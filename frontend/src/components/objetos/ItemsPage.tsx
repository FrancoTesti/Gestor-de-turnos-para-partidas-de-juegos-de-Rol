import { useEffect, useMemo, useState } from 'react';
import type { Personaje, Tienda, Inventario } from '../../interfaces';
import { useUser } from '../../context/UserContext';
import { api } from '../../services/api';
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  purchaseItem,
  type CreateItemData,
  type PurchaseItemData,
  type ItemPublic,
} from '../../services/item.service';
import { getCharacters } from '../../services/character.service';
import { getShops } from '../../services/shop.service';
import PurchaseItemForm from './PurchaseItemForm';
import ItemDetail from './ItemDetail';
import ItemForm from './ItemForm';
import ItemList from './ItemList';
import './items.css';

type ViewMode = 'listado' | 'formulario';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado';
}

export function ItemsPage() {
  const { usuarioLogueado, rolDe } = useUser();
  const userId = usuarioLogueado!.idUsuario;
  const host = rolDe(userId) === 'anfitrion';
  const [inventarios, setInventarios] = useState<Inventario[]>([]);
  const [sugerirPara, setSugerirPara] = useState('');
  const [objetos, setObjetos] = useState<ItemPublic[]>([]);
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [personajes, setPersonajes] = useState<Personaje[]>([]);
  const [seleccionado, setSeleccionado] = useState<ItemPublic | null>(null);
  const [enEdicion, setEnEdicion] = useState<ItemPublic | undefined>();
  const [vista, setVista] = useState<ViewMode>('listado');
  const [busqueda, setBusqueda] = useState('');
  const [tipo, setTipo] = useState('');
  const [nivel, setNivel] = useState('');
  const [valorMax, setValorMax] = useState('');
  const [cargando, setCargando] = useState(true);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetalle, setErrorDetalle] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [compraAbierta, setCompraAbierta] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([
      getItems(),
      getShops(),
      getCharacters(),
      api<Inventario[]>('/inventarios'),
    ]).then(([objetosObtenidos, tiendasObtenidas, personajesObtenidos, inventariosObtenidos]) => {
      if (!active) return;
      setObjetos(objetosObtenidos);
      setError(null);
      setTiendas(tiendasObtenidas);
      setPersonajes(personajesObtenidos.filter(p => p.idUsuarioJugador === userId));
      setInventarios(inventariosObtenidos);
    }).catch(e => { if (active) setError(getErrorMessage(e)); })
      .finally(() => { if (active) setCargando(false); });
    return () => { active = false; };
  }, [userId, revision]);
  const cargarDatos = () => { setCargando(true); setError(null); setRevision(n => n + 1); };

  const tipos = useMemo(
    () => [...new Set(objetos.map((objeto) => objeto.tipoObjeto))].sort(),
    [objetos],
  );

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase();
    return objetos.filter((objeto) => {
      // Las instancias de objetos no únicos comprados pertenecen exclusivamente al inventario
      if (objeto.idPersonaje !== null && !objeto.esUnico) return false;

      const coincideTexto = !texto || objeto.nombre.toLocaleLowerCase().includes(texto) || objeto.descripcion.toLocaleLowerCase().includes(texto);
      const clase = personajes.find(p => p.idPersonaje === Number(sugerirPara))?.idClase;
      const sugerido = !sugerirPara || (objeto.idTienda !== null && objeto.idPersonaje === null && tiendas.some(t => t.idTienda === objeto.idTienda && t.idClase === clase));
      const coincideTipo = !tipo || objeto.tipoObjeto === tipo;
      const coincideNivel = !nivel || objeto.nivelObjeto === Number(nivel);
      const coincideValor = !valorMax || objeto.valor <= Number(valorMax);
      return coincideTexto && coincideTipo && coincideNivel && coincideValor && sugerido;
    }).sort((a, b) => a.nombre.localeCompare(b.nombre, undefined, { sensitivity: 'base' }));
  }, [busqueda, objetos, tipo, nivel, valorMax, sugerirPara, personajes, tiendas]);

  async function handleSelect(objeto: ItemPublic): Promise<void> {
    setCompraAbierta(false);
    setCargandoDetalle(true);
    setErrorDetalle(null);
    try {
      setSeleccionado(await getItemById(objeto.idObjeto));
    } catch (e) {
      setSeleccionado(null);
      setErrorDetalle(getErrorMessage(e));
    } finally {
      setCargandoDetalle(false);
    }
  }

  async function handleSave(datos: CreateItemData): Promise<void> {
    setError(null);
    setMensaje(null);
    try {
      if (enEdicion) {
        const actualizado = await updateItem(enEdicion.idObjeto, datos);
        setObjetos((actuales) => actuales.map((objeto) => objeto.idObjeto === actualizado.idObjeto ? actualizado : objeto));
        setSeleccionado(actualizado);
        setMensaje('Objeto actualizado correctamente.');
      } else {
        const creado = await createItem(datos);
        setObjetos((actuales) => [...actuales, creado]);
        setSeleccionado(creado);
        setMensaje('Objeto creado correctamente.');
      }
      setVista('listado');
      setEnEdicion(undefined);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  async function handleDelete(objeto: ItemPublic): Promise<void> {
    if (!window.confirm(`¿Seguro que querés eliminar "${objeto.nombre}"?`)) return;
    setError(null);
    setMensaje(null);
    try {
      await deleteItem(objeto.idObjeto);
      setObjetos((actuales) => actuales.filter((actual) => actual.idObjeto !== objeto.idObjeto));
      if (seleccionado?.idObjeto === objeto.idObjeto) setSeleccionado(null);
      setMensaje('Objeto eliminado correctamente.');
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  async function handlePurchase(data: PurchaseItemData): Promise<void> {
    if (host) {
      setError('Los anfitriones no tienen permitido comprar objetos de la tienda.');
      return;
    }
    if (!seleccionado) return;
    setError(null);
    setMensaje(null);
    try {
      const resultado = await purchaseItem(seleccionado.idObjeto, data);
      if (seleccionado.esUnico) {
        setObjetos((actuales) =>
          actuales.map((objeto) => (objeto.idObjeto === resultado.objeto.idObjeto ? resultado.objeto : objeto)),
        );
        setSeleccionado(resultado.objeto);
      }
      setPersonajes((actuales) =>
        actuales.map((personaje) => personaje.idPersonaje === resultado.idPersonaje
          ? { ...personaje, dinero: resultado.dineroRestante }
          : personaje),
      );
      setCompraAbierta(false);
      setMensaje(`Compra realizada con éxito. Saldo restante: $${resultado.dineroRestante}.`);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  return (
    <section>
      <header className="seccion-header">
        <div>
          <p className="app-eyebrow">Inventario y tiendas</p>
          <h1>Administración de objetos</h1>
        </div>
        {vista === 'listado' && host && <button className="btn-nuevo" type="button" onClick={() => { setEnEdicion(undefined); setVista('formulario'); }}>Nuevo objeto</button>}
      </header>

      {mensaje && <p className="mensaje mensaje-exito" role="status">{mensaje}</p>}
      {error && <div className="mensaje mensaje-error" role="alert"><span>{error}</span>{vista === 'listado' && <button type="button" onClick={() => void cargarDatos()}>Reintentar</button>}</div>}

      {vista === 'formulario' ? (
        <div className="panel-formulario">
          <ItemForm objeto={enEdicion} tiendas={tiendas} onGuardar={handleSave} onCancelar={() => { setEnEdicion(undefined); setVista('listado'); }} />
        </div>
      ) : (
        <>
          <div className="objeto-filtros" aria-label="Filtros de objetos">
            <label>Sugeridos por clase de mi personaje<select value={sugerirPara} onChange={e => setSugerirPara(e.target.value)}><option value="">Todos los objetos</option>{personajes.map(p => <option key={p.idPersonaje} value={p.idPersonaje}>{p.nombreFicticio}</option>)}</select></label>
            <input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre o descripción" />
            <select aria-label="Filtrar por tipo de objeto" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Todos los tipos</option>
              {tipos.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <div className="objeto-campos-numericos">
              <input
                type="number"
                min="1"
                value={nivel}
                onChange={(e) => setNivel(e.target.value)}
                placeholder="Nivel exacto"
                aria-label="Filtrar por nivel"
              />
              <input
                type="number"
                min="0"
                value={valorMax}
                onChange={(e) => setValorMax(e.target.value)}
                placeholder="Valor máx"
                aria-label="Filtrar por valor máximo"
              />
            </div>
          </div>
          <div className="objetos-layout">
            <ItemList objetos={filtrados} seleccionadoId={seleccionado?.idObjeto} cargando={cargando} onSeleccionar={(objeto) => void handleSelect(objeto)} onEditar={host ? (objeto) => { setEnEdicion(objeto); setVista('formulario'); } : undefined} onEliminar={host ? (objeto) => void handleDelete(objeto) : undefined} />
            <aside className="panel-detalle panel-detalle-desktop">
              <ItemDetail
                objeto={seleccionado}
                cargando={cargandoDetalle}
                error={errorDetalle}
                nombreTienda={tiendas.find((tienda) => tienda.idTienda === seleccionado?.idTienda)?.nombre}
                onComprar={!host && seleccionado !== null && seleccionado.idTienda !== null ? () => setCompraAbierta(true) : undefined}
                deshabilitarCompra={host}
                motivoDeshabilitado="Los anfitriones no pueden comprar objetos de la tienda"
                onCerrar={seleccionado ? () => { setSeleccionado(null); setCompraAbierta(false); } : undefined}
              />
              {seleccionado && compraAbierta && (
                <PurchaseItemForm
                  objeto={seleccionado}
                  personajes={personajes}
                  inventarios={inventarios}
                  onComprar={handlePurchase}
                  onCancelar={() => setCompraAbierta(false)}
                />
              )}
            </aside>
          </div>

          {/* Modal Pop-up para mobile al cliquear cualquier objeto */}
          {seleccionado && (
            <div
              className="objeto-modal-mobile"
              role="dialog"
              aria-modal="true"
              onClick={() => { setSeleccionado(null); setCompraAbierta(false); }}
            >
              <div
                className="objeto-modal-mobile-content"
                onClick={(e) => e.stopPropagation()}
              >
                <ItemDetail
                  objeto={seleccionado}
                  cargando={cargandoDetalle}
                  error={errorDetalle}
                  nombreTienda={tiendas.find((tienda) => tienda.idTienda === seleccionado?.idTienda)?.nombre}
                  onComprar={!host && seleccionado.idTienda !== null ? () => setCompraAbierta(true) : undefined}
                  deshabilitarCompra={host}
                  motivoDeshabilitado="Los anfitriones no pueden comprar objetos de la tienda"
                  onCerrar={() => { setSeleccionado(null); setCompraAbierta(false); }}
                />
                {compraAbierta && (
                  <PurchaseItemForm
                    objeto={seleccionado}
                    personajes={personajes}
                    inventarios={inventarios}
                    onComprar={async (d) => {
                      await handlePurchase(d);
                      setSeleccionado(null);
                    }}
                    onCancelar={() => setCompraAbierta(false)}
                  />
                )}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export const ObjetosPage = ItemsPage;
export default ItemsPage;
