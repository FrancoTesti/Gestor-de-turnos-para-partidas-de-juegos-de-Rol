import { useState, useEffect } from "react";
import type { Usuario } from '../../interfaces';

export type UsuarioFormData = Omit<
  Usuario,
  'idUsuario'
> & {
  idUsuario?: number;
  contrasena?: string;
};

interface UsuarioFormularioProps {
  usuario?: Usuario;
  onGuardar: (usuario: UsuarioFormData) => Promise<void> | void;
  onCancelar: () => void;
}

type Errores = Partial<Record<keyof UsuarioFormData, string>>;

const initialForm: UsuarioFormData = {
  nombreUsuario: "",
  contrasena: "",
  imagen: "",
  nickname: "",
};

export default function UsuarioFormulario({
  usuario,
  onGuardar,
  onCancelar,
}: UsuarioFormularioProps) {
  const esEdicion = Boolean(usuario);

  const [form, setForm] = useState<UsuarioFormData>(initialForm);
  const [errores, setErrores] = useState<Errores>({});
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (usuario) {
      setForm({
        idUsuario: usuario.idUsuario,
        nombreUsuario: usuario.nombreUsuario || "",
        contrasena: "",
        imagen: usuario.imagen || "",
        nickname: usuario.nickname || "",
      });
    } else {
      setForm(initialForm);
    }
    setErrores({});
  }, [usuario]);

  const handleChange = (campo: keyof UsuarioFormData, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    // Limpiar el error del campo cuando el usuario empieza a modificarlo
    if (errores[campo]) {
      setErrores((prev) => ({ ...prev, [campo]: undefined }));
    }
  };

  const validar = (): boolean => {
    const nuevosErrores: Errores = {};

    if (!form.nombreUsuario?.trim()) {
      nuevosErrores.nombreUsuario = "El nombre de usuario es obligatorio.";
    } else if (form.nombreUsuario.length > 50) {
      nuevosErrores.nombreUsuario =
        "El nombre de usuario no puede superar los 50 caracteres.";
    }

    if (!esEdicion && !form.contrasena?.trim()) {
      nuevosErrores.contrasena = "La contraseña es obligatoria.";
    } else if (form.contrasena && form.contrasena.length > 100) {
      nuevosErrores.contrasena =
        "La contraseña no puede superar los 100 caracteres.";
    }

    if (!form.nickname?.trim()) {
      nuevosErrores.nickname = "El nickname es obligatorio.";
    } else if (form.nickname.length > 50) {
      nuevosErrores.nickname =
        "El nickname no puede superar los 50 caracteres.";
    }

    if (form.imagen && form.imagen.length > 255) {
      nuevosErrores.imagen =
        "La URL de la imagen no puede superar los 255 caracteres.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;

    setGuardando(true);
    try {
      const datosAEnviar: UsuarioFormData = { ...form };
      // En edición, si no se ingresó una nueva contraseña, no la enviamos
      if (esEdicion && !form.contrasena?.trim()) {
        delete datosAEnviar.contrasena;
      }
      await onGuardar(datosAEnviar);
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form className="usuario-formulario" onSubmit={handleSubmit} noValidate>
      <h2>{esEdicion ? "Editar Usuario" : "Nuevo Usuario"}</h2>

      <div className="form-group">
        <label htmlFor="nombreUsuario">
          Nombre de usuario <span className="required">*</span>
        </label>
        <input
          id="nombreUsuario"
          type="text"
          value={form.nombreUsuario}
          onChange={(e) => handleChange("nombreUsuario", e.target.value)}
          disabled={guardando}
          placeholder="Ej: juanperez"
        />
        {errores.nombreUsuario && (
          <span className="error-text">{errores.nombreUsuario}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="nickname">
          Nickname <span className="required">*</span>
        </label>
        <input
          id="nickname"
          type="text"
          value={form.nickname}
          onChange={(e) => handleChange("nickname", e.target.value)}
          disabled={guardando}
          placeholder="Ej: ElDestructor99"
        />
        {errores.nickname && (
          <span className="error-text">{errores.nickname}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="contrasena">
          Contraseña {!esEdicion && <span className="required">*</span>}
          {esEdicion && (
            <small className="hint">
              {" "}
              (Dejar vacío para mantener la actual)
            </small>
          )}
        </label>
        <input
          id="contrasena"
          type="password"
          value={form.contrasena || ""}
          onChange={(e) => handleChange("contrasena", e.target.value)}
          disabled={guardando}
          placeholder={esEdicion ? "••••••••" : "Ingrese una contraseña"}
        />
        {errores.contrasena && (
          <span className="error-text">{errores.contrasena}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="imagen">Imagen (URL)</label>
        <input
          id="imagen"
          type="text"
          value={form.imagen}
          onChange={(e) => handleChange("imagen", e.target.value)}
          disabled={guardando}
          placeholder="https://ejemplo.com/avatar.jpg"
        />
        {errores.imagen && <span className="error-text">{errores.imagen}</span>}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={guardando}>
          {guardando ? "Guardando..." : esEdicion ? "Actualizar" : "Guardar"}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={onCancelar}
          disabled={guardando}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
