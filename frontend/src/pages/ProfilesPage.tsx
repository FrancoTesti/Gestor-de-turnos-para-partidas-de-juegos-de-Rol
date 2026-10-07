import { useState } from 'react';
import { useUser } from '../context/UserContext';
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
      <h1>Mis perfiles</h1>
      {error && <p className="perfil-error" role="alert">{error}</p>}
      {aviso && <p className="perfil-aviso" role="status">{aviso}</p>}

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
            <button type="button" disabled={busy} onClick={() => { setError(''); setAviso(''); setEditando(true); }}>
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
