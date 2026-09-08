/**
 * PersonajesPage — Módulo Alejandro Ciesco
 * Gestión completa de Personajes con CRUD integrado a la API real.
 *
 * Reglas de acceso:
 *  - Todos los usuarios logueados pueden ver el listado y filtrar por clase.
 *  - Jugadores: pueden crear personajes propios, editarlos y eliminarlos.
 *  - La creación fija automáticamente idUsuarioJugador al usuario logueado,
 *    previniendo que un jugador cree personajes de otra cuenta.
 *  - Anfitriones: solo pueden visualizar (no crear ni editar personajes ajenos).
 *
 * Validaciones de backend propagadas al usuario:
 *  - Partida llena (limiteJugadores alcanzado)
 *  - Contraseña de partida privada incorrecta
 *  - Ya tenés un personaje en esa partida
 *  - Jugador inactivo
 *  - Personaje con historial de sesiones (no se puede eliminar)
 *  - Personaje con objetos en inventario (venderlos primero)
 */
import { useCallback, useEffect, useState } from 'react';
import type { Clase, Personaje } from '../interfaces';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import PersonajeDetalle from '../components/personajes/PersonajeDetalle';
import PersonajeLista from '../components/personajes/PersonajeLista';
import {
  actualizarPersonaje,
  crearPersonaje,
  eliminarPersonaje,
  obtenerPersonajes,
  type ActualizarPersonajeData,
  type CrearPersonajeData,
} from '../services/personaje.service';
import { obtenerClases } from '../services/clase.service';

interface PartidaSimple {
  idPartida: number;
  nombre: string;
  estado: string;
  limiteJugadores: number;
  esPrivada: boolean;
}

function mensajeError(e: unknown): string {
  return e instanceof Error ? e.message : 'Error inesperado';
}

