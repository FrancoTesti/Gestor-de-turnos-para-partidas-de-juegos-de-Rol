import type { Usuario } from "../../interfaces";
import "./usuarios.css";

export interface UsuarioDetalleProps {
  usuario?: Usuario | null;
  cargando?: boolean;
  error?: string | null;
  onCerrar?: () => void;
  onEditar?: (usuario: Usuario) => void;
  onEliminar?: (idUsuario: number) => void;
}

export default function UsuarioDetalle({
  usuario,
  cargando = false,
  error = null,
  onCerrar,
  onEditar,
  onEliminar,
}: UsuarioDetalleProps) {
  if (cargando) {
    return (
      <div className="usuario-detalle-card cargando">
        <div className="loader-spinner">⏳</div>
        <p>Cargando información del usuario...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="usuario-detalle-card error">
        <div className="error-icon">❌</div>
        <h3>Ocurrió un error</h3>
        <p className="error-mensaje">{error}</p>
        {onCerrar && (
          <button type="button" className="btn-secundario" onClick={onCerrar}>
            Volver
          </button>
        )}
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="usuario-detalle-card vacio">
        <div className="info-icon">ℹ️</div>
        <h3>Detalle de Usuario</h3>
        <p>Selecciona un usuario de la lista para ver sus datos detallados.</p>
      </div>
    );
  }

  const avatarUrl = usuario.imagen?.trim()
    ? usuario.imagen
    : `https://api.dicebear.com/7.x/bottts/svg?seed=${usuario.nickname || usuario.nombreUsuario}`;

  return (
    <div className="usuario-detalle-card">
      <div className="detalle-header">
        <h2>Detalle del Usuario</h2>
        {onCerrar && (
          <button
            type="button"
            className="btn-cerrar"
            onClick={onCerrar}
            title="Cerrar detalle"
          >
            ✖
          </button>
        )}
      </div>

      <div className="detalle-body">
        <div className="detalle-avatar-wrapper">
          <img
            src={avatarUrl}
            alt={`Avatar de ${usuario.nombreUsuario}`}
            className="detalle-avatar"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://api.dicebear.com/7.x/bottts/svg?seed=${usuario.nickname || "user"}`;
            }}
          />
        </div>

        <div className="detalle-info-grid">
          <div className="detalle-campo">
            <span className="campo-etiqueta">ID de Usuario:</span>
            <span className="campo-valor badge">#{usuario.idUsuario}</span>
          </div>

          <div className="detalle-campo">
            <span className="campo-etiqueta">Nombre de Usuario:</span>
            <span className="campo-valor destacado">
              {usuario.nombreUsuario}
            </span>
          </div>

          <div className="detalle-campo">
            <span className="campo-etiqueta">Nickname:</span>
            <span className="campo-valor nickname">@{usuario.nickname}</span>
          </div>

          <div className="detalle-campo">
            <span className="campo-etiqueta">URL de Imagen:</span>
            <span
              className="campo-valor url"
              title={usuario.imagen || "No especificada"}
            >
              {usuario.imagen || "Avatar por defecto"}
            </span>
          </div>
        </div>
      </div>

      <div className="detalle-footer">
        {onEditar && (
          <button
            type="button"
            className="btn-editar"
            onClick={() => onEditar(usuario)}
          >
            ✏️ Editar
          </button>
        )}
        {onEliminar && (
          <button
            type="button"
            className="btn-eliminar"
            onClick={() => onEliminar(usuario.idUsuario)}
          >
            🗑️ Eliminar
          </button>
        )}
      </div>
    </div>
  );
}
