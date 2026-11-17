import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Usuario, Jugador, Anfitrion } from '../interfaces';
import { api, ApiError, SESSION_EXPIRED_EVENT } from '../services/api';
interface Session { usuario: Usuario; roles: { idUsuario: number; jugador: boolean; anfitrion: boolean } }
export interface UserContextType {
  usuarios: Usuario[]; jugadores: Jugador[]; anfitriones: Anfitrion[];
  usuarioLogueado: Usuario | null; mensaje: string; cargandoSesion: boolean;
  registrarUsuario: (nombre: string, nickname: string, password: string, tipo: 'jugador' | 'anfitrion') => Promise<void>;
  loguearse: (nickname: string, password: string) => Promise<void>;
  logout: () => Promise<void>; limpiarMensaje: () => void; recargar: () => Promise<void>;
  rolDe: (id: number) => 'jugador' | 'anfitrion' | 'usuario';
  esJugador: boolean;
  esAnfitrion: boolean;
  tieneRolJugador: (id?: number) => boolean;
  tieneRolAnfitrion: (id?: number) => boolean;
}
const UserContext = createContext<UserContextType | undefined>(undefined);
export function UserProvider({ children }: { children: ReactNode }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [anfitriones, setAnfitriones] = useState<Anfitrion[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const sessionVersion = useRef(0);
  const clearSession = useCallback(() => {
    sessionVersion.current += 1;
    setSession(null); setUsuarios([]); setJugadores([]); setAnfitriones([]);
  }, []);
  useEffect(() => {
    const expired = () => { clearSession(); };
    window.addEventListener(SESSION_EXPIRED_EVENT, expired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, expired);
  }, [clearSession]);
  const recargar = useCallback(async () => {
    const version = sessionVersion.current;
    const [u, j, a] = await Promise.all([api<Usuario[]>('/usuarios'), api<Jugador[]>('/jugadores'), api<Anfitrion[]>('/anfitriones')]);
    if (version !== sessionVersion.current) return;
    setUsuarios(u); setJugadores(j); setAnfitriones(a);
    setSession(prev => prev ? { ...prev, usuario: u.find(x => x.idUsuario === prev.usuario.idUsuario) ?? prev.usuario } : null);
  }, []);
  useEffect(() => {
    let active = true;
    const version = sessionVersion.current;
    api<Session>('/auth/me').then(async s => {
      if (active && version === sessionVersion.current) { setSession(s); await recargar(); }
    }).catch(error => {
      if (active && !(error instanceof ApiError && error.status === 401)) setMensaje('No se pudo conectar con el servidor. Reintentá al iniciar sesión.');
    }).finally(() => { if (active) setCargandoSesion(false); });
    return () => { active = false; };
  }, [recargar]);
  const limpiarMensaje = useCallback(() => setMensaje(''), []);
  const registrarUsuario = async (nombreUsuario: string, nickname: string, contrasena: string, tipo: 'jugador' | 'anfitrion') => {
    await api('/auth/register', 'POST', { nombreUsuario, nickname, contrasena, tipo });
    if (session) await recargar();
    setMensaje('Cuenta creada. Ya podés iniciar sesión.');
  };
  const loguearse = async (nickname: string, contrasena: string) => {
    const s = await api<Session>('/auth/login', 'POST', { nickname, contrasena });
    sessionVersion.current += 1;
    setSession(s); await recargar(); setMensaje(`Bienvenido, ${s.usuario.nickname}.`);
  };
  const logout = async () => {
    await api('/auth/logout', 'POST');
    clearSession(); setMensaje('Sesión cerrada.');
  };
  const tieneRolJugador = useCallback((id?: number) => {
    const targetId = id ?? session?.usuario?.idUsuario;
    if (!targetId) return false;
    return jugadores.some(j => j.idUsuario === targetId) || (session?.usuario?.idUsuario === targetId && !!session?.roles?.jugador);
  }, [jugadores, session]);
  const tieneRolAnfitrion = useCallback((id?: number) => {
    const targetId = id ?? session?.usuario?.idUsuario;
    if (!targetId) return false;
    return anfitriones.some(a => a.idUsuario === targetId) || (session?.usuario?.idUsuario === targetId && !!session?.roles?.anfitrion);
  }, [anfitriones, session]);
  const esJugador = session?.usuario ? tieneRolJugador(session.usuario.idUsuario) : false;
  const esAnfitrion = session?.usuario ? tieneRolAnfitrion(session.usuario.idUsuario) : false;
  const rolDe = (id: number) => {
    if (tieneRolAnfitrion(id)) return 'anfitrion';
    if (tieneRolJugador(id)) return 'jugador';
    return 'usuario';
  };
  return <UserContext.Provider value={{ usuarios, jugadores, anfitriones, usuarioLogueado: session?.usuario ?? null, mensaje, cargandoSesion, registrarUsuario, loguearse, logout, limpiarMensaje, rolDe, recargar, esJugador, esAnfitrion, tieneRolJugador, tieneRolAnfitrion }}>{children}</UserContext.Provider>;
}
// eslint-disable-next-line react-refresh/only-export-components
export function useUser() {
  const value = useContext(UserContext);
  if (!value) throw new Error('useUser debe ser usado dentro de UserProvider');
  return value;
}
