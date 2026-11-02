import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import type { Mision, Sesion, Partida, Personaje } from '../interfaces';
import { getMissions, createMission, updateMission, deleteMission, completeMission } from '../services/mission.service';
import type { Reward } from '../services/mission.service';
import { getSession } from '../services/session.service';
import type { SessionDetailDTO } from '../services/session.service';
import Alert from '../components/ui/Alert';
import Loading from '../components/ui/Loading';
import Modal from '../components/ui/Modal';
import { NoticeModal, CoinIcon, ZapIcon, CloseIcon } from '../components/ui';

function getErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'No se pudo completar la operación';
}

function formatMissionError(mensaje: string): string {
  if (/(idPartida|numSesion).*Too small/i.test(mensaje) || /(idPartida|numSesion).*>0/i.test(mensaje) || /sesión.*(válida|curso)/i.test(mensaje)) {
    return 'Debes seleccionar una sesión en curso para crear la misión.';
  }
  if (/numMision.*(Too big|demasiado grande|2147483647)/i.test(mensaje)) {
    return 'El número de misión es demasiado grande. Debe ser un número entero menor o igual a 2.147.483.647.';
  }
  if (/numMision.*(Too small|>0|mayor a 0)/i.test(mensaje)) {
    return 'El número de misión debe ser un número entero mayor a 0.';
  }
  if (/descripcion.*(Too small|required|vacía)/i.test(mensaje)) {
    return 'Debes ingresar una descripción para la misión.';
  }
  if (/(dineroTotal|xpTotal).*(Too big|demasiado grande)/i.test(mensaje)) {
    return 'El monto de recompensa es demasiado grande (máximo 2.147.483.647).';
  }
  if (/Ese número de misión ya existe/i.test(mensaje) || /ya existe/i.test(mensaje)) {
    return 'Ese número de misión ya existe en esta sesión. Elegí otro número de misión.';
  }
  if (/La sesión está finalizada/i.test(mensaje) || /finalizada/i.test(mensaje)) {
    return 'No se pueden crear ni modificar misiones en una sesión que ya fue finalizada.';
  }
  return mensaje;
}

