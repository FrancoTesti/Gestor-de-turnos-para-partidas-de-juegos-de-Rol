import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Alert } from '../components/ui';
import './AuthPages.css';

export default function LoginPage() {
  const [nickname, setNickname] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errorLogin, setErrorLogin] = useState('');
  const { usuarioLogueado, loguearse } = useUser();
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
    <main className="auth-page">
      <h2>Iniciar Sesión</h2>

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
          <input
            id="login-contrasena"
            name="contrasena"
            type="password"
            autoComplete="current-password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setContrasena(e.target.value)}
            disabled={busy}
          />
        </div>

        <button type="submit" className="auth-primario" disabled={busy} aria-busy={busy}>
          {busy ? 'Ingresando…' : 'Ingresar'}
        </button>
        <button
          type="button"
          className="auth-secundario"
          onClick={() => navigate('/register')}
        >
          Ir a Registro
        </button>
      </form>

      <p className="auth-nota">
        ¿Todavía no tenés cuenta? Registrate eligiendo si vas a jugar o a dirigir partidas.
      </p>
    </main>
  );
}
