import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Tienda } from '../../interfaces';
import {
  actualizarObjeto,
  crearObjeto,
  eliminarObjeto,
  obtenerObjetoPorId,
  obtenerObjetos,
  type CrearObjetoData,
  type ObjetoPublico,
} from '../../services/objeto.service';
import { obtenerTiendas } from '../../services/tienda.service';
import ObjetoDetalle from './ObjetoDetalle';
import ObjetoFormulario from './ObjetoFormulario';
import ObjetoLista from './ObjetoLista';
import './objetos.css';

type Vista = 'listado' | 'formulario';

function mensajeDeError(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado';
}

export default function ObjetosPage() {
  const [objetos, setObjetos] = useState<ObjetoPublico[]>([]);
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
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

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [objetosObtenidos, tiendasObtenidas] = await Promise.all([obtenerObjetos(), obtenerTiendas()]);
      setObjetos(objetosObtenidos);
      setTiendas(tiendasObtenidas);
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  const tipos = useMemo(
    () => [...new Set(objetos.map((objeto) => objeto.tipoObjeto))].sort(),
    [objetos],
  );

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase();
    return objetos.filter((objeto) => {
      const coincideTexto = !texto || objeto.nombre.toLocaleLowerCase().includes(texto) || objeto.descripcion.toLocaleLowerCase().includes(texto);
      return coincideTexto && (!tipo || objeto.tipoObjeto === tipo);
    });
  }, [busqueda, objetos, tipo]);

  async function seleccionar(objeto: ObjetoPublico): Promise<void> {
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

  return (
    <section>
      <header className="seccion-header">
        <div>
          <p className="app-eyebrow">Inventario y tiendas</p>
          <h1>Administración de objetos</h1>
        </div>
        {vista === 'listado' && <button className="btn-nuevo" type="button" onClick={() => { setEnEdicion(undefined); setVista('formulario'); }}>Nuevo objeto</button>}
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
            <input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre o descripción" />
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Todos los tipos</option>
              {tipos.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div className="objetos-layout">
            <ObjetoLista objetos={filtrados} seleccionadoId={seleccionado?.idObjeto} cargando={cargando} onSeleccionar={(objeto) => void seleccionar(objeto)} onEditar={(objeto) => { setEnEdicion(objeto); setVista('formulario'); }} onEliminar={(objeto) => void borrar(objeto)} />
            <aside className="panel-detalle">
              <ObjetoDetalle objeto={seleccionado} cargando={cargandoDetalle} error={errorDetalle} nombreTienda={tiendas.find((tienda) => tienda.idTienda === seleccionado?.idTienda)?.nombre} />
            </aside>
          </div>
        </>
      )}
    </section>
  );
}
