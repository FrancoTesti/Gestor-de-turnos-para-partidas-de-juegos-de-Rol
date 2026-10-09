import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import type { Mision, Sesion, Partida, Personaje } from '../interfaces';
import { obtenerMisiones, crearMision, actualizarMision, eliminarMision, completarMision } from '../services/mision.service';
import type { Recompensa } from '../services/mision.service';
import { obtenerSesion } from '../services/sesion.service';
import type { SesionDetalleDTO } from '../services/sesion.service';
import Alert from '../components/ui/Alert';
import Loading from '../components/ui/Loading';
import Modal from '../components/ui/Modal';

function mensajeError(e: unknown): string {
  return e instanceof Error ? e.message : 'No se pudo completar la operación';
}

export default function MisionesPage() {
  const { usuarioLogueado, rolDe } = useUser();
  const userId = usuarioLogueado?.idUsuario ?? 0;
  const host = rolDe(userId) === 'anfitrion';
  
  const [misiones, setMisiones] = useState<Mision[]>([]);
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [personajes, setPersonajes] = useState<Personaje[]>([]);
  const [filtroPartida, setFiltroPartida] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('partida') || '';
    }
    return '';
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [revision, setRevision] = useState(0);
  
  const estadoInicialMision = { idPartida: '', numSesion: '', numMision: '', descripcion: '', dineroTotal: 0, xpTotal: 0, asistenciaGrupoGrande: 0 };
  const [nuevaMision, setNuevaMision] = useState(estadoInicialMision);
  const [editando, setEditando] = useState(false);
  const [misionAEliminar, setMisionAEliminar] = useState<Mision | null>(null);

  const [selectedMision, setSelectedMision] = useState<Mision | null>(null);
  const [participantes, setParticipantes] = useState<SesionDetalleDTO['participantes']>([]);
  const [recompensas, setRecompensas] = useState<Recompensa[]>([]);

  useEffect(() => {
    let activo = true;
    Promise.all([
      obtenerMisiones(),
      api<Sesion[]>('/sesiones').catch(() => []),
      api<Partida[]>('/partidas').catch(() => []),
      api<Personaje[]>('/personajes').catch(() => []),
    ])
      .then(([mis, ses, pts, pjs]) => {
        if (activo) {
          setMisiones(mis);
          setSesiones(ses);
          setPartidas(pts);
          setPersonajes(pjs);
        }
      })
      .catch((e: unknown) => { if (activo) setError(mensajeError(e)); })
      .finally(() => { if (activo) setLoading(false); });
    return () => { activo = false; };
  }, [revision]);

  function recargar() {
    setLoading(true);
    setError('');
    setRevision(value => value + 1);
  }

  const handleCrearOActualizar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      if (editando) {
        await actualizarMision(
          Number(nuevaMision.idPartida),
          Number(nuevaMision.numSesion),
          Number(nuevaMision.numMision),
          {
            descripcion: nuevaMision.descripcion,
            dineroTotal: Number(nuevaMision.dineroTotal),
            xpTotal: Number(nuevaMision.xpTotal),
            asistenciaGrupoGrande: Number(nuevaMision.asistenciaGrupoGrande)
          }
        );
      } else {
        await crearMision({
          idPartida: Number(nuevaMision.idPartida),
          numSesion: Number(nuevaMision.numSesion),
          numMision: Number(nuevaMision.numMision),
          descripcion: nuevaMision.descripcion,
          dineroTotal: Number(nuevaMision.dineroTotal),
          xpTotal: Number(nuevaMision.xpTotal),
          asistenciaGrupoGrande: Number(nuevaMision.asistenciaGrupoGrande)
        });
      }
      recargar();
      setAviso(editando ? 'Misión actualizada.' : 'Misión creada.');
      setNuevaMision(estadoInicialMision);
      setEditando(false);
    } catch (e: unknown) {
      setError(mensajeError(e));
    }
  };

  const handleEditar = (m: Mision) => {
    setNuevaMision({
      idPartida: String(m.idPartida),
      numSesion: String(m.numSesion),
      numMision: String(m.numMision),
      descripcion: m.descripcion,
      dineroTotal: m.dineroTotal,
      xpTotal: m.xpTotal,
      asistenciaGrupoGrande: m.asistenciaGrupoGrande
    });
    setEditando(true);
  };

  const handleEliminar = (m: Mision) => {
    setMisionAEliminar(m);
  };

  const confirmarEliminacion = async () => {
    if (!misionAEliminar) return;
    try {
      setError('');
      await eliminarMision(misionAEliminar.idPartida, misionAEliminar.numSesion, misionAEliminar.numMision);
      recargar();
      setAviso('Misión eliminada.');
    } catch (e: unknown) {
      setError(mensajeError(e));
    } finally {
      setMisionAEliminar(null);
    }
  };

  const handleSeleccionar = async (mision: Mision) => {
    setSelectedMision(mision);
    try {
      setError('');
      const sesionDetalle = await obtenerSesion(mision.idPartida, mision.numSesion);
      setParticipantes(sesionDetalle.participantes ?? []);
      setRecompensas((sesionDetalle.participantes ?? []).map(p => ({ idPersonaje: p.idPersonaje, dinero: 0, xp: 0 })));
    } catch (e: unknown) {
      setError(mensajeError(e));
    }
  };

  const handleChangeRecompensa = (idPersonaje: number, campo: 'dinero' | 'xp', valor: number) => {
    setRecompensas(prev => prev.map(r => r.idPersonaje === idPersonaje ? { ...r, [campo]: valor } : r));
  };

  const handleCompletar = async () => {
    if (!selectedMision) return;
    try {
      setError('');
      await completarMision(selectedMision.idPartida, selectedMision.numSesion, selectedMision.numMision, recompensas);
      recargar();
      setAviso('Misión completada y recompensas acreditadas.');
      setSelectedMision(null);
    } catch (e: unknown) {
      setError(mensajeError(e));
    }
  };

  const misPersonajes = useMemo(() => {
    return personajes.filter(p => p.idUsuarioJugador === userId);
  }, [personajes, userId]);

  const partidasDelUsuario = useMemo(() => {
    return partidas.filter(p => {
      const esAnfitrionDePartida = p.idUsuarioAnfitrion === userId;
      const tienePjEnPartida = misPersonajes.some(pj => pj.idPartida === p.idPartida);
      return esAnfitrionDePartida || tienePjEnPartida;
    });
  }, [partidas, userId, misPersonajes]);

  const misionesFiltradas = useMemo(() => {
    if (filtroPartida) {
      return misiones.filter(m => String(m.idPartida) === String(filtroPartida));
    }
    if (partidas.length > 0 && partidasDelUsuario.length > 0) {
      const idsPermitidos = new Set(partidasDelUsuario.map(p => p.idPartida));
      return misiones.filter(m => idsPermitidos.has(m.idPartida));
    }
    return misiones;
  }, [misiones, filtroPartida, partidas.length, partidasDelUsuario]);

  const sumaDinero = recompensas.reduce((acc, r) => acc + r.dinero, 0);
  const sumaXp = recompensas.reduce((acc, r) => acc + r.xp, 0);
  const esCorrecto = selectedMision && sumaDinero === selectedMision.dineroTotal && sumaXp === selectedMision.xpTotal;

  if (loading) return <Loading />;

  return (
    <div className="module-page">
      <div style={{ marginBottom: '1.25rem' }}>
        <p className="app-eyebrow">Objetivos y Recompensas</p>
        <h1>Gestión de Misiones</h1>
      </div>
      
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {aviso && <p role="status" className="mensaje-exito">{aviso}</p>}

      {/* Selector de Partida */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.25rem', background: 'var(--bg-card)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <span>🎲 Partida:</span>
          <select
            value={filtroPartida}
            onChange={(e) => setFiltroPartida(e.target.value)}
            style={{ padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-card-secondary)', color: 'var(--text-h)' }}
          >
            <option value="">Todas las partidas visibles ({partidasDelUsuario.length > 0 ? partidasDelUsuario.length : partidas.length})</option>
            {(partidasDelUsuario.length > 0 ? partidasDelUsuario : partidas).map((p) => (
              <option key={p.idPartida} value={String(p.idPartida)}>
                {p.nombre} (#{p.idPartida})
              </option>
            ))}
          </select>
        </label>
        {filtroPartida && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setFiltroPartida('')}
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
          >
            Mostrar todas las partidas
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ minWidth: 0 }}>
          <div className="tabla-scroll">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Partida</th>
                  <th>Sesión</th>
                  <th>Misión</th>
                  <th>Descripción</th>
                  <th>Premio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {misionesFiltradas.map(m => (
                  <tr key={`${m.idPartida}-${m.numSesion}-${m.numMision}`}>
                    <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>{partidas.find(p => p.idPartida === m.idPartida)?.nombre || `Partida #${m.idPartida}`}</td>
                    <td>S{m.numSesion}</td>
                    <td>M{m.numMision}</td>
                    <td>{m.descripcion}</td>
                    <td style={{ fontWeight: 600, color: 'var(--accent-text)' }}>${m.dineroTotal} | {m.xpTotal}XP</td>
                    <td>
                      {m.estado ? (
                        <span className="badge badge-success">Completada</span>
                      ) : (
                        <span className="badge badge-warning">Pendiente</span>
                      )}
                    </td>
                    <td>
                      {!m.estado && host && (
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <button className="btn-primary btn-small" onClick={() => void handleSeleccionar(m)}>Repartir</button>
                          <button className="btn-secondary btn-small" onClick={() => handleEditar(m)}>Editar</button>
                          <button className="btn-danger btn-small" onClick={() => void handleEliminar(m)}>X</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {host && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginTop: '1.5rem', boxShadow: 'var(--shadow)' }}>
              <form onSubmit={(e) => void handleCrearOActualizar(e)} className="app-form">
                <h3 style={{ marginTop: 0 }}>{editando ? 'Editar Misión' : 'Crear Misión'}</h3>
                <label>Sesión en Curso:
                  <select required disabled={editando} value={`${nuevaMision.idPartida}-${nuevaMision.numSesion}`} onChange={e => {
                    const [p, s] = e.target.value.split('-');
                    setNuevaMision({ ...nuevaMision, idPartida: p, numSesion: s });
                  }}>
                    <option value="-">Seleccionar...</option>
                    {sesiones.filter(s => s.estadoSesion === 1 || editando).map(s => (
                      <option key={`${s.idPartida}-${s.numSesion}`} value={`${s.idPartida}-${s.numSesion}`}>
                        Partida {partidas.find(p => p.idPartida === s.idPartida)?.nombre} - S{s.numSesion}
                      </option>
                    ))}
                  </select>
                </label>
                <label>Número Misión:
                  <input type="number" min="1" disabled={editando} required value={nuevaMision.numMision} onChange={e => setNuevaMision({ ...nuevaMision, numMision: e.target.value })} />
                </label>
                <label>Descripción:
                  <input type="text" required value={nuevaMision.descripcion} onChange={e => setNuevaMision({ ...nuevaMision, descripcion: e.target.value })} />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <label>Dinero Total: <input type="number" min="0" required value={nuevaMision.dineroTotal} onChange={e => setNuevaMision({ ...nuevaMision, dineroTotal: Number(e.target.value) })} /></label>
                  <label>XP Total: <input type="number" min="0" required value={nuevaMision.xpTotal} onChange={e => setNuevaMision({ ...nuevaMision, xpTotal: Number(e.target.value) })} /></label>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn-primary">{editando ? 'Guardar Cambios' : 'Crear Misión'}</button>
                  {editando && <button type="button" className="btn-secondary" onClick={() => { setEditando(false); setNuevaMision(estadoInicialMision); }}>Cancelar</button>}
                </div>
              </form>
            </div>
          )}
        </div>

        {selectedMision && !selectedMision.estado && (
          <aside style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}>
            <h2 style={{ marginTop: 0 }}>Completar Misión {selectedMision.numMision}</h2>
            <p style={{ color: 'var(--text)' }}>
              <strong>A Repartir:</strong>{' '}
              <span style={{ color: 'var(--success-text)', fontWeight: 700 }}>{selectedMision.dineroTotal} Monedas</span> |{' '}
              <span style={{ color: 'var(--accent-text)', fontWeight: 700 }}>{selectedMision.xpTotal} Experiencia</span>
            </p>
            <hr />
            
            {participantes?.map(p => {
              const rec = recompensas.find(r => r.idPersonaje === p.idPersonaje);
              return (
                <div key={p.idPersonaje} style={{ background: 'var(--bg-card-secondary)', border: '1px solid var(--border-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <strong style={{ minWidth: '110px', color: 'var(--text-h)' }}>{p.nombre}</strong>
                  <label style={{ margin: 0 }}>$$: <input type="number" min="0" style={{ width: '80px', padding: '0.35rem' }} value={rec?.dinero ?? 0} onChange={e => handleChangeRecompensa(p.idPersonaje, 'dinero', Number(e.target.value))} /></label>
                  <label style={{ margin: 0 }}>XP: <input type="number" min="0" style={{ width: '80px', padding: '0.35rem' }} value={rec?.xp ?? 0} onChange={e => handleChangeRecompensa(p.idPersonaje, 'xp', Number(e.target.value))} /></label>
                </div>
              );
            })}
            
            <div style={{ marginTop: '1rem', padding: '1rem', background: esCorrecto ? 'var(--success-bg)' : 'var(--error-bg)', border: '1px solid', borderColor: esCorrecto ? 'var(--success-border)' : 'var(--error-border)', borderRadius: 'var(--radius-sm)' }}>
              <p style={{ margin: 0, fontWeight: 600, color: esCorrecto ? 'var(--success-text)' : 'var(--error-text)' }}>
                Sumas actuales: Dinero ({sumaDinero}) | XP ({sumaXp})
              </p>
              {!esCorrecto && <p style={{ color: 'var(--error-text)', margin: '0.35rem 0 0', fontSize: '0.85rem' }}>⚠️ El reparto debe coincidir **exactamente** con los totales de la misión.</p>}
            </div>

            <button className="btn-primary" onClick={() => void handleCompletar()} disabled={!esCorrecto} style={{ marginTop: '1rem', width: '100%' }}>
              Confirmar y Completar Misión
            </button>
            <button type="button" className="btn-secondary" style={{ marginTop: '0.5rem', width: '100%' }} onClick={() => setSelectedMision(null)}>
              Cancelar Reparto
            </button>
          </aside>
        )}
      </div>

      <Modal
        isOpen={misionAEliminar !== null}
        title="Eliminar misión"
        message={`¿Seguro que deseas eliminar la misión ${misionAEliminar?.numMision}?`}
        onConfirm={() => void confirmarEliminacion()}
        onCancel={() => setMisionAEliminar(null)}
        type="confirm"
      />
    </div>
  );
}
