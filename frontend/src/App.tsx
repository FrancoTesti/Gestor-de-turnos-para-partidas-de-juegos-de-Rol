import * as React from 'react';
import { useState } from 'react';
import type { Usuario } from './interfaces.ts';

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
  // Reemplaza jugadores[] / anfitriones[] de menu.ts: un solo array de Usuario,
  // discriminado por datosJugador / datosAnfitrion, tal como está en el DDD.
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [vista, setVista] = useState<Vista>('principal');
  const [usuarioLogueado, setUsuarioLogueado] = useState<Usuario | null>(null);
  const [mensaje, setMensaje] = useState<string>('');
 
  function registrarUsuario(
    nombreUsuario: string,
    nickname: string,
    contrasenia: string,
    tipo: 'jugador' | 'anfitrion'
  ) {
    const yaExiste = usuarios.some((u: Usuario) => u.nickname === nickname);
    if (yaExiste) {
      setMensaje('Ese nickname ya está en uso.');
      return;
    }
 
    const nuevoUsuario: Usuario = {
      idUsuario: proximoId++,
      nombreUsuario,
      contrasenia,
      imagen: '',
      nickname,
      ...(tipo === 'jugador'
        ? { datosJugador: { estado: true } }
        : { datosAnfitrion: { cantPartidasActuales: 0, karma: 0 } }),
    };
 
    setUsuarios((prev: Usuario[]) => [...prev, nuevoUsuario]);
    setMensaje(`${tipo === 'jugador' ? 'Jugador' : 'Anfitrión'} registrado con éxito.`);
    setVista('principal');
  }
 
  function loguearse(nickname: string, contrasenia: string) {
    const encontrado = usuarios.find(
      (u: Usuario) => u.nickname === nickname && u.contrasenia === contrasenia
    );
    if (encontrado) {
      setUsuarioLogueado(encontrado);
      const rol = encontrado.datosJugador ? 'jugador' : 'anfitrión';
      setMensaje(`Bienvenido ${rol} ${encontrado.nickname}.`);
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
            {u.nickname} — {u.datosJugador ? 'jugador' : 'anfitrión'}
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTipo('jugador')}
        />
        Jugador
      </label>
      <label>
        <input
          type="radio"
          checked={tipo === 'anfitrion'}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTipo('anfitrion')}
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