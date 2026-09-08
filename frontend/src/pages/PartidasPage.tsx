// PartidasPage.tsx — página de partidas y sesiones corregida.
import { useEffect, useState } from 'react';
import PartidaDetalle from '../components/partidas/PartidaDetalle';
import PartidaFormulario from '../components/partidas/PartidaFormulario';
import PartidaLista from '../components/partidas/PartidaLista';
import type { CrearPartidaData, PartidaPublica } from '../services/partida.service';
import {
  actualizarPartida,
  crearPartida,
  eliminarPartida,
  obtenerPartidasActivas,    
} from '../services/partida.service';
import type { SesionPublica } from '../services/sesion.service';
import {
  actualizarSesion,
  agregarParticipante,   
  crearSesion,
  eliminarSesion,
  obtenerParticipantes,
  obtenerSesionesPorPartida,
} from '../services/sesion.service';

export default function PartidasPage() {
  // estado de partidas 
  const [partidas, setPartidas] = useState<PartidaPublica[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partidaSeleccionada, setPartidaSeleccionada] = useState<PartidaPublica | null>(null);
  const [editando, setEditando] = useState(false);
  const [creando, setCreando] = useState(false);

  // estado de sesiones 
  const [sesiones, setSesiones] = useState<SesionPublica[]>([]);
  const [cargandoSesiones, setCargandoSesiones] = useState(false);
  const [creandoSesion, setCreandoSesion] = useState(false);
  const [errorSesion, setErrorSesion] = useState<string | null>(null);
    const [participantes, setParticipantes] = useState<Record<number, number[]>>({});
    // ↑ guarda { numSesion: [idPersonaje1, idPersonaje2, ...] }
    const [idPersonajeNuevo, setIdPersonajeNuevo] = useState<number>(1);

  // formulario nueva sesion
  const [formSesion, setFormSesion] = useState({
    numSesion: 1,
    duracionSesion: 60,
    cantJugadores: 1,
    estado: 'planificada' as SesionPublica['estado'],
  });

  useEffect(() => {
    void cargarPartidas();
  }, []);

  async function cargarPartidas() {
    try {
      setCargando(true);
      setError(null);
      const data = await obtenerPartidasActivas();  
      setPartidas(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar partidas');
    } finally {
      setCargando(false);
    }
  }

  async function seleccionarPartida(partida: PartidaPublica) {
    setPartidaSeleccionada(partida);
    setEditando(false);
    setCreandoSesion(false);
    setErrorSesion(null);
    await cargarSesiones(partida.idPartida);
  }

  async function cargarSesiones(idPartida: number) {
    try {
      setCargandoSesiones(true);
      const data = await obtenerSesionesPorPartida(idPartida);
      setSesiones(data);
    } catch {
      setSesiones([]);
    } finally {
      setCargandoSesiones(false);
    }
  }

  // acciones de partida

  // onGuardar de PartidaFormulario entrega CrearPartidaData (no Omit<PartidaPublica>)
  async function handleCrearPartida(data: CrearPartidaData) {
    try {
      await crearPartida(data);
      setCreando(false);
      await cargarPartidas();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear partida');
    }
  }

  // al editar, el formulario también entrega CrearPartidaData
  async function handleActualizarPartida(data: CrearPartidaData) {
    if (!partidaSeleccionada) return;
    try {
      await actualizarPartida(partidaSeleccionada.idPartida, data);
      setEditando(false);
      await cargarPartidas();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar partida');
    }
  }

  async function handleEliminarPartida(idPartida: number) {
    if (!confirm('¿Seguro que querés eliminar esta partida?')) return;
    try {
      await eliminarPartida(idPartida);
      setPartidaSeleccionada(null);
      setSesiones([]);
      await cargarPartidas();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar partida');
    }
  }

  //acciones de sesiones

  async function handleCrearSesion() {
    if (!partidaSeleccionada) return;
    try {
      setErrorSesion(null);
      await crearSesion({ ...formSesion, idPartida: partidaSeleccionada.idPartida });
      setCreandoSesion(false);
      await cargarSesiones(partidaSeleccionada.idPartida);
    } catch (err: unknown) {
      setErrorSesion(err instanceof Error ? err.message : 'Error al crear sesión');
    }
  }

  async function handleCambiarEstadoSesion(sesion: SesionPublica, nuevoEstado: SesionPublica['estado']) {
    try {
      await actualizarSesion(sesion.idPartida, sesion.numSesion, { estado: nuevoEstado });
      await cargarSesiones(sesion.idPartida);
    } catch (err: unknown) {
      setErrorSesion(err instanceof Error ? err.message : 'Error al actualizar sesión');
    }
  }

  async function handleEliminarSesion(sesion: SesionPublica) {
    if (!confirm(`¿Eliminar la sesión ${sesion.numSesion}?`)) return;
    try {
      await eliminarSesion(sesion.idPartida, sesion.numSesion);
      await cargarSesiones(sesion.idPartida);
    } catch (err: unknown) {
      setErrorSesion(err instanceof Error ? err.message : 'Error al eliminar sesión');
    }
  }

  function etiquetaEstado(estado: SesionPublica['estado']) {
    const etiquetas = { planificada: '📅 Planificada', en_curso: '▶ En curso', finalizada: '■ Finalizada' };
    return etiquetas[estado];
  }

  // render
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Partidas y Sesiones</h1>

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>⚠ {error}</div>}

      <button onClick={() => { setCreando(true); setPartidaSeleccionada(null); }}>
        + Nueva partida
      </button>

      {/* formulario de CREACIÓN — prop correcta: partida (sin valor = modo crear) */}
      {creando && (
        <PartidaFormulario
          onGuardar={handleCrearPartida}
          onCancelar={() => setCreando(false)}
        />
      )}

      <PartidaLista
        partidas={partidas}
        cargando={cargando}
        partidaSeleccionadaId={partidaSeleccionada?.idPartida}
        onSeleccionar={seleccionarPartida}
        onEditar={(p) => { setPartidaSeleccionada(p); setEditando(true); }}
        onEliminar={handleEliminarPartida}
      />

      {/* detalle — onEditar recibe (partida: PartidaPublica), correcto */}
      {partidaSeleccionada && !editando && (
        <PartidaDetalle
          partida={partidaSeleccionada}
          onEditar={(p) => { setPartidaSeleccionada(p); setEditando(true); }}
          onEliminar={handleEliminarPartida}
        />
      )}

      {/* formulario de EDICIÓN — prop correcta: partida={partidaSeleccionada} */}
      {editando && partidaSeleccionada && (
        <PartidaFormulario
          partida={partidaSeleccionada}
          onGuardar={handleActualizarPartida}
          onCancelar={() => setEditando(false)}
        />
      )}

      {/*sesiones */}
      {partidaSeleccionada && !editando && (
        <section style={{ marginTop: '2rem' }}>
          <h2>Sesiones de "{partidaSeleccionada.nombre}"</h2>

          {errorSesion && <p style={{ color: 'red' }}>⚠ {errorSesion}</p>}

          <button onClick={() => setCreandoSesion(!creandoSesion)}>+ Nueva sesión</button>

          {creandoSesion && (
            <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
              <h3>Nueva sesión</h3>
              <label>
                Número de sesión:{' '}
                <input type="number" min={1} value={formSesion.numSesion}
                  onChange={(e) => setFormSesion({ ...formSesion, numSesion: Number(e.target.value) })} />
              </label><br />
              <label>
                Duración (minutos):{' '}
                <input type="number" min={1} value={formSesion.duracionSesion}
                  onChange={(e) => setFormSesion({ ...formSesion, duracionSesion: Number(e.target.value) })} />
              </label><br />
              <label>
                Cantidad de jugadores:{' '}
                <input type="number" min={1} value={formSesion.cantJugadores}
                  onChange={(e) => setFormSesion({ ...formSesion, cantJugadores: Number(e.target.value) })} />
              </label><br />
              <label>
                Estado inicial:{' '}
                <select value={formSesion.estado}
                  onChange={(e) => setFormSesion({ ...formSesion, estado: e.target.value as SesionPublica['estado'] })}>
                  <option value="planificada">Planificada</option>
                  <option value="en_curso">En curso</option>
                </select>
              </label><br />
              <button onClick={() => { void handleCrearSesion(); }}>Crear</button>
              <button onClick={() => setCreandoSesion(false)}>Cancelar</button>
            </div>
          )}

          {cargandoSesiones ? (
            <p>Cargando sesiones...</p>
          ) : sesiones.length === 0 ? (
            <p>Esta partida no tiene sesiones todavía.</p>
          ) : (
            <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Nº</th><th>Duración (min)</th><th>Jugadores</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
               {sesiones.map((s) => (
  <tr key={s.numSesion}>
    <td>{s.numSesion}</td>
    <td>{s.duracionSesion}</td>
    <td>{s.cantJugadores}</td>
    <td>{etiquetaEstado(s.estado)}</td>
    <td>
      {s.estado === 'planificada' && (
        <button onClick={() => { void handleCambiarEstadoSesion(s, 'en_curso'); }}>▶ Iniciar</button>
      )}
      {s.estado === 'en_curso' && (
        <button onClick={() => { void handleCambiarEstadoSesion(s, 'finalizada'); }}>■ Finalizar</button>
      )}
      <button
        style={{ marginLeft: '0.5rem' }}
        onClick={async () => {
          const ids = await obtenerParticipantes(s.idPartida, s.numSesion);
          setParticipantes((prev) => ({ ...prev, [s.numSesion]: ids }));
        }}
      >
        👥 Ver participantes
      </button>
      <button style={{ marginLeft: '0.5rem', color: 'red' }}
        onClick={() => { void handleEliminarSesion(s); }}>
        Eliminar
      </button>

      {/* sección de participantes (se muestra al clickear "Ver") */}
      {participantes[s.numSesion] !== undefined && (
        <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f5f5f5' }}>
          <strong>Participantes (IDs): </strong>
          {participantes[s.numSesion].length === 0
            ? 'Ninguno todavía'
            : participantes[s.numSesion].join(', ')}
          <br />
          {s.estado !== 'finalizada' && (
            <>
              <input
                type="number" min={1}
                placeholder="ID del personaje"
                value={idPersonajeNuevo}
                onChange={(e) => setIdPersonajeNuevo(Number(e.target.value))}
                style={{ width: '130px', marginRight: '0.5rem' }}
              />
              <button onClick={async () => {
                try {
                  await agregarParticipante(s.idPartida, s.numSesion, idPersonajeNuevo);
                  const ids = await obtenerParticipantes(s.idPartida, s.numSesion);
                  setParticipantes((prev) => ({ ...prev, [s.numSesion]: ids }));
                } catch (err: unknown) {
                  setErrorSesion(err instanceof Error ? err.message : 'Error al agregar');
                }
              }}>
                + Agregar
              </button>
            </>
          )}
        </div>
      )}
    </td>
  </tr>
))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  );
}