import { useState } from 'react';
import type { Personaje } from '../../interfaces';
import type { ComprarObjetoData, ObjetoPublico } from '../../services/objeto.service';
import './objetos.css';

interface CompraObjetoFormularioProps {
  objeto: ObjetoPublico;
  personajes: Personaje[];
  onComprar: (data: ComprarObjetoData) => Promise<void> | void;
  onCancelar: () => void;
}

export default function CompraObjetoFormulario({
  objeto,
  personajes,
  onComprar,
  onCancelar,
}: CompraObjetoFormularioProps) {
  const [idPersonaje, setIdPersonaje] = useState(personajes[0]?.idPersonaje ?? 0);
  const [numInventario, setNumInventario] = useState(1);
  const [posicion, setPosicion] = useState(0);
  const [comprando, setComprando] = useState(false);

  async function enviar(evento: React.FormEvent): Promise<void> {
    evento.preventDefault();
    if (!idPersonaje || numInventario < 1 || posicion < 0) return;

    setComprando(true);
    try {
      await onComprar({ idPersonaje, numInventario, posicion });
    } finally {
      setComprando(false);
    }
  }

  return (
    <form className="compra-formulario" onSubmit={(evento) => void enviar(evento)}>
      <h3>Comprar {objeto.nombre}</h3>
      <p className="compra-precio">Precio: {objeto.valor}</p>

      {personajes.length === 0 ? (
        <p className="detalle-error">No hay personajes disponibles para realizar la compra.</p>
      ) : (
        <>
          <label>
            Personaje
            <select value={idPersonaje} onChange={(e) => setIdPersonaje(Number(e.target.value))} disabled={comprando}>
              {personajes.map((personaje) => (
                <option key={personaje.idPersonaje} value={personaje.idPersonaje}>
                  {personaje.nombreFicticio} — dinero: {personaje.dinero}
                </option>
              ))}
            </select>
          </label>
          <label>
            Número de inventario
            <input type="number" min="1" step="1" value={numInventario} onChange={(e) => setNumInventario(Number(e.target.value))} disabled={comprando} />
          </label>
          <label>
            Posición
            <input type="number" min="0" step="1" value={posicion} onChange={(e) => setPosicion(Number(e.target.value))} disabled={comprando} />
          </label>
        </>
      )}

      <div className="compra-acciones">
        <button className="btn-comprar" type="submit" disabled={comprando || personajes.length === 0}>
          {comprando ? 'Comprando...' : 'Confirmar compra'}
        </button>
        <button type="button" onClick={onCancelar} disabled={comprando}>Cancelar</button>
      </div>
    </form>
  );
}
