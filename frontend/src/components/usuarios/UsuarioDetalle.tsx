import { useState } from "react";
import type { Usuario } from "../../interfaces";
import Loading from "../ui/Loading";
import { CloseIcon } from "../ui";
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
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [errorUrl, setErrorUrl] = useState<string | null>(null);

  if (cargando) {
    return (
      <div className="usuario-detalle-card cargando">
        <Loading message="Cargando información del usuario..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="usuario-detalle-card error">
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
        <h3>Detalle de Usuario</h3>
        <p>Selecciona un usuario de la lista para ver sus datos detallados.</p>
      </div>
    );
  }

  const rawUrl = usuario.imagen?.trim() || "";
  const fallbackUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${usuario.nickname || usuario.nombreUsuario || "user"}`;
  const avatarUrl = rawUrl && errorUrl !== rawUrl ? rawUrl : fallbackUrl;

  return (
    <div className="usuario-detalle-card">
      {isImageOpen && (
        <div className="lightbox-overlay" onClick={() => setIsImageOpen(false)}>
          <button className="lightbox-close" onClick={() => setIsImageOpen(false)} aria-label="Cerrar"><CloseIcon size={18} /></button>
          <img src={avatarUrl} alt="Avatar" className="lightbox-image" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
      <div className="detalle-header">
        <h2>Detalle del Usuario</h2>
        {onCerrar && (
          <button
            type="button"
            className="btn-cerrar"
            onClick={onCerrar}
            title="Cerrar detalle"
            aria-label="Cerrar detalle"
          >
            <CloseIcon size={16} />
          </button>
        )}
      </div>

      <div className="detalle-body">
        <div className="detalle-avatar-wrapper" onClick={() => setIsImageOpen(true)} style={{ cursor: "pointer" }} title="Ampliar imagen">
          <img
            src={avatarUrl}
            alt={`Avatar de ${usuario.nombreUsuario}`}
            className="detalle-avatar"
            onError={() => {
              if (rawUrl) setErrorUrl(rawUrl);
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
              className="campo-valor url" style={{ wordBreak: "break-all", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
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
            Editar
          </button>
        )}
        {onEliminar && (
          <button
            type="button"
            className="btn-eliminar"
            onClick={() => onEliminar(usuario.idUsuario)}
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
}
