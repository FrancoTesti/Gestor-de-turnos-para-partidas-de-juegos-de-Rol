/* formulario reutilizable para crear y editar partidas.
El mismo componente sirve para las dos operaciones (igual que UsuarioFormulario). */
import { useState, useEffect } from 'react';
import type { PartidaPublica, CrearPartidaData, EstadoPartida } from '../../services/partida.service';
import './partidas.css';

// tipo del formulario interno (todos string para los inputs)
export type PartidaFormData = {
  idPartida?: number;
  nombre: string;
  estado: EstadoPartida;
  limiteJugadores: number;
  esPrivada: boolean;
  contrasena?: string;
  idUsuarioAnfitrion: number;
};

interface PartidaFormularioProps {
  partida?: PartidaPublica;                              // si viene -> modo edicion
  onGuardar: (data: CrearPartidaData) => Promise<void> | void;
  onCancelar: () => void;
}

// errores por campo
type Errores = Partial<Record<keyof PartidaFormData, string>>;

// valores iniciales del formulario vacio
const initialForm: PartidaFormData = {
  nombre: '',
  estado: 'activa',
  limiteJugadores: 4,
  esPrivada: false,
  contrasena: '',
  idUsuarioAnfitrion: 0,
};

export default function PartidaFormulario({
  partida,
  onGuardar,
  onCancelar,
}: PartidaFormularioProps) {
  const esEdicion = Boolean(partida);

  const [form, setForm] = useState<PartidaFormData>(initialForm);
  const [errores, setErrores] = useState<Errores>({});
  const [guardando, setGuardando] = useState(false);

  // cuando cambia la prop "partida", cargamos sus datos en el formulario
  useEffect(() => {
    if (partida) {
      setForm({
        idPartida: partida.idPartida,
        nombre: partida.nombre,
        estado: partida.estado,
        limiteJugadores: partida.limiteJugadores,
        esPrivada: partida.esPrivada,
        contrasena: '',       // nunca pre-llenamos la contraseña por seguridad
        idUsuarioAnfitrion: partida.idUsuarioAnfitrion,
      });
    } else {
      setForm(initialForm);
    }
    setErrores({});
  }, [partida]);

  // actualizamos un campo del form y limpia su error
  function handleChange(campo: keyof PartidaFormData, valor: string | boolean | number) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo]) {
      setErrores((prev) => ({ ...prev, [campo]: undefined }));
    }
  }

  // validacion del lado del cliente antes de enviar
  function validar(): boolean {
    const nuevosErrores: Errores = {};

    if (!form.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre de la partida es obligatorio.';
    } else if (form.nombre.length > 100) {
      nuevosErrores.nombre = 'El nombre no puede superar los 100 caracteres.';
    }

    // limiteJugadores debe ser entero positivo (regla de negocio del plan)
    if (!Number.isInteger(form.limiteJugadores) || form.limiteJugadores <= 0) {
      nuevosErrores.limiteJugadores = 'El límite de jugadores debe ser un número entero positivo.';
    }

    // REGLA: solo las partidas privadas requieren contraseña
    if (form.esPrivada && !esEdicion && !form.contrasena?.trim()) {
      nuevosErrores.contrasena = 'Las partidas privadas deben tener una contraseña.';
    }

    if (form.idUsuarioAnfitrion <= 0) {
      nuevosErrores.idUsuarioAnfitrion = 'El ID del anfitrión debe ser un número positivo.';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validar()) return;

    setGuardando(true);
    try {
      // armamos el objeto que va al servicio (que lo manda al backend)
      const datos: CrearPartidaData = {
        nombre: form.nombre.trim(),
        estado: form.estado,
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
      console.error('Error al guardar la partida:', error);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form className="partida-formulario" onSubmit={handleSubmit} noValidate>
      <h2>{esEdicion ? 'Editar Partida' : 'Nueva Partida'}</h2>

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
          onChange={(e) => handleChange('estado', e.target.value as EstadoPartida)}
          disabled={guardando}
        >
          <option value="activa">▶ Activa</option>
          <option value="finalizada">■ Finalizada</option>
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
          {guardando ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear partida'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </button>
      </div>
    </form>
  );
}