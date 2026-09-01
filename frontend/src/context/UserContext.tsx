import React, { createContext, useContext, useState } from 'react';
import type { Usuario, Jugador, Anfitrion } from '../interfaces';

interface UserContextType {
  usuarios: Usuario[];
  jugadores: Jugador[];
  anfitriones: Anfitrion[];
  usuarioLogueado: Usuario | null;
  mensaje: string;
  registrarUsuario: (nombreUsuario: string, nickname: string, contrasena: string, tipo: 'jugador' | 'anfitrion') => void;
  loguearse: (nickname: string, contrasena: string) => void;
  logout: () => void;
  limpiarMensaje: () => void;
  rolDe: (idUsuario: number) => 'jugador' | 'anfitrion' | 'usuario';
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [anfitriones, setAnfitriones] = useState<Anfitrion[]>([]);
  const [usuarioLogueado, setUsuarioLogueado] = useState<Usuario | null>(null);
  const [mensaje, setMensaje] = useState<string>('');
  const [proximoId, setProximoId] = useState(1);

  const rolDe = (idUsuario: number): 'jugador' | 'anfitrion' | 'usuario' => {
    // Primero preguntamos por el rol más importante / con más permisos
    if (anfitriones.some((a: Anfitrion) => a.idUsuario === idUsuario)) return 'anfitrion';
    if (jugadores.some((j: Jugador) => j.idUsuario === idUsuario)) return 'jugador';
    return 'usuario';
  };

  const registrarUsuario = (
    nombreUsuario: string,
    nickname: string,
    contrasena: string,
    tipo: 'jugador' | 'anfitrion'
  ) => {
    const yaExiste = usuarios.some((u: Usuario) => u.nickname === nickname);
    if (yaExiste) {
      setMensaje('Ese nickname ya está en uso.');
      return;
    }

    const idUsuario = proximoId;
    setProximoId(proximoId + 1);

    setUsuarios((prev: Usuario[]) => [
      ...prev,
      { idUsuario, nombreUsuario, contrasena, imagen: '', nickname },
    ]);

    if (tipo === 'jugador') {
      setJugadores((prev: Jugador[]) => [...prev, { idUsuario, estado: true }]);
    } else {
      setAnfitriones((prev: Anfitrion[]) => [
        ...prev,
        { idUsuario, cantPartidasActuales: 0, karma: 0 },
      ]);
    }

    setMensaje(`${tipo === 'jugador' ? 'Jugador' : 'Anfitrión'} registrado con éxito.`);
  };

  const loguearse = (nickname: string, contrasena: string) => {
    const encontrado = usuarios.find(
      (u: Usuario) => u.nickname === nickname && u.contrasena === contrasena
    );
    if (encontrado) {
      setUsuarioLogueado(encontrado);
      setMensaje(`Bienvenido ${rolDe(encontrado.idUsuario)} ${encontrado.nickname}.`);
    } else {
      setMensaje('Usuario no encontrado.');
    }
  };

  const logout = () => {
    setUsuarioLogueado(null);
    setMensaje('Sesión cerrada.');
  };

  const limpiarMensaje = () => {
    setMensaje('');
  };

  return (
    <UserContext.Provider
      value={{
        usuarios,
        jugadores,
        anfitriones,
        usuarioLogueado,
        mensaje,
        registrarUsuario,
        loguearse,
        logout,
        limpiarMensaje,
        rolDe,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser debe ser usado dentro de UserProvider');
  }
  return context;
};
