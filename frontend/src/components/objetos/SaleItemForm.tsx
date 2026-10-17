import { useState } from 'react';
import type { Personaje, Tienda } from '../../interfaces';
import type { ItemPublic, ObjetoPublico, SellItemData } from '../../services/item.service';
import { NoticeModal, CoinIcon } from '../ui';
import './items.css';

export interface SaleItemFormProps {
  objeto: ItemPublic | ObjetoPublico;
  personaje?: Personaje;
  tiendas: Tienda[];
  onVender: (data: SellItemData) => Promise<void> | void;
  onCancelar: () => void;
}
export type VentaObjetoFormularioProps = SaleItemFormProps;

export function SaleItemForm({
  objeto,
  personaje,
  tiendas,
  onVender,
  onCancelar,
}: SaleItemFormProps) {
  const fixedPrice = objeto.valor;
  const [idTienda, setIdTienda] = useState<number | ''>(tiendas[0]?.idTienda ?? '');
  const [selling, setSelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const saldoActual = personaje ? personaje.dinero : 0;
  const saldoResultante = saldoActual + fixedPrice;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!personaje) {
      const msg = 'No se ha especificado el personaje propietario del objeto.';
      setError(msg);
      setErrorModal(msg);
      return;
    }
    if (!idTienda) {
      const msg = 'Debés seleccionar una tienda receptora.';
      setError(msg);
      setErrorModal(msg);
      return;
    }

    setSelling(true);
    try {
      await onVender({
        idPersonaje: personaje.idPersonaje,
        idTienda: Number(idTienda),
        precio: fixedPrice,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al vender el objeto';
      setError(msg);
      setErrorModal(msg);
    } finally {
      setSelling(false);
    }
  }

  return (
    <form className="compra-formulario" onSubmit={(e) => void handleSubmit(e)}>
      <h3>Vender {objeto.nombre}</h3>
      <p className="compra-precio" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
        Precio de venta: <strong><CoinIcon size={14} />${fixedPrice}</strong>
      </p>

      {error && (
        <p role="alert" className="detalle-error">
          {error}
        </p>
      )}

      <div className="rango-info" style={{
        background: 'rgba(59, 130, 246, 0.12)',
        padding: '0.6rem 0.8rem',
        borderRadius: '6px',
        margin: '0.75rem 0',
        border: '1px solid rgba(59, 130, 246, 0.35)'
      }}>
        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', color: 'var(--info-text, #38bdf8)', fontWeight: 600 }}>
          Venta instantánea a la tienda
        </p>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Se vende de manera instantánea al valor máximo (${fixedPrice}).
        </p>
      </div>

      <div className="saldo-resumen" style={{
        background: 'rgba(34, 197, 94, 0.12)',
        padding: '0.6rem 0.8rem',
        borderRadius: '6px',
        marginBottom: '0.75rem',
        border: '1px solid rgba(34, 197, 94, 0.35)'
      }}>
        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          Saldo actual: <strong><CoinIcon size={14} />${saldoActual}</strong>
        </p>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--success-text, #22c55e)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          Saldo después de la venta: <strong><CoinIcon size={14} />${saldoResultante}</strong>
        </p>
      </div>

      <label style={{ display: 'block', marginBottom: '0.75rem' }}>
        Tienda receptora *
        <select
          required
          value={idTienda}
          onChange={(e) => setIdTienda(e.target.value ? Number(e.target.value) : '')}
          disabled={selling}
          style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
        >
          <option value="">Seleccionar tienda</option>
          {tiendas.map((t) => (
            <option key={t.idTienda} value={t.idTienda}>
              {t.nombre} ({t.claseTienda})
            </option>
          ))}
        </select>
      </label>

      <div className="compra-acciones">
        <button
          className="btn-primary"
          type="submit"
          disabled={selling || !idTienda}
        >
          {selling ? 'Vendiendo...' : `Confirmar venta por $${fixedPrice}`}
        </button>
        <button type="button" onClick={onCancelar} disabled={selling}>
          Cancelar
        </button>
      </div>
      <NoticeModal mensaje={errorModal} onClose={() => setErrorModal(null)} />
    </form>
  );
}

export const VentaObjetoFormulario = SaleItemForm;
export default SaleItemForm;
