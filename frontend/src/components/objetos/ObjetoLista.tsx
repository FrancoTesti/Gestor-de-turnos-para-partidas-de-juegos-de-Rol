import type { ObjetoPublico } from '../../services/objeto.service';
import './objetos.css';

interface ObjetoListaProps {
  objetos: ObjetoPublico[];
  seleccionadoId?: number;
  cargando?: boolean;
  onSeleccionar: (objeto: ObjetoPublico) => void;
  onEditar?: (objeto: ObjetoPublico) => void;
  onEliminar?: (objeto: ObjetoPublico) => void;
}

export default function ObjetoLista({ objetos, seleccionadoId, cargando, onSeleccionar, onEditar, onEliminar }: ObjetoListaProps) {
  if (cargando) return <p className="estado-lista">Cargando objetos...</p>;
  if (objetos.length === 0) return <p className="estado-lista">No hay objetos que coincidan con los filtros.</p>;

  return (
    <div className="objeto-grid">
      {objetos.map((objeto) => {
        const tooltipText = `ID: #${objeto.idObjeto}\nNombre: ${objeto.nombre}\nDescripción: ${objeto.descripcion || 'Sin descripción'}\nTipo: ${objeto.tipoObjeto}\nNivel: ${objeto.nivelObjeto}\nValor: ${objeto.valor}\nCualidad: ${objeto.esUnico ? 'Único ⭐' : 'Estándar'}`;

        return (
          <article
            key={objeto.idObjeto}
            className={`objeto-card ${seleccionadoId === objeto.idObjeto ? 'seleccionado' : ''}`}
            title={tooltipText}
          >
            <button className="objeto-card-contenido" type="button" onClick={() => onSeleccionar(objeto)} title={tooltipText}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="objeto-tipo">{objeto.tipoObjeto}</span>
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ID: #{objeto.idObjeto}</span>
                  {objeto.esUnico && (
                    <span className="badge-unico" style={{ background: '#fefcbf', color: '#744210', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                      ⭐ Único
                    </span>
                  )}
                </div>
              </div>
              <h3>{objeto.nombre}</h3>
              <p>Nivel {objeto.nivelObjeto} · Valor {objeto.valor}</p>
            </button>
            {(onEditar || onEliminar) && objeto.idPersonaje === null && (
              <div className="objeto-acciones">
                {onEditar && <button type="button" className="btn-secondary" onClick={() => onEditar(objeto)}>Editar</button>}
                {onEliminar && <button type="button" className="btn-danger peligro" onClick={() => onEliminar(objeto)}>Eliminar</button>}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
