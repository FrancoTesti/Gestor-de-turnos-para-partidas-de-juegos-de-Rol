import type { MouseEvent } from 'react';
import type { Clase } from '../../interfaces';
import './clases.css';

export interface ClaseListaProps {
  clases: Clase[];
  claseSeleccionadaId?: number | null;
  onSeleccionar?: (clase: Clase) => void;
  onEditar?: (clase: Clase) => void;
  onEliminar?: (idClase: number) => void;
  onNuevo?: () => void;
  cargando?: boolean;
}

export default function ClaseLista({
  clases,
  claseSeleccionadaId,
  onSeleccionar,
  onEditar,
  onEliminar,
  onNuevo,
  cargando = false,
}: ClaseListaProps) {
  function handleEditar(event: MouseEvent<HTMLButtonElement>, clase: Clase) {
    event.stopPropagation();
    onEditar?.(clase);
  }

  function handleEliminar(event: MouseEvent<HTMLButtonElement>, idClase: number) {
    event.stopPropagation();
    if (window.confirm('¿Está seguro de eliminar esta clase?')) {
      onEliminar?.(idClase);
    }
  }

  if (cargando) {
    return (
      <section className="clase-container">
        <div className="clase-header">
          <h2>Clases de Personaje</h2>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <span>⏳ Cargando clases...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="clase-container">
      <header className="clase-header">
        <h2>Clases de Personaje ({clases.length})</h2>
        {onNuevo && (
          <button type="button" className="btn-primary" onClick={onNuevo}>
            + Nueva Clase
          </button>
        )}
      </header>

      {clases.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', background: '#f7fafc', borderRadius: '8px' }}>
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
                role={onSeleccionar ? 'button' : undefined}
                tabIndex={onSeleccionar ? 0 : undefined}
              >
                <div>
                  <div className="clase-icon-badge">🛡️</div>
                  <h3 className="clase-title">{clase.nombreClase}</h3>
                  <p className="clase-desc">{clase.descripcionClase}</p>
                </div>

                {(onEditar || onEliminar) && (
                  <div className="clase-acciones">
                    {onEditar && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={(event) => handleEditar(event, clase)}
                      >
                        Editar
                      </button>
                    )}
                    {onEliminar && (
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={(event) => handleEliminar(event, clase.idClase)}
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
