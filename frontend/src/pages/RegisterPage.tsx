import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Alert } from '../components/ui';
import './AuthPages.css';

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
  const [tipo, setTipo] = useState<'jugador' | 'anfitrion'>('jugador');
  const { registrarUsuario, mensaje } = useUser();
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
    <main className="auth-page">
      <h2>Registrarse</h2>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {mensaje && <p className="auth-mensaje">{mensaje}</p>}

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
          <input
            id="registro-contrasena"
            name="contrasena"
            type="password"
            autoComplete="new-password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setContrasena(e.target.value)}
            disabled={busy}
          />
          <small className="auth-ayuda">Mínimo 6 caracteres.</small>
        </div>

        <div className="auth-campo">
          <label htmlFor="registro-repetida">Repetir contraseña</label>
          <input
            id="registro-repetida"
            name="repetirContrasena"
            type="password"
            autoComplete="new-password"
            placeholder="Repetir contraseña"
            value={repetida}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setRepetida(e.target.value)}
            disabled={busy}
          />
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
  );
}
