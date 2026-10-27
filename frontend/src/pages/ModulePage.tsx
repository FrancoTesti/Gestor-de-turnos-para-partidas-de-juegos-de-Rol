import { useEffect, useState, useMemo, useCallback, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';
import Loading from '../components/ui/Loading';
import { AvisoModal, TrendingUpIcon, CoinIcon, ShieldIcon } from '../components/ui';
import './ModulePage.css';
import './UsersPage.css';

type Row = Record<string, unknown>;
type Resource = 'partidas' | 'inventarios';
type Field = { key: string; label: string; type?: 'number' | 'boolean' | 'password'; ref?: string; optional?: boolean; initial?: string | number | boolean; min?: number; max?: number; createOnly?: boolean };
type Config = { title: string; keys: string[]; fields: Field[] };
const field = (key: string, label: string, options: Omit<Field, 'key' | 'label'> = {}): Field => ({ key, label, ...options });
const configs: Record<Resource, Config> = {
  partidas: { title: 'Partidas', keys: ['idPartida'], fields: [field('nombre', 'Nombre'), field('estado', 'Estado', { initial: 'activa' }), field('limiteJugadores', 'Límite de jugadores', { type: 'number', min: 1, initial: 4 }), field('esPrivada', 'Privada', { type: 'boolean', initial: false }), field('contrasena', 'Contraseña (vacía: conservar al editar)', { type: 'password', optional: true })] },
  inventarios: { title: 'Inventarios', keys: ['idPersonaje', 'numInventario'], fields: [field('idPersonaje', 'Personaje', { ref: 'personajes', createOnly: true }), field('numInventario', 'Número de inventario', { type: 'number', min: 1, createOnly: true }), field('cantidadEspacio', 'Capacidad', { type: 'number', min: 1, max: 1000, initial: 10 })] },
};
const idKeys: Record<string, string> = { clases: 'idClase', partidas: 'idPartida', personajes: 'idPersonaje', tiendas: 'idTienda' };
const label = (r: Row) => String(r.nombre ?? r.nombreClase ?? r.nombreFicticio ?? r.nickname ?? '');

export default function ModulePage({ resource }: { resource: Resource }) {
  const config = configs[resource];
  const { usuarioLogueado, rolDe } = useUser();
  const userId = usuarioLogueado!.idUsuario;
  const host = rolDe(userId) === 'anfitrion';
  const [rows, setRows] = useState<Row[]>([]);
  const [refs, setRefs] = useState<Record<string, Row[]>>({});
  const [selected, setSelected] = useState<Row | null>(null);
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<Row>({});
  const [error, setError] = useState('');
  const [errorAvisoModal, setErrorAvisoModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('personaje') || params.get('search') || '';
    }
    return '';
  });

  useEffect(() => {
    const syncFromUrl = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('personaje') || params.get('search');
        if (q !== null) {
          setSearch(q);
        }
      }
    };
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, [resource]);
  const [activeOnly, setActiveOnly] = useState(false);
  const [sortField, setSortField] = useState<string>('idPartida');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [soloMisPartidas, setSoloMisPartidas] = useState(false);
  const [revision, setRevision] = useState(0);

  const estaInscripto = useCallback((r: Row) => {
    const idPartida = Number(r.idPartida);
    const tienePersonaje = (refs.personajes ?? []).some(p => Number(p.idPartida) === idPartida && Number(p.idUsuarioJugador) === userId);
    const esHost = Number(r.idUsuarioAnfitrion) === userId;
    return Boolean(tienePersonaje || esHost);
  }, [refs.personajes, userId]);

  const url = (r: Row) => `/${resource}/${config.keys.map(k => r[k]).join('/')}`;
  useEffect(() => {
    let active = true;
    Promise.all([api<Row[]>(`/${resource}`), ...['clases', 'partidas', 'personajes', 'tiendas'].map(r => api<Row[]>(`/${r}`))])
      .then(([list, classes, games, characters, stores]) => { if (active) { setRows(list); setRefs({ clases: classes, partidas: games, personajes: characters, tiendas: stores }); } })
      .catch(e => { if (active) { const msg = e.message; setError(msg); setErrorAvisoModal(msg); } }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [resource, revision]);
  const allowed = (r?: Row) => {
    if (resource === 'inventarios') return true;
    return host && (!r || r.idUsuarioAnfitrion === userId);
  };
  const startEdit = (r?: Row) => {
    setSelected(r ?? null); setValues(Object.fromEntries(config.fields.map(f => [f.key, r?.[f.key] ?? f.initial ?? (f.type === 'boolean' ? false : '')]))); setEditing(true); setError('');
  };
  const perform = async (work: () => Promise<unknown>) => {
    setBusy(true); setError('');
    try {
      await work();
      setEditing(false);
      if (resource === 'inventarios' && selected) {
        try {
          const updated = await api<Row>(url(selected));
          setSelected(updated);
        } catch {
          setSelected(null);
        }
      } else {
        setSelected(null);
      }
      setRevision(n => n + 1);
    }
    catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo completar la operación';
      setError(msg);
      setErrorAvisoModal(msg);
    }
    finally { setBusy(false); }
  };
  const save = () => perform(async () => {
    const data: Row = {};
    for (const f of config.fields) {
      if (selected && f.createOnly) continue;
      const value = values[f.key];
      if (f.optional && (value === '' || value === undefined)) { if (f.ref) data[f.key] = null; continue; }
      data[f.key] = f.type === 'number' || f.ref ? Number(value) : value;
    }
    if (resource === 'partidas' && !selected) data.idUsuarioAnfitrion = userId;
    if (resource === 'partidas' && !data.esPrivada) delete data.contrasena;
    await api(selected ? url(selected) : `/${resource}`, selected ? 'PUT' : 'POST', data);
  });
  const detail = async (r: Row) => {
    setError('');
    try { setSelected(await api<Row>(url(r))); }
    catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      setErrorAvisoModal(msg);
    }
  };
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    let res = rows.filter(r => {
      let matchesSearch = true;
      if (term) {
        if (resource === 'partidas') {
          const cleanIdTerm = term.replace(/^(#|id\s*|partida\s*)/i, '').trim();
          if (/^\d+$/.test(cleanIdTerm)) {
            matchesSearch = String(r.idPartida) === cleanIdTerm || String(r.idPartida).startsWith(cleanIdTerm);
          } else {
            const nombre = String(r.nombre ?? '').toLowerCase();
            const anfitrion = String(r.nicknameAnfitrion ?? '').toLowerCase();
            matchesSearch = nombre.includes(term) || anfitrion.includes(term) || String(r.idPartida).includes(term);
          }
        } else {
          const cleanIdTerm = term.replace(/^#/, '').trim();
          const p = refs.personajes?.find(x => x.idPersonaje === r.idPersonaje);
          const pName = p ? label(p).toLowerCase() : '';
          const matchesId = String(r.idPersonaje) === cleanIdTerm || String(r.idPersonaje).includes(cleanIdTerm);
          const matchesName = pName.includes(term);
          const matchesOther = Object.values(r).some(v => v !== null && v !== undefined && String(v).toLocaleLowerCase().includes(term));
          matchesSearch = matchesId || matchesName || matchesOther;
        }
      }
      const matchesActive = !activeOnly || r.estado === 'activa';
      const matchesMisPartidas = !soloMisPartidas || resource !== 'partidas' || estaInscripto(r);
      return matchesSearch && matchesActive && matchesMisPartidas;
    });

    if (resource === 'partidas' && sortField === 'inscripto') {
      res = [...res].sort((a, b) => {
        const valA = estaInscripto(a) ? 1 : 0;
        const valB = estaInscripto(b) ? 1 : 0;
        return sortDir === 'asc' ? valB - valA : valA - valB;
      });
    } else if (resource === 'partidas' && sortField) {
      res = [...res].sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDir === 'asc' ? valA - valB : valB - valA;
        }
        valA = String(valA ?? '').toLowerCase();
        valB = String(valB ?? '').toLowerCase();
        if (valA === valB) return 0;
        const comp = valA > valB ? 1 : -1;
        return sortDir === 'asc' ? comp : -comp;
      });
    }

    return res;
  }, [rows, refs.personajes, search, activeOnly, soloMisPartidas, resource, sortField, sortDir, estaInscripto]);
  const columns = resource === 'inventarios'
    ? ['idPersonaje', 'personajeNombre', 'numInventario', 'cantidadEspacio']
    : [...new Set([...config.keys, ...config.fields.filter(f => f.type !== 'password').map(f => f.key), 'nicknameAnfitrion'])];
  const columnLabel = (key: string): string => {
    if (key === 'nicknameAnfitrion') return 'Nickname Anfitrión';
    if (key === 'idPartida') return 'Id de Partida';
    if (key === 'idPersonaje') return 'Id Personaje';
    if (key === 'personajeNombre') return 'Personaje';
    if (key === 'numInventario') return 'Núm. Inventario';
    return config.fields.find(f => f.key === key)?.label ?? key;
  };
  const display = (r: Row, key: string) => {
    if (resource === 'inventarios') {
      if (key === 'idPersonaje') return `#${r.idPersonaje}`;
      if (key === 'personajeNombre') {
        const pj = refs.personajes?.find(x => x.idPersonaje === r.idPersonaje);
        return pj ? label(pj) : '—';
      }
    }
    const f = config.fields.find(f => f.key === key);
    const referenced = f?.ref && refs[f.ref]?.find(x => x[idKeys[f.ref!]] === r[key]);
    if (referenced) return `${r[key]} — ${label(referenced)}`;
    if (key === 'estado') {
      const val = String(r[key] ?? '').toLowerCase();
      if (val === 'activa') return 'Activa';
      if (val === 'finalizada') return 'Finalizada';
      return val ? val.charAt(0).toUpperCase() + val.slice(1) : '—';
    }
    return typeof r[key] === 'boolean' ? (r[key] ? 'Sí' : 'No') : String(r[key] ?? '—');
  };
  return <section className="module-page">
    <h1>{config.title}</h1>
    {error && <p role="alert">{error}</p>}
    {loading ? (
      <Loading message={`Cargando ${config.title.toLowerCase()}...`} />
    ) : (
      <>
        <button className="btn-secondary" disabled={busy} onClick={() => { setError(''); setLoading(true); setRevision(n => n + 1); }}>Actualizar listado</button>
        {!editing && allowed() && <button className="btn-primary" onClick={() => startEdit()}>Crear</button>}
    {editing ? <form onSubmit={e => { e.preventDefault(); void save(); }}>
      <h2>{selected ? 'Editar' : 'Crear'} {config.title.toLowerCase()}</h2>
      {config.fields.filter(f => !selected || !f.createOnly).map(f => <label key={f.key}>{f.label}
        {f.ref ? <select required={!f.optional} value={String(values[f.key] ?? '')} onChange={e => setValues({ ...values, [f.key]: e.target.value })}>
          <option value="">Seleccionar</option>
          {(refs[f.ref] ?? []).filter(r => f.ref !== 'personajes' || r.idUsuarioJugador === userId).filter(r => f.ref !== 'partidas' || r.idUsuarioAnfitrion === userId).map(r => <option key={String(r[idKeys[f.ref!]])} value={String(r[idKeys[f.ref!]])}>{label(r)} (#{String(r[idKeys[f.ref!]])})</option>)}
        </select> : f.key === 'estado' ? <select value={String(values.estado)} onChange={e => setValues({ ...values, estado: e.target.value })}><option value="activa">Activa</option><option value="finalizada">Finalizada</option></select> :
        <input type={f.type === 'boolean' ? 'checkbox' : f.type ?? 'text'} required={!f.optional && f.type !== 'boolean'} min={f.min} max={f.max ?? (f.type === 'number' ? 2147483647 : undefined)} step={f.type === 'number' ? 1 : undefined} maxLength={f.type === 'password' ? 100 : undefined} checked={f.type === 'boolean' ? Boolean(values[f.key]) : undefined} value={f.type === 'boolean' ? undefined : String(values[f.key] ?? '')} onChange={e => setValues({ ...values, [f.key]: f.type === 'boolean' ? e.target.checked : e.target.value })} />}
      </label>)}
      <button className="btn-primary" disabled={busy} type="submit">Guardar</button><button className="btn-secondary" type="button" disabled={busy} onClick={() => setEditing(false)}>Cancelar</button>
    </form> : <>
      <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'center', background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <label htmlFor="modulo-buscar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontWeight: 500, fontSize: '0.95rem', color: 'var(--text-h)', flex: '1 1 auto', flexWrap: 'wrap', maxWidth: '100%' }}>
          {resource === 'partidas' ? 'Buscar por Id de Partida:' : 'Buscar:'}
          <input
            id="modulo-buscar"
            value={search}
            placeholder={resource === 'partidas' ? 'Buscar por Id de Partida' : 'Filtrar por cualquier campo...'}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.95rem', outline: 'none', width: '100%', maxWidth: '24rem', boxSizing: 'border-box' }}
          />
        </label>
        {resource === 'partidas' && (
          <>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontWeight: 500, fontSize: '0.95rem', color: 'var(--text-h)' }}>
              Ordenar por:
              <select value={sortField} onChange={e => setSortField(e.target.value)} style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.95rem', outline: 'none' }}>
                <option value="idPartida">Id de Partida</option>
                <option value="inscripto">Partidas en las que estoy inscripto</option>
                <option value="nombre">Nombre</option>
                <option value="limiteJugadores">Límite de Jugadores</option>
                <option value="estado">Estado</option>
              </select>
            </label>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
              onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              title="Alternar dirección de orden"
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <TrendingUpIcon size={14} style={{ transform: sortDir === 'desc' ? 'scaleY(-1)' : undefined }} />
                {sortDir === 'asc' ? 'Asc' : 'Desc'}
              </span>
            </button>
            <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={!soloMisPartidas ? "btn-primary" : "btn-secondary"}
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
                onClick={() => setSoloMisPartidas(false)}
              >
                Ver todas las partidas
              </button>
              <button
                type="button"
                className={soloMisPartidas ? "btn-primary" : "btn-secondary"}
                style={{
                  fontSize: '0.85rem',
                  padding: '0.4rem 0.75rem',
                  ...(soloMisPartidas ? {} : { borderColor: 'var(--accent)', color: 'var(--accent-text)' }),
                }}
                onClick={() => setSoloMisPartidas(true)}
              >
                Mis partidas (inscripto/dirigiendo)
              </button>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, cursor: 'pointer' }}>
              <input type="checkbox" checked={activeOnly} onChange={e => setActiveOnly(e.target.checked)} />
              Solo partidas activas
            </label>
          </>
        )}
        {(search || activeOnly || soloMisPartidas) && (
          <button type="button" className="btn-secondary" style={{ fontSize: '0.85rem', padding: '0.35rem 0.7rem' }} onClick={() => { setSearch(''); setActiveOnly(false); setSoloMisPartidas(false); }}>
            Limpiar filtros
          </button>
        )}
      </div>
      <div className="module-table">
        <table>
          <thead>
            <tr>
              {columns.map((k, idx) => {
                let thAlign: 'left' | 'center' | 'right' | undefined = undefined;
                if (resource === 'inventarios') {
                  thAlign = idx === 0 ? 'left' : 'center';
                } else if (resource === 'partidas') {
                  thAlign = 'center';
                }
                return (
                  <th
                    key={k}
                    style={thAlign ? { textAlign: thAlign } : undefined}
                  >
                    {columnLabel(k)}
                  </th>
                );
              })}
              <th
                style={
                  resource === 'inventarios'
                    ? { textAlign: 'right' }
                    : resource === 'partidas'
                    ? { textAlign: 'center' }
                    : undefined
                }
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={url(r)}>
                {columns.map((k, idx) => {
                  const val = display(r, k);
                  let align: 'left' | 'center' | 'right' | undefined = undefined;
                  if (resource === 'inventarios') {
                    align = idx === 0 ? 'left' : 'center';
                  } else if (resource === 'partidas') {
                    align = 'center';
                  }

                  let cellContent: ReactNode = val;
                  if (resource === 'inventarios' && k === 'personajeNombre') {
                    cellContent = (
                      <strong style={{ fontWeight: 700, color: 'var(--text-h)' }}>
                        {val}
                      </strong>
                    );
                  } else if (resource === 'partidas' && k === 'nombre') {
                    cellContent = (
                      <strong style={{ fontWeight: 700, color: 'var(--text-h)' }}>
                        {val}
                      </strong>
                    );
                  } else if (resource === 'partidas' && k === 'estado') {
                    const valLower = String(val).toLowerCase();
                    const esActiva = valLower.includes('activa') || valLower.includes('activo');
                    const esFinalizada = valLower.includes('finalizada') || valLower.includes('finalizado');
                    const colorEstado = esActiva
                      ? 'var(--success-text, #10b981)'
                      : esFinalizada
                      ? 'var(--danger-text, #ef4444)'
                      : 'inherit';
                    cellContent = (
                      <strong style={{ fontWeight: 700, color: colorEstado }}>
                        {val}
                      </strong>
                    );
                  }

                  return (
                    <td
                      key={k}
                      title={val.length > 25 ? val : undefined}
                      style={align ? { textAlign: align } : undefined}
                    >
                      <div
                        className="table-cell-content truncate"
                        style={{
                          maxWidth: 220,
                          textAlign: align,
                          margin: align === 'center' ? '0 auto' : undefined,
                        }}
                      >
                        {cellContent}
                      </div>
                    </td>
                  );
                })}
                <td
                  style={
                    resource === 'inventarios'
                      ? { textAlign: 'right' }
                      : resource === 'partidas'
                      ? { textAlign: 'center' }
                      : undefined
                  }
                >
                  <div
                    style={
                      resource === 'inventarios'
                        ? { display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }
                        : resource === 'partidas'
                        ? { display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }
                        : undefined
                    }
                  >
                    <button
                      className="btn-secondary"
                      style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem', marginRight: resource === 'inventarios' || resource === 'partidas' ? undefined : '0.5rem' }}
                      onClick={() => void detail(r)}
                      aria-label={`Ver detalle de ${label(r) || 'registro'}`}
                    >
                      Ver detalle
                    </button>
                    {allowed(r) && (
                      <>
                        <button
                          className="btn-primary"
                          style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem', marginRight: resource === 'inventarios' || resource === 'partidas' ? undefined : '0.5rem' }}
                          onClick={() => startEdit(r)}
                          aria-label={`Editar ${label(r) || 'registro'}`}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-danger"
                          style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
                          disabled={busy}
                          onClick={() => {
                            if (window.confirm('¿Eliminar este registro?')) void perform(() => api(url(r), 'DELETE'));
                          }}
                          aria-label={`Eliminar ${label(r) || 'registro'}`}
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!loading && !filtered.length && <p>No hay registros para mostrar.</p>}
      {selected && (
        <article className={resource === 'inventarios' ? 'inventario-detalle-article' : undefined}>
          <h2>Detalle</h2>
          {resource === 'inventarios' ? (
            <dl className="inventario-info-grid">
              {columns.map(k => (
                <div key={k} className="inventario-info-card">
                  <dt className="inventario-info-label">{columnLabel(k)}</dt>
                  <dd className="inventario-info-value">{display(selected, k)}</dd>
                </div>
              ))}
              {(() => {
                const personaje = refs.personajes?.find(p => Number(p.idPersonaje) === Number(selected.idPersonaje));
                const clase = refs.clases?.find(c => Number(c.idClase) === Number(personaje?.idClase));
                const nombreClase = String(clase?.nombreClase || personaje?.clase || 'Sin clase');
                return (
                  <>
                    <div className="inventario-info-card">
                      <dt className="inventario-info-label">Dinero del personaje</dt>
                      <dd className="inventario-info-value" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success-text, #10b981)', fontWeight: 700 }}>
                        <CoinIcon size={14} /> ${String(personaje?.dinero ?? 0)}
                      </dd>
                    </div>
                    <div className="inventario-info-card">
                      <dt className="inventario-info-label">Clase del personaje</dt>
                      <dd className="inventario-info-value" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                        <ShieldIcon size={14} /> {nombreClase}
                      </dd>
                    </div>
                  </>
                );
              })()}
            </dl>
          ) : (
            <dl>{columns.map(k => <div key={k}><dt>{columnLabel(k)}</dt><dd>{display(selected, k)}</dd></div>)}</dl>
          )}
        {resource === 'partidas' && (
          <div style={{ display: 'flex', gap: '0.75rem', margin: '1rem 0', flexWrap: 'wrap' }}>
            <Link to={`/missions?partida=${String(selected.idPartida)}`} className="btn-secondary" style={{ textDecoration: 'none' }}>
              Ver misiones de esta partida
            </Link>
            <Link to={`/stores?partida=${String(selected.idPartida)}`} className="btn-secondary" style={{ textDecoration: 'none' }}>
              Ver tiendas de esta partida
            </Link>
          </div>
        )}
        <Workflow key={url(selected)} resource={resource} row={selected} refs={refs} busy={busy} perform={perform} onNotifyError={(msg) => setErrorAvisoModal(msg)} />
        <button className="btn-secondary" onClick={() => setSelected(null)}>Cerrar detalle</button>
      </article>
      )}
    </>}
    </>
  )}
  <AvisoModal mensaje={errorAvisoModal} onClose={() => setErrorAvisoModal(null)} />
  </section>;
}

