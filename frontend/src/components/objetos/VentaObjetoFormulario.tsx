import { useState } from 'react';
import type { Personaje, Tienda } from '../../interfaces';
import type { ObjetoPublico, VenderObjetoData } from '../../services/objeto.service';
import './objetos.css';

interface VentaObjetoFormularioProps {
  objeto: ObjetoPublico;
  personaje?: Personaje;
  tiendas: Tienda[];
  onVender: (data: VenderObjetoData) => Promise<void> | void;
  onCancelar: () => void;
}

export default function VentaObjetoFormulario({
  objeto,
  personaje,
  tiendas,
  onVender,
  onCancelar,
}: VentaObjetoFormularioProps) {
  const precioFijo = objeto.valor;
  const [idTienda, setIdTienda] = useState<number | ''>(tiendas[0]?.idTienda ?? '');
  const [vendiendo, setVendiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saldoActual = personaje ? personaje.dinero : 0;
  const saldoResultante = saldoActual + precioFijo;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!personaje) {
      setError('No se ha especificado el personaje propietario del objeto.');
      return;
    }
    if (!idTienda) {
      setError('Debés seleccionar una tienda receptora.');
      return;
    }

    setVendiendo(true);
    try {
      await onVender({
        idPersonaje: personaje.idPersonaje,
        idTienda: Number(idTienda),
        precio: precioFijo,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al vender el objeto');
    } finally {
      setVendiendo(false);
    }
  }

  return (
    <form className="compra-formulario" onSubmit={(e) => void enviar(e)}>
      <h3>Vender {objeto.nombre}</h3>
      <p className="compra-precio">
        Precio de venta: <strong>${precioFijo}</strong>
      </p>

      {error && (
        <p role="alert" className="detalle-error">
          ⚠️ {error}
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
          ⚡ Venta instantánea a la tienda
        </p>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Se vende de manera instantánea al valor máximo (${precioFijo}).
        </p>
      </div>

      <div className="saldo-resumen" style={{
        background: 'rgba(34, 197, 94, 0.12)',
        padding: '0.6rem 0.8rem',
        borderRadius: '6px',
        marginBottom: '0.75rem',
        border: '1px solid rgba(34, 197, 94, 0.35)'
      }}>
        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>
          💰 Saldo actual: <strong>${saldoActual}</strong>
        </p>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--success-text, #22c55e)' }}>
          📊 Saldo después de la venta: <strong>${saldoResultante}</strong>
        </p>
      </div>

      <label style={{ display: 'block', marginBottom: '0.75rem' }}>
        Tienda receptora *
        <select
          required
          value={idTienda}
          onChange={(e) => setIdTienda(e.target.value ? Number(e.target.value) : '')}
          disabled={vendiendo}
          style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
        >
          <option value="">Seleccionar tienda</option>
          {tiendas.map((t) => (
            <option key={t.idTienda} value={t.idTienda}>
              🏪 {t.nombre} ({t.claseTienda})
            </option>
          ))}
        </select>
      </label>

      <div className="compra-acciones">
        <button
          className="btn-primary"
          type="submit"
          disabled={vendiendo || !idTienda}
        >
          {vendiendo ? 'Vendiendo...' : `Confirmar venta por $${precioFijo}`}
        </button>
        <button type="button" onClick={onCancelar} disabled={vendiendo}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
