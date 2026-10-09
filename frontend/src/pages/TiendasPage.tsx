/**
 * TiendasPage — Módulo Octavio Gudiño
 * Gestión completa de Tiendas con CRUD integrado a la API real.
 *
 * Reglas de acceso:
 *  - Todos pueden ver el listado de tiendas.
 *  - Solo anfitriones pueden crear, editar o eliminar tiendas.
 *
 * Reglas de Partida y Objetos Únicos:
 *  - Las tiendas pertenecen a cada partida (idPartida), permitiendo filtrar por partida.
 *  - Las tiendas venden objetos según su tipo/clase (claseTienda).
 *  - Objetos únicos (esUnico):
 *      * Si COUNT == 1 en inventarios de personajes de esa partida: la tienda no lo puede vender
 *        (No se puede vender, mostrando quién lo tiene y en qué inventario).
 *      * Si COUNT == 0: la tienda lo puede vender (Se puede vender / Disponible).
 *      * Si se vende de vuelta a la tienda, COUNT vuelve a 0 y es comprable nuevamente.
 */
import { useEffect, useMemo, useState } from 'react';
import type { Clase, Partida, Personaje, Tienda } from '../interfaces';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import { obtenerClases } from '../services/clase.service';
import {
  actualizarTienda,
  crearTienda,
  eliminarTienda,
  obtenerTiendas,
  type ActualizarTiendaData,
  type CrearTiendaData,
} from '../services/tienda.service';
import {
  comprarObjeto,
  obtenerObjetos,
  type ObjetoPublico,
} from '../services/objeto.service';

function mensajeError(e: unknown): string {
  return e instanceof Error ? e.message : 'Error inesperado';
}

const TIPOS_TIENDA = ['General', 'Armas', 'Armaduras', 'Magia', 'Alquimia', 'Pociones', 'Reliquias', 'Otro'];

