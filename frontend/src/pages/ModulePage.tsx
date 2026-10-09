import { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';
import './ModulePage.css';

type Row = Record<string, unknown>;
type Resource = 'clases' | 'tiendas' | 'partidas' | 'personajes' | 'inventarios';
type Field = { key: string; label: string; type?: 'number' | 'boolean' | 'password'; ref?: string; optional?: boolean; initial?: string | number | boolean; min?: number; max?: number; createOnly?: boolean };
type Config = { title: string; keys: string[]; fields: Field[] };
const field = (key: string, label: string, options: Omit<Field, 'key' | 'label'> = {}): Field => ({ key, label, ...options });
const game = field('idPartida', 'Partida', { ref: 'partidas', createOnly: true });
const configs: Record<Resource, Config> = {
  clases: { title: 'Clases', keys: ['idClase'], fields: [field('nombreClase', 'Nombre'), field('descripcionClase', 'Descripción')] },
  tiendas: { title: 'Tiendas', keys: ['idTienda'], fields: [field('nombre', 'Nombre'), field('claseTienda', 'Tipo de tienda'), field('idClase', 'Clase sugerida', { ref: 'clases', optional: true })] },
  partidas: { title: 'Partidas', keys: ['idPartida'], fields: [field('nombre', 'Nombre'), field('estado', 'Estado', { initial: 'activa' }), field('limiteJugadores', 'Límite de jugadores', { type: 'number', min: 1, initial: 4 }), field('esPrivada', 'Privada', { type: 'boolean', initial: false }), field('contrasena', 'Contraseña (vacía: conservar al editar)', { type: 'password', optional: true })] },
  personajes: { title: 'Personajes', keys: ['idPersonaje'], fields: [field('nombreFicticio', 'Nombre'), field('raza', 'Raza'), field('idClase', 'Clase', { ref: 'clases' }), game, field('contrasenaPartida', 'Contraseña de partida privada', { type: 'password', optional: true, createOnly: true })] },
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
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [sortField, setSortField] = useState<string>('idPartida');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [revision, setRevision] = useState(0);
  const url = (r: Row) => `/${resource}/${config.keys.map(k => r[k]).join('/')}`;
  useEffect(() => {
    let active = true;
    Promise.all([api<Row[]>(`/${resource}`), ...['clases', 'partidas', 'personajes', 'tiendas'].map(r => api<Row[]>(`/${r}`))])
      .then(([list, classes, games, characters, stores]) => { if (active) { setRows(list); setRefs({ clases: classes, partidas: games, personajes: characters, tiendas: stores }); } })
      .catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [resource, revision]);
  const allowed = (r?: Row) => {
    if (resource === 'personajes') return r ? r.idUsuarioJugador === userId : true;
    if (resource === 'inventarios') return true;
    if (resource === 'partidas') return host && (!r || r.idUsuarioAnfitrion === userId);
    return host;
  };
  const startEdit = (r?: Row) => {
    setSelected(r ?? null); setValues(Object.fromEntries(config.fields.map(f => [f.key, r?.[f.key] ?? f.initial ?? (f.type === 'boolean' ? false : '')]))); setEditing(true); setError('');
  };
  const perform = async (work: () => Promise<unknown>, keepSelected = false) => {
    setBusy(true); setError('');
    try {
      await work();
      setEditing(false);
      if (keepSelected && selected) {
        try {
          const updated = await api<Row>(url(selected));
          setSelected(updated);
        } catch {
          setSelected(null);
        }
      } else {
        setSelected(null);
        setLoading(true);
      }
      setRevision(n => n + 1);
    }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo completar la operación'); }
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
    if (resource === 'personajes' && !selected) data.idUsuarioJugador = userId;
    await api(selected ? url(selected) : `/${resource}`, selected ? 'PUT' : 'POST', data);
  });
  const detail = async (r: Row) => { setError(''); try { setSelected(await api<Row>(url(r))); } catch (e) { setError((e as Error).message); } };
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    let res = rows.filter(r => {
      const matchesSearch = !term || Object.values(r).some(v => v !== null && v !== undefined && String(v).toLocaleLowerCase().includes(term));
      const matchesClass = !classFilter || String(r.idClase) === classFilter;
      const matchesActive = !activeOnly || r.estado === 'activa';
      return matchesSearch && matchesClass && matchesActive;
    });

    if (resource === 'partidas' && sortField) {
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
  }, [rows, search, classFilter, activeOnly, resource, sortField, sortDir]);
  const columns = [...new Set([...config.keys, ...config.fields.filter(f => f.type !== 'password').map(f => f.key), ...(resource === 'partidas' ? ['nicknameAnfitrion'] : []), ...(resource === 'personajes' ? ['jugadorNombre', 'xp', 'nivel', 'dinero'] : [])])];
  const display = (r: Row, key: string) => {
    const f = config.fields.find(f => f.key === key);
    const referenced = f?.ref && refs[f.ref]?.find(x => x[idKeys[f.ref!]] === r[key]);
    if (referenced) return `${r[key]} — ${label(referenced)}`;
    if (key === 'estadoSesion') return ['Planificada', 'En curso', 'Finalizada'][Number(r[key])] ?? String(r[key]);
    return typeof r[key] === 'boolean' ? (r[key] ? 'Sí' : 'No') : String(r[key] ?? '—');
  };
  return <section className="module-page">
    <h1>{config.title}</h1>
    {error && <p role="alert">{error}</p>}
    {loading && <p role="status">Cargando…</p>}
    <button className="btn-secondary" disabled={busy} onClick={() => { setError(''); setLoading(true); setRevision(n => n + 1); }}>Actualizar listado</button>
    {!editing && allowed() && <button className="btn-primary" onClick={() => startEdit()}>Crear</button>}
    {editing ? <form onSubmit={e => { e.preventDefault(); void save(); }}>
      <h2>{selected ? 'Editar' : 'Crear'} {config.title.toLowerCase()}</h2>
      {config.fields.filter(f => !selected || !f.createOnly).map(f => <label key={f.key}>{f.label}
        {f.ref ? <select required={!f.optional} value={String(values[f.key] ?? '')} onChange={e => setValues({ ...values, [f.key]: e.target.value })}>
          <option value="">Seleccionar</option>
          {(refs[f.ref] ?? []).filter(r => f.ref !== 'personajes' || r.idUsuarioJugador === userId).filter(r => f.ref !== 'partidas' || resource === 'personajes' || r.idUsuarioAnfitrion === userId).map(r => <option key={String(r[idKeys[f.ref!]])} value={String(r[idKeys[f.ref!]])}>{label(r)} (#{String(r[idKeys[f.ref!]])})</option>)}
        </select> : f.key === 'estado' ? <select value={String(values.estado)} onChange={e => setValues({ ...values, estado: e.target.value })}><option value="activa">Activa</option><option value="finalizada">Finalizada</option></select> :
        <input type={f.type === 'boolean' ? 'checkbox' : f.type ?? 'text'} required={!f.optional && f.type !== 'boolean'} min={f.min} max={f.max ?? (f.type === 'number' ? 2147483647 : undefined)} step={f.type === 'number' ? 1 : undefined} maxLength={f.type === 'password' ? 100 : undefined} checked={f.type === 'boolean' ? Boolean(values[f.key]) : undefined} value={f.type === 'boolean' ? undefined : String(values[f.key] ?? '')} onChange={e => setValues({ ...values, [f.key]: f.type === 'boolean' ? e.target.checked : e.target.value })} />}
      </label>)}
      <button className="btn-primary" disabled={busy} type="submit">Guardar</button><button className="btn-secondary" type="button" disabled={busy} onClick={() => setEditing(false)}>Cancelar</button>
    </form> : <>
      <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'center', background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontWeight: 500, fontSize: '0.95rem', color: 'var(--text-h)' }}>
          {resource === 'partidas' ? 'Buscar por Id de Partida:' : 'Buscar:'}
          <input value={search} placeholder={resource === 'partidas' ? 'Buscar por Id de Partida' : 'Filtrar por cualquier campo...'} onChange={e => setSearch(e.target.value)} style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.95rem', outline: 'none' }} />
        </label>
        {resource === 'personajes' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontWeight: 500, fontSize: '0.95rem', color: 'var(--text-h)' }}>
            Filtrar por clase:
            <select value={classFilter} onChange={e => setClassFilter(e.target.value)} style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.95rem', outline: 'none' }}>
              <option value="">Todas</option>
              {refs.clases?.map(c => <option key={String(c.idClase)} value={String(c.idClase)}>{label(c)}</option>)}
            </select>
          </label>
        )}
        {resource === 'partidas' && (
          <>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontWeight: 500, fontSize: '0.95rem', color: 'var(--text-h)' }}>
              Ordenar por:
              <select value={sortField} onChange={e => setSortField(e.target.value)} style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.95rem', outline: 'none' }}>
                <option value="idPartida">Id de Partida</option>
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
              {sortDir === 'asc' ? '▲ Asc' : '▼ Desc'}
            </button>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, cursor: 'pointer' }}>
              <input type="checkbox" checked={activeOnly} onChange={e => setActiveOnly(e.target.checked)} />
              Solo partidas activas
            </label>
          </>
        )}
        {(search || classFilter || activeOnly) && (
          <button type="button" className="btn-secondary" style={{ fontSize: '0.85rem', padding: '0.35rem 0.7rem' }} onClick={() => { setSearch(''); setClassFilter(''); setActiveOnly(false); }}>
            Limpiar filtros
          </button>
        )}
      </div>
      <div className="module-table"><table><thead><tr>{columns.map(k => <th key={k}>{config.fields.find(f => f.key === k)?.label ?? k}</th>)}<th>Acciones</th></tr></thead><tbody>{filtered.map(r => <tr key={url(r)}>{columns.map(k => { const val = display(r, k); return <td key={k} title={val.length > 25 ? val : undefined}><div className="table-cell-content truncate" style={{ maxWidth: 220 }}>{val}</div></td>; })}<td><button className="btn-secondary" style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem', marginRight: '0.5rem' }} onClick={() => void detail(r)} aria-label={`Ver detalle de ${label(r) || 'registro'}`}>Ver detalle</button>{allowed(r) && <><button className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem', marginRight: '0.5rem' }} onClick={() => startEdit(r)} aria-label={`Editar ${label(r) || 'registro'}`}>Editar</button><button className="btn-danger" style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }} disabled={busy} onClick={() => { if (window.confirm('¿Eliminar este registro?')) void perform(() => api(url(r), 'DELETE')); }} aria-label={`Eliminar ${label(r) || 'registro'}`}>Eliminar</button></>}</td></tr>)}</tbody></table></div>
      {!loading && !filtered.length && <p>No hay registros para mostrar.</p>}
      {selected && <article><h2>Detalle</h2><dl>{columns.map(k => <div key={k}><dt>{config.fields.find(f => f.key === k)?.label ?? k}</dt><dd>{display(selected, k)}</dd></div>)}</dl>
        <Workflow key={url(selected)} resource={resource} row={selected} refs={refs} busy={busy} perform={perform} />
        <button className="btn-secondary" onClick={() => setSelected(null)}>Cerrar detalle</button>
      </article>}
    </>}
  </section>;
}

