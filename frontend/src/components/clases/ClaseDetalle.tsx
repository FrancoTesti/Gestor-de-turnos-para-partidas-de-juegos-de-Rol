import type { Clase } from '../../interfaces';
import './clases.css';

export interface ClaseDetalleProps {
  clase: Clase | null;
  onVolver: () => void;
  onEditar?: (clase: Clase) => void;
}

export default function ClaseDetalle({ clase, onVolver, onEditar }: ClaseDetalleProps) {
  if (!clase) {
    return (
      <div className="clase-detalle-card">
        <p>No se ha seleccionado ninguna clase.</p>
        <button type="button" className="btn-secondary" onClick={onVolver}>
          Volver al listado
        </button>
      </div>
    );
  }

  return (
    <div className="clase-detalle-card">
      <div className="clase-header">
        <h2>Detalle de Clase #{clase.idClase}</h2>
        <button type="button" className="btn-secondary" onClick={onVolver}>
          ← Volver
        </button>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <div className="clase-icon-badge">🛡️</div>
        <h3 style={{ fontSize: '1.4rem', color: '#2d3748', margin: '0.5rem 0' }}>
          {clase.nombreClase}
        </h3>
        <p style={{ color: '#4a5568', lineHeight: 1.5, fontSize: '1rem' }}>
          {clase.descripcionClase}
        </p>
      </div>

      {onEditar && (
        <div className="clase-acciones" style={{ marginTop: '1.5rem' }}>
          <button type="button" className="btn-primary" onClick={() => onEditar(clase)}>
            Editar esta Clase
          </button>
        </div>
      )}
    </div>
  );
}
