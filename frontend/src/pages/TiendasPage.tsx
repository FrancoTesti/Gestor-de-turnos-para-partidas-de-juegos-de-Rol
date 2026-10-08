/**
 * TiendasPage — Módulo Octavio Gudiño
 * Gestión completa de Tiendas con CRUD integrado a la API real.
 *
 * Reglas de acceso:
 *  - Todos pueden ver el listado de tiendas.
 *  - Solo anfitriones pueden crear, editar o eliminar tiendas.
 *
 * Validaciones:
 *  - No se puede eliminar una tienda con objetos asociados (FK: error 409 del backend).
 *  - La clase asociada es opcional; si se vincula, debe existir.
 *
 * Cada tienda muestra: nombre, tipo de tienda, clase asociada (si tiene).
 */
import { useEffect, useState } from 'react';
import type { Clase, Tienda } from '../interfaces';
import { useUser } from '../context/UserContext';
import { obtenerClases } from '../services/clase.service';
import {
  actualizarTienda,
  crearTienda,
  eliminarTienda,
  obtenerTiendas,
  type ActualizarTiendaData,
  type CrearTiendaData,
} from '../services/tienda.service';

function mensajeError(e: unknown): string {
  return e instanceof Error ? e.message : 'Error inesperado';
}

const TIPOS_TIENDA = ['General', 'Armas', 'Armaduras', 'Magia', 'Alquimia', 'Pociones', 'Reliquias', 'Otro'];

export default function TiendasPage() {
  const { usuarioLogueado, rolDe } = useUser();
  const esAnfitrion = usuarioLogueado ? rolDe(usuarioLogueado.idUsuario) === 'anfitrion' : false;

  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [clases, setClases] = useState<Clase[]>([]);
  const [seleccionada, setSeleccionada] = useState<Tienda | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [enEdicion, setEnEdicion] = useState<Tienda | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  // Campos del formulario
  const [nombre, setNombre] = useState('');
  const [claseTienda, setClaseTienda] = useState('General');
  const [idClase, setIdClase] = useState<number | ''>('');
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const [revision, setRevision] = useState(0);
  function cargar() {
    setCargando(true);
    setError(null);
    setRevision(value => value + 1);
  }

  useEffect(() => {
    let activo = true;
    Promise.all([obtenerTiendas(), obtenerClases()])
      .then(([t, c]) => { if (activo) { setTiendas(t); setClases(c); } })
      .catch((e) => { if (activo) setError(mensajeError(e)); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [revision]);

  function abrirFormularioCrear() {
    setEnEdicion(null);
    setNombre('');
    setClaseTienda('General');
    setIdClase('');
    setErrorForm(null);
    setMostrarFormulario(true);
  }

  function abrirFormularioEditar(t: Tienda) {
    setEnEdicion(t);
    setNombre(t.nombre);
    setClaseTienda(t.claseTienda);
    setIdClase(t.idClase ?? '');
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

  const tiposTienda = [...new Set(tiendas.map((t) => t.claseTienda))].filter(Boolean).sort();

  const tiendasFiltradas = tiendas.filter((t) => {
    const coincideTexto = !busqueda.trim() ||
      t.nombre.toLocaleLowerCase().includes(busqueda.toLocaleLowerCase()) ||
      t.claseTienda.toLocaleLowerCase().includes(busqueda.toLocaleLowerCase());
    const coincideTipo = !filtroTipo || t.claseTienda === filtroTipo;
    return coincideTexto && coincideTipo;
  });

  function nombreClase(idClaseVal: number | null): string {
    if (!idClaseVal) return '—';
    return clases.find((c) => c.idClase === idClaseVal)?.nombreClase ?? `Clase #${idClaseVal}`;
  }

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
            style={{ padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-card-secondary)', color: 'var(--text-h)', width: '220px' }}
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
        {(busqueda || filtroTipo) && (
          <button type="button" className="btn-secondary" onClick={() => { setBusqueda(''); setFiltroTipo(''); }}>
            Quitar filtros
          </button>
        )}
      </div>

      {cargando && <p role="status" style={{ color: 'var(--text-muted)' }}>⏳ Cargando tiendas…</p>}

      {!cargando && !error && tiendasFiltradas.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
          {busqueda || filtroTipo
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
                  <td style={{ color: 'var(--text)' }}>{nombreClase(t.idClase)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={(e) => { e.stopPropagation(); setSeleccionada(t); }}
                      style={{ marginRight: '0.5rem' }}
                    >
                      Ver detalle
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

      {/* Panel de detalle */}
      {seleccionada && (
        <aside style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', maxWidth: '520px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ marginTop: 0 }}>Detalle de tienda #{seleccionada.idTienda}</h3>
          <dl style={{ display: 'grid', gap: '0.75rem', margin: '1rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><dt style={{ fontWeight: 600, color: 'var(--text-h)' }}>Nombre</dt><dd style={{ margin: 0, color: 'var(--text)' }}>{seleccionada.nombre}</dd></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><dt style={{ fontWeight: 600, color: 'var(--text-h)' }}>Tipo de tienda</dt><dd style={{ margin: 0, color: 'var(--text)' }}>{seleccionada.claseTienda}</dd></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <dt style={{ fontWeight: 600, color: 'var(--text-h)' }}>Clase vinculada</dt>
              <dd style={{ margin: 0, color: 'var(--text)' }}>{nombreClase(seleccionada.idClase)}</dd>
            </div>
          </dl>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '1rem 0' }}>
            Los objetos de esta tienda aparecerán como sugeridos para personajes de la clase vinculada.
          </p>
          <button type="button" className="btn-secondary" onClick={() => setSeleccionada(null)}>
            Cerrar detalle
          </button>
        </aside>
      )}
    </section>
  );
}
