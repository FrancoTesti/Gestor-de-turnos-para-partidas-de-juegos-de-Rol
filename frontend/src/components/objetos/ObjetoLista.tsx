import type { ObjetoPublico } from '../../services/objeto.service';
import './objetos.css';

interface ObjetoListaProps {
  objetos: ObjetoPublico[];
  seleccionadoId?: number;
  cargando?: boolean;
  onSeleccionar: (objeto: ObjetoPublico) => void;
  onEditar: (objeto: ObjetoPublico) => void;
  onEliminar: (objeto: ObjetoPublico) => void;
}

export default function ObjetoLista({ objetos, seleccionadoId, cargando, onSeleccionar, onEditar, onEliminar }: ObjetoListaProps) {
  if (cargando) return <p className="estado-lista">Cargando objetos...</p>;
  if (objetos.length === 0) return <p className="estado-lista">No hay objetos que coincidan con los filtros.</p>;

  return (
    <div className="objeto-grid">
      {objetos.map((objeto) => (
        <article key={objeto.idObjeto} className={`objeto-card ${seleccionadoId === objeto.idObjeto ? 'seleccionado' : ''}`}>
          <button className="objeto-card-contenido" type="button" onClick={() => onSeleccionar(objeto)}>
            <span className="objeto-tipo">{objeto.tipoObjeto}</span>
            <h3>{objeto.nombre}</h3>
            <p>Nivel {objeto.nivelObjeto} · Valor {objeto.valor}</p>
          </button>
          <div className="objeto-acciones">
            <button type="button" onClick={() => onEditar(objeto)}>Editar</button>
            <button type="button" className="peligro" onClick={() => onEliminar(objeto)}>Eliminar</button>
          </div>
        </article>
      ))}
    </div>
  );
}
