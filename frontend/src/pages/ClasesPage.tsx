/**
 * ClasesPage — Módulo Alejandro Ciesco
 * Gestión completa de Clases de Personaje con CRUD integrado a la API real.
 *
 * Reglas de acceso:
 *  - Todos los usuarios logueados pueden ver las clases.
 *  - Solo anfitriones pueden crear, editar o eliminar.
 *
 * La eliminación falla si hay personajes o tiendas vinculadas (error 409 del
 * backend). El mensaje se muestra al usuario sin recargar la página.
 */
import { useEffect, useState } from 'react';
import type { Clase } from '../interfaces';
import { useUser } from '../context/UserContext';
import ClaseDetalle from '../components/clases/ClaseDetalle';
import ClaseFormulario from '../components/clases/ClaseFormulario';
import ClaseLista from '../components/clases/ClaseLista';
import {
  actualizarClase,
  crearClase,
  eliminarClase,
  obtenerClases,
  type ActualizarClaseData,
  type CrearClaseData,
} from '../services/clase.service';

type Vista = 'listado' | 'formulario';

function mensajeError(e: unknown): string {
  return e instanceof Error ? e.message : 'Error inesperado';
}

export default function ClasesPage() {
  const { usuarioLogueado, rolDe } = useUser();
  const esAnfitrion = usuarioLogueado ? rolDe(usuarioLogueado.idUsuario) === 'anfitrion' : false;

  const [clases, setClases] = useState<Clase[]>([]);
  const [seleccionada, setSeleccionada] = useState<Clase | null>(null);
  const [enEdicion, setEnEdicion] = useState<Clase | null>(null);
  const [vista, setVista] = useState<Vista>('listado');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);
    obtenerClases()
      .then((data) => { if (activo) { setClases(data); } })
      .catch((e) => { if (activo) setError(mensajeError(e)); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, []);

  function recargar() {
    setCargando(true);
    setError(null);
    obtenerClases()
      .then(setClases)
      .catch((e) => setError(mensajeError(e)))
      .finally(() => setCargando(false));
  }

  async function guardar(data: CrearClaseData | ActualizarClaseData): Promise<void> {
    setGuardando(true);
    setError(null);
    setMensaje(null);
    try {
      if (enEdicion) {
        const actualizada = await actualizarClase(enEdicion.idClase, data as ActualizarClaseData);
        setClases((prev) => prev.map((c) => c.idClase === actualizada.idClase ? actualizada : c));
        setSeleccionada(actualizada);
        setMensaje('Clase actualizada correctamente.');
      } else {
        const nueva = await crearClase(data as CrearClaseData);
        setClases((prev) => [...prev, nueva]);
        setSeleccionada(nueva);
        setMensaje('Clase creada correctamente.');
      }
      setVista('listado');
      setEnEdicion(null);
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setGuardando(false);
    }
  }

  async function borrar(idClase: number): Promise<void> {
    setError(null);
    setMensaje(null);
    try {
      await eliminarClase(idClase);
      setClases((prev) => prev.filter((c) => c.idClase !== idClase));
      if (seleccionada?.idClase === idClase) setSeleccionada(null);
      setMensaje('Clase eliminada correctamente.');
    } catch (e) {
      setError(mensajeError(e));
    }
  }

  const clasesFiltradas = busqueda.trim()
    ? clases.filter((c) =>
        c.nombreClase.toLocaleLowerCase().includes(busqueda.toLocaleLowerCase()) ||
        c.descripcionClase.toLocaleLowerCase().includes(busqueda.toLocaleLowerCase()),
      )
    : clases;

  return (
    <section style={{ padding: '1.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.8rem', color: '#718096', textTransform: 'uppercase', margin: 0 }}>
            Catálogo del sistema
          </p>
          <h1 style={{ margin: 0 }}>Clases de Personaje</h1>
        </div>
        {vista === 'listado' && esAnfitrion && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => { setEnEdicion(null); setVista('formulario'); }}
          >
            + Nueva Clase
          </button>
        )}
      </header>

      {mensaje && (
        <p role="status" style={{ color: '#276749', background: '#f0fff4', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
          ✅ {mensaje}
        </p>
      )}
      {error && (
        <div role="alert" style={{ color: '#c53030', background: '#fff5f5', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠️ {error}</span>
          {vista === 'listado' && (
            <button type="button" onClick={recargar} style={{ marginLeft: '1rem' }}>
              Reintentar
            </button>
          )}
        </div>
      )}

      {vista === 'formulario' ? (
        <div style={{ maxWidth: '600px' }}>
          <ClaseFormulario
            claseInicial={enEdicion}
            onGuardar={guardar}
            onCancelar={() => { setEnEdicion(null); setVista('listado'); }}
          />
          {guardando && <p role="status">Guardando…</p>}
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <label htmlFor="buscarClase">
              🔍 Buscar:{' '}
              <input
                id="buscarClase"
                type="search"
                placeholder="Nombre o descripción"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
              />
            </label>
            {busqueda && (
              <button type="button" onClick={() => setBusqueda('')}>
                Quitar filtro
              </button>
            )}
          </div>

          {!cargando && !error && clasesFiltradas.length === 0 && (
            <p style={{ color: '#718096', fontStyle: 'italic' }}>
              {busqueda ? 'No hay clases que coincidan con la búsqueda.' : 'No hay clases registradas en el sistema.'}
            </p>
          )}

          <ClaseLista
            clases={clasesFiltradas}
            claseSeleccionadaId={seleccionada?.idClase}
            cargando={cargando}
            onSeleccionar={(c) => setSeleccionada(c)}
            onEditar={esAnfitrion ? (c) => { setEnEdicion(c); setVista('formulario'); } : undefined}
            onEliminar={esAnfitrion ? (id) => void borrar(id) : undefined}
          />

          {seleccionada && (
            <aside style={{ marginTop: '1.5rem', padding: '1rem', background: '#f7fafc', borderRadius: '8px', maxWidth: '480px' }}>
              <ClaseDetalle clase={seleccionada} />
              <button
                type="button"
                style={{ marginTop: '0.75rem' }}
                onClick={() => setSeleccionada(null)}
              >
                Cerrar detalle
              </button>
            </aside>
          )}
        </>
      )}
    </section>
  );
}
