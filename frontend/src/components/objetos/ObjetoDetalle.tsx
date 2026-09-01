import type { ObjetoPublico } from '../../services/objeto.service';
import './objetos.css';

interface ObjetoDetalleProps {
  objeto: ObjetoPublico | null;
  nombreTienda?: string;
  cargando?: boolean;
  error?: string | null;
}

export default function ObjetoDetalle({ objeto, nombreTienda, cargando, error }: ObjetoDetalleProps) {
  if (cargando) return <p>Cargando detalle...</p>;
  if (error) return <p className="detalle-error" role="alert">{error}</p>;
  if (!objeto) return <p>Seleccioná un objeto para ver sus datos.</p>;

  return (
    <div className="objeto-detalle">
      <span className="objeto-tipo">{objeto.tipoObjeto}</span>
      <h2>{objeto.nombre}</h2>
      <p>{objeto.descripcion}</p>
      <dl>
        <div><dt>Nivel</dt><dd>{objeto.nivelObjeto}</dd></div>
        <div><dt>Valor</dt><dd>{objeto.valor}</dd></div>
        <div><dt>Posición</dt><dd>{objeto.posicion}</dd></div>
        <div><dt>Tienda</dt><dd>{nombreTienda ?? 'Sin tienda'}</dd></div>
      </dl>
    </div>
  );
}
