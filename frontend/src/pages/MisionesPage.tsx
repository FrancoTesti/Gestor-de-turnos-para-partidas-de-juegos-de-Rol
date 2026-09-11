import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import type { Mision, Sesion, Partida } from '../interfaces';
import { obtenerMisiones, crearMision, actualizarMision, eliminarMision, completarMision, Recompensa } from '../services/mision.service';
import { SesionDetalleDTO, obtenerSesion } from '../services/sesion.service';
import Alert from '../components/ui/Alert';
import Loading from '../components/ui/Loading';

export default function MisionesPage() {
  const { usuarioLogueado, rolDe } = useUser();
  const host = rolDe(usuarioLogueado?.idUsuario ?? 0) === 'anfitrion';
  
  const [misiones, setMisiones] = useState<Mision[]>([]);
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const estadoInicialMision = { idPartida: '', numSesion: '', numMision: '', descripcion: '', dineroTotal: 0, xpTotal: 0, asistenciaGrupoGrande: 0 };
  const [nuevaMision, setNuevaMision] = useState(estadoInicialMision);
  const [editando, setEditando] = useState(false);

  const [selectedMision, setSelectedMision] = useState<Mision | null>(null);
  const [participantes, setParticipantes] = useState<SesionDetalleDTO['participantes']>([]);
  const [recompensas, setRecompensas] = useState<Recompensa[]>([]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [mis, ses, pts] = await Promise.all([
        obtenerMisiones(),
        api<Sesion[]>('/sesiones'),
        api<Partida[]>('/partidas')
      ]);
      setMisiones(mis);
      setSesiones(ses);
      setPartidas(pts);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void cargarDatos(); }, []);

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
      await cargarDatos();
      setNuevaMision(estadoInicialMision);
      setEditando(false);
    } catch (e: any) {
      setError(e.message);
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

  const handleEliminar = async (m: Mision) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la misión ${m.numMision}?`)) return;
    try {
      setError('');
      await eliminarMision(m.idPartida, m.numSesion, m.numMision);
      await cargarDatos();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleSeleccionar = async (mision: Mision) => {
    setSelectedMision(mision);
    try {
      setError('');
      const sesionDetalle = await obtenerSesion(mision.idPartida, mision.numSesion);
      setParticipantes(sesionDetalle.participantes ?? []);
      setRecompensas((sesionDetalle.participantes ?? []).map(p => ({ idPersonaje: p.idPersonaje, dinero: 0, xp: 0 })));
    } catch (e: any) {
      setError(e.message);
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
      await cargarDatos();
      setSelectedMision(null);
      alert('¡Misión completada con éxito!');
    } catch (e: any) {
      setError(e.message);
    }
  };

  const sumaDinero = recompensas.reduce((acc, r) => acc + r.dinero, 0);
  const sumaXp = recompensas.reduce((acc, r) => acc + r.xp, 0);
  const esCorrecto = selectedMision && sumaDinero === selectedMision.dineroTotal && sumaXp === selectedMision.xpTotal;

  if (loading) return <Loading />;

  return (
    <div className="module-page">
      <h1>Gestión de Misiones</h1>
      {error && <Alert type="error" message={error} />}

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 50%' }}>
          <table className="app-table">
            <thead>
              <tr><th>Partida</th><th>Sesión</th><th>Misión</th><th>Premio</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {misiones.map(m => (
                <tr key={`${m.idPartida}-${m.numSesion}-${m.numMision}`}>
                  <td>{partidas.find(p => p.idPartida === m.idPartida)?.nombre}</td>
                  <td>S{m.numSesion}</td>
                  <td>M{m.numMision}</td>
                  <td>${m.dineroTotal} | {m.xpTotal}XP</td>
                  <td>{m.estado ? <b style={{ color: 'green' }}>Completada</b> : <b style={{ color: 'orange' }}>Pendiente</b>}</td>
                  <td>
                    {!m.estado && host && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-small" onClick={() => void handleSeleccionar(m)}>Repartir</button>
                        <button className="btn btn-small" onClick={() => handleEditar(m)}>Editar</button>
                        <button className="btn btn-small" style={{ background: 'red' }} onClick={() => void handleEliminar(m)}>X</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {host && (
            <form onSubmit={(e) => void handleCrearOActualizar(e)} className="app-form" style={{ marginTop: '2rem' }}>
              <h3>{editando ? 'Editar Misión' : 'Crear Misión'}</h3>
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
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label>Dinero Total: <input type="number" min="0" required value={nuevaMision.dineroTotal} onChange={e => setNuevaMision({ ...nuevaMision, dineroTotal: Number(e.target.value) })} /></label>
                <label>XP Total: <input type="number" min="0" required value={nuevaMision.xpTotal} onChange={e => setNuevaMision({ ...nuevaMision, xpTotal: Number(e.target.value) })} /></label>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn">{editando ? 'Guardar Cambios' : 'Crear Misión'}</button>
                {editando && <button type="button" className="btn" onClick={() => { setEditando(false); setNuevaMision(estadoInicialMision); }}>Cancelar</button>}
              </div>
            </form>
          )}
        </div>

        {selectedMision && !selectedMision.estado && (
          <div style={{ flex: '1 1 40%', padding: '1rem', border: '2px solid #ccc', borderRadius: '8px' }}>
            <h2>Completar Misión {selectedMision.numMision}</h2>
            <p><strong>A Repartir:</strong> {selectedMision.dineroTotal} Monedas | {selectedMision.xpTotal} Experiencia</p>
            <hr />
            
            {participantes?.map(p => {
              const rec = recompensas.find(r => r.idPersonaje === p.idPersonaje);
              return (
                <div key={p.idPersonaje} style={{ background: '#f9f9f9', padding: '0.5rem', marginBottom: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <strong style={{ width: '120px' }}>{p.nombre}</strong>
                  <label style={{ margin: 0 }}>$$: <input type="number" min="0" style={{ width: '70px' }} value={rec?.dinero ?? 0} onChange={e => handleChangeRecompensa(p.idPersonaje, 'dinero', Number(e.target.value))} /></label>
                  <label style={{ margin: 0 }}>XP: <input type="number" min="0" style={{ width: '70px' }} value={rec?.xp ?? 0} onChange={e => handleChangeRecompensa(p.idPersonaje, 'xp', Number(e.target.value))} /></label>
                </div>
              );
            })}
            
            <div style={{ marginTop: '1rem', padding: '1rem', background: esCorrecto ? '#e6ffe6' : '#ffe6e6', border: '1px solid', borderColor: esCorrecto ? 'green' : 'red' }}>
              <p>Sumas actuales: Dinero ({sumaDinero}) | XP ({sumaXp})</p>
              {!esCorrecto && <p style={{ color: 'red', margin: 0 }}>⚠️ El reparto debe coincidir **exactamente** con los totales de la misión.</p>}
            </div>

            <button className="btn" onClick={() => void handleCompletar()} disabled={!esCorrecto} style={{ marginTop: '1rem', width: '100%', opacity: esCorrecto ? 1 : 0.5 }}>
              Confirmar y Completar Misión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
