import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
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

export default function LoginPage() {
  const [nickname, setNickname] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [verContrasena, setVerContrasena] = useState(false);
  const [errorLogin, setErrorLogin] = useState('');
  const { usuarioLogueado, loguearse, mensaje, limpiarMensaje } = useUser();
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  // Si ya está logueado, redirige a dashboard
  useEffect(() => {
    if (usuarioLogueado) {
      navigate('/dashboard');
    }
  }, [usuarioLogueado, navigate]);

  const handleLogin = async (evento?: FormEvent) => {
    evento?.preventDefault();
    if (!nickname || !contrasena) {
      setErrorLogin('Completa todos los campos');
      return;
    }

    setBusy(true); setErrorLogin('');
    try { await loguearse(nickname, contrasena); navigate('/dashboard'); }
    catch (e) { setErrorLogin(e instanceof Error ? e.message : 'No se pudo iniciar sesión'); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-top-bar">
        <ThemeToggle />
      </div>
      <main className="auth-page">
        <div className="auth-header">
          <div className="auth-brand-badge" aria-hidden="true">🎲</div>
          <h2>Iniciar Sesión</h2>
          <p className="auth-subtitle">Gestor de Turnos para Partidas de Rol</p>
        </div>

        {mensaje && (
          <Alert
            type="success"
            message={mensaje}
            onClose={limpiarMensaje}
          />
        )}

        {errorLogin && (
          <Alert
            type="error"
            message={errorLogin}
            onClose={() => setErrorLogin('')}
          />
        )}

        <form className="auth-form" onSubmit={handleLogin} noValidate>
          <div className="auth-campo">
            <label htmlFor="login-nickname">Nickname</label>
            <input
              id="login-nickname"
              name="nickname"
              autoComplete="username"
              placeholder="Nickname"
              value={nickname}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNickname(e.target.value)}
              disabled={busy}
            />
          </div>

          <div className="auth-campo">
            <label htmlFor="login-contrasena">Contraseña</label>
            <div className="auth-input-wrapper">
              <input
                id="login-contrasena"
                name="contrasena"
                type={verContrasena ? 'text' : 'password'}
                autoComplete="current-password"
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
          </div>

          <button type="submit" className="auth-primario" disabled={busy} aria-busy={busy}>
            {busy ? 'Ingresando…' : 'Ingresar'}
          </button>
          <button
            type="button"
            className="auth-secundario"
            onClick={() => navigate('/register')}
          >
            Registrar
          </button>
        </form>

        <p className="auth-nota">
          ¿Todavía no tenés cuenta? Registrate eligiendo si vas a jugar o a dirigir partidas.
        </p>
      </main>
    </div>
  );
}
