import type { Clase } from '../../interfaces';
import { ShieldIcon } from '../ui';
import './classes.css';

export interface ClassDetailProps {
  clase: Clase | null;
  onVolver?: () => void;
  onCerrar?: () => void;
  onEditar?: (clase: Clase) => void;
}
export type ClaseDetalleProps = ClassDetailProps;

export default function ClassDetail({ clase, onVolver, onCerrar, onEditar }: ClassDetailProps) {
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
        <h3 style={{ fontSize: '1.4rem', color: 'var(--text-h)', margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldIcon size={20} /> {clase.nombreClase}
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

export const ClaseDetalle = ClassDetail;
