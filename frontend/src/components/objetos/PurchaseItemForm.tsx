import { useState } from 'react';
import type { Personaje, Inventario } from '../../interfaces';
import type { BuyItemData, PublicItem } from '../../services/item.service';
import { AvisoModal, CoinIcon } from '../ui';
import './items.css';

export interface PurchaseItemFormProps {
  objeto: PublicItem;
  personajes: Personaje[];
  inventarios?: Inventario[];
  onComprar: (data: BuyItemData) => Promise<void> | void;
  onCancelar: () => void;
}
export type CompraObjetoFormularioProps = PurchaseItemFormProps;

export default function PurchaseItemForm({
  objeto,
  personajes,
  inventarios,
  onComprar,
  onCancelar,
}: PurchaseItemFormProps) {
  const [idPersonaje, setIdPersonaje] = useState(personajes[0]?.idPersonaje ?? 0);
  const [numInventario, setNumInventario] = useState(1);
  const [posicion, setPosicion] = useState(0);
  const [comprando, setComprando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorAvisoModal, setErrorAvisoModal] = useState<string | null>(null);

  const personajeSeleccionado = personajes.find(p => p.idPersonaje === idPersonaje);
  const saldoActual = personajeSeleccionado ? personajeSeleccionado.dinero : 0;
  const saldoRestante = saldoActual - objeto.valor;
  const saldoInsuficiente = saldoActual < objeto.valor;
  const nivelInsuficiente = Boolean(
    personajeSeleccionado && personajeSeleccionado.nivel < objeto.nivelObjeto
  );

  const disponibles = inventarios?.filter(i => i.idPersonaje === idPersonaje);
  const elegido = disponibles?.find(i => i.numInventario === numInventario);

  async function handleSubmit(evento: React.FormEvent): Promise<void> {
    evento.preventDefault();
    setError(null);
    if (!idPersonaje || numInventario < 1 || posicion < 0 || saldoInsuficiente || nivelInsuficiente) return;

    setComprando(true);
    try {
      await onComprar({ idPersonaje, numInventario, posicion });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al realizar la compra';
      setError(msg);
      setErrorAvisoModal(msg);
    } finally {
      setComprando(false);
    }
  }

  return (
    <form className="compra-formulario" onSubmit={(evento) => void handleSubmit(evento)}>
      <h3>Comprar {objeto.nombre}</h3>
      <p className="compra-precio" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
        Precio del objeto: <strong><CoinIcon size={14} /> ${objeto.valor}</strong>
      </p>

      {error && (
        <p className="detalle-error" role="alert">
          {error}
        </p>
      )}

      {personajes.length === 0 ? (
        <p className="detalle-error" role="alert">No hay personajes disponibles para realizar la compra.</p>
      ) : (
        <>
          <label>
            Personaje
            <select value={idPersonaje} onChange={(e) => { const id = Number(e.target.value); setIdPersonaje(id); setNumInventario(inventarios?.find(i => i.idPersonaje === id)?.numInventario ?? 1); setPosicion(0); }} disabled={comprando}>
              {personajes.map((personaje) => (
                <option key={personaje.idPersonaje} value={personaje.idPersonaje}>
                  {personaje.nombreFicticio} — Saldo: ${personaje.dinero}
                </option>
              ))}
            </select>
          </label>

          <div className="saldo-resumen" style={{
            background: saldoInsuficiente ? 'rgba(239, 68, 68, 0.12)' : 'rgba(34, 197, 94, 0.12)',
            padding: '0.6rem 0.8rem',
            borderRadius: '6px',
            margin: '0.75rem 0',
            border: `1px solid ${saldoInsuficiente ? 'rgba(239, 68, 68, 0.35)' : 'rgba(34, 197, 94, 0.35)'}`
          }}>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Saldo actual: <strong><CoinIcon size={14} />${saldoActual}</strong>
            </p>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', color: saldoInsuficiente ? 'var(--error-text, #ef4444)' : 'var(--success-text, #22c55e)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Saldo después de la compra: <strong><CoinIcon size={14} />${saldoRestante}</strong>
            </p>
            {saldoInsuficiente && (
              <p role="alert" style={{ margin: '0.25rem 0 0 0', color: 'var(--error-text, #ef4444)', fontWeight: 600, fontSize: '0.85rem' }}>
                Saldo insuficiente. Te faltan ${objeto.valor - saldoActual} monedas.
              </p>
            )}
            {nivelInsuficiente && (
              <p role="alert" style={{ margin: '0.25rem 0 0 0', color: 'var(--error-text, #ef4444)', fontWeight: 600, fontSize: '0.85rem' }}>
                Nivel insuficiente: tu personaje es nivel {personajeSeleccionado?.nivel} y el objeto requiere nivel {objeto.nivelObjeto}.
              </p>
            )}
          </div>

          <label>
            Número de inventario
            {disponibles ? <select required value={elegido ? numInventario : ''} onChange={e => { setNumInventario(Number(e.target.value)); setPosicion(0); }}><option value="">Elegir inventario</option>{disponibles.map(i => <option key={i.numInventario} value={i.numInventario}>Inventario #{i.numInventario} ({i.cantidadEspacio} espacios)</option>)}</select> : <input type="number" min="1" step="1" value={numInventario} onChange={(e) => setNumInventario(Number(e.target.value))} disabled={comprando} />}
          </label>
          <label>
            Posición en el inventario
            <input type="number" min="0" max={elegido ? elegido.cantidadEspacio - 1 : undefined} step="1" value={posicion} onChange={(e) => setPosicion(Number(e.target.value))} disabled={comprando} />
          </label>
        </>
      )}

      <div className="compra-acciones">
        <button className="btn-comprar" type="submit" disabled={comprando || personajes.length === 0 || saldoInsuficiente || nivelInsuficiente || (disponibles !== undefined && !elegido)}>
          {comprando ? 'Comprando...' : 'Confirmar compra'}
        </button>
        <button type="button" onClick={onCancelar} disabled={comprando}>Cancelar</button>
      </div>
      <AvisoModal mensaje={errorAvisoModal} onClose={() => setErrorAvisoModal(null)} />
    </form>
  );
}

export const CompraObjetoFormulario = PurchaseItemForm;
