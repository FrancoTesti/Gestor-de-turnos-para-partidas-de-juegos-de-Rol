import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Usuario, Jugador, Anfitrion } from '../interfaces';
import { api, ApiError } from '../services/api';
interface Session { usuario: Usuario; roles: { idUsuario: number; jugador: boolean; anfitrion: boolean } }
interface UserContextType {
  usuarios: Usuario[]; jugadores: Jugador[]; anfitriones: Anfitrion[];
  usuarioLogueado: Usuario | null; mensaje: string; cargandoSesion: boolean;
  registrarUsuario: (nombre: string, nickname: string, password: string, tipo: 'jugador' | 'anfitrion') => Promise<void>;
  loguearse: (nickname: string, password: string) => Promise<void>;
  logout: () => Promise<void>; limpiarMensaje: () => void; recargar: () => Promise<void>;
  rolDe: (id: number) => 'jugador' | 'anfitrion' | 'usuario';
}
const UserContext = createContext<UserContextType | undefined>(undefined);
export function UserProvider({ children }: { children: ReactNode }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [anfitriones, setAnfitriones] = useState<Anfitrion[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const recargar = useCallback(async () => {
    const [u, j, a] = await Promise.all([api<Usuario[]>('/usuarios'), api<Jugador[]>('/jugadores'), api<Anfitrion[]>('/anfitriones')]);
    setUsuarios(u); setJugadores(j); setAnfitriones(a);
    setSession(prev => prev ? { ...prev, usuario: u.find(x => x.idUsuario === prev.usuario.idUsuario) ?? prev.usuario } : null);
  }, []);
  useEffect(() => {
    let active = true;
    api<Session>('/auth/me').then(async s => {
      if (active) { setSession(s); await recargar(); }
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
    setSession(s); await recargar(); setMensaje(`Bienvenido, ${s.usuario.nickname}.`);
  };
  const logout = async () => {
    await api('/auth/logout', 'POST');
    setSession(null); setUsuarios([]); setJugadores([]); setAnfitriones([]); setMensaje('Sesión cerrada.');
  };
  const rolDe = (id: number) => {
    if (anfitriones.some(a => a.idUsuario === id)) return 'anfitrion';
    if (jugadores.some(j => j.idUsuario === id)) return 'jugador';
    return 'usuario';
  };
  return <UserContext.Provider value={{ usuarios, jugadores, anfitriones, usuarioLogueado: session?.usuario ?? null, mensaje, cargandoSesion, registrarUsuario, loguearse, logout, limpiarMensaje, rolDe, recargar }}>{children}</UserContext.Provider>;
}
// eslint-disable-next-line react-refresh/only-export-components
export function useUser() {
  const value = useContext(UserContext);
  if (!value) throw new Error('useUser debe ser usado dentro de UserProvider');
  return value;
}
