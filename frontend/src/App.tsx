import * as React from 'react';
import { useState } from 'react';
import type { Usuario, Jugador, Anfitrion } from './interfaces.ts';

// allow JSX in environments without @types/react
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
 
// Vista actual del "menú" (reemplaza el while + switch de la consola)
type Vista = 'principal' | 'registro' | 'login';
 
let proximoId = 1; // simula el autoincrement de idUsuario (CP) hasta que haya backend
 
export default function MenuApp() {
  // Modelo relacional: tres listas separadas, relacionadas por idUsuario.
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [anfitriones, setAnfitriones] = useState<Anfitrion[]>([]);
  const [vista, setVista] = useState<Vista>('principal');
  const [usuarioLogueado, setUsuarioLogueado] = useState<Usuario | null>(null);
  const [mensaje, setMensaje] = useState<string>('');

  // El rol se deduce mirando en que tabla esta el usuario.
  function rolDe(idUsuario: number): 'jugador' | 'anfitrión' | 'usuario' {
    if (jugadores.some((j: Jugador) => j.idUsuario === idUsuario)) return 'jugador';
    if (anfitriones.some((a: Anfitrion) => a.idUsuario === idUsuario)) return 'anfitrión';
    return 'usuario';
  }

  function registrarUsuario(
    nombreUsuario: string,
    nickname: string,
    contrasena: string,
    tipo: 'jugador' | 'anfitrion'
  ) {
    const yaExiste = usuarios.some((u: Usuario) => u.nickname === nickname);
    if (yaExiste) {
      setMensaje('Ese nickname ya está en uso.');
      return;
    }

    const idUsuario = proximoId++;
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
    setVista('principal');
  }

  function loguearse(nickname: string, contrasena: string) {
    const encontrado = usuarios.find(
      (u: Usuario) => u.nickname === nickname && u.contrasena === contrasena
    );
    if (encontrado) {
      setUsuarioLogueado(encontrado);
      setMensaje(`Bienvenido ${rolDe(encontrado.idUsuario)} ${encontrado.nickname}.`);
    } else {
      setMensaje('Usuario no encontrado.');
    }
    setVista('principal');
  }
 
  return (
    <div style={{ maxWidth: 420, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>Gestor de turnos — juegos de rol</h2>
 
      {mensaje && (
        <p style={{ background: '#eee', padding: '0.5rem', borderRadius: 4 }}>{mensaje}</p>
      )}
 
      {usuarioLogueado && (
        <p>
          Sesión activa: <strong>{usuarioLogueado.nickname}</strong>
        </p>
      )}
 
      {vista === 'principal' && (
        <PantallaPrincipal
          onLoguearse={() => setVista('login')}
          onRegistrarse={() => setVista('registro')}
        />
      )}
 
      {vista === 'registro' && (
        <PantallaRegistro
          onRegistrar={registrarUsuario}
          onVolver={() => setVista('principal')}
        />
      )}
 
      {vista === 'login' && (
        <PantallaLogin onLoguearse={loguearse} onVolver={() => setVista('principal')} />
      )}
 
      <hr />
      <p>Usuarios registrados (en memoria, sin persistencia):</p>
      <ul>
        {usuarios.map((u: Usuario) => (
          <li key={u.idUsuario}>
            {u.nickname} — {rolDe(u.idUsuario)} 
          </li>
        ))}
      </ul>
    </div>
  );
}
 
function PantallaPrincipal({
  onLoguearse,
  onRegistrarse,
}: {
  onLoguearse: () => void;
  onRegistrarse: () => void;
}) {
  return (
    <div>
      <button onClick={onLoguearse}>Loguearse</button>
      <button onClick={onRegistrarse}>Registrarse</button>
    </div>
  );
}
 
function PantallaLogin({
  onLoguearse,
  onVolver,
}: {
  onLoguearse: (nickname: string, contrasenia: string) => void;
  onVolver: () => void;
}) {
  const [nickname, setNickname] = useState('');
  const [contrasenia, setContrasenia] = useState('');
 
  return (
    <div>
      <input
        placeholder="Nickname"
        value={nickname}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNickname(e.target.value)}
      />
      <input
        placeholder="Contraseña"
        type="password"
        value={contrasenia}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContrasenia(e.target.value)}
      />
      <button onClick={() => onLoguearse(nickname, contrasenia)}>Ingresar</button>
      <button onClick={onVolver}>Volver</button>
    </div>
  );
}
 
function PantallaRegistro({
  onRegistrar,
  onVolver,
}: {
  onRegistrar: (
    nombreUsuario: string,
    nickname: string,
    contrasenia: string,
    tipo: 'jugador' | 'anfitrion'
  ) => void;
  onVolver: () => void;
}) {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [nickname, setNickname] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [tipo, setTipo] = useState<'jugador' | 'anfitrion'>('jugador');
 
  return (
    <div>
      <input
        placeholder="Nombre y apellido"
        value={nombreUsuario}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombreUsuario(e.target.value)}
      />
      <input
        placeholder="Nickname"
        value={nickname}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNickname(e.target.value)}
      />
      <input
        placeholder="Contraseña"
        type="password"
        value={contrasenia}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContrasenia(e.target.value)}
      />
      <label>
        <input
          type="radio"
          checked={tipo === 'jugador'}
          onChange={() => setTipo('jugador')}
        />
        Jugador
      </label>
      <label>
        <input
          type="radio"
          checked={tipo === 'anfitrion'}
          onChange={() => setTipo('anfitrion')}
        />
        Anfitrión
      </label>
      <button onClick={() => onRegistrar(nombreUsuario, nickname, contrasenia, tipo)}>
        Registrar
      </button>
      <button onClick={onVolver}>Volver</button>
    </div>
  );
}