function Workflow({ resource, row, refs, busy, perform }: { resource: Resource; row: Row; refs: Record<string, Row[]>; busy: boolean; perform: (f: () => Promise<unknown>, keepSelected?: boolean) => Promise<void> }) {
  const [error, setError] = useState('');
  const [object, setObject] = useState('');
  const [position, setPosition] = useState('0');
  const [store, setStore] = useState('');
  const [price, setPrice] = useState('');
  const [characterObjects, setCharacterObjects] = useState<Row[]>([]);
  const [objetoSeleccionado, setObjetoSeleccionado] = useState<Row | null>(null);
  const [modalVenta, setModalVenta] = useState<Row | null>(null);
  const [tiendaVenta, setTiendaVenta] = useState<string>('');
  const [precioVenta, setPrecioVenta] = useState<string>('');
  const [errorVenta, setErrorVenta] = useState<string>('');
  const [exitoVenta, setExitoVenta] = useState<string>('');

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

  if (resource === 'inventarios') {
    const objects = (row.objetos ?? []) as Row[];

    const totalCapacity = Number(row.cantidadEspacio);
    const occupiedPositions = new Set(objects.map(o => Number(o.posicion)));
    const freePositions: number[] = [];
    for (let p = 0; p < totalCapacity; p++) {
      if (!occupiedPositions.has(p)) freePositions.push(p);
    }
    const isFull = freePositions.length === 0;
    const selling = objects.find(o => String(o.idObjeto) === object);
    const moveOptions = characterObjects.length > 0 ? characterObjects : objects;

    return (
      <div className="inventario-modulo" style={{ marginTop: '1rem' }}>
        <h3>Mochila / Inventario #{String(row.numInventario)}</h3>
        {error && <p role="alert" style={{ color: 'var(--error-text)', background: 'var(--error-bg)', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--error-border)' }}>⚠️ {error}</p>}
        {exitoVenta && (
          <p role="status" style={{ color: 'var(--success-text)', background: 'var(--success-bg)', border: '1px solid var(--success-border)', padding: '0.65rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem', fontWeight: 600 }}>
            ✅ {exitoVenta}
          </p>
        )}
        <p style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
          Capacidad: <strong>{objects.length} / {totalCapacity} espacios ocupados</strong> ({freePositions.length} libres)
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          💡 Hacé clic en cualquier objeto de la mochila para seleccionarlo y acceder a la opción de <strong>Vender</strong>.
        </p>

        <div className="grid-posiciones" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.6rem', marginBottom: '1.25rem' }}>
          {Array.from({ length: totalCapacity }, (_, idx) => {
            const item = objects.find(o => Number(o.posicion) === idx);
            const isSelected = item && objetoSeleccionado && Number(objetoSeleccionado.idObjeto) === Number(item.idObjeto);
            return (
              <div
                key={idx}
                onClick={() => {
                  if (item) {
                    setObjetoSeleccionado(prev => (prev && Number(prev.idObjeto) === Number(item.idObjeto) ? null : item));
                    setExitoVenta('');
                  }
                }}
                style={{
                  border: item
                    ? isSelected
                      ? '2px solid var(--accent)'
                      : '1px solid var(--border)'
                    : '1px dashed var(--border)',
                  background: item
                    ? isSelected
                      ? 'var(--accent-bg)'
                      : 'var(--bg-card)'
                    : 'var(--bg-card-secondary)',
                  padding: '0.65rem 0.6rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  cursor: item ? 'pointer' : 'default',
                  boxShadow: isSelected ? '0 0 0 1px var(--accent)' : undefined,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--text-h)', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Casillero #{idx}</span>
                  {isSelected && <span style={{ color: 'var(--accent)', fontWeight: 800 }}>✓</span>}
                </div>
                {item ? (
                  <div style={{ marginTop: '0.35rem' }}>
                    <strong style={{ display: 'block', color: 'var(--text-h)', wordBreak: 'break-word', fontSize: '0.9rem' }}>{label(item)}</strong>
                    <div style={{ color: 'var(--text)', fontSize: '0.8rem', marginTop: '0.2rem' }}>💰 ${String(item.valor)} {item.esUnico ? '⭐' : ''}</div>
                    {isSelected && (
                      <button
                        type="button"
                        className="btn-primary"
                        style={{
                          marginTop: '0.5rem',
                          width: '100%',
                          fontSize: '0.775rem',
                          padding: '0.3rem 0.5rem',
                          fontWeight: 700,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalVenta(item);
                          const val = Number(item.valor);
                          setPrecioVenta(String(Math.floor(val)));
                          setTiendaVenta(refs.tiendas?.[0]?.idTienda ? String(refs.tiendas[0].idTienda) : '');
                          setErrorVenta('');
                        }}
                      >
                        🏷️ Vender
                      </button>
                    )}
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', display: 'block', marginTop: '0.25rem' }}>[ Libre ]</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal superpuesto de venta */}
        {modalVenta && (() => {
          const val = Number(modalVenta.valor ?? 0);
          const min = Math.ceil(val * 0.7);
          const max = Math.floor(val);
          const numPrecio = Number(precioVenta);
          const precioValido = !isNaN(numPrecio) && numPrecio >= min && numPrecio <= max;

          return (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-venta-titulo"
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '1rem',
              }}
              onClick={() => setModalVenta(null)}
            >
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.75rem',
                  maxWidth: '500px',
                  width: '100%',
                  boxShadow: 'var(--shadow-lg)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 id="modal-venta-titulo" style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-h)' }}>
                    Vender {label(modalVenta)}
                  </h3>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '1rem', lineHeight: 1 }}
                    onClick={() => setModalVenta(null)}
                    aria-label="Cerrar modal"
                  >
                    ✕
                  </button>
                </div>

                <p style={{ margin: '0 0 0.75rem', color: 'var(--text)', fontSize: '0.9rem' }}>
                  Valor base del objeto: <strong style={{ color: 'var(--text-h)' }}>${val}</strong>
                </p>

                {errorVenta && (
                  <p role="alert" style={{ color: 'var(--error-text)', background: 'var(--error-bg)', border: '1px solid var(--error-border)', padding: '0.65rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                    ⚠️ {errorVenta}
                  </p>
                )}

                <div style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  fontSize: '0.875rem'
                }}>
                  <p style={{ margin: '0 0 0.25rem', fontWeight: 600, color: 'var(--info-text, #38bdf8)' }}>
                    🏷️ Rango permitido: 70 % a 100 % del valor
                  </p>
                  <p style={{ margin: 0, color: 'var(--text)' }}>
                    Mínimo: <strong>${min}</strong> — Máximo: <strong>${max}</strong>
                  </p>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setErrorVenta('');
                  if (!tiendaVenta) {
                    setErrorVenta('Debés seleccionar una tienda receptora.');
                    return;
                  }
                  if (!precioValido) {
                    setErrorVenta(`El precio debe estar entre $${min} y $${max}.`);
                    return;
                  }
                  try {
                    await perform(
                      () => api(`/objetos/${modalVenta.idObjeto}/vender`, 'POST', {
                        idPersonaje: row.idPersonaje,
                        idTienda: Number(tiendaVenta),
                        precio: numPrecio,
                      }),
                      true
                    );
                    setExitoVenta(`¡Objeto "${label(modalVenta)}" vendido con éxito por $${numPrecio}!`);
                    setModalVenta(null);
                    setObjetoSeleccionado(null);
                  } catch (err) {
                    setErrorVenta(err instanceof Error ? err.message : 'Error al vender el objeto');
                  }
                }} style={{ display: 'grid', gap: '1rem' }}>
                  <label style={{ display: 'block' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-h)' }}>Tienda receptora *</span>
                    <select
                      required
                      value={tiendaVenta}
                      onChange={(e) => setTiendaVenta(e.target.value)}
                      style={{ display: 'block', width: '100%', marginTop: '0.35rem' }}
                      disabled={busy}
                    >
                      <option value="">Seleccionar tienda receptora</option>
                      {refs.tiendas?.map((t) => (
                        <option key={String(t.idTienda)} value={String(t.idTienda)}>
                          🏪 {label(t)} {t.claseTienda ? `(${t.claseTienda})` : ''}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label style={{ display: 'block' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-h)' }}>Precio de venta ($) *</span>
                    <input
                      required
                      type="number"
                      step="1"
                      min={min}
                      max={max}
                      value={precioVenta}
                      onChange={(e) => setPrecioVenta(e.target.value)}
                      style={{ display: 'block', width: '100%', marginTop: '0.35rem' }}
                      disabled={busy}
                    />
                  </label>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setModalVenta(null)}
                      disabled={busy}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={busy || !tiendaVenta || !precioValido}
                    >
                      {busy ? 'Vendiendo…' : 'Confirmar Venta'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        })()}

        {/* Mover objeto */}
        <form
          onSubmit={e => {
            e.preventDefault();
            setError('');
            const posNum = Number(position);
            if (occupiedPositions.has(posNum) && !objects.some(o => String(o.idObjeto) === object && Number(o.posicion) === posNum)) {
              setError('La posición seleccionada ya está ocupada.');
              return;
            }
            void perform(
              () => api(`/inventarios/${row.idPersonaje}/${row.numInventario}/mover`, 'POST', { idObjeto: Number(object), posicion: posNum }),
              true
            );
          }}
          style={{ background: 'var(--social-bg)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--border)' }}
        >
          <h4 style={{ marginTop: 0 }}>Mover objeto a este inventario</h4>
          {isFull && <p style={{ color: '#c53030', fontSize: '0.85rem' }}>⚠️ Capacidad insuficiente: Este inventario está lleno.</p>}
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

        {/* Vender objeto (formulario adicional por lista) */}
        <form
          onSubmit={e => {
            e.preventDefault();
            void perform(
              () => api(`/objetos/${object}/vender`, 'POST', { idPersonaje: row.idPersonaje, idTienda: Number(store), precio: Number(price) }),
              true
            );
          }}
          style={{ background: 'var(--social-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}
        >
          <h4 style={{ marginTop: 0 }}>Vender objeto de este inventario</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text)' }}>Elegí un precio entero entre el 70 % y el 100 % del valor base.</p>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Objeto a vender
            <select
              required
              value={object}
              onChange={e => { setObject(e.target.value); setPrice(''); }}
              style={{ display: 'block', width: '100%', padding: '0.4rem', marginTop: '0.2rem' }}
            >
              <option value="">Seleccionar objeto</option>
              {objects.map(o => (
                <option key={String(o.idObjeto)} value={String(o.idObjeto)}>
                  {label(o)} (Posición {String(o.posicion)}, Valor ${String(o.valor)})
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Precio de venta {selling && `(permitido: $${selling.minimo ?? Math.ceil(Number(selling.valor) * 0.7)} a $${selling.maximo ?? Math.floor(Number(selling.valor))})`}
            <input
              required
              type="number"
              step="1"
              min={Number(selling?.minimo ?? Math.ceil(Number(selling?.valor ?? 0) * 0.7))}
              max={Number(selling?.maximo ?? Math.floor(Number(selling?.valor ?? 0)))}
              value={price}
              onChange={e => setPrice(e.target.value)}
              style={{ display: 'block', width: '100%', padding: '0.4rem', marginTop: '0.2rem' }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Tienda receptora
            <select
              required
              value={store}
              onChange={e => setStore(e.target.value)}
              style={{ display: 'block', width: '100%', padding: '0.4rem', marginTop: '0.2rem' }}
            >
              <option value="">Seleccionar tienda</option>
              {refs.tiendas?.map(t => (
                <option key={String(t.idTienda)} value={String(t.idTienda)}>
                  🏪 {label(t)}
                </option>
              ))}
            </select>
          </label>
          <button className="btn-primary" disabled={busy || !selling}>Vender objeto</button>
        </form>
      </div>
    );
  }
  return null;
}
