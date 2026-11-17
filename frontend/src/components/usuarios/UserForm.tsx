import { useState } from "react";
import type { Usuario } from '../../interfaces';
import './users.css';

export type UserFormData = Omit<
  Usuario,
  'idUsuario'
> & {
  idUsuario?: number;
  contrasena?: string;
};
export type UsuarioFormData = UserFormData;

export interface UserFormProps {
  usuario?: Usuario;
  onGuardar: (usuario: UserFormData) => Promise<void> | void;
  onCancelar: () => void;
}
export type UsuarioFormularioProps = UserFormProps;

type Errors = Partial<Record<keyof UserFormData, string>>;

const initialForm: UserFormData = {
  nombreUsuario: "",
  contrasena: "",
  imagen: "",
  nickname: "",
};

export function UserForm(props: UserFormProps) {
  return <UserFormBody key={JSON.stringify(props.usuario ?? null)} {...props} />;
}

function UserFormBody({
  usuario,
  onGuardar,
  onCancelar,
}: UserFormProps) {
  const isEditing = Boolean(usuario);

  const [form, setForm] = useState<UserFormData>(() => usuario ? { ...usuario, contrasena: '' } : initialForm);
  const [errores, setErrores] = useState<Errors>({});
  const [guardando, setGuardando] = useState(false);
  const [errorServidor, setErrorServidor] = useState('');

  const handleChange = (campo: keyof UserFormData, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    // Limpiar el error del campo cuando el usuario empieza a modificarlo
    if (errores[campo]) {
      setErrores((prev) => ({ ...prev, [campo]: undefined }));
    }
  };

  const validate = (): boolean => {
    const nuevosErrores: Errors = {};
    const nombreUsuario = form.nombreUsuario.trim();
    const nickname = form.nickname.trim();
    const contrasena = form.contrasena ?? '';

    if (!nombreUsuario) {
      nuevosErrores.nombreUsuario = "El nombre de usuario es obligatorio.";
    } else if (nombreUsuario.length < 2) {
      nuevosErrores.nombreUsuario = "Debe tener al menos 2 caracteres.";
    } else if (nombreUsuario.length > 50) {
      nuevosErrores.nombreUsuario =
        "El nombre de usuario no puede superar los 50 caracteres.";
    }

    if (!isEditing && !contrasena) {
      nuevosErrores.contrasena = "La contraseña es obligatoria.";
    } else if (contrasena && contrasena.length < 6) {
      nuevosErrores.contrasena = "La contraseña debe tener al menos 6 caracteres.";
    } else if (contrasena.length > 100) {
      nuevosErrores.contrasena =
        "La contraseña no puede superar los 100 caracteres.";
    }

    if (!nickname) {
      nuevosErrores.nickname = "El nickname es obligatorio.";
    } else if (nickname.length < 3) {
      nuevosErrores.nickname = "El nickname debe tener al menos 3 caracteres.";
    } else if (nickname.length > 50) {
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
    if (!validate()) return;

    setGuardando(true);
    setErrorServidor('');
    try {
      const datosAEnviar: UserFormData = {
        ...form,
        nombreUsuario: form.nombreUsuario.trim(),
        nickname: form.nickname.trim(),
        imagen: form.imagen.trim(),
        contrasena: form.contrasena,
      };
      // En edición, si no se ingresó una nueva contraseña, no la enviamos
      if (isEditing && !form.contrasena) {
        delete datosAEnviar.contrasena;
      }
      await onGuardar(datosAEnviar);
    } catch (error) {
      setErrorServidor(error instanceof Error ? error.message : 'No se pudo guardar el usuario');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form className="usuario-formulario" onSubmit={handleSubmit} noValidate>
      <h2>{isEditing ? "Editar Usuario" : "Nuevo Usuario"}</h2>
      {errorServidor && <p role="alert">{errorServidor}</p>}

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
          Contraseña {!isEditing && <span className="required">*</span>}
          {isEditing && (
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
          placeholder={isEditing ? "••••••••" : "Ingrese una contraseña"}
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
          {guardando ? "Guardando..." : isEditing ? "Actualizar" : "Guardar"}
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

export const UsuarioFormulario = UserForm;
export default UserForm;

