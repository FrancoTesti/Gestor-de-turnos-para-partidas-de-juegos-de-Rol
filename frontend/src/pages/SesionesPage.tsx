import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import type { Sesion, Partida, Personaje } from '../interfaces';
import { obtenerSesiones, obtenerSesion, crearSesion, jugarSesion, finalizarSesion, calificarAnfitrion, SesionDetalleDTO } from '../services/sesion.service';
import Alert from '../components/ui/Alert';
import Loading from '../components/ui/Loading';

export default function SesionesPage() {
  const { usuarioLogueado, rolDe } = useUser();
  const host = rolDe(usuarioLogueado?.idUsuario ?? 0) === 'anfitrion';
  
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [personajes, setPersonajes] = useState<Personaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<SesionDetalleDTO | null>(null);

  // estados de formularios
  const [nuevaSesion, setNuevaSesion] = useState({ idPartida: '', numSesion: '', duracionSesion: 60 });
  const [participantesIds, setParticipantesIds] = useState<number[]>([]);
  const [karma, setKarma] = useState(1);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [ses, pts, pjs] = await Promise.all([
        obtenerSesiones(),
        api<Partida[]>('/partidas'),
        api<Personaje[]>('/personajes')
      ]);
      setSesiones(ses);
      setPartidas(pts);
      setPersonajes(pjs);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void cargarDatos(); }, []);

  const handleVerDetalle = async (idPartida: number, numSesion: number) => {
    try {
      setError('');
      const detalle = await obtenerSesion(idPartida, numSesion);
      setSelected(detalle);
      setParticipantesIds([]);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await crearSesion({
        idPartida: Number(nuevaSesion.idPartida),
        numSesion: Number(nuevaSesion.numSesion),
        duracionSesion: Number(nuevaSesion.duracionSesion)
      });
      await cargarDatos();
      setNuevaSesion({ idPartida: '', numSesion: '', duracionSesion: 60 });
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleIniciar = async () => {
    if (!selected) return;
    if (participantesIds.length === 0) {
      setError('Debes seleccionar al menos un participante (personaje) para iniciar la sesión');
      return;
    }
    try {
      setError('');
      await jugarSesion(selected.idPartida, selected.numSesion, participantesIds);
      await handleVerDetalle(selected.idPartida, selected.numSesion);
      await cargarDatos();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleFinalizar = async () => {
    if (!selected) return;
    try {
      setError('');
      await finalizarSesion(selected.idPartida, selected.numSesion);
      await handleVerDetalle(selected.idPartida, selected.numSesion);
      await cargarDatos();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleCalificar = async () => {
    if (!selected) return;
    try {
      setError('');
      await calificarAnfitrion(selected.idPartida, selected.numSesion, karma);
      await handleVerDetalle(selected.idPartida, selected.numSesion);
      alert('Anfitrión calificado con éxito!');
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="module-page">
      <h1>Gestión de Sesiones</h1>
      {error && <Alert type="error" message={error} />}

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 50%' }}>
          <table className="app-table">
            <thead>
              <tr><th>Partida</th><th>Sesión</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {sesiones.map(s => (
                <tr key={`${s.idPartida}-${s.numSesion}`}>
                  <td>{partidas.find(p => p.idPartida === s.idPartida)?.nombre ?? s.idPartida}</td>
                  <td>{s.numSesion}</td>
                  <td>
                    {s.estadoSesion === 0 && <b style={{ color: 'gray' }}>Planificada</b>}
                    {s.estadoSesion === 1 && <b style={{ color: 'blue' }}>En Curso</b>}
                    {s.estadoSesion === 2 && <b style={{ color: 'green' }}>Finalizada</b>}
                  </td>
                  <td>
                    <button className="btn btn-small" onClick={() => void handleVerDetalle(s.idPartida, s.numSesion)}>Ver detalle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {host && (
            <form onSubmit={(e) => void handleCrear(e)} className="app-form" style={{ marginTop: '2rem' }}>
              <h3>Crear Sesión</h3>
              <label>Partida:
                <select required value={nuevaSesion.idPartida} onChange={e => setNuevaSesion({ ...nuevaSesion, idPartida: e.target.value })}>
                  <option value="">Seleccionar partida...</option>
                  {partidas.filter(p => p.idUsuarioAnfitrion === usuarioLogueado?.idUsuario).map(p => (
                    <option key={p.idPartida} value={p.idPartida}>{p.nombre}</option>
                  ))}
                </select>
              </label>
              <label>Número Sesión:
                <input type="number" min="1" required value={nuevaSesion.numSesion} onChange={e => setNuevaSesion({ ...nuevaSesion, numSesion: e.target.value })} />
              </label>
              <label>Duración (min):
                <input type="number" min="0" required value={nuevaSesion.duracionSesion} onChange={e => setNuevaSesion({ ...nuevaSesion, duracionSesion: Number(e.target.value) })} />
              </label>
              <button type="submit" className="btn">Crear Sesión</button>
            </form>
          )}
        </div>

        {selected && (
          <div style={{ flex: '1 1 40%', padding: '1rem', border: '2px solid #ccc', borderRadius: '8px', background: '#f9f9f9' }}>
            <h2>Detalle: Sesión {selected.numSesion}</h2>
            <p><strong>Partida:</strong> {partidas.find(p => p.idPartida === selected.idPartida)?.nombre}</p>
            
            {/* ESTADO 0: plaNificada */}
            {selected.estadoSesion === 0 && host && (
              <div style={{ marginTop: '1rem' }}>
                <h3>Iniciar Sesión</h3>
                <p>Seleccioná los personajes que van a jugar:</p>
                <div style={{ background: '#fff', padding: '1rem', border: '1px solid #ddd' }}>
                  {personajes.filter(p => p.idPartida === selected.idPartida).map(p => (
                    <label key={p.idPersonaje} style={{ display: 'block', margin: '0.5rem 0' }}>
                      <input type="checkbox" checked={participantesIds.includes(p.idPersonaje)}
                        onChange={(e) => {
                          if (e.target.checked) setParticipantesIds([...participantesIds, p.idPersonaje]);
                          else setParticipantesIds(participantesIds.filter(id => id !== p.idPersonaje));
                        }} />
                      {p.nombreFicticio} (Nivel {p.nivel})
                    </label>
                  ))}
                  {personajes.filter(p => p.idPartida === selected.idPartida).length === 0 && <p style={{color:'red'}}>No hay personajes anotados en esta partida.</p>}
                </div>
                <button className="btn" onClick={() => void handleIniciar()} style={{ marginTop: '1rem' }}>Comenzar Sesión</button>
              </div>
            )}

            {/* ESTADO 1: EN CURSO */}
            {selected.estadoSesion === 1 && (
              <div style={{ marginTop: '1rem' }}>
                <h3>Participantes en juego</h3>
                <ul>{selected.participantes?.map(p => <li key={p.idPersonaje}>{p.nombre}</li>)}</ul>
                {host && (
                  <>
                    <p style={{ color: '#d9534f', fontSize: '0.9em', marginTop: '1rem' }}>
                      ⚠️ No podrás finalizar la sesión si hay misiones pendientes.
                    </p>
                    <button className="btn" onClick={() => void handleFinalizar()} style={{ background: '#d9534f' }}>Finalizar Sesión</button>
                  </>
                )}
              </div>
            )}

            {/* ESTADO 2: FINALIZADA */}
            {selected.estadoSesion === 2 && (
              <div style={{ marginTop: '1rem' }}>
                <h3>Participantes del historial</h3>
                <ul>
                  {selected.participantes?.map(p => (
                    <li key={p.idPersonaje}>{p.nombre} {p.dioKarma ? '⭐' : ''}</li>
                  ))}
                </ul>
                
                {/* Lógica para que un jugador participante pueda calificar 1 sola vez */}
                {!host && selected.participantes?.some(p => {
                    const miPj = personajes.find(pj => pj.idPersonaje === p.idPersonaje);
                    return miPj?.idUsuarioJugador === usuarioLogueado?.idUsuario && !p.dioKarma;
                }) && (
                  <div className="app-form" style={{ marginTop: '1rem' }}>
                    <h3>Calificar Anfitrión</h3>
                    <label>Puntos de Karma:
                      <input type="number" min="1" max="5" value={karma} onChange={e => setKarma(Number(e.target.value))} />
                    </label>
                    <button className="btn" onClick={() => void handleCalificar()}>Enviar Calificación</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}