export default function TiendasPage() {
  const { usuarioLogueado, rolDe } = useUser();
  const userId = usuarioLogueado?.idUsuario ?? 0;
  const esAnfitrion = usuarioLogueado ? rolDe(userId) === 'anfitrion' : false;

  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [clases, setClases] = useState<Clase[]>([]);
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [personajes, setPersonajes] = useState<Personaje[]>([]);
  const [objetos, setObjetos] = useState<ObjetoPublico[]>([]);
  const [seleccionada, setSeleccionada] = useState<Tienda | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [enEdicion, setEnEdicion] = useState<Tienda | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroPartida, setFiltroPartida] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('partida') || '';
    }
    return '';
  });

  // Campos del formulario
  const [nombre, setNombre] = useState('');
  const [claseTienda, setClaseTienda] = useState('General');
  const [idClase, setIdClase] = useState<number | ''>('');
  const [idPartida, setIdPartida] = useState<number | ''>('');
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // Acciones de compra
  const [personajeCompradorId, setPersonajeCompradorId] = useState<number | ''>('');
  const [comprandoId, setComprandoId] = useState<number | null>(null);

  const [revision, setRevision] = useState(0);
  function cargar() {
    setCargando(true);
    setError(null);
    setRevision(value => value + 1);
  }

  useEffect(() => {
    let activo = true;
    Promise.all([
      obtenerTiendas(),
      obtenerClases(),
      api<Partida[]>('/partidas').catch(() => []),
      api<Personaje[]>('/personajes').catch(() => []),
      obtenerObjetos().catch(() => []),
    ])
      .then(([t, c, pts, pjs, objs]) => {
        if (activo) {
          setTiendas(t);
          setClases(c);
          setPartidas(pts);
          setPersonajes(pjs);
          setObjetos(objs);
        }
      })
      .catch((e) => { if (activo) setError(mensajeError(e)); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [revision]);

  // Personajes del usuario logueado
  const misPersonajes = useMemo(() => {
    return personajes.filter((p) => p.idUsuarioJugador === userId);
  }, [personajes, userId]);

  // Partidas en las que participa el usuario
  const partidasDelUsuario = useMemo(() => {
    return partidas.filter((p) => {
      const esHost = p.idUsuarioAnfitrion === userId;
      const tienePj = misPersonajes.some((pj) => pj.idPartida === p.idPartida);
      return esHost || tienePj;
    });
  }, [partidas, userId, misPersonajes]);

  function abrirFormularioCrear() {
    setEnEdicion(null);
    setNombre('');
    setClaseTienda('General');
    setIdClase('');
    setIdPartida(filtroPartida ? Number(filtroPartida) : '');
    setErrorForm(null);
    setMostrarFormulario(true);
  }

  function abrirFormularioEditar(t: Tienda) {
    setEnEdicion(t);
    setNombre(t.nombre);
    setClaseTienda(t.claseTienda);
    setIdClase(t.idClase ?? '');
    setIdPartida(t.idPartida ?? '');
    setErrorForm(null);
    setMostrarFormulario(true);
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setErrorForm(null);
    if (!nombre.trim()) { setErrorForm('El nombre de la tienda es obligatorio.'); return; }
    if (!claseTienda) { setErrorForm('El tipo de tienda es obligatorio.'); return; }

    setGuardando(true);
    try {
      const data: CrearTiendaData | ActualizarTiendaData = {
        nombre: nombre.trim(),
        claseTienda,
        idClase: idClase !== '' ? Number(idClase) : null,
        idPartida: idPartida !== '' ? Number(idPartida) : null,
      };

      if (enEdicion) {
        const actualizada = await actualizarTienda(enEdicion.idTienda, data as ActualizarTiendaData);
        setTiendas((prev) => prev.map((t) => t.idTienda === actualizada.idTienda ? actualizada : t));
        setSeleccionada(actualizada);
        setMensaje('Tienda actualizada correctamente.');
      } else {
        const nueva = await crearTienda(data as CrearTiendaData);
        setTiendas((prev) => [...prev, nueva]);
        setSeleccionada(nueva);
        setMensaje('Tienda creada correctamente.');
      }
      setMostrarFormulario(false);
      setEnEdicion(null);
    } catch (err) {
      setErrorForm(mensajeError(err));
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(idTienda: number) {
    setError(null);
    setMensaje(null);
    if (!window.confirm('¿Seguro que querés eliminar esta tienda? Si tiene objetos asociados, no se podrá eliminar.')) return;
    try {
      await eliminarTienda(idTienda);
      setTiendas((prev) => prev.filter((t) => t.idTienda !== idTienda));
      if (seleccionada?.idTienda === idTienda) setSeleccionada(null);
      setMensaje('Tienda eliminada.');
    } catch (e) {
      setError(mensajeError(e));
    }
  }

  async function handleComprar(idObjeto: number) {
    if (!personajeCompradorId) {
      setError('Seleccioná un personaje para realizar la compra.');
      return;
    }
    setComprandoId(idObjeto);
    setError(null);
    setMensaje(null);
    try {
      await comprarObjeto(idObjeto, {
        idPersonaje: Number(personajeCompradorId),
        numInventario: 1,
        posicion: 0,
      });
      setMensaje('¡Objeto comprado con éxito!');
      cargar();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setComprandoId(null);
    }
  }

  const tiposTienda = [...new Set(tiendas.map((t) => t.claseTienda))].filter(Boolean).sort();

  const tiendasFiltradas = tiendas.filter((t) => {
    const coincideTexto = !busqueda.trim() ||
      t.nombre.toLocaleLowerCase().includes(busqueda.toLocaleLowerCase()) ||
      t.claseTienda.toLocaleLowerCase().includes(busqueda.toLocaleLowerCase());
    const coincideTipo = !filtroTipo || t.claseTienda === filtroTipo;
    const coincidePartida = !filtroPartida ||
      t.idPartida === undefined ||
      t.idPartida === null ||
      String(t.idPartida) === String(filtroPartida);

    return coincideTexto && coincideTipo && coincidePartida;
  });

  function nombreClase(idClaseVal: number | null | undefined): string {
    if (!idClaseVal) return '—';
    return clases.find((c) => c.idClase === idClaseVal)?.nombreClase ?? `Clase #${idClaseVal}`;
  }

  function nombrePartida(idPartidaVal: number | null | undefined): string {
    if (!idPartidaVal) return 'Global / Sin asignar';
    return partidas.find((p) => p.idPartida === idPartidaVal)?.nombre ?? `Partida #${idPartidaVal}`;
  }

  // Objetos para la tienda seleccionada
  const objetosDeTienda = useMemo(() => {
    if (!seleccionada) return [];
    return objetos.filter((o) => {
      if (o.idTienda === seleccionada.idTienda) return true;
      if (o.esUnico && o.idPersonaje !== null && seleccionada.idPartida) {
        const pj = personajes.find((p) => p.idPersonaje === o.idPersonaje);
        if (pj && pj.idPartida === seleccionada.idPartida) return true;
      }
      return false;
    });
  }, [seleccionada, objetos, personajes]);

  return (
    <section style={{ padding: '0.5rem 0' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.8rem', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', margin: 0 }}>
            Comercio del sistema
          </p>
          <h1 style={{ margin: '0.25rem 0 0' }}>Tiendas</h1>
        </div>
        {!mostrarFormulario && esAnfitrion && (
          <button type="button" className="btn-primary" onClick={abrirFormularioCrear}>
            + Nueva Tienda
          </button>
        )}
      </header>

      {mensaje && (
        <p role="status" style={{ color: 'var(--success-text)', background: 'var(--success-bg)', border: '1px solid var(--success-border)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontWeight: 500 }}>
          ✅ {mensaje}
        </p>
      )}
      {error && (
        <div role="alert" style={{ color: 'var(--error-text)', background: 'var(--error-bg)', border: '1px solid var(--error-border)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span>⚠️ {error}</span>
          <button type="button" onClick={cargar} className="btn-secondary">Reintentar</button>
        </div>
      )}

      {mostrarFormulario && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '1.75rem', borderRadius: 'var(--radius-md)', maxWidth: '560px', marginBottom: '1.5rem', boxShadow: 'var(--shadow-lg)' }}>
          <h2 style={{ marginTop: 0 }}>{enEdicion ? 'Editar Tienda' : 'Nueva Tienda'}</h2>
          {errorForm && (
            <p role="alert" style={{ color: 'var(--error-text)', background: 'var(--error-bg)', border: '1px solid var(--error-border)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
              ⚠️ {errorForm}
            </p>
          )}
          <form onSubmit={(e) => { e.preventDefault(); void handleGuardar(e); }} style={{ display: 'grid', gap: '1rem' }}>
            <label>
              Nombre de la tienda *
              <input
                type="text"
                required
                placeholder="Ej: Forja de Hierro Negro"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={guardando}
                style={{ display: 'block', width: '100%', marginTop: '0.35rem' }}
              />
            </label>
            <label>
              Tipo de tienda *
              <select
                required
                value={claseTienda}
                onChange={(e) => setClaseTienda(e.target.value)}
                disabled={guardando}
                style={{ display: 'block', width: '100%', marginTop: '0.35rem' }}
              >
                {TIPOS_TIENDA.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              Partida asignada (opcional)
              <select
                value={idPartida}
                onChange={(e) => setIdPartida(e.target.value ? Number(e.target.value) : '')}
                disabled={guardando}
                style={{ display: 'block', width: '100%', marginTop: '0.35rem' }}
              >
                <option value="">Sin partida específica</option>
                {partidas.map((p) => (
                  <option key={p.idPartida} value={p.idPartida}>
                    🎲 {p.nombre} (#{p.idPartida})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Clase vinculada (opcional — restringe qué objetos se sugieren)
              <select
                value={idClase}
                onChange={(e) => setIdClase(e.target.value ? Number(e.target.value) : '')}
                disabled={guardando}
                style={{ display: 'block', width: '100%', marginTop: '0.35rem' }}
              >
                <option value="">Sin restricción de clase</option>
                {clases.map((c) => (
                  <option key={String(c.idClase)} value={c.idClase}>{c.nombreClase}</option>
                ))}
              </select>
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn-primary" disabled={guardando}>
                {guardando ? 'Guardando…' : enEdicion ? 'Actualizar' : 'Crear Tienda'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                disabled={guardando}
                onClick={() => { setMostrarFormulario(false); setEnEdicion(null); setErrorForm(null); }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🔍 Buscar:</span>
          <input
            type="search"
            placeholder="Nombre o tipo"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-card-secondary)', color: 'var(--text-h)', width: '200px' }}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Tipo:</span>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            style={{ padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-card-secondary)', color: 'var(--text-h)' }}
          >
            <option value="">Todos los tipos</option>
            {tiposTienda.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        {partidas.length > 0 && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🎲 Partida:</span>
            <select
              value={filtroPartida}
              onChange={(e) => setFiltroPartida(e.target.value)}
              style={{ padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-card-secondary)', color: 'var(--text-h)' }}
            >
              <option value="">Todas las partidas</option>
              {(partidasDelUsuario.length > 0 ? partidasDelUsuario : partidas).map((p) => (
                <option key={p.idPartida} value={String(p.idPartida)}>
                  {p.nombre} (#{p.idPartida})
                </option>
              ))}
            </select>
          </label>
        )}
        {(busqueda || filtroTipo || filtroPartida) && (
          <button type="button" className="btn-secondary" onClick={() => { setBusqueda(''); setFiltroTipo(''); setFiltroPartida(''); }}>
            Quitar filtros
          </button>
        )}
      </div>

      {cargando && <p role="status" style={{ color: 'var(--text-muted)' }}>⏳ Cargando tiendas…</p>}

      {!cargando && !error && tiendasFiltradas.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
          {busqueda || filtroTipo || filtroPartida
            ? 'No hay tiendas que coincidan con los filtros.'
            : 'No hay tiendas registradas en el sistema.'}
        </p>
      )}

      {/* Tabla de tiendas */}
      {!cargando && tiendasFiltradas.length > 0 && (
        <div className="tabla-scroll">
          <table className="app-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Partida</th>
                <th>Clase vinculada</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tiendasFiltradas.map((t) => (
                <tr
                  key={String(t.idTienda)}
                  style={{
                    background: seleccionada?.idTienda === t.idTienda ? 'var(--accent-bg)' : undefined,
                    cursor: 'pointer',
                  }}
                  onClick={() => setSeleccionada(t)}
                >
                  <td style={{ color: 'var(--text-muted)' }}>#{t.idTienda}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>🏪 {t.nombre}</td>
                  <td>
                    <span className="badge badge-info">
                      {t.claseTienda}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text)' }}>
                    {t.idPartida ? `🎲 ${nombrePartida(t.idPartida)}` : '🌐 Global'}
                  </td>
                  <td style={{ color: 'var(--text)' }}>{nombreClase(t.idClase)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={(e) => { e.stopPropagation(); setSeleccionada(t); }}
                      style={{ marginRight: '0.5rem' }}
                    >
                      Ver catálogo
                    </button>
                    {esAnfitrion && (
                      <>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ marginRight: '0.5rem' }}
                          onClick={(e) => { e.stopPropagation(); abrirFormularioEditar(t); }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={(e) => { e.stopPropagation(); void handleEliminar(t.idTienda); }}
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Panel de detalle y Catálogo de objetos de la tienda */}
      {seleccionada && (
        <aside style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', maxWidth: '680px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ marginTop: 0 }}>🏪 Tienda #{seleccionada.idTienda}: {seleccionada.nombre}</h3>
            <button type="button" className="btn-secondary" onClick={() => setSeleccionada(null)}>
              ✕ Cerrar
            </button>
          </div>
          <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', margin: '1rem 0' }}>
            <div><dt style={{ fontWeight: 600, color: 'var(--text-h)' }}>Tipo de tienda</dt><dd style={{ margin: 0, color: 'var(--text)' }}>{seleccionada.claseTienda}</dd></div>
            <div><dt style={{ fontWeight: 600, color: 'var(--text-h)' }}>Partida</dt><dd style={{ margin: 0, color: 'var(--text)' }}>{nombrePartida(seleccionada.idPartida)}</dd></div>
            <div><dt style={{ fontWeight: 600, color: 'var(--text-h)' }}>Clase vinculada</dt><dd style={{ margin: 0, color: 'var(--text)' }}>{nombreClase(seleccionada.idClase)}</dd></div>
          </dl>

          <hr style={{ borderColor: 'var(--border-subtle)', margin: '1.25rem 0' }} />

          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-h)' }}>
            📦 Catálogo de Objetos ({objetosDeTienda.length})
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
            Venta según tipo de tienda ({seleccionada.claseTienda}). Los objetos únicos solo pueden existir en un lugar por partida (en tienda o en inventario).
          </p>

          {misPersonajes.length > 0 && (
            <div style={{ background: 'var(--bg-card-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', border: '1px solid var(--border-subtle)' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>👤 Comprar como:</span>
                <select
                  value={personajeCompradorId}
                  onChange={(e) => setPersonajeCompradorId(e.target.value ? Number(e.target.value) : '')}
                  style={{ padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-h)' }}
                >
                  <option value="">Seleccionar personaje...</option>
                  {misPersonajes.map((pj) => (
                    <option key={pj.idPersonaje} value={pj.idPersonaje}>
                      🛡️ {pj.nombreFicticio} (Saldo: ${pj.dinero})
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {objetosDeTienda.length === 0 ? (
            <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', margin: '1rem 0' }}>
              Actualmente no hay objetos asociados a esta tienda.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {objetosDeTienda.map((obj) => {
                const pjDueno = obj.idPersonaje ? personajes.find((p) => p.idPersonaje === obj.idPersonaje) : null;
                const countEnInventarios = pjDueno ? 1 : 0;
                const esComprable = !obj.esUnico || countEnInventarios === 0;

                return (
                  <div
                    key={obj.idObjeto}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-card-secondary)',
                      border: '1px solid var(--border)',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ color: 'var(--text-h)' }}>{obj.nombre}</strong>
                        {obj.esUnico && (
                          <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.2)', color: 'var(--accent, #a855f7)', fontWeight: 700 }}>
                            ⭐ Único
                          </span>
                        )}
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          ({obj.tipoObjeto} - Nivel {obj.nivelObjeto})
                        </span>
                      </div>
                      <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: 'var(--text)' }}>
                        {obj.descripcion}
                      </p>
                      {obj.esUnico && (
                        <p style={{ margin: '0.2rem 0', fontSize: '0.8rem', fontWeight: 600 }}>
                          {countEnInventarios === 1 ? (
                            <span style={{ color: 'var(--error-text)' }}>
                              🔒 No se puede vender — En posesión de {pjDueno?.nombreFicticio} (Inventario #{obj.numInventario ?? 1})
                            </span>
                          ) : (
                            <span style={{ color: 'var(--success-text)' }}>
                              ✨ Se puede vender — Disponible en tienda (COUNT = 0)
                            </span>
                          )}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--accent-text)', fontSize: '1rem' }}>
                        ${obj.valor}
                      </span>
                      <button
                        type="button"
                        className="btn-primary"
                        disabled={!esComprable || comprandoId === obj.idObjeto || !personajeCompradorId}
                        onClick={() => void handleComprar(obj.idObjeto)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                      >
                        {comprandoId === obj.idObjeto
                          ? 'Comprando...'
                          : esComprable
                          ? 'Comprar'
                          : 'No se puede vender'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </aside>
      )}
    </section>
  );
}
