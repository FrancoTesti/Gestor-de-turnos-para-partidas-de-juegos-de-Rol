import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Alert } from '../components/ui';
import ThemeToggle from '../components/ui/ThemeToggle';
import './AuthPages.css';

function EyeClosedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function EyeOpenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// Las reglas repiten las del backend (schemas/usuario.schema.ts) para avisar antes
// de mandar el formulario. El servidor vuelve a validar: esto no lo reemplaza.
function validar(nombreUsuario: string, nickname: string, contrasena: string, repetida: string): string {
  if (nombreUsuario.trim().length < 2) return 'El nombre y apellido debe tener al menos 2 caracteres.';
  if (nickname.trim().length < 3) return 'El nickname debe tener al menos 3 caracteres.';
  if (contrasena.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
  if (contrasena !== repetida) return 'Las dos contraseñas no coinciden.';
  return '';
}

export default function RegisterPage() {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [nickname, setNickname] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [repetida, setRepetida] = useState('');
  const [verContrasena, setVerContrasena] = useState(false);
  const [verRepetida, setVerRepetida] = useState(false);
  const [tipo, setTipo] = useState<'jugador' | 'anfitrion'>('jugador');
  const { registrarUsuario, mensaje, limpiarMensaje } = useUser();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleRegister = async (evento?: FormEvent) => {
    evento?.preventDefault();
    const problema = validar(nombreUsuario, nickname, contrasena, repetida);
    if (problema) { setError(problema); return; }

    setBusy(true); setError('');
    try { await registrarUsuario(nombreUsuario.trim(), nickname.trim(), contrasena, tipo); navigate('/login'); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo registrar'); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-top-bar">
        <ThemeToggle />
      </div>
      <main className="auth-page">
        <div className="auth-header">
          <div className="auth-brand-badge" aria-hidden="true">🛡️</div>
          <h2>Registrarse</h2>
          <p className="auth-subtitle">Crea tu cuenta de Aventurero o Director de Juego</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {mensaje && <Alert type="success" message={mensaje} onClose={limpiarMensaje} />}

        <form className="auth-form" onSubmit={handleRegister} noValidate>
          <div className="auth-campo">
            <label htmlFor="registro-nombre">Nombre y apellido</label>
            <input
              id="registro-nombre"
              name="nombreUsuario"
              autoComplete="name"
              placeholder="Nombre y apellido"
              value={nombreUsuario}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNombreUsuario(e.target.value)}
              disabled={busy}
            />
          </div>

          <div className="auth-campo">
            <label htmlFor="registro-nickname">Nickname</label>
            <input
              id="registro-nickname"
              name="nickname"
              autoComplete="username"
              placeholder="Nickname"
              value={nickname}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNickname(e.target.value)}
              disabled={busy}
            />
            <small className="auth-ayuda">Con este nombre vas a iniciar sesión; no puede repetirse.</small>
          </div>

          <div className="auth-campo">
            <label htmlFor="registro-contrasena">Contraseña</label>
            <div className="auth-input-wrapper">
              <input
                id="registro-contrasena"
                name="contrasena"
                type={verContrasena ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Contraseña"
                value={contrasena}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setContrasena(e.target.value)}
                disabled={busy}
              />
              <button
                type="button"
                className="auth-toggle-password"
                onClick={() => setVerContrasena(!verContrasena)}
                title={verContrasena ? 'Ocultar contraseña' : 'Ver contraseña'}
                aria-label={verContrasena ? 'Ocultar contraseña' : 'Ver contraseña'}
                disabled={busy}
              >
                {verContrasena ? <EyeOpenIcon /> : <EyeClosedIcon />}
              </button>
            </div>
            <small className="auth-ayuda">Mínimo 6 caracteres.</small>
          </div>

          <div className="auth-campo">
            <label htmlFor="registro-repetida">Repetir contraseña</label>
            <div className="auth-input-wrapper">
              <input
                id="registro-repetida"
                name="repetirContrasena"
                type={verRepetida ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repetir contraseña"
                value={repetida}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setRepetida(e.target.value)}
                disabled={busy}
              />
              <button
                type="button"
                className="auth-toggle-password"
                onClick={() => setVerRepetida(!verRepetida)}
                title={verRepetida ? 'Ocultar contraseña' : 'Ver contraseña'}
                aria-label={verRepetida ? 'Ocultar contraseña' : 'Ver contraseña'}
                disabled={busy}
              >
                {verRepetida ? <EyeOpenIcon /> : <EyeClosedIcon />}
              </button>
            </div>
          </div>

          <fieldset className="auth-tipo">
            <legend>Tipo de cuenta</legend>
            <label>
              <input
                type="radio"
                name="tipo"
                checked={tipo === 'jugador'}
                onChange={() => setTipo('jugador')}
                disabled={busy}
              />
              Jugador
            </label>
            <label>
              <input
                type="radio"
                name="tipo"
                checked={tipo === 'anfitrion'}
                onChange={() => setTipo('anfitrion')}
                disabled={busy}
              />
              Anfitrión
            </label>
            <small className="auth-ayuda">
              Después podés sumar el otro perfil desde la pantalla «Mis perfiles».
            </small>
          </fieldset>

          <button type="submit" className="auth-primario" disabled={busy} aria-busy={busy}>
            {busy ? 'Registrando…' : 'Registrar'}
          </button>
          <button
            type="button"
            className="auth-secundario"
            onClick={() => navigate('/login')}
          >
            Ir a Login
          </button>
        </form>
      </main>
    </div>
  );
}
