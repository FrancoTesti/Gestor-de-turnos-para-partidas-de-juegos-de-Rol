import { useState } from 'react';
import type { Personaje, Inventario } from '../../interfaces';
import type { ComprarObjetoData, ObjetoPublico } from '../../services/objeto.service';
import './objetos.css';

interface CompraObjetoFormularioProps {
  objeto: ObjetoPublico;
  personajes: Personaje[];
  inventarios?: Inventario[];
  onComprar: (data: ComprarObjetoData) => Promise<void> | void;
  onCancelar: () => void;
}

export default function CompraObjetoFormulario({
  objeto,
  personajes,
  inventarios,
  onComprar,
  onCancelar,
}: CompraObjetoFormularioProps) {
  const [idPersonaje, setIdPersonaje] = useState(personajes[0]?.idPersonaje ?? 0);
  const [numInventario, setNumInventario] = useState(1);
  const [posicion, setPosicion] = useState(0);
  const [comprando, setComprando] = useState(false);
  const disponibles = inventarios?.filter(i => i.idPersonaje === idPersonaje);
  const elegido = disponibles?.find(i => i.numInventario === numInventario);

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
            <select value={idPersonaje} onChange={(e) => { const id = Number(e.target.value); setIdPersonaje(id); setNumInventario(inventarios?.find(i => i.idPersonaje === id)?.numInventario ?? 1); setPosicion(0); }} disabled={comprando}>
              {personajes.map((personaje) => (
                <option key={personaje.idPersonaje} value={personaje.idPersonaje}>
                  {personaje.nombreFicticio} — dinero: {personaje.dinero}
                </option>
              ))}
            </select>
          </label>
          <label>
            Número de inventario
            {disponibles ? <select required value={elegido ? numInventario : ''} onChange={e => { setNumInventario(Number(e.target.value)); setPosicion(0); }}><option value="">Elegir inventario</option>{disponibles.map(i => <option key={i.numInventario} value={i.numInventario}>Inventario {i.numInventario} ({i.cantidadEspacio} espacios)</option>)}</select> : <input type="number" min="1" step="1" value={numInventario} onChange={(e) => setNumInventario(Number(e.target.value))} disabled={comprando} />}
          </label>
          <label>
            Posición
            <input type="number" min="0" max={elegido ? elegido.cantidadEspacio - 1 : undefined} step="1" value={posicion} onChange={(e) => setPosicion(Number(e.target.value))} disabled={comprando} />
          </label>
        </>
      )}

      <div className="compra-acciones">
        <button className="btn-comprar" type="submit" disabled={comprando || personajes.length === 0 || (disponibles !== undefined && !elegido)}>
          {comprando ? 'Comprando...' : 'Confirmar compra'}
        </button>
        <button type="button" onClick={onCancelar} disabled={comprando}>Cancelar</button>
      </div>
    </form>
  );
}
