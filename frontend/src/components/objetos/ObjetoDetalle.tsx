import type { ObjetoPublico } from '../../services/objeto.service';
import Loading from '../ui/Loading';
import { CoinIcon, StarIcon } from '../ui';
import './objetos.css';

interface ObjetoDetalleProps {
  objeto: ObjetoPublico | null;
  nombreTienda?: string;
  cargando?: boolean;
  error?: string | null;
  onComprar?: () => void;
  deshabilitarCompra?: boolean;
  motivoDeshabilitado?: string;
}

export default function ObjetoDetalle({
  objeto,
  nombreTienda,
  cargando,
  error,
  onComprar,
  deshabilitarCompra,
  motivoDeshabilitado,
}: ObjetoDetalleProps) {
  if (cargando) return <Loading message="Cargando detalle..." />;
  if (error) return <p className="detalle-error" role="alert">{error}</p>;
  if (!objeto) return <p>Seleccioná un objeto para ver sus datos.</p>;

  return (
    <div className="objeto-detalle">
      <span className="objeto-tipo">{objeto.tipoObjeto}</span>
      <h2>{objeto.nombre}</h2>
      <p>{objeto.descripcion}</p>
      <dl>
        <div><dt>Nivel</dt><dd>{objeto.nivelObjeto}</dd></div>
        <div>
          <dt style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            Valor <CoinIcon size={14} />
          </dt>
          <dd>${objeto.valor}</dd>
        </div>
        <div>
          <dt style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            Único <StarIcon size={14} />
          </dt>
          <dd>{objeto.esUnico ? 'Sí' : 'No'}</dd>
        </div>
        <div><dt>Posición</dt><dd>{objeto.posicion}</dd></div>
        <div><dt>Ubicación</dt><dd>{nombreTienda ?? (objeto.idPersonaje ? `Inventario ${objeto.numInventario} del personaje #${objeto.idPersonaje}` : 'Sin asignar')}</dd></div>
      </dl>
      {objeto.esUnico && (objeto.idPersonaje !== null || objeto.idTienda === null) ? (
        <button
          className="btn-comprar btn-ya-comprado"
          type="button"
          disabled
          aria-disabled="true"
          title="Este objeto único ya fue comprado"
        >
          Ya comprado
        </button>
      ) : (
        objeto.idTienda !== null && (onComprar || deshabilitarCompra) && (
          <button
            className="btn-comprar"
            type="button"
            disabled={deshabilitarCompra || !onComprar}
            title={motivoDeshabilitado}
            onClick={onComprar}
          >
            Comprar objeto
          </button>
        )
      )}
    </div>
  );
}
