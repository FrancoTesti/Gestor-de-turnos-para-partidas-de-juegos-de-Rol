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
      {objetos.map((objeto) => (
        <article key={objeto.idObjeto} className={`objeto-card ${seleccionadoId === objeto.idObjeto ? 'seleccionado' : ''}`}>
          <button className="objeto-card-contenido" type="button" onClick={() => onSeleccionar(objeto)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="objeto-tipo">{objeto.tipoObjeto}</span>
              {objeto.esUnico && (
                <span className="badge-unico" style={{ background: '#fefcbf', color: '#744210', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                  ⭐ Único
                </span>
              )}
            </div>
            <h3>{objeto.nombre}</h3>
            <p>Nivel {objeto.nivelObjeto} · Valor {objeto.valor}</p>
          </button>
          <div className="objeto-acciones">
            {onEditar && objeto.idPersonaje === null && <button type="button" onClick={() => onEditar(objeto)}>Editar</button>}
            {onEliminar && objeto.idPersonaje === null && <button type="button" className="peligro" onClick={() => onEliminar(objeto)}>Eliminar</button>}
          </div>
        </article>
      ))}
    </div>
  );
}
