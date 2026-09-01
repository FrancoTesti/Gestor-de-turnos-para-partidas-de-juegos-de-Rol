import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function RegisterPage() {
  const [nombreUsuario, setNombreUsuario] = React.useState('');
  const [nickname, setNickname] = React.useState('');
  const [contrasena, setContrasena] = React.useState('');
  const [tipo, setTipo] = React.useState<'jugador' | 'anfitrion'>('jugador');
  const { registrarUsuario, mensaje } = useUser();
  const navigate = useNavigate();

  const handleRegister = () => {
    registrarUsuario(nombreUsuario, nickname, contrasena, tipo);
    // Después de registrar, vuelve al login
    setTimeout(() => navigate('/login'), 500);
  };

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>Registrarse</h2>

      {mensaje && (
        <p style={{ background: '#eee', padding: '0.5rem', borderRadius: 4 }}>
          {mensaje}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          placeholder="Nombre y apellido"
          value={nombreUsuario}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombreUsuario(e.target.value)}
          style={{ padding: '0.5rem', fontSize: '1rem' }}
        />
        <input
          placeholder="Nickname"
          value={nickname}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNickname(e.target.value)}
          style={{ padding: '0.5rem', fontSize: '1rem' }}
        />
        <input
          placeholder="Contraseña"
          type="password"
          value={contrasena}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContrasena(e.target.value)}
          style={{ padding: '0.5rem', fontSize: '1rem' }}
        />

        <fieldset style={{ border: '1px solid #ccc', padding: '1rem' }}>
          <legend>Tipo de cuenta</legend>
          <label style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="radio"
              checked={tipo === 'jugador'}
              onChange={() => setTipo('jugador')}
            />
            Jugador
          </label>
          <label style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="radio"
              checked={tipo === 'anfitrion'}
              onChange={() => setTipo('anfitrion')}
            />
            Anfitrión
          </label>
        </fieldset>

        <button onClick={handleRegister} style={{ padding: '0.5rem', fontSize: '1rem' }}>
          Registrar
        </button>
        <button
          onClick={() => navigate('/login')}
          style={{ padding: '0.5rem', fontSize: '1rem', background: '#222222' }}
        >
          Ir a Login
        </button>
      </div>
    </div>
  );
}
