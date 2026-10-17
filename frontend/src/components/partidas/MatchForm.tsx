/* formulario reutilizable para crear y editar partidas.
El mismo componente sirve para las dos operaciones (igual que UsuarioFormulario). */
import { useState } from 'react';
import type {
  MatchPublic,
  CreateMatchData,
  MatchState,
} from '../../services/match.service';
import { NoticeModal } from '../ui';
import './matches.css';

// tipo del formulario interno (todos string para los inputs)
export type MatchFormData = {
  idPartida?: number;
  nombre: string;
  estado: MatchState;
  limiteJugadores: number;
  esPrivada: boolean;
  contrasena?: string;
  idUsuarioAnfitrion: number;
};
export type PartidaFormData = MatchFormData;

export interface MatchFormProps {
  partida?: MatchPublic;                              // si viene -> modo edicion
  onGuardar: (data: CreateMatchData) => Promise<void> | void;
  onCancelar: () => void;
}
export type PartidaFormularioProps = MatchFormProps;

// errores por campo
type Errors = Partial<Record<keyof MatchFormData, string>>;

// valores iniciales del formulario vacio
const initialForm: MatchFormData = {
  nombre: '',
  estado: 'activa',
  limiteJugadores: 4,
  esPrivada: false,
  contrasena: '',
  idUsuarioAnfitrion: 0,
};

export function MatchForm(props: MatchFormProps) {
  return <MatchFormBody key={JSON.stringify(props.partida ?? null)} {...props} />;
}

