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

export function rangoVenta(valor: number) {
  return {
    minimo: Math.ceil((valor * 70) / 100),
    maximo: Math.floor((valor * 100) / 100),
  };
}

export default function VentaObjetoFormulario({
  objeto,
  personaje,
  tiendas,
  onVender,
  onCancelar,
}: VentaObjetoFormularioProps) {
  const rango = rangoVenta(objeto.valor);
  const [precio, setPrecio] = useState<number | ''>(rango.maximo);
  const [idTienda, setIdTienda] = useState<number | ''>(tiendas[0]?.idTienda ?? '');
  const [vendiendo, setVendiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saldoActual = personaje ? personaje.dinero : 0;
  const precioNumerico = typeof precio === 'number' ? precio : 0;
  const saldoResultante = saldoActual + precioNumerico;
  const precioValido = typeof precio === 'number' && precio >= rango.minimo && precio <= rango.maximo;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!personaje) {
      setError('No se ha especificado el personaje propietario del objeto.');
      return;
    }
    if (!idTienda) {
      setError('Debés seleccionar una tienda destino.');
      return;
    }
    if (!precioValido) {
      setError(`El precio debe estar dentro del rango permitido (${rango.minimo} a ${rango.maximo}).`);
      return;
    }

    setVendiendo(true);
    try {
      await onVender({
        idPersonaje: personaje.idPersonaje,
        idTienda: Number(idTienda),
        precio: precioNumerico,
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
      <p className="compra-precio">Valor base del objeto: <strong>${objeto.valor}</strong></p>

      {error && (
        <p role="alert" className="detalle-error">
          ⚠️ {error}
        </p>
      )}

      <div className="rango-info" style={{ background: '#ebf8ff', padding: '0.6rem 0.8rem', borderRadius: '6px', margin: '0.75rem 0', border: '1px solid #bee3f8' }}>
        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', color: '#2b6cb0', fontWeight: 600 }}>
          🏷️ Rango de precio permitido: 70 % a 100 %
        </p>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#4a5568' }}>
          Mínimo: <strong>${rango.minimo}</strong> — Máximo: <strong>${rango.maximo}</strong>
        </p>
      </div>

      <div className="saldo-resumen" style={{ background: '#f0fff4', padding: '0.6rem 0.8rem', borderRadius: '6px', marginBottom: '0.75rem', border: '1px solid #9ae6b4' }}>
        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>
          💰 Saldo actual del personaje: <strong>${saldoActual}</strong>
        </p>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#276749' }}>
          📈 Saldo posterior a la venta: <strong>${saldoResultante}</strong>
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

      <label style={{ display: 'block', marginBottom: '0.75rem' }}>
        Precio de venta ($) *
        <input
          required
          type="number"
          step="1"
          min={rango.minimo}
          max={rango.maximo}
          value={precio}
          onChange={(e) => setPrecio(e.target.value ? Number(e.target.value) : '')}
          disabled={vendiendo}
          style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
        />
      </label>

      <div className="compra-acciones">
        <button
          className="btn-primary"
          type="submit"
          disabled={vendiendo || !idTienda || !precioValido}
        >
          {vendiendo ? 'Vendiendo...' : 'Confirmar venta'}
        </button>
        <button type="button" onClick={onCancelar} disabled={vendiendo}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
