import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import type { Sesion, Partida, Personaje } from '../interfaces';
import { obtenerSesiones, obtenerSesion, crearSesion, jugarSesion, finalizarSesion, calificarAnfitrion } from '../services/sesion.service';
import type { SesionDetalleDTO } from '../services/sesion.service';
import { obtenerMisiones } from '../services/mision.service';
import type { Mision } from '../interfaces';
import Alert from '../components/ui/Alert';
import Loading from '../components/ui/Loading';

function mensajeError(e: unknown): string {
  return e instanceof Error ? e.message : 'No se pudo completar la operación';
}

export default function SesionesPage() {
  const { usuarioLogueado, rolDe } = useUser();
  const host = rolDe(usuarioLogueado?.idUsuario ?? 0) === 'anfitrion';
  
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [misiones, setMisiones] = useState<Mision[]>([]);
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [personajes, setPersonajes] = useState<Personaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<SesionDetalleDTO | null>(null);
  const [aviso, setAviso] = useState('');
  const [revision, setRevision] = useState(0);

  // estados de formularios
  const [nuevaSesion, setNuevaSesion] = useState({ idPartida: '', numSesion: '', duracionSesion: 60 });
  const [participantesIds, setParticipantesIds] = useState<number[]>([]);
  const [valorKarma, setValorKarma] = useState<1 | -1>(1);

  useEffect(() => {
    let activo = true;
    Promise.all([obtenerSesiones(), obtenerMisiones(), api<Partida[]>('/partidas'), api<Personaje[]>('/personajes')])
      .then(([ses, mis, pts, pjs]) => { if (activo) { setSesiones(ses); setMisiones(mis); setPartidas(pts); setPersonajes(pjs); } })
      .catch((e: unknown) => { if (activo) setError(mensajeError(e)); })
      .finally(() => { if (activo) setLoading(false); });
    return () => { activo = false; };
  }, [revision]);

  function recargar() {
    setLoading(true);
    setError('');
    setRevision(value => value + 1);
  }

  const handleVerDetalle = async (idPartida: number, numSesion: number) => {
    try {
      setError('');
      const detalle = await obtenerSesion(idPartida, numSesion);
      setSelected(detalle);
      setParticipantesIds([]);
    } catch (e: unknown) {
      setError(mensajeError(e));
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
      recargar();
      setAviso('Sesión creada correctamente.');
      setNuevaSesion({ idPartida: '', numSesion: '', duracionSesion: 60 });
    } catch (e: unknown) {
      setError(mensajeError(e));
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
      recargar();
      setAviso('Sesión iniciada con los participantes elegidos.');
    } catch (e: unknown) {
      setError(mensajeError(e));
    }
  };

  const handleFinalizar = async () => {
    if (!selected) return;
    try {
      setError('');
      await finalizarSesion(selected.idPartida, selected.numSesion);
      await handleVerDetalle(selected.idPartida, selected.numSesion);
      recargar();
      setAviso('Sesión finalizada.');
    } catch (e: unknown) {
      setError(mensajeError(e));
    }
  };

  const handleCalificar = async () => {
    if (!selected) return;
    try {
      setError('');
      await calificarAnfitrion(selected.idPartida, selected.numSesion, valorKarma);
      await handleVerDetalle(selected.idPartida, selected.numSesion);
      setAviso('Calificación enviada.');
    } catch (e: unknown) {
      setError(mensajeError(e));
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="module-page">
      <div style={{ marginBottom: '1.25rem' }}>
        <p className="app-eyebrow">Gestión de Turnos y Partidas</p>
        <h1>Gestión de Sesiones</h1>
      </div>
      
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {aviso && <p role="status" className="mensaje-exito">{aviso}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ minWidth: 0 }}>
          <div className="tabla-scroll">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Partida</th>
                  <th>Sesión</th>
                  <th>Duración (min)</th>
                  <th>Misión Realizada</th>
                  <th>Oro Entregado</th>
                  <th>XP Entregado</th>
                  <th>Jugadores</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sesiones.map(s => {
                  const partidaNombre = partidas.find(p => p.idPartida === s.idPartida)?.nombre ?? String(s.idPartida);
                  const misionesSesion = misiones.filter(m => m.idPartida === s.idPartida && m.numSesion === s.numSesion);
                  const misionRealizada = misionesSesion.find(m => m.estado);
                  const oroTotal = misionesSesion.reduce((acc, m) => acc + (m.estado ? m.dineroOtorgadoAJugadores : 0), 0);
                  const xpTotal = misionesSesion.reduce((acc, m) => acc + (m.estado ? m.xpOtorgadoJugadores : 0), 0);

                  return (
                    <tr key={`${s.idPartida}-${s.numSesion}`}>
                      <td style={{ fontWeight: 600, color: 'var(--text-h)', maxWidth: 200 }} className="truncate" title={partidaNombre}>
                        {partidaNombre}
                      </td>
                      <td className="tabular-nums">#{s.numSesion}</td>
                      <td className="tabular-nums">{s.duracionSesion} min</td>
                      <td>
                        {misionRealizada ? (
                          <span style={{ fontWeight: 500 }} title={misionRealizada.descripcion}>
                            {misionRealizada.descripcion ? (misionRealizada.descripcion.length > 20 ? `${misionRealizada.descripcion.slice(0, 20)}…` : misionRealizada.descripcion) : `Misión #${misionRealizada.numMision}`}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin misión</span>
                        )}
                      </td>
                      <td className="tabular-nums">
                        <span style={{ color: 'var(--success-text)', fontWeight: 600 }}>
                          {oroTotal} 🪙
                        </span>
                      </td>
                      <td className="tabular-nums">
                        <span style={{ color: 'var(--accent-text)', fontWeight: 600 }}>
                          {xpTotal} XP
                        </span>
                      </td>
                      <td className="tabular-nums">{s.cantJugadores}</td>
                      <td>
                        {s.estadoSesion === 0 && <span className="badge badge-warning">Planificada</span>}
                        {s.estadoSesion === 1 && <span className="badge badge-info">En Curso</span>}
                        {s.estadoSesion === 2 && <span className="badge badge-success">Finalizada</span>}
                      </td>
                      <td>
                        <button
                          className="btn-secondary btn-small"
                          onClick={() => void handleVerDetalle(s.idPartida, s.numSesion)}
                          aria-label={`Ver detalle de sesión ${s.numSesion} de ${partidaNombre}`}
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {host && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginTop: '1.5rem', boxShadow: 'var(--shadow)' }}>
              <form onSubmit={(e) => void handleCrear(e)} className="app-form">
                <h3 style={{ marginTop: 0 }}>Crear Sesión</h3>
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
                <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Crear Sesión</button>
              </form>
            </div>
          )}
        </div>

        {selected && (
          <aside style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}>
            <h2 style={{ marginTop: 0 }}>Detalle: Sesión {selected.numSesion}</h2>
            <p><strong>Partida:</strong> {partidas.find(p => p.idPartida === selected.idPartida)?.nombre}</p>
            
            {/* Desglose de misiones de esta sesión */}
            {(() => {
              const misSes = misiones.filter(m => m.idPartida === selected.idPartida && m.numSesion === selected.numSesion);
              return misSes.length > 0 ? (
                <div style={{ marginTop: '1rem', background: 'var(--bg-card-secondary)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>Desglose de Misiones y Recompensas</h4>
                  {misSes.map(m => (
                    <div key={m.numMision} style={{ marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div><strong>Misión #{m.numMision}:</strong> {m.descripcion || 'Sin descripción'}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Estado: {m.estado ? '✅ Completada' : '⏳ Pendiente'} | XP: <strong>{m.xpOtorgadoJugadores}</strong> | Oro: <strong>{m.dineroOtorgadoAJugadores} 🪙</strong>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null;
            })()}

            {/* ESTADO 0: planificada */}
            {selected.estadoSesion === 0 && host && (
              <div style={{ marginTop: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem' }}>Iniciar Sesión</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Seleccioná los personajes que van a jugar:</p>
                <div style={{ background: 'var(--bg-card-secondary)', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', maxHeight: '200px', overflowY: 'auto' }}>
                  {personajes.filter(p => p.idPartida === selected.idPartida).map(p => (
                    <label key={p.idPersonaje} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0', cursor: 'pointer' }}>
                      <input type="checkbox" checked={participantesIds.includes(p.idPersonaje)}
                        onChange={(e) => {
                          if (e.target.checked) setParticipantesIds([...participantesIds, p.idPersonaje]);
                          else setParticipantesIds(participantesIds.filter(id => id !== p.idPersonaje));
                        }} />
                      <span>{p.nombreFicticio} (Nivel {p.nivel})</span>
                    </label>
                  ))}
                  {personajes.filter(p => p.idPartida === selected.idPartida).length === 0 && <p style={{ color: 'var(--error-text)', margin: 0 }}>No hay personajes anotados en esta partida.</p>}
                </div>
                <button className="btn-primary" onClick={() => void handleIniciar()} style={{ marginTop: '1rem' }}>Comenzar Sesión</button>
              </div>
            )}

            {/* ESTADO 1: EN CURSO */}
            {selected.estadoSesion === 1 && (
              <div style={{ marginTop: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem' }}>Participantes en juego</h3>
                <ul style={{ paddingLeft: '1.25rem', margin: '0.5rem 0' }}>
                  {selected.participantes?.map(p => <li key={p.idPersonaje} style={{ margin: '0.25rem 0' }}>{p.nombre}</li>)}
                </ul>
                {host && (
                  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <p style={{ color: 'var(--warning-text)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                      ⚠️ No podrás finalizar la sesión si hay misiones pendientes.
                    </p>
                    <button className="btn-danger" onClick={() => void handleFinalizar()}>Finalizar Sesión</button>
                  </div>
                )}
              </div>
            )}

            {/* ESTADO 2: FINALIZADA */}
            {selected.estadoSesion === 2 && (
              <div style={{ marginTop: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem' }}>Resumen de Recompensas</h3>
                <div style={{ background: 'var(--bg-card-secondary)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
                  <p style={{ margin: 0 }}>
                    <strong>Total entregado:</strong>{' '}
                    <span style={{ color: 'var(--success-text)', fontWeight: 700 }}>
                      {misiones.filter(m => m.idPartida === selected.idPartida && m.numSesion === selected.numSesion && m.estado).reduce((acc, m) => acc + m.dineroOtorgadoAJugadores, 0)} Monedas
                    </span>{' '}
                    y{' '}
                    <span style={{ color: 'var(--accent-text)', fontWeight: 700 }}>
                      {misiones.filter(m => m.idPartida === selected.idPartida && m.numSesion === selected.numSesion && m.estado).reduce((acc, m) => acc + m.xpOtorgadoJugadores, 0)} XP
                    </span>
                  </p>
                </div>

                <h3 style={{ fontSize: '1.1rem', marginTop: '1rem' }}>Participantes del historial</h3>
                <ul style={{ paddingLeft: '1.25rem', margin: '0.5rem 0' }}>
                  {selected.participantes?.map(p => (
                    <li key={p.idPersonaje} style={{ margin: '0.25rem 0' }}>{p.nombre} {p.dioKarma ? '⭐' : ''}</li>
                  ))}
                </ul>
                
                {/* Lógica para que un jugador participante pueda calificar 1 sola vez */}
                {!host && selected.participantes?.some(p => {
                    const miPj = personajes.find(pj => pj.idPersonaje === p.idPersonaje);
                    return miPj?.idUsuarioJugador === usuarioLogueado?.idUsuario && !p.dioKarma;
                }) && (
                  <div className="app-form" style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1.1rem', marginTop: 0 }}>Calificar Anfitrión</h3>
                    <label>Experiencia con el anfitrión:
                      <select value={valorKarma} onChange={e => setValorKarma(Number(e.target.value) === -1 ? -1 : 1)}>
                        <option value={1}>Buena experiencia (+1)</option>
                        <option value={-1}>Mala experiencia (-1)</option>
                      </select>
                    </label>
                    <button className="btn-primary" onClick={() => void handleCalificar()} style={{ marginTop: '0.5rem' }}>Enviar Calificación</button>
                  </div>
                )}
              </div>
            )}

            <button type="button" className="btn-secondary" style={{ marginTop: '1.25rem' }} onClick={() => setSelected(null)}>
              Cerrar detalle
            </button>
          </aside>
        )}
      </div>
    </div>
  );
}