function MatchFormBody({
  partida,
  onGuardar,
  onCancelar,
}: MatchFormProps) {
  const isEditing = Boolean(partida);
  const esEdicion = isEditing;

  const [form, setForm] = useState<MatchFormData>(() => partida ? { ...partida, contrasena: '' } : initialForm);
  const [errores, setErrores] = useState<Errors>({});
  const [guardando, setGuardando] = useState(false);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  // actualizamos un campo del form y limpia su error
  function handleChange(campo: keyof MatchFormData, valor: string | boolean | number) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo]) {
      setErrores((prev) => ({ ...prev, [campo]: undefined }));
    }
  }

  // validacion del lado del cliente antes de enviar
  function validate(): { isValid: boolean; errors: Errors } {
    const nuevosErrores: Errors = {};

    if (!form.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre de la partida es obligatorio.';
    } else if (form.nombre.length > 100) {
      nuevosErrores.nombre = 'El nombre no puede superar los 100 caracteres.';
    }

    // limiteJugadores debe ser entero positivo (regla de negocio del plan)
    if (!Number.isInteger(form.limiteJugadores) || form.limiteJugadores <= 0) {
      nuevosErrores.limiteJugadores = 'El límite de jugadores debe ser un número entero positivo.';
    } else if (form.limiteJugadores > 2147483647) {
      nuevosErrores.limiteJugadores = 'El límite de jugadores es demasiado grande (máximo 2.147.483.647).';
    }

    // REGLA: solo las partidas privadas requieren contraseña
    if (form.esPrivada && !isEditing && !form.contrasena?.trim()) {
      nuevosErrores.contrasena = 'Las partidas privadas deben tener una contraseña.';
    }

    if (form.idUsuarioAnfitrion <= 0) {
      nuevosErrores.idUsuarioAnfitrion = 'El ID del anfitrión debe ser un número positivo.';
    }

    setErrores(nuevosErrores);
    return { isValid: Object.keys(nuevosErrores).length === 0, errors: nuevosErrores };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { isValid, errors: errs } = validate();
    if (!isValid) {
      const primerError = Object.values(errs)[0];
      if (primerError) setErrorModal(primerError);
      return;
    }

    setGuardando(true);
    try {
      // armamos el objeto que va al servicio (que lo manda al backend)
      const datos: CreateMatchData = {
        nombre: form.nombre.trim(),
        estado: form.estado as MatchState,
        limiteJugadores: form.limiteJugadores,
        esPrivada: form.esPrivada,
        idUsuarioAnfitrion: form.idUsuarioAnfitrion,
      };

      // solo enviamos contraseña si la partida es privada y se escribió algo
      if (form.esPrivada && form.contrasena?.trim()) {
        datos.contrasena = form.contrasena.trim();
      }

      await onGuardar(datos);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'No se pudo guardar la partida.';
      setErrorServidor(msg);
      setErrorModal(msg);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form className="partida-formulario" onSubmit={handleSubmit} noValidate>
      <h2>{esEdicion ? 'Editar Partida' : 'Nueva Partida'}</h2>
      {errorServidor && <p role="alert" className="error-text">{errorServidor}</p>}

      {/* nombre */}
      <div className="form-group">
        <label htmlFor="nombre">
          Nombre <span className="required">*</span>
        </label>
        <input
          id="nombre"
          type="text"
          value={form.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          disabled={guardando}
          placeholder="Ej: La Cripta del Dragón"
        />
        {errores.nombre && <span className="error-text">{errores.nombre}</span>}
      </div>

      {/* estado */}
      <div className="form-group">
        <label htmlFor="estado">Estado <span className="required">*</span></label>
        <select
          id="estado"
          value={form.estado}
          onChange={(e) => handleChange('estado', e.target.value as MatchState)}
          disabled={guardando}
        >
          <option value="activa">Activa</option>
          <option value="finalizada">Finalizada</option>
        </select>
      </div>

      {/* limite de jugadores */}
      <div className="form-group">
        <label htmlFor="limiteJugadores">
          Límite de jugadores <span className="required">*</span>
        </label>
        <input
          id="limiteJugadores"
          type="number"
          min={1}
          max={2147483647}
          value={form.limiteJugadores}
          onChange={(e) => handleChange('limiteJugadores', parseInt(e.target.value, 10))}
          disabled={guardando}
        />
        {errores.limiteJugadores && <span className="error-text">{errores.limiteJugadores}</span>}
      </div>

      {/* id del anfitrion */}
      <div className="form-group">
        <label htmlFor="idUsuarioAnfitrion">
          ID del Anfitrión <span className="required">*</span>
        </label>
        <input
          id="idUsuarioAnfitrion"
          type="number"
          min={1}
          value={form.idUsuarioAnfitrion || ''}
          onChange={(e) => handleChange('idUsuarioAnfitrion', parseInt(e.target.value, 10))}
          disabled={guardando}
          placeholder="Ej: 3"
        />
        {errores.idUsuarioAnfitrion && <span className="error-text">{errores.idUsuarioAnfitrion}</span>}
      </div>

      {/* privacidad: checkbox */}
      <div className="form-group form-group-check">
        <input
          id="esPrivada"
          type="checkbox"
          checked={form.esPrivada}
          onChange={(e) => handleChange('esPrivada', e.target.checked)}
          disabled={guardando}
        />
        <label htmlFor="esPrivada">Partida privada (requiere contraseña)</label>
      </div>

      {/* contrasenia: solo aparece si esPrivada está marcado */}
      {form.esPrivada && (
        <div className="form-group">
          <label htmlFor="contrasena">
            Contraseña
            {!esEdicion && <span className="required"> *</span>}
            {esEdicion && <small className="hint"> (dejar vacío para no cambiarla)</small>}
          </label>
          <input
            id="contrasena"
            type="password"
            value={form.contrasena ?? ''}
            onChange={(e) => handleChange('contrasena', e.target.value)}
            disabled={guardando}
            placeholder="Contraseña de la partida"
          />
          {errores.contrasena && <span className="error-text">{errores.contrasena}</span>}
        </div>
      )}

      {/* botones */}
      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={guardando}>
          {guardando ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear partida'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </button>
      </div>
      <NoticeModal mensaje={errorModal} onClose={() => setErrorModal(null)} />
    </form>
  );
}

export const PartidaFormulario = MatchForm;
export default MatchForm;

