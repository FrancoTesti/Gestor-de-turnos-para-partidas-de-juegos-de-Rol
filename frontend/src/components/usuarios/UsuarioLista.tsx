import type { KeyboardEvent, MouseEvent } from 'react';
import type { Usuario } from '../../interfaces';
import './usuarios.css';

export interface UsuarioListaProps {
  usuarios: Usuario[];
  usuarioSeleccionadoId?: number | null;
  onSeleccionar?: (usuario: Usuario) => void;
  onEditar?: (usuario: Usuario) => void;
  onEliminar?: (idUsuario: number) => void;
  cargando?: boolean;
}

export default function UsuarioLista({
  usuarios,
  usuarioSeleccionadoId,
  onSeleccionar,
  onEditar,
  onEliminar,
  cargando = false,
}: UsuarioListaProps) {
  function seleccionarConTeclado(
    event: KeyboardEvent<HTMLDivElement>,
    usuario: Usuario,
  ) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSeleccionar?.(usuario);
    }
  }

  function editarUsuario(
    event: MouseEvent<HTMLButtonElement>,
    usuario: Usuario,
  ) {
    event.stopPropagation();
    onEditar?.(usuario);
  }

  function eliminarUsuario(
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

        <div className="estado-cargando" role="status">
          <span className="spinner" aria-hidden="true">
            ⏳
          </span>

          <span>Cargando usuarios...</span>
        </div>
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
                seleccionarConTeclado(event, usuario)
              }
              role={onSeleccionar ? 'button' : undefined}
              tabIndex={onSeleccionar ? 0 : undefined}
              aria-pressed={
                onSeleccionar ? esSeleccionado : undefined
              }
            >
              {usuario.imagen ? (
                <img
                  className="usuario-imagen"
                  src={usuario.imagen}
                  alt={`Avatar de ${usuario.nickname}`}
                />
              ) : (
                <div
                  className="usuario-imagen usuario-imagen-vacia"
                  aria-hidden="true"
                >
                  {usuario.nickname.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="usuario-datos">
                <h3>{usuario.nickname}</h3>
                <p>{usuario.nombreUsuario}</p>
                <small>Usuario #{usuario.idUsuario}</small>
              </div>

              {(onEditar || onEliminar) && (
                <div className="usuario-acciones">
                  {onEditar && (
                    <button
                      type="button"
                      onClick={(event) =>
                        editarUsuario(event, usuario)
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
                        eliminarUsuario(
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