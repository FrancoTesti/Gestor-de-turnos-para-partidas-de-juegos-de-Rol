import type { MouseEvent } from 'react';
import type { Clase } from '../../interfaces';
import Loading from '../ui/Loading';
import { ShieldIcon } from '../ui';
import './classes.css';

export interface ClassListProps {
  clases: Clase[];
  claseSeleccionadaId?: number | null;
  onSeleccionar?: (clase: Clase) => void;
  onEditar?: (clase: Clase) => void;
  onEliminar?: (idClase: number) => void;
  onNuevo?: () => void;
  cargando?: boolean;
}
export type ClaseListaProps = ClassListProps;

export default function ClassList({
  clases,
  claseSeleccionadaId,
  onSeleccionar,
  onEditar,
  onEliminar,
  onNuevo,
  cargando = false,
}: ClassListProps) {
  function handleEdit(event: MouseEvent<HTMLButtonElement>, clase: Clase) {
    event.stopPropagation();
    onEditar?.(clase);
  }

  function handleDelete(event: MouseEvent<HTMLButtonElement>, idClase: number) {
    event.stopPropagation();
    if (window.confirm('¿Está seguro de eliminar esta clase?')) {
      onEliminar?.(idClase);
    }
  }

  if (cargando) {
    return (
      <section className="clase-container">
        <div className="clase-header" style={{ borderBottom: "none", paddingBottom: "0", marginBottom: "1.5rem" }}>
          <h2>Clases de Personaje</h2>
        </div>
        <Loading message="Cargando clases..." />
      </section>
    );
  }

  return (
    <section className="clase-container">
      <header className="clase-header">
        <h3 style={{ color: "var(--text)", fontSize: "1rem", margin: 0 }}>Mostrando {clases.length} clase{clases.length !== 1 ? "s" : ""}</h3>
        {onNuevo && (
          <button type="button" className="btn-primary" onClick={onNuevo}>
            + Nueva Clase
          </button>
        )}
      </header>

      {clases.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--social-bg)', borderRadius: '8px' }}>
          <p>No hay clases registradas aún en el sistema.</p>
        </div>
      ) : (
        <div className="clase-grid">
          {clases.map((clase) => {
            const esSeleccionado = claseSeleccionadaId === clase.idClase;

            return (
              <div
                key={clase.idClase}
                className={`clase-card ${esSeleccionado ? 'seleccionado' : ''}`}
                onClick={() => onSeleccionar?.(clase)}
              >
                <div>
                  <h3 className="clase-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldIcon size={16} /> {clase.nombreClase}
                  </h3>
                  <p className="clase-desc">{clase.descripcionClase}</p>
                </div>

                {(onEditar || onEliminar) && (
                  <div className="clase-acciones">
                    {onSeleccionar && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          onSeleccionar(clase);
                        }}
                      >
                        Ver detalle
                      </button>
                    )}
                    {onEditar && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={(event) => handleEdit(event, clase)}
                      >
                        Editar
                      </button>
                    )}
                    {onEliminar && (
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={(event) => handleDelete(event, clase.idClase)}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export const ClaseLista = ClassList;
