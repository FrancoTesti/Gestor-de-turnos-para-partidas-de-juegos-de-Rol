import { useState, type FormEvent } from 'react';
import type { Clase } from '../../interfaces';
import type { CrearClaseData } from '../../services/clase.service';
import './clases.css';

export interface ClaseFormularioProps {
  claseInicial?: Clase | null;
  onGuardar: (data: CrearClaseData) => Promise<void>;
  onCancelar: () => void;
}

export default function ClaseFormulario({
  claseInicial,
  onGuardar,
  onCancelar,
}: ClaseFormularioProps) {
  const [nombreClase, setNombreClase] = useState(claseInicial?.nombreClase ?? '');
  const [descripcionClase, setDescripcionClase] = useState(claseInicial?.descripcionClase ?? '');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const esEdicion = Boolean(claseInicial);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!nombreClase.trim()) {
      setError('El nombre de la clase es obligatorio.');
      return;
    }

    if (!descripcionClase.trim()) {
      setError('La descripción de la clase es obligatoria.');
      return;
    }

    try {
      setGuardando(true);
      await onGuardar({
        nombreClase: nombreClase.trim(),
        descripcionClase: descripcionClase.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la clase.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="clase-form">
      <h3>{esEdicion ? 'Editar Clase de Personaje' : 'Crear Nueva Clase de Personaje'}</h3>

      {error && <div className="mensaje-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombreClase">Nombre de la Clase *</label>
          <input
            id="nombreClase"
            type="text"
            placeholder="Ej: Guerrero, Mago, Pícaro..."
            value={nombreClase}
            onChange={(e) => setNombreClase(e.target.value)}
            disabled={guardando}
          />
        </div>

        <div className="form-group">
          <label htmlFor="descripcionClase">Descripción de la Clase *</label>
          <textarea
            id="descripcionClase"
            rows={4}
            placeholder="Describe las habilidades, fortalezas y estilo de juego de esta clase..."
            value={descripcionClase}
            onChange={(e) => setDescripcionClase(e.target.value)}
            disabled={guardando}
          />
        </div>

        <div className="clase-acciones">
          <button type="submit" className="btn-primary" disabled={guardando}>
            {guardando ? 'Guardando...' : esEdicion ? 'Actualizar Clase' : 'Crear Clase'}
          </button>
          <button type="button" className="btn-secondary" onClick={onCancelar} disabled={guardando}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
