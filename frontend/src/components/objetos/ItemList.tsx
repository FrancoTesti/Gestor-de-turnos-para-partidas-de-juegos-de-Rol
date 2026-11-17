import { useMemo } from 'react';
import type { ItemPublic, ObjetoPublico } from '../../services/item.service';
import Loading from '../ui/Loading';
import { CoinIcon, StarIcon } from '../ui';
import './items.css';

export interface ItemListProps {
  objetos: (ItemPublic | ObjetoPublico)[];
  seleccionadoId?: number;
  cargando?: boolean;
  onSeleccionar: (objeto: ItemPublic) => void;
  onEditar?: (objeto: ItemPublic) => void;
  onEliminar?: (objeto: ItemPublic) => void;
}
export type ObjetoListaProps = ItemListProps;

export function ItemList({ objetos, seleccionadoId, cargando, onSeleccionar, onEditar, onEliminar }: ItemListProps) {
  const sortedItems = useMemo(() => {
    return [...objetos].sort((a, b) => a.nombre.localeCompare(b.nombre, undefined, { sensitivity: 'base' }));
  }, [objetos]);

  if (cargando) return <Loading message="Cargando objetos..." />;
  if (sortedItems.length === 0) return <p className="estado-lista">No hay objetos que coincidan con los filtros.</p>;

  return (
    <div className="objeto-grid">
      {sortedItems.map((objeto) => {
        const tooltipText = `ID: #${objeto.idObjeto}\nNombre: ${objeto.nombre}\nDescripción: ${objeto.descripcion || 'Sin descripción'}\nTipo: ${objeto.tipoObjeto}\nNivel: ${objeto.nivelObjeto}\nValor: ${objeto.valor}\nCualidad: ${objeto.esUnico ? 'Único' : 'Estándar'}`;

        return (
          <article
            key={objeto.idObjeto}
            className={`objeto-card ${seleccionadoId === objeto.idObjeto ? 'seleccionado' : ''}`}
            title={tooltipText}
          >
            <button
              className="objeto-card-contenido"
              type="button"
              onClick={() => onSeleccionar(objeto as ItemPublic)}
              title={tooltipText}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
            >
              {/* Arriba de todo: Tipo de item */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="objeto-tipo">{objeto.tipoObjeto}</span>
              </div>

              {/* Mismo nivel: Nombre a la izquierda y Precio a la derecha */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-h)' }}>
                  {objeto.nombre}
                </h3>
                <span
                  style={{
                    fontWeight: 700,
                    color: 'var(--accent-text)',
                    fontSize: '1rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    flexShrink: 0,
                  }}
                >
                  <CoinIcon size={14} /> ${objeto.valor}
                </span>
              </div>

              {/* Descripción si existe */}
              {objeto.descripcion && (
                <p style={{ margin: '0.1rem 0 0.25rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {objeto.descripcion}
                </p>
              )}

              {/* Abajo: ID, Nivel, Único */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginTop: '0.25rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  flexWrap: 'wrap',
                }}
              >
                <span>ID: #{objeto.idObjeto}</span>
                <span>•</span>
                <span>Nivel {objeto.nivelObjeto}</span>
                {objeto.esUnico && (
                  <>
                    <span>•</span>
                    <span
                      className="badge-unico"
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                        background: 'rgba(168, 85, 247, 0.2)',
                        color: 'var(--accent, #a855f7)',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                      }}
                    >
                      <StarIcon size={12} /> Único
                    </span>
                    {objeto.idPersonaje !== null && (
                      <span
                        className="badge-comprado"
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: 'var(--error-solid, #ef4444)',
                          fontWeight: 700,
                        }}
                      >
                        Ya comprado
                      </span>
                    )}
                  </>
                )}
              </div>
            </button>
            {(onEditar || onEliminar) && objeto.idPersonaje === null && (
              <div className="objeto-acciones">
                {onEditar && <button type="button" className="btn-secondary" onClick={() => onEditar(objeto as ItemPublic)}>Editar</button>}
                {onEliminar && <button type="button" className="btn-danger peligro" onClick={() => onEliminar(objeto as ItemPublic)}>Eliminar</button>}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

export const ObjetoLista = ItemList;
export default ItemList;
