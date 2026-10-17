import { useState, type KeyboardEvent, type MouseEvent } from 'react';
import type { Usuario } from '../../interfaces';
import Loading from '../ui/Loading';
import './users.css';

export function UserAvatar({ imagen, nickname }: { imagen?: string; nickname: string }) {
  const [errorUrl, setErrorUrl] = useState<string | null>(null);
  const urlLimpia = imagen?.trim() || '';
  const fallo = Boolean(urlLimpia && errorUrl === urlLimpia);
  const inicial = nickname?.trim() ? nickname.trim().charAt(0).toUpperCase() : '?';

  if (!urlLimpia || fallo) {
    return (
      <div className="usuario-imagen usuario-imagen-vacia" aria-hidden="true">
        {inicial}
      </div>
    );
  }

  return (
    <img
      className="usuario-imagen"
      src={urlLimpia}
      alt={inicial}
      onError={() => setErrorUrl(urlLimpia)}
    />
  );
}
export const AvatarUsuario = UserAvatar;

export interface UserListProps {
  usuarios: Usuario[];
  usuarioSeleccionadoId?: number | null;
  onSeleccionar?: (usuario: Usuario) => void;
  onEditar?: (usuario: Usuario) => void;
  onEliminar?: (idUsuario: number) => void;
  cargando?: boolean;
}
export type UsuarioListaProps = UserListProps;

export function UserList({
  usuarios,
  usuarioSeleccionadoId,
  onSeleccionar,
  onEditar,
  onEliminar,
  cargando = false,
}: UserListProps) {
  function handleKeyDownSelect(
    event: KeyboardEvent<HTMLDivElement>,
    usuario: Usuario,
  ) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSeleccionar?.(usuario);
    }
  }

  function handleEditUser(
    event: MouseEvent<HTMLButtonElement>,
    usuario: Usuario,
  ) {
    event.stopPropagation();
    onEditar?.(usuario);
  }

  function handleDeleteUser(
    event: MouseEvent<HTMLButtonElement>,
    idUsuario: number,
  ) {
    event.stopPropagation();
    onEliminar?.(idUsuario);
  }

  if (cargando) {
    return (
      <section className="usuario-lista-container">
        <h2>Listado de usuarios</h2>
        <Loading message="Cargando usuarios..." />
      </section>
    );
  }

  if (usuarios.length === 0) {
    return (
      <section className="usuario-lista-container">
        <h2>Listado de usuarios</h2>

        <div className="lista-vacia">
          <p>No hay usuarios registrados en el sistema.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="usuario-lista-container">
      <header className="usuario-lista-header">
        <h2>Listado de usuarios ({usuarios.length})</h2>
      </header>

      <div className="usuario-grid">
        {usuarios.map((usuario) => {
          const esSeleccionado =
            usuarioSeleccionadoId === usuario.idUsuario;

          return (
            <div
              key={usuario.idUsuario}
              className={`usuario-card ${
                esSeleccionado ? 'seleccionado' : ''
              }`}
              onClick={() => onSeleccionar?.(usuario)}
              onKeyDown={(event) =>
                handleKeyDownSelect(event, usuario)
              }
              role={onSeleccionar ? 'button' : undefined}
              tabIndex={onSeleccionar ? 0 : undefined}
              aria-pressed={
                onSeleccionar ? esSeleccionado : undefined
              }
            >
              <UserAvatar imagen={usuario.imagen} nickname={usuario.nickname} />

              <div className="usuario-datos">
                <h3 title={usuario.nickname}>{usuario.nickname}</h3>
                <p title={usuario.nombreUsuario}>{usuario.nombreUsuario}</p>
                <small>Usuario #{usuario.idUsuario}</small>
              </div>

              {(onEditar || onEliminar) && (
                <div className="usuario-acciones">
                  {onEditar && (
                    <button
                      type="button"
                      onClick={(event) =>
                        handleEditUser(event, usuario)
                      }
                    >
                      Editar
                    </button>
                  )}

                  {onEliminar && (
                    <button
                      type="button"
                      className="boton-eliminar"
                      onClick={(event) =>
                        handleDeleteUser(
                          event,
                          usuario.idUsuario,
                        )
                      }
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export const UsuarioLista = UserList;
export default UserList;