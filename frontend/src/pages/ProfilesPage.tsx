import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useTheme, type Theme, type AccentColor } from '../context/ThemeContext';
import UsuarioFormulario, { type UsuarioFormData } from '../components/usuarios/UsuarioFormulario';
import { actualizarUsuario } from '../services/usuario.service';
import { actualizarJugador, crearJugador, eliminarJugador } from '../services/jugador.service';
import { crearAnfitrion, eliminarAnfitrion } from '../services/anfitrion.service';
import './ProfilesPage.css';

// Pantalla de cuenta propia: datos del usuario y los dos perfiles que puede tener.
// El servidor solo autoriza operar sobre la cuenta de la sesión, así que acá no se
// ofrecen acciones sobre cuentas ajenas.
export default function ProfilesPage() {
  const { usuarioLogueado, jugadores, anfitriones, recargar, logout } = useUser();
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [busy, setBusy] = useState(false);
  const [editando, setEditando] = useState(false);

  if (!usuarioLogueado) return null;
  const id = usuarioLogueado.idUsuario;
  const jugador = jugadores.find(j => j.idUsuario === id);
  const anfitrion = anfitriones.find(a => a.idUsuario === id);

  // Toda acción sigue el mismo circuito: bloquear, llamar al servidor, refrescar y avisar.
  // Si el servidor rechaza, se muestra su mensaje y no se recarga ni se simula éxito.
  const ejecutar = async (accion: () => Promise<unknown>, mensajeOk: string) => {
    setBusy(true); setError(''); setAviso('');
    try {
      await accion();
      await recargar();
      setAviso(mensajeOk);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo completar la operación.');
    } finally {
      setBusy(false);
    }
  };

  const guardarCuenta = async (data: UsuarioFormData) => {
    const { idUsuario: _ignorado, ...payload } = data;
    await actualizarUsuario(id, payload);
    setEditando(false);
    if (payload.contrasena) {
      // El token de sesión guarda el hash anterior: cambiar la contraseña la invalida.
      await logout();
      return;
    }
    await recargar();
    setError(''); setAviso('Datos de la cuenta actualizados.');
  };

  const confirmarBaja = (texto: string) => window.confirm(texto);

  return (
    <section className="profiles-page">
      <div className="profiles-header">
        <p className="app-eyebrow">Ajustes del Sistema</p>
        <h1>Configuración</h1>
      </div>

      {error && <p className="perfil-error" role="alert">{error}</p>}
      {aviso && <p className="perfil-aviso" role="status">{aviso}</p>}

      {/* Configuración de Apariencia / Tema */}
      <article className="perfil-card">
        <h2>🎨 Apariencia y Tema</h2>
        <p className="perfil-nota" style={{ marginBottom: '1rem' }}>
          Personalizá el aspecto visual de la aplicación. Los cambios se guardan automáticamente en tu dispositivo.
        </p>

        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '1.25rem 0 0.5rem', color: 'var(--text-h)' }}>
          Modo de Iluminación
        </h3>
        <div className="theme-options-grid">
          {(
            [
              ['dark', '🌙 Tema Oscuro', 'Colores oscuros para inmersión rolera'],
              ['light', '☀️ Tema Claro', 'Colores claros y nítidos para alta visibilidad'],
              ['system', '💻 Tema del Sistema', 'Sincronizado con la preferencia de tu dispositivo'],
            ] as [Theme, string, string][]
          ).map(([t, label, desc]) => (
            <button
              key={t}
              type="button"
              className={`theme-option-card ${theme === t ? 'active' : ''}`}
              onClick={() => setTheme(t)}
            >
              <div className="theme-option-title">{label}</div>
              <div className="theme-option-desc">{desc}</div>
              {theme === t && <span className="theme-option-check">✓ Activo</span>}
            </button>
          ))}
        </div>

        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '1.75rem 0 0.5rem', color: 'var(--text-h)' }}>
          Color de Botones y Acentos
        </h3>
        <p className="perfil-nota" style={{ marginBottom: '1rem' }}>
          Elegí el tono característico para botones principales, badges activos y resaltados de combate.
        </p>
        <div className="accent-options-grid">
          {(
            [
              ['violet', 'Violeta Arcano (Por defecto)', '#9333ea', 'El clásico tono místico rolero'],
              ['amber', 'Ámbar Forja', '#f59e0b', 'Dorado forja y pergamino antiguo'],
              ['emerald', 'Esmeralda Épica', '#10b981', 'Verde runa para aventureros de la naturaleza'],
              ['blue', 'Azul Hechicero', '#3b82f6', 'Zafiro de maná y control arcano'],
              ['crimson', 'Carmesí Dragón', '#e11d48', 'Rojo furia de combate y dragones'],
            ] as [AccentColor, string, string, string][]
          ).map(([c, label, hex, desc]) => (
            <button
              key={c}
              type="button"
              className={`accent-option-card ${accentColor === c ? 'active' : ''}`}
              onClick={() => setAccentColor(c)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: hex,
                    boxShadow: `0 0 8px ${hex}88`,
                  }}
                />
                <span className="theme-option-title" style={{ margin: 0 }}>{label}</span>
              </div>
              <div className="theme-option-desc">{desc}</div>
              {accentColor === c && <span className="theme-option-check">✓ Activo</span>}
            </button>
          ))}
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', background: 'var(--bg-card-secondary)', padding: '0.85rem 1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Vista previa del botón:</span>
          <button type="button" className="btn-primary" style={{ pointerEvents: 'none' }}>
            ⚔️ Botón de Acción ({accentColor === 'violet' ? 'Violeta' : accentColor === 'amber' ? 'Ámbar' : accentColor === 'emerald' ? 'Esmeralda' : accentColor === 'blue' ? 'Azul' : 'Carmesí'})
          </button>
        </div>
      </article>

      <article className="perfil-card">
        <h2>Datos de la cuenta</h2>
        {editando ? (
          <UsuarioFormulario
            usuario={usuarioLogueado}
            onGuardar={guardarCuenta}
            onCancelar={() => setEditando(false)}
          />
        ) : (
          <>
            <dl className="perfil-datos">
              <dt>Nombre</dt><dd>{usuarioLogueado.nombreUsuario}</dd>
              <dt>Nickname</dt><dd>@{usuarioLogueado.nickname}</dd>
              <dt>Imagen</dt><dd>{usuarioLogueado.imagen || 'Sin imagen cargada'}</dd>
              <dt>Identificador</dt><dd>#{id}</dd>
            </dl>
            <p className="perfil-nota">
              Si cambiás la contraseña se cierra la sesión y hay que volver a iniciarla.
            </p>
            <button type="button" className="btn-secondary" disabled={busy} onClick={() => { setError(''); setAviso(''); setEditando(true); }}>
              Editar mis datos
            </button>
          </>
        )}
      </article>

      <article className="perfil-card">
        <h2>Jugador</h2>
        {jugador ? (
          <>
            <p>Estado: {jugador.estado ? 'Activo' : 'Inactivo'}</p>
            <p className="perfil-nota">
              Con el perfil de jugador podés crear personajes y participar en sesiones.
            </p>
            <div className="perfil-acciones">
              <button
                type="button"
                className="btn-secondary"
                disabled={busy}
                onClick={() => void ejecutar(
                  () => actualizarJugador(id, { estado: !jugador.estado }),
                  jugador.estado ? 'Perfil de jugador marcado como inactivo.' : 'Perfil de jugador marcado como activo.',
                )}
              >
                Cambiar estado
              </button>
              <button
                type="button"
                className="btn-danger"
                disabled={busy}
                onClick={() => {
                  if (confirmarBaja('¿Eliminar el perfil de jugador? No se puede si tenés personajes creados.')) {
                    void ejecutar(() => eliminarJugador(id), 'Perfil de jugador eliminado.');
                  }
                }}
              >
                Eliminar perfil de jugador
              </button>
            </div>
          </>
        ) : (
          <>
            <p>Todavía no tenés perfil de jugador.</p>
            <button
              type="button"
              className="btn-primary"
              disabled={busy}
              onClick={() => void ejecutar(() => crearJugador({ idUsuario: id, estado: true }), 'Perfil de jugador creado.')}
            >
              Crear perfil de jugador
            </button>
          </>
        )}
      </article>

      <article className="perfil-card">
        <h2>Anfitrión</h2>
        {anfitrion ? (
          <>
            <p>Karma: {anfitrion.karma}. Partidas activas: {anfitrion.cantPartidasActuales}</p>
            <p className="perfil-nota">
              El karma y la cantidad de partidas activas los calcula el servidor a partir de las
              calificaciones y de las partidas abiertas: no se editan desde acá.
            </p>
            <button
              type="button"
              className="btn-danger"
              disabled={busy}
              onClick={() => {
                if (confirmarBaja('¿Eliminar el perfil de anfitrión? No se puede si tenés partidas creadas.')) {
                  void ejecutar(() => eliminarAnfitrion(id), 'Perfil de anfitrión eliminado.');
                }
              }}
            >
              Eliminar perfil de anfitrión
            </button>
          </>
        ) : (
          <>
            <p>Todavía no tenés perfil de anfitrión.</p>
            <button
              type="button"
              className="btn-primary"
              disabled={busy}
              onClick={() => void ejecutar(() => crearAnfitrion({ idUsuario: id }), 'Perfil de anfitrión creado.')}
            >
              Crear perfil de anfitrión
            </button>
          </>
        )}
      </article>
    </section>
  );
}
