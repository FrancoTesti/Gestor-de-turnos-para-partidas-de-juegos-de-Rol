import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
export default function ProfilesPage() {
  const { usuarioLogueado, jugadores, anfitriones, recargar } = useUser();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const id = usuarioLogueado!.idUsuario;
  const player = jugadores.find(j => j.idUsuario === id);
  const host = anfitriones.find(a => a.idUsuario === id);
  const act = async (path: string, method: string, data?: unknown) => {
    setBusy(true); setError('');
    try { await api(path, method, data); await recargar(); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  };
  return <section><h1>Mis perfiles</h1>{error && <p role="alert">{error}</p>}
    <h2>Jugador</h2>{player ? <><p>Estado: {player.estado ? 'Activo' : 'Inactivo'}</p><button disabled={busy} onClick={() => void act(`/jugadores/${id}`, 'PUT', { estado: !player.estado })}>Cambiar estado</button><button disabled={busy} onClick={() => { if (window.confirm('¿Eliminar el perfil de jugador?')) void act(`/jugadores/${id}`, 'DELETE'); }}>Eliminar perfil</button></> : <button disabled={busy} onClick={() => void act('/jugadores', 'POST', { idUsuario: id, estado: true })}>Crear perfil de jugador</button>}
    <h2>Anfitrión</h2>{host ? <><p>Karma: {host.karma}. Partidas activas: {host.cantPartidasActuales}</p><button disabled={busy} onClick={() => { if (window.confirm('¿Eliminar el perfil de anfitrión?')) void act(`/anfitriones/${id}`, 'DELETE'); }}>Eliminar perfil</button></> : <button disabled={busy} onClick={() => void act('/anfitriones', 'POST', { idUsuario: id })}>Crear perfil de anfitrión</button>}
  </section>;
}
