import { useEffect, useMemo, useState } from 'react';
import type { Personaje, Tienda, Inventario } from '../../interfaces';
import { useUser } from '../../context/UserContext';
import { api } from '../../services/api';
import {
  actualizarObjeto,
  comprarObjeto,
  crearObjeto,
  eliminarObjeto,
  obtenerObjetoPorId,
  obtenerObjetos,
  type CrearObjetoData,
  type ComprarObjetoData,
  type ObjetoPublico,
} from '../../services/objeto.service';
import { obtenerPersonajes } from '../../services/personaje.service';
import { obtenerTiendas } from '../../services/tienda.service';
import CompraObjetoFormulario from './CompraObjetoFormulario';
import ObjetoDetalle from './ObjetoDetalle';
import ObjetoFormulario from './ObjetoFormulario';
import ObjetoLista from './ObjetoLista';
import './objetos.css';

type Vista = 'listado' | 'formulario';

function mensajeDeError(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado';
}

export default function ObjetosPage() {
  const { usuarioLogueado, rolDe } = useUser();
  const userId = usuarioLogueado!.idUsuario;
  const host = rolDe(userId) === 'anfitrion';
  const [inventarios, setInventarios] = useState<Inventario[]>([]);
  const [sugerirPara, setSugerirPara] = useState('');
  const [objetos, setObjetos] = useState<ObjetoPublico[]>([]);
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [personajes, setPersonajes] = useState<Personaje[]>([]);
  const [seleccionado, setSeleccionado] = useState<ObjetoPublico | null>(null);
  const [enEdicion, setEnEdicion] = useState<ObjetoPublico | undefined>();
  const [vista, setVista] = useState<Vista>('listado');
  const [busqueda, setBusqueda] = useState('');
  const [tipo, setTipo] = useState('');
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
        obtenerObjetos(),
        obtenerTiendas(),
        obtenerPersonajes(),
        api<Inventario[]>('/inventarios'),
      ]).then(([objetosObtenidos, tiendasObtenidas, personajesObtenidos, inventariosObtenidos]) => {
      if (!active) return;
      setObjetos(objetosObtenidos);
      setError(null);
      setTiendas(tiendasObtenidas);
      setPersonajes(personajesObtenidos.filter(p => p.idUsuarioJugador === userId));
      setInventarios(inventariosObtenidos);
    }).catch(e => { if (active) setError(mensajeDeError(e)); })
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
      const coincideTexto = !texto || objeto.nombre.toLocaleLowerCase().includes(texto) || objeto.descripcion.toLocaleLowerCase().includes(texto);
      const clase = personajes.find(p => p.idPersonaje === Number(sugerirPara))?.idClase;
      const sugerido = !sugerirPara || (objeto.idTienda !== null && objeto.idPersonaje === null && tiendas.some(t => t.idTienda === objeto.idTienda && t.idClase === clase));
      return coincideTexto && (!tipo || objeto.tipoObjeto === tipo) && sugerido;
    });
  }, [busqueda, objetos, tipo, sugerirPara, personajes, tiendas]);

  async function seleccionar(objeto: ObjetoPublico): Promise<void> {
    setCompraAbierta(false);
    setCargandoDetalle(true);
    setErrorDetalle(null);
    try {
      setSeleccionado(await obtenerObjetoPorId(objeto.idObjeto));
    } catch (e) {
      setSeleccionado(null);
      setErrorDetalle(mensajeDeError(e));
    } finally {
      setCargandoDetalle(false);
    }
  }

  async function guardar(datos: CrearObjetoData): Promise<void> {
    setError(null);
    setMensaje(null);
    try {
      if (enEdicion) {
        const actualizado = await actualizarObjeto(enEdicion.idObjeto, datos);
        setObjetos((actuales) => actuales.map((objeto) => objeto.idObjeto === actualizado.idObjeto ? actualizado : objeto));
        setSeleccionado(actualizado);
        setMensaje('Objeto actualizado correctamente.');
      } else {
        const creado = await crearObjeto(datos);
        setObjetos((actuales) => [...actuales, creado]);
        setSeleccionado(creado);
        setMensaje('Objeto creado correctamente.');
      }
      setVista('listado');
      setEnEdicion(undefined);
    } catch (e) {
      setError(mensajeDeError(e));
    }
  }

  async function borrar(objeto: ObjetoPublico): Promise<void> {
    if (!window.confirm(`¿Seguro que querés eliminar "${objeto.nombre}"?`)) return;
    setError(null);
    setMensaje(null);
    try {
      await eliminarObjeto(objeto.idObjeto);
      setObjetos((actuales) => actuales.filter((actual) => actual.idObjeto !== objeto.idObjeto));
      if (seleccionado?.idObjeto === objeto.idObjeto) setSeleccionado(null);
      setMensaje('Objeto eliminado correctamente.');
    } catch (e) {
      setError(mensajeDeError(e));
    }
  }

  async function comprar(data: ComprarObjetoData): Promise<void> {
    if (!seleccionado) return;
    setError(null);
    setMensaje(null);
    try {
      const resultado = await comprarObjeto(seleccionado.idObjeto, data);
      setObjetos((actuales) =>
        actuales.map((objeto) => objeto.idObjeto === resultado.objeto.idObjeto ? resultado.objeto : objeto),
      );
      setSeleccionado(resultado.objeto);
      setPersonajes((actuales) =>
        actuales.map((personaje) => personaje.idPersonaje === resultado.idPersonaje
          ? { ...personaje, dinero: resultado.dineroRestante }
          : personaje),
      );
      setCompraAbierta(false);
      setMensaje(`Compra realizada. Dinero restante: ${resultado.dineroRestante}.`);
    } catch (e) {
      setError(mensajeDeError(e));
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
          <ObjetoFormulario objeto={enEdicion} tiendas={tiendas} onGuardar={guardar} onCancelar={() => { setEnEdicion(undefined); setVista('listado'); }} />
        </div>
      ) : (
        <>
          <div className="objeto-filtros" aria-label="Filtros de objetos">
            <label>Sugeridos por clase de mi personaje<select value={sugerirPara} onChange={e => setSugerirPara(e.target.value)}><option value="">Todos los objetos</option>{personajes.map(p => <option key={p.idPersonaje} value={p.idPersonaje}>{p.nombreFicticio}</option>)}</select></label>
            <input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre o descripción" />
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Todos los tipos</option>
              {tipos.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div className="objetos-layout">
            <ObjetoLista objetos={filtrados} seleccionadoId={seleccionado?.idObjeto} cargando={cargando} onSeleccionar={(objeto) => void seleccionar(objeto)} onEditar={host ? (objeto) => { setEnEdicion(objeto); setVista('formulario'); } : undefined} onEliminar={host ? (objeto) => void borrar(objeto) : undefined} />
            <aside className="panel-detalle">
              <ObjetoDetalle
                objeto={seleccionado}
                cargando={cargandoDetalle}
                error={errorDetalle}
                nombreTienda={tiendas.find((tienda) => tienda.idTienda === seleccionado?.idTienda)?.nombre}
                onComprar={seleccionado !== null && seleccionado.idTienda !== null ? () => setCompraAbierta(true) : undefined}
              />
              {seleccionado && compraAbierta && (
                <CompraObjetoFormulario
                  objeto={seleccionado}
                  personajes={personajes}
                  inventarios={inventarios}
                  onComprar={comprar}
                  onCancelar={() => setCompraAbierta(false)}
                />
              )}
            </aside>
          </div>
        </>
      )}
    </section>
  );
}