export default function PersonajesPage() {
  const { usuarioLogueado, rolDe } = useUser();
  const userId = usuarioLogueado!.idUsuario;
  const esJugador = rolDe(userId) === 'jugador';

  const [personajes, setPersonajes] = useState<Personaje[]>([]);
  const [clases, setClases] = useState<Clase[]>([]);
  const [partidas, setPartidas] = useState<PartidaSimple[]>([]);
  const [seleccionado, setSeleccionado] = useState<Personaje | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [enEdicion, setEnEdicion] = useState<Personaje | null>(null);

  // Campos del formulario
  const [nombreFicticio, setNombreFicticio] = useState('');
  const [raza, setRaza] = useState('');
  const [idClase, setIdClase] = useState<number | ''>('');
  const [idPartida, setIdPartida] = useState<number | ''>('');
  const [contrasenaPartida, setContrasenaPartida] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const cargar = useCallback(() => {
    setCargando(true);
    setError(null);
    Promise.all([
      obtenerPersonajes(),
      obtenerClases(),
      api<PartidaSimple[]>('/partidas'),
    ])
      .then(([p, c, pt]) => { setPersonajes(p); setClases(c); setPartidas(pt); })
      .catch((e) => setError(mensajeError(e)))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  function abrirFormularioCrear() {
    setEnEdicion(null);
    setNombreFicticio('');
    setRaza('');
    setIdClase(clases[0]?.idClase ?? '');
    setIdPartida(partidas.filter((p) => p.estado === 'activa')[0]?.idPartida ?? '');
    setContrasenaPartida('');
    setErrorForm(null);
    setMostrarFormulario(true);
  }

  function abrirFormularioEditar(p: Personaje) {
    setEnEdicion(p);
    setNombreFicticio(p.nombreFicticio);
    setRaza(p.raza);
    setIdClase(p.idClase);
    setIdPartida(p.idPartida);
    setContrasenaPartida('');
    setErrorForm(null);
    setMostrarFormulario(true);
  }

  const partidaSeleccionada = partidas.find((p) => p.idPartida === Number(idPartida));
  const requiereContrasena = !enEdicion && (partidaSeleccionada?.esPrivada ?? false);

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    setErrorForm(null);
    if (!nombreFicticio.trim()) { setErrorForm('El nombre ficticio es obligatorio.'); return; }
    if (!raza.trim()) { setErrorForm('La raza es obligatoria.'); return; }
    if (!idClase) { setErrorForm('Seleccioná una clase.'); return; }
    if (!idPartida) { setErrorForm('Seleccioná una partida.'); return; }
    if (requiereContrasena && !contrasenaPartida) { setErrorForm('La partida es privada. Ingresá la contraseña.'); return; }

    setGuardando(true);
    try {
      if (enEdicion) {
        const data: ActualizarPersonajeData = {
          nombreFicticio: nombreFicticio.trim(),
          raza: raza.trim(),
          idClase: Number(idClase),
        };
        const actualizado = await actualizarPersonaje(enEdicion.idPersonaje, data);
        setPersonajes((prev) => prev.map((p) => p.idPersonaje === actualizado.idPersonaje ? actualizado : p));
        setSeleccionado(actualizado);
        setMensaje('Personaje actualizado correctamente.');
      } else {
        const data: CrearPersonajeData = {
          nombreFicticio: nombreFicticio.trim(),
          raza: raza.trim(),
          idClase: Number(idClase),
          idUsuarioJugador: userId,
          idPartida: Number(idPartida),
          ...(contrasenaPartida ? { contrasenaPartida } : {}),
        };
        const nuevo = await crearPersonaje(data);
        setPersonajes((prev) => [...prev, nuevo]);
        setSeleccionado(nuevo);
        setMensaje('Personaje creado correctamente. El inventario inicial ya está disponible.');
      }
      setMostrarFormulario(false);
      setEnEdicion(null);
    } catch (err) {
      setErrorForm(mensajeError(err));
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(idPersonaje: number) {
    setError(null);
    setMensaje(null);
    try {
      await eliminarPersonaje(idPersonaje);
      setPersonajes((prev) => prev.filter((p) => p.idPersonaje !== idPersonaje));
      if (seleccionado?.idPersonaje === idPersonaje) setSeleccionado(null);
      setMensaje('Personaje eliminado.');
    } catch (e) {
      setError(mensajeError(e));
    }
  }

  const partidasActivas = partidas.filter((p) => p.estado === 'activa');

  return (
    <section style={{ padding: '1.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.8rem', color: '#718096', textTransform: 'uppercase', margin: 0 }}>
            Juego de Rol
          </p>
          <h1 style={{ margin: 0 }}>Personajes</h1>
        </div>
        {!mostrarFormulario && esJugador && (
          <button type="button" className="btn-purple" onClick={abrirFormularioCrear}>
            + Crear Personaje
          </button>
        )}
      </header>

      {mensaje && (
        <p role="status" style={{ color: '#276749', background: '#f0fff4', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
          ✅ {mensaje}
        </p>
      )}
      {error && (
        <div role="alert" style={{ color: '#c53030', background: '#fff5f5', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠️ {error}</span>
          <button type="button" onClick={cargar}>Reintentar</button>
        </div>
      )}

      {mostrarFormulario && (
        <div style={{ background: '#f7fafc', padding: '1.5rem', borderRadius: '8px', maxWidth: '640px', marginBottom: '1.5rem' }}>
          <h2 style={{ marginTop: 0 }}>{enEdicion ? 'Editar Personaje' : 'Crear Nuevo Personaje'}</h2>
          {errorForm && (
            <p role="alert" style={{ color: '#c53030', background: '#fff5f5', padding: '0.5rem 0.75rem', borderRadius: '4px' }}>
              ⚠️ {errorForm}
            </p>
          )}
          <form onSubmit={(e) => void handleGuardar(e)} style={{ display: 'grid', gap: '1rem' }}>
            <label>
              Nombre ficticio *
              <input
                type="text"
                required
                placeholder="Ej: Thorin EscudoDeRoble"
                value={nombreFicticio}
                onChange={(e) => setNombreFicticio(e.target.value)}
                disabled={guardando}
                style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
              />
            </label>
            <label>
              Raza *
              <input
                type="text"
                required
                placeholder="Ej: Enano, Elfo, Humano..."
                value={raza}
                onChange={(e) => setRaza(e.target.value)}
                disabled={guardando}
                style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
              />
            </label>
            <label>
              Clase de personaje *
              <select
                required
                value={idClase}
                onChange={(e) => setIdClase(Number(e.target.value))}
                disabled={guardando}
                style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
              >
                <option value="">Seleccionar clase…</option>
                {clases.map((c) => (
                  <option key={c.idClase} value={c.idClase}>{c.nombreClase}</option>
                ))}
              </select>
            </label>
            {!enEdicion && (
              <label>
                Partida *
                <select
                  required
                  value={idPartida}
                  onChange={(e) => { setIdPartida(Number(e.target.value)); setContrasenaPartida(''); }}
                  disabled={guardando}
                  style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                >
                  <option value="">Seleccionar partida activa…</option>
                  {partidasActivas.map((p) => (
                    <option key={p.idPartida} value={p.idPartida}>
                      {p.nombre} (#{p.idPartida}) — hasta {p.limiteJugadores} jug.{p.esPrivada ? ' 🔒' : ''}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {requiereContrasena && (
              <label>
                Contraseña de la partida privada 🔒 *
                <input
                  type="password"
                  required
                  placeholder="Ingresá la contraseña"
                  value={contrasenaPartida}
                  onChange={(e) => setContrasenaPartida(e.target.value)}
                  disabled={guardando}
                  style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                />
              </label>
            )}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn-purple" disabled={guardando}>
                {guardando ? 'Guardando…' : enEdicion ? 'Actualizar' : 'Crear Personaje'}
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

      <PersonajeLista
        personajes={personajes}
        clases={clases}
        personajeSeleccionadoId={seleccionado?.idPersonaje}
        cargando={cargando}
        onSeleccionar={(p) => setSeleccionado(p)}
        onEditar={esJugador ? (p) => { if (p.idUsuarioJugador === userId) abrirFormularioEditar(p); } : undefined}
        onEliminar={esJugador ? (id) => {
          const p = personajes.find((x) => x.idPersonaje === id);
          if (p && p.idUsuarioJugador === userId) void handleEliminar(id);
        } : undefined}
      />

      {seleccionado && (
        <aside style={{ marginTop: '1.5rem', padding: '1rem', background: '#f7fafc', borderRadius: '8px', maxWidth: '520px' }}>
          <PersonajeDetalle personaje={seleccionado} clases={clases} onVolver={() => setSeleccionado(null)} />
        </aside>
      )}
    </section>
  );
}