export function MissionsPage() {
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
  const [errorAvisoModal, setErrorAvisoModal] = useState<string | null>(null);
  const [aviso, setAviso] = useState('');
  const [revision, setRevision] = useState(0);
  
  const estadoInicialMision = { idPartida: '', numSesion: '', numMision: '', descripcion: '', dineroTotal: 0, xpTotal: 0, asistenciaGrupoGrande: 0 };
  const [nuevaMision, setNuevaMision] = useState(estadoInicialMision);
  const [errorFormulario, setErrorFormulario] = useState('');
  const [editando, setEditando] = useState(false);
  const [misionAEliminar, setMisionAEliminar] = useState<Mision | null>(null);

  const [selectedMision, setSelectedMision] = useState<Mision | null>(null);
  const [participantes, setParticipantes] = useState<SessionDetailDTO['participantes']>([]);
  const [recompensas, setRecompensas] = useState<Reward[]>([]);

  useEffect(() => {
    let activo = true;
    Promise.all([
      getMissions(),
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
      .catch((e: unknown) => { if (activo) setErrorAvisoModal(getErrorMessage(e)); })
      .finally(() => { if (activo) setLoading(false); });
    return () => { activo = false; };
  }, [revision]);

  function recargar() {
    setLoading(true);
    setErrorFormulario('');
    setErrorAvisoModal(null);
    setRevision(value => value + 1);
  }

  const handleCrearOActualizar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorFormulario('');
    setAviso('');

    const idPartidaNum = Number(nuevaMision.idPartida);
    const numSesionNum = Number(nuevaMision.numSesion);

    if (!nuevaMision.idPartida || !nuevaMision.numSesion || !idPartidaNum || !numSesionNum || idPartidaNum <= 0 || numSesionNum <= 0) {
      const msg = 'Debes seleccionar una sesión en curso para crear la misión.';
      setErrorFormulario(msg);
      setErrorAvisoModal(msg);
      return;
    }

    const numMisionNum = Number(nuevaMision.numMision);
    if (!nuevaMision.numMision || isNaN(numMisionNum) || !Number.isInteger(numMisionNum) || numMisionNum <= 0) {
      const msg = 'El número de misión debe ser un número entero mayor a 0.';
      setErrorFormulario(msg);
      setErrorAvisoModal(msg);
      return;
    }

    if (numMisionNum > 2147483647) {
      const msg = 'El número de misión es demasiado grande. Debe ser un número entero entre 1 y 2.147.483.647.';
      setErrorFormulario(msg);
      setErrorAvisoModal(msg);
      return;
    }

    if (!nuevaMision.descripcion.trim()) {
      const msg = 'Debes ingresar una descripción para la misión.';
      setErrorFormulario(msg);
      setErrorAvisoModal(msg);
      return;
    }

    const dineroNum = Number(nuevaMision.dineroTotal);
    if (isNaN(dineroNum) || !Number.isInteger(dineroNum) || dineroNum < 0 || dineroNum > 2147483647) {
      const msg = 'El dinero total debe ser un valor entero positivo (máximo 2.147.483.647).';
      setErrorFormulario(msg);
      setErrorAvisoModal(msg);
      return;
    }

    const xpNum = Number(nuevaMision.xpTotal);
    if (isNaN(xpNum) || !Number.isInteger(xpNum) || xpNum < 0 || xpNum > 2147483647) {
      const msg = 'El XP total debe ser un valor entero positivo (máximo 2.147.483.647).';
      setErrorFormulario(msg);
      setErrorAvisoModal(msg);
      return;
    }

    try {
      if (editando) {
        await updateMission(
          idPartidaNum,
          numSesionNum,
          numMisionNum,
          {
            descripcion: nuevaMision.descripcion.trim(),
            dineroTotal: dineroNum,
            xpTotal: xpNum,
            asistenciaGrupoGrande: Number(nuevaMision.asistenciaGrupoGrande)
          }
        );
      } else {
        await createMission({
          idPartida: idPartidaNum,
          numSesion: numSesionNum,
          numMision: numMisionNum,
          descripcion: nuevaMision.descripcion.trim(),
          dineroTotal: dineroNum,
          xpTotal: xpNum,
          asistenciaGrupoGrande: Number(nuevaMision.asistenciaGrupoGrande)
        });
      }
      recargar();
      setAviso(editando ? 'Misión actualizada.' : 'Misión creada.');
      setNuevaMision(estadoInicialMision);
      setEditando(false);
    } catch (e: unknown) {
      const msg = formatMissionError(getErrorMessage(e));
      setErrorFormulario(msg);
      setErrorAvisoModal(msg);
    }
  };

  const handleEditar = (m: Mision) => {
    setErrorFormulario('');
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
      await deleteMission(misionAEliminar.idPartida, misionAEliminar.numSesion, misionAEliminar.numMision);
      recargar();
      setAviso('Misión eliminada.');
    } catch (e: unknown) {
      setErrorAvisoModal(getErrorMessage(e));
    } finally {
      setMisionAEliminar(null);
    }
  };

  const handleSeleccionar = async (mision: Mision) => {
    setSelectedMision(mision);
    try {
      const sesionDetalle = await getSession(mision.idPartida, mision.numSesion);
      setParticipantes(sesionDetalle.participantes ?? []);
      setRecompensas((sesionDetalle.participantes ?? []).map(p => ({ idPersonaje: p.idPersonaje, dinero: 0, xp: 0 })));
    } catch (e: unknown) {
      setErrorAvisoModal(getErrorMessage(e));
    }
  };

  const handleChangeRecompensa = (idPersonaje: number, campo: 'dinero' | 'xp', valor: number) => {
    setRecompensas(prev => prev.map(r => r.idPersonaje === idPersonaje ? { ...r, [campo]: valor } : r));
  };

  const handleCompletar = async () => {
    if (!selectedMision) return;
    try {
      await completeMission(selectedMision.idPartida, selectedMision.numSesion, selectedMision.numMision, recompensas);
      recargar();
      setAviso('Misión completada y recompensas acreditadas.');
      setSelectedMision(null);
    } catch (e: unknown) {
      setErrorAvisoModal(getErrorMessage(e));
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

  const esAnfitrionDePartida = (idPartida: number) => {
    if (!host) return false;
    const p = partidas.find(pt => Number(pt.idPartida) === Number(idPartida));
    return p ? Number(p.idUsuarioAnfitrion) === Number(userId) : true;
  };

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
      
      {aviso && <p role="status" className="mensaje-exito">{aviso}</p>}

      {/* Selector de Partida */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.25rem', background: 'var(--bg-card)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', boxSizing: 'border-box', width: '100%' }}>
        <label htmlFor="filtro-partida-misiones" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <span>Partida:</span>
        </label>
        <select
          id="filtro-partida-misiones"
          aria-label="Filtrar por Partida"
          value={filtroPartida}
          onChange={(e) => setFiltroPartida(e.target.value)}
          style={{ padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-card-secondary)', color: 'var(--text-h)', maxWidth: '100%', boxSizing: 'border-box' }}
        >
          <option value="">Todas las partidas visibles ({partidasDelUsuario.length > 0 ? partidasDelUsuario.length : partidas.length})</option>
          {(partidasDelUsuario.length > 0 ? partidasDelUsuario : partidas).map((p) => (
            <option key={p.idPartida} value={String(p.idPartida)}>
              {p.nombre} (#{p.idPartida})
            </option>
          ))}
        </select>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
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
                    <td style={{ fontWeight: 600 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: 'var(--success-text)' }}>
                        <CoinIcon size={14} /> {m.dineroTotal}
                      </span>
                      <span style={{ color: 'var(--text-muted)', margin: '0 0.35rem', fontWeight: 400 }}>|</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: 'var(--accent-text)' }}>
                        <ZapIcon size={14} /> {m.xpTotal} XP
                      </span>
                    </td>
                    <td>
                      {m.estado ? (
                        <span className="badge badge-success">Completada</span>
                      ) : (
                        <span className="badge badge-warning">Pendiente</span>
                      )}
                    </td>
                    <td>
                      {!m.estado && esAnfitrionDePartida(m.idPartida) && (
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <button className="btn-primary btn-small" onClick={() => void handleSeleccionar(m)}>Repartir</button>
                          <button className="btn-secondary btn-small" onClick={() => handleEditar(m)}>Editar</button>
                          <button className="btn-danger btn-small" onClick={() => void handleEliminar(m)} aria-label="Eliminar misión" title="Eliminar misión">
                            <CloseIcon size={13} />
                          </button>
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
                  <select
                    required
                    disabled={editando}
                    value={nuevaMision.idPartida && nuevaMision.numSesion ? `${nuevaMision.idPartida}-${nuevaMision.numSesion}` : ''}
                    onChange={e => {
                      setErrorFormulario('');
                      if (!e.target.value) {
                        setNuevaMision({ ...nuevaMision, idPartida: '', numSesion: '' });
                      } else {
                        const [p, s] = e.target.value.split('-');
                        setNuevaMision({ ...nuevaMision, idPartida: p, numSesion: s });
                      }
                    }}
                  >
                    <option value="">Seleccionar...</option>
                    {sesiones.filter(s => (s.estadoSesion === 1 || editando) && esAnfitrionDePartida(s.idPartida)).map(s => (
                      <option key={`${s.idPartida}-${s.numSesion}`} value={`${s.idPartida}-${s.numSesion}`}>
                        Partida {partidas.find(p => p.idPartida === s.idPartida)?.nombre} - S{s.numSesion}
                      </option>
                    ))}
                  </select>
                </label>
                <label>Número Misión:
                  <input
                    type="number"
                    min="1"
                    max="2147483647"
                    disabled={editando}
                    required
                    value={nuevaMision.numMision}
                    onChange={e => { setNuevaMision({ ...nuevaMision, numMision: e.target.value }); setErrorFormulario(''); }}
                  />
                </label>
                <label>Descripción:
                  <input
                    type="text"
                    required
                    value={nuevaMision.descripcion}
                    onChange={e => { setNuevaMision({ ...nuevaMision, descripcion: e.target.value }); setErrorFormulario(''); }}
                  />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <label>
                    Dinero Total:
                    <input
                      type="number"
                      min="0"
                      max="2147483647"
                      required
                      value={nuevaMision.dineroTotal}
                      onChange={e => { setNuevaMision({ ...nuevaMision, dineroTotal: Number(e.target.value) }); setErrorFormulario(''); }}
                    />
                  </label>
                  <label>
                    XP Total:
                    <input
                      type="number"
                      min="0"
                      max="2147483647"
                      required
                      value={nuevaMision.xpTotal}
                      onChange={e => { setNuevaMision({ ...nuevaMision, xpTotal: Number(e.target.value) }); setErrorFormulario(''); }}
                    />
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn-primary">{editando ? 'Guardar Cambios' : 'Crear Misión'}</button>
                  {editando && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => { setEditando(false); setNuevaMision(estadoInicialMision); setErrorFormulario(''); }}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
                {errorFormulario && (
                  <div style={{ marginTop: '1rem' }}>
                    <Alert type="warning" message={errorFormulario} onClose={() => setErrorFormulario('')} />
                  </div>
                )}
              </form>
            </div>
          )}
      </div>

      {selectedMision && !selectedMision.estado && (
        <div
          className="usuario-modal-overlay"
          onClick={() => setSelectedMision(null)}
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.25rem',
            boxSizing: 'border-box',
          }}
        >
          <div
            className="usuario-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '580px',
              width: '100%',
              padding: '1.75rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6)',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                  Completar y Repartir
                </p>
                <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.4rem' }}>Misión #{selectedMision.numMision}</h2>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedMision(null)}
                aria-label="Cerrar"
                style={{ padding: '0.4rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <div style={{ background: 'var(--bg-card-secondary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: '1.25rem' }}>
              <p style={{ margin: 0, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <strong>Recompensa Total a Repartir:</strong>
                <span style={{ color: 'var(--success-text)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CoinIcon size={14} /> {selectedMision.dineroTotal} Monedas
                </span>
                <span>|</span>
                <span style={{ color: 'var(--accent-text)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ZapIcon size={14} /> {selectedMision.xpTotal} XP
                </span>
              </p>
            </div>

            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem' }}>Asignación a participantes:</h4>
            <div style={{ maxHeight: '220px', overflowY: 'auto', marginBottom: '1rem' }}>
              {participantes?.map(p => {
                const rec = recompensas.find(r => r.idPersonaje === p.idPersonaje);
                return (
                  <div key={p.idPersonaje} style={{ background: 'var(--bg-card-secondary)', border: '1px solid var(--border-subtle)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <strong style={{ minWidth: '120px', color: 'var(--text-h)' }}>{p.nombre}</strong>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <label style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                        <CoinIcon size={13} /> Oro:
                        <input aria-label="$$:" type="number" min="0" max="2147483647" style={{ width: '85px', padding: '0.35rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} value={rec?.dinero ?? 0} onChange={e => handleChangeRecompensa(p.idPersonaje, 'dinero', Number(e.target.value))} />
                      </label>
                      <label style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                        <ZapIcon size={13} /> XP:
                        <input aria-label="XP:" type="number" min="0" max="2147483647" style={{ width: '85px', padding: '0.35rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} value={rec?.xp ?? 0} onChange={e => handleChangeRecompensa(p.idPersonaje, 'xp', Number(e.target.value))} />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: '0.85rem 1rem', background: esCorrecto ? 'var(--success-bg)' : 'var(--error-bg)', border: '1px solid', borderColor: esCorrecto ? 'var(--success-border)' : 'var(--error-border)', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
              <p style={{ margin: 0, fontWeight: 600, color: esCorrecto ? 'var(--success-text)' : 'var(--error-text)', fontSize: '0.9rem' }}>
                Suma asignada: Dinero ({sumaDinero} / {selectedMision.dineroTotal}) | XP ({sumaXp} / {selectedMision.xpTotal})
              </p>
              {!esCorrecto && <p style={{ color: 'var(--error-text)', margin: '0.25rem 0 0', fontSize: '0.825rem' }}>El reparto debe coincidir exactamente con los totales de la misión.</p>}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedMision(null)}
              >
                Cancelar Reparto
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => void handleCompletar()}
                disabled={!esCorrecto}
              >
                Confirmar y Completar
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={misionAEliminar !== null}
        title="Eliminar misión"
        message={`¿Seguro que deseas eliminar la misión ${misionAEliminar?.numMision}?`}
        onConfirm={() => void confirmarEliminacion()}
        onCancel={() => setMisionAEliminar(null)}
        type="confirm"
      />

      <NoticeModal mensaje={errorAvisoModal} onClose={() => setErrorAvisoModal(null)} />
    </div>
  );
}

export const MisionesPage = MissionsPage;
export default MissionsPage;

