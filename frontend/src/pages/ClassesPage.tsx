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
import ClassDetail from '../components/clases/ClassDetail';
import ClassForm from '../components/clases/ClassForm';
import ClassList from '../components/clases/ClassList';
import {
  updateClass,
  createClass,
  deleteClass,
  getClasses,
  type UpdateClassData,
  type CreateClassData,
} from '../services/class.service';
import './UsersPage.css';

type ViewMode = 'listado' | 'formulario';

function getErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Error inesperado';
}

export function ClassesPage() {
  const { usuarioLogueado, rolDe } = useUser();
  const esAnfitrion = usuarioLogueado ? rolDe(usuarioLogueado.idUsuario) === 'anfitrion' : false;

  const [clases, setClases] = useState<Clase[]>([]);
  const [seleccionada, setSeleccionada] = useState<Clase | null>(null);
  const [enEdicion, setEnEdicion] = useState<Clase | null>(null);
  const [vista, setVista] = useState<ViewMode>('listado');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let activo = true;
    getClasses()
      .then((data) => { if (activo) { setClases(data); } })
      .catch((e) => { if (activo) setError(getErrorMessage(e)); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [revision]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && seleccionada) {
        setSeleccionada(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [seleccionada]);

  function reload() {
    setCargando(true);
    setError(null);
    setRevision(value => value + 1);
  }

  async function handleSave(data: CreateClassData | UpdateClassData): Promise<void> {
    setGuardando(true);
    setError(null);
    setMensaje(null);
    try {
      if (enEdicion) {
        const actualizada = await updateClass(enEdicion.idClase, data as UpdateClassData);
        setClases((prev) => prev.map((c) => c.idClase === actualizada.idClase ? actualizada : c));
        setSeleccionada(actualizada);
        setMensaje('Clase actualizada correctamente.');
      } else {
        const nueva = await createClass(data as CreateClassData);
        setClases((prev) => [...prev, nueva]);
        setSeleccionada(nueva);
        setMensaje('Clase creada correctamente.');
      }
      setVista('listado');
      setEnEdicion(null);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setGuardando(false);
    }
  }

  async function handleDelete(idClase: number): Promise<void> {
    setError(null);
    setMensaje(null);
    try {
      await deleteClass(idClase);
      setClases((prev) => prev.filter((c) => c.idClase !== idClase));
      if (seleccionada?.idClase === idClase) setSeleccionada(null);
      setMensaje('Clase eliminada correctamente.');
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  const clasesFiltradas = busqueda.trim()
    ? clases.filter((c) =>
        c.nombreClase.toLocaleLowerCase().includes(busqueda.toLocaleLowerCase()) ||
        c.descripcionClase.toLocaleLowerCase().includes(busqueda.toLocaleLowerCase()),
      )
    : clases;

  const claseSeleccionada = seleccionada && clasesFiltradas.some((c) => c.idClase === seleccionada.idClase) ? seleccionada : null;

  return (
    <section style={{ padding: '0.5rem 0' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.8rem', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', margin: 0 }}>
            Catálogo del sistema
          </p>
          <h1 style={{ margin: '0.25rem 0 0' }}>Clases de Personaje</h1>
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
        <p role="status" style={{ color: 'var(--success-text)', background: 'var(--success-bg)', border: '1px solid var(--success-border)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontWeight: 500 }}>
          {mensaje}
        </p>
      )}
      {error && (
        <div role="alert" style={{ color: 'var(--error-text)', background: 'var(--error-bg)', border: '1px solid var(--error-border)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span>{error}</span>
          {vista === 'listado' && (
            <button type="button" onClick={reload} className="btn-secondary" style={{ marginLeft: '1rem' }}>
              Reintentar
            </button>
          )}
        </div>
      )}

      {vista === 'formulario' ? (
        <div style={{ maxWidth: '640px' }}>
          <ClassForm
            claseInicial={enEdicion}
            onGuardar={handleSave}
            onCancelar={() => { setEnEdicion(null); setVista('listado'); }}
          />
          {guardando && <p role="status" style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>Guardando…</p>}
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <label htmlFor="buscarClase" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Buscar:</span>
              <input
                id="buscarClase"
                type="search"
                placeholder="Nombre o descripción"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-card-secondary)', color: 'var(--text-h)', width: '260px' }}
              />
            </label>
            {busqueda && (
              <button type="button" className="btn-secondary" onClick={() => setBusqueda('')}>
                Quitar filtro
              </button>
            )}
          </div>

          {!cargando && !error && clasesFiltradas.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
              {busqueda ? 'No hay clases que coincidan con la búsqueda.' : 'No hay clases registradas en el sistema.'}
            </p>
          )}

          <ClassList
            clases={clasesFiltradas}
            claseSeleccionadaId={claseSeleccionada?.idClase}
            cargando={cargando}
            onSeleccionar={(c) => setSeleccionada(c)}
            onEditar={esAnfitrion ? (c) => { setEnEdicion(c); setVista('formulario'); } : undefined}
            onEliminar={esAnfitrion ? (id) => void handleDelete(id) : undefined}
          />

          {claseSeleccionada && (
            <div
              className="usuario-modal-overlay"
              onClick={() => setSeleccionada(null)}
              role="dialog"
              aria-modal="true"
            >
              <div
                className="usuario-modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <ClassDetail
                  clase={claseSeleccionada}
                  onVolver={() => setSeleccionada(null)}
                  onCerrar={() => setSeleccionada(null)}
                  onEditar={esAnfitrion ? (c) => { setEnEdicion(c); setVista('formulario'); setSeleccionada(null); } : undefined}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ marginTop: '1rem', width: '100%' }}
                  onClick={() => setSeleccionada(null)}
                >
                  Cerrar detalle
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export const ClasesPage = ClassesPage;
export default ClassesPage;

