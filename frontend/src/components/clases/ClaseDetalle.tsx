import type { Clase } from '../../interfaces';
import './clases.css';

export interface ClaseDetalleProps {
  clase: Clase | null;
  onVolver?: () => void;
  onCerrar?: () => void;
  onEditar?: (clase: Clase) => void;
}

export default function ClaseDetalle({ clase, onVolver, onCerrar, onEditar }: ClaseDetalleProps) {
  const cerrar = onVolver || onCerrar;

  if (!clase) {
    return (
      <div className="clase-detalle-card">
        <p>No se ha seleccionado ninguna clase.</p>
        {cerrar && (
          <button type="button" className="btn-secondary" onClick={cerrar}>
            Volver al listado
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="clase-detalle-card">
      <div className="clase-header">
        <h2>Detalle de Clase #{clase.idClase}</h2>
        {cerrar && (
          <button type="button" className="btn-secondary" onClick={cerrar}>
            ← Volver
          </button>
        )}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <h3 style={{ fontSize: '1.4rem', color: 'var(--text-h)', margin: '0.5rem 0' }}>
          {clase.nombreClase}
        </h3>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.5, fontSize: '1rem' }}>
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