function Workflow({ resource, row, refs, busy, perform, onNotifyError }: { resource: Resource; row: Row; refs: Record<string, Row[]>; busy: boolean; perform: (f: () => Promise<unknown>) => Promise<void>; onNotifyError?: (msg: string) => void }) {
  const [error, setError] = useState('');
  const [mensajeVenta, setMensajeVenta] = useState<string | null>(null);
  const [object, setObject] = useState('');
  const [position, setPosition] = useState('0');
  const [characterObjects, setCharacterObjects] = useState<Row[]>([]);
  const [objetoVenta, setObjetoVenta] = useState<Row | null>(null);
  const [precioReventa, setPrecioReventa] = useState<number>(0);
  const [tiendaVenta, setTiendaVenta] = useState<string>('');
  const [preciosReventa, setPreciosReventa] = useState<Record<string | number, number>>(() => {
    try {
      const guardados = sessionStorage.getItem('precios_reventa_inventario');
      return guardados ? JSON.parse(guardados) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    let active = true;
    if (resource === 'inventarios' && row.idPersonaje) {
      api<Row[]>('/objetos')
        .then(list => {
          if (active) setCharacterObjects(list.filter(o => Number(o.idPersonaje) === Number(row.idPersonaje)));
        })
        .catch(() => {});
    }
    return () => { active = false; };
  }, [resource, row.idPersonaje, row]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && objetoVenta) {
        setObjetoVenta(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [objetoVenta]);

  const abrirVentaObjeto = (item: Row) => {
    const id = String(item.idObjeto);
    let finalPrice = preciosReventa[id];

    // Si aún no se generó para este objeto, se calcula una única vez
    if (typeof finalPrice !== 'number') {
      const valorBase = Number(item.valor) || 0;
      // Generar una única vez entre 70% y 80% (conforme a las reglas de cátedra 70%-100%)
      const factor = 0.7 + Math.random() * 0.1;
      const minVenta = Math.ceil(valorBase * 0.7);
      const maxVenta = Math.floor(valorBase * 1.0);
      const calculado = Math.round(valorBase * factor);
      finalPrice = Math.max(minVenta, Math.min(maxVenta, calculado));

      setPreciosReventa(prev => {
        const updated = { ...prev, [id]: finalPrice };
        try {
          sessionStorage.setItem('precios_reventa_inventario', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }

    setObjetoVenta(item);
    setPrecioReventa(finalPrice);
    const defaultStore = refs.tiendas && refs.tiendas.length > 0 ? String(refs.tiendas[0].idTienda) : '';
    setTiendaVenta(defaultStore);
  };

  if (resource === 'inventarios') {
    const objects = (row.objetos ?? []) as Row[];

    const totalCapacity = Number(row.cantidadEspacio);
    const occupiedPositions = new Set(objects.map(o => Number(o.posicion)));
    const freePositions: number[] = [];
    for (let p = 0; p < totalCapacity; p++) {
      if (!occupiedPositions.has(p)) freePositions.push(p);
    }
    const isFull = freePositions.length === 0;
    const moveOptions = (characterObjects.length > 0 ? characterObjects : objects)
      .slice()
      .sort((a, b) => String(a.nombre || label(a) || '').localeCompare(String(b.nombre || label(b) || ''), undefined, { sensitivity: 'base' }));

    return (
      <div className="inventario-modulo" style={{ marginTop: '1rem' }}>
        <h3>Mochila / Inventario #{String(row.numInventario)}</h3>
        {mensajeVenta && (
          <p className="mensaje mensaje-exito" role="status" style={{ margin: '0.75rem 0' }}>
            {mensajeVenta}
          </p>
        )}
        {error && <p role="alert">{error}</p>}
        <p style={{ fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.35rem' }}>
          Capacidad: <strong>{objects.length} / {totalCapacity} espacios ocupados</strong> ({freePositions.length} libres)
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
          💡 Hacé clic en cualquier objeto de la mochila para ver sus características y venderlo a una tienda.
        </p>

        <div className="grid-posiciones" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '0.65rem', marginBottom: '1.25rem' }}>
          {Array.from({ length: totalCapacity }, (_, idx) => {
            const item = objects.find(o => Number(o.posicion) === idx);
            return (
              <div
                key={idx}
                className={item ? 'casillero-ocupado' : undefined}
                onClick={() => {
                  if (item) {
                    abrirVentaObjeto(item);
                  }
                }}
                style={{
                  border: item ? '1px solid var(--border)' : '1px dashed var(--border)',
                  background: item ? 'var(--bg-card)' : 'var(--bg-card-secondary)',
                  padding: '0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  cursor: item ? 'pointer' : 'default',
                  transition: 'all 0.15s ease',
                  ...(item ? { boxShadow: '0 2px 8px rgba(0,0,0,0.12)' } : {}),
                }}
                title={item ? `Clic para ver detalle y vender ${label(item)}` : `Casillero #${idx} libre`}
              >
                <div style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: '0.75rem' }}>
                  <span>Casillero #{idx}</span>
                </div>
                {item ? (
                  <div style={{ marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <strong style={{ display: 'block', color: 'var(--text-h)', fontSize: '0.9rem' }}>{label(item)}</strong>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
                      <div style={{ color: 'var(--accent-text)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <CoinIcon size={12} /> ${String(item.valor)} {item.esUnico ? '(Único)' : ''}
                      </div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: 'var(--accent-text)',
                          background: 'var(--accent-bg)',
                          border: '1px solid var(--accent)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.15rem',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                        }}
                      >
                        Vender ↗
                      </span>
                    </div>
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', display: 'inline-block', marginTop: '0.25rem' }}>[ Libre ]</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Mover objeto */}
        <form
          onSubmit={e => {
            e.preventDefault();
            setError('');
            const posNum = Number(position);
            if (occupiedPositions.has(posNum) && !objects.some(o => String(o.idObjeto) === object && Number(o.posicion) === posNum)) {
              const msg = 'La posición seleccionada ya está ocupada.';
              setError(msg);
              onNotifyError?.(msg);
              return;
            }
            void perform(async () => {
              await api(`/inventarios/${row.idPersonaje}/${row.numInventario}/mover`, 'POST', { idObjeto: Number(object), posicion: posNum });
              setObject('');
            });
          }}
          style={{ background: 'var(--social-bg)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--border)' }}
        >
          <h4 style={{ marginTop: 0 }}>Mover objeto en este inventario</h4>
          {isFull && <p style={{ color: '#c53030', fontSize: '0.85rem' }}>Capacidad insuficiente: Este inventario está lleno.</p>}
          <label htmlFor="select-objeto-mover" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Objeto del personaje
          </label>
          <select
            id="select-objeto-mover"
            required
            value={object}
            onChange={e => setObject(e.target.value)}
            style={{ display: 'block', width: '100%', padding: '0.4rem', marginTop: '0.2rem', marginBottom: '0.5rem' }}
          >
            <option value="">Seleccionar objeto...</option>
            {moveOptions.map(o => (
              <option key={String(o.idObjeto)} value={String(o.idObjeto)}>
                {label(o)} (ID: #{String(o.idObjeto)}) — Inv #{String(o.numInventario ?? 1)} Casillero #{String(o.posicion)}
              </option>
            ))}
          </select>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Posición destino (0 a {totalCapacity - 1})
            <select
              required
              value={position}
              onChange={e => setPosition(e.target.value)}
              style={{ display: 'block', width: '100%', padding: '0.4rem', marginTop: '0.2rem' }}
            >
              <option value="">Seleccionar posición disponible</option>
              {freePositions.map(p => (
                <option key={p} value={p}>Casillero #{p} [ Libre ]</option>
              ))}
              {Array.from({ length: totalCapacity }, (_, idx) => idx).filter(idx => occupiedPositions.has(idx)).map(p => (
                <option key={`occ-${p}`} value={p} disabled>Casillero #{p} [ Ocupado ]</option>
              ))}
            </select>
          </label>
          <button className="btn-primary" disabled={busy || isFull}>Mover objeto</button>
        </form>

        {/* Modal de Detalle y Venta de Objeto al cliquear */}
        {objetoVenta && (
          <div
            className="usuario-modal-overlay"
            onClick={() => setObjetoVenta(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="usuario-modal-content"
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '480px', padding: '1.5rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-h)' }}>
                  Detalle y Venta de Objeto
                </h3>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setObjetoVenta(null)}
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.85rem' }}
                >
                  ✕
                </button>
              </div>

              {/* Tarjeta con formato de catalogo > tienda */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  padding: '1rem 1.15rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-card-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                {/* Arriba de todo: Tipo de item */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--accent)',
                      fontWeight: 700,
                    }}
                  >
                    {String(objetoVenta.tipoObjeto ?? 'Objeto')}
                  </span>
                </div>

                {/* Mismo nivel: Nombre a la izquierda y Precio original a la derecha */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <strong style={{ fontSize: '1.1rem', color: 'var(--text-h)' }}>
                    {label(objetoVenta)}
                  </strong>
                  <span
                    style={{
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      fontSize: '0.95rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      flexShrink: 0,
                      textDecoration: 'line-through',
                    }}
                    title="Valor de compra original"
                  >
                    <CoinIcon size={14} /> ${String(objetoVenta.valor)}
                  </span>
                </div>

                {/* Descripción si existe */}
                {objetoVenta.descripcion ? (
                  <p style={{ margin: '0.15rem 0 0.35rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {String(objetoVenta.descripcion)}
                  </p>
                ) : null}

                {/* Abajo: ID, Nivel, Posición, Único */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginTop: '0.25rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    flexWrap: 'wrap',
                  }}
                >
                  <span>#{String(objetoVenta.idObjeto)}</span>
                  <span>•</span>
                  <span>Nivel {String(objetoVenta.nivelObjeto ?? 1)}</span>
                  <span>•</span>
                  <span>Casillero #{String(objetoVenta.posicion)}</span>
                  {objetoVenta.esUnico && (
                    <>
                      <span>•</span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          background: 'rgba(168, 85, 247, 0.2)',
                          color: 'var(--accent, #a855f7)',
                          fontWeight: 700,
                        }}
                      >
                        Único
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Valor de Reventa */}
              <div
                style={{
                  background: 'rgba(34, 197, 94, 0.12)',
                  border: '1px solid rgba(34, 197, 94, 0.35)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem 1rem',
                  margin: '1rem 0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: '0.95rem' }}>
                    Valor de reventa:
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success-text, #10b981)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CoinIcon size={16} /> ${precioReventa}
                  </span>
                </div>
                <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Calculado aleatoriamente entre 70% y 80% de su valor original ({Math.round((precioReventa / (Number(objetoVenta.valor) || 1)) * 100)}%).
                </p>
              </div>

              {/* Selector de Tienda Receptora */}
              <label style={{ display: 'block', marginBottom: '1.25rem', fontWeight: 600, color: 'var(--text-h)' }}>
                Tienda receptora
                <select
                  required
                  value={tiendaVenta}
                  onChange={e => setTiendaVenta(e.target.value)}
                  style={{ display: 'block', width: '100%', padding: '0.55rem', marginTop: '0.35rem' }}
                >
                  <option value="">Seleccionar tienda...</option>
                  {refs.tiendas?.map(t => (
                    <option key={String(t.idTienda)} value={String(t.idTienda)}>
                      {label(t)} {t.claseTienda ? `(${t.claseTienda})` : ''}
                    </option>
                  ))}
                </select>
              </label>

              {/* Botón de Vender y Cancelar */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={busy || !tiendaVenta}
                  onClick={() => {
                    if (!tiendaVenta) {
                      const msg = 'Debés seleccionar una tienda receptora.';
                      setError(msg);
                      onNotifyError?.(msg);
                      return;
                    }
                    void perform(async () => {
                      await api(`/objetos/${objetoVenta.idObjeto}/vender`, 'POST', {
                        idPersonaje: row.idPersonaje,
                        idTienda: Number(tiendaVenta),
                        precio: precioReventa,
                      });
                      setPreciosReventa(prev => {
                        const updated = { ...prev };
                        delete updated[String(objetoVenta.idObjeto)];
                        try {
                          sessionStorage.setItem('precios_reventa_inventario', JSON.stringify(updated));
                        } catch {}
                        return updated;
                      });
                      setMensajeVenta(`¡Venta realizada con éxito! Objeto vendido por $${precioReventa}.`);
                      setObjetoVenta(null);
                    });
                  }}
                  style={{ flex: 1, padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.95rem' }}
                >
                  <CoinIcon size={14} /> Vender por ${precioReventa}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setObjetoVenta(null)}
                  style={{ padding: '0.65rem 1rem' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
}
