import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';
import './ModulePage.css';

type Row = Record<string, unknown>;
type Resource = 'clases' | 'tiendas' | 'partidas' | 'personajes' | 'sesiones' | 'misiones' | 'inventarios';
type Field = { key: string; label: string; type?: 'number' | 'boolean' | 'password'; ref?: string; optional?: boolean; initial?: string | number | boolean; min?: number; max?: number; createOnly?: boolean };
type Config = { title: string; keys: string[]; fields: Field[] };
const field = (key: string, label: string, options: Omit<Field, 'key' | 'label'> = {}): Field => ({ key, label, ...options });
const game = field('idPartida', 'Partida', { ref: 'partidas', createOnly: true });
const session = field('numSesion', 'Número de sesión', { type: 'number', min: 1, createOnly: true });
const configs: Record<Resource, Config> = {
  clases: { title: 'Clases', keys: ['idClase'], fields: [field('nombreClase', 'Nombre'), field('descripcionClase', 'Descripción')] },
  tiendas: { title: 'Tiendas', keys: ['idTienda'], fields: [field('nombre', 'Nombre'), field('claseTienda', 'Tipo de tienda'), field('idClase', 'Clase sugerida', { ref: 'clases', optional: true })] },
  partidas: { title: 'Partidas', keys: ['idPartida'], fields: [field('nombre', 'Nombre'), field('estado', 'Estado', { initial: 'activa' }), field('limiteJugadores', 'Límite de jugadores', { type: 'number', min: 1, initial: 4 }), field('esPrivada', 'Privada', { type: 'boolean', initial: false }), field('contrasena', 'Contraseña (vacía: conservar al editar)', { type: 'password', optional: true })] },
  personajes: { title: 'Personajes', keys: ['idPersonaje'], fields: [field('nombreFicticio', 'Nombre'), field('raza', 'Raza'), field('idClase', 'Clase', { ref: 'clases' }), game, field('contrasenaPartida', 'Contraseña de partida privada', { type: 'password', optional: true, createOnly: true })] },
  sesiones: { title: 'Sesiones', keys: ['idPartida', 'numSesion'], fields: [game, session, field('duracionSesion', 'Duración (minutos)', { type: 'number', min: 0, initial: 60 })] },
  misiones: { title: 'Misiones', keys: ['idPartida', 'numSesion', 'numMision'], fields: [game, session, field('numMision', 'Número de misión', { type: 'number', min: 1, createOnly: true }), field('descripcion', 'Descripción'), field('dineroTotal', 'Dinero total', { type: 'number', min: 0, initial: 0 }), field('xpTotal', 'XP total', { type: 'number', min: 0, initial: 0 }), field('asistenciaGrupoGrande', 'Asistencia de grupo grande', { type: 'number', min: 0, initial: 0 })] },
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
    if (resource === 'sesiones' || resource === 'misiones') return host && (!r || refs.partidas?.some(p => p.idPartida === r.idPartida && p.idUsuarioAnfitrion === userId));
    return host;
  };
  const startEdit = (r?: Row) => {
    setSelected(r ?? null); setValues(Object.fromEntries(config.fields.map(f => [f.key, r?.[f.key] ?? f.initial ?? (f.type === 'boolean' ? false : '')]))); setEditing(true); setError('');
  };
  const perform = async (work: () => Promise<unknown>) => {
    setBusy(true); setError('');
    try { await work(); setEditing(false); setSelected(null); setLoading(true); setRevision(n => n + 1); }
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
  const filtered = rows.filter(r => Object.values(r).join(' ').toLocaleLowerCase().includes(search.toLocaleLowerCase()) && (!classFilter || String(r.idClase) === classFilter) && (!activeOnly || r.estado === 'activa'));
  const columns = [...new Set([...config.keys, ...config.fields.filter(f => f.type !== 'password').map(f => f.key), ...(resource === 'partidas' ? ['nicknameAnfitrion'] : []), ...(resource === 'personajes' ? ['jugadorNombre', 'xp', 'nivel', 'dinero'] : []), ...(resource === 'sesiones' ? ['estadoSesion', 'cantJugadores'] : []), ...(resource === 'misiones' ? ['estado'] : [])])];
  const display = (r: Row, key: string) => {
    const f = config.fields.find(f => f.key === key);
    const referenced = f?.ref && refs[f.ref]?.find(x => x[idKeys[f.ref!]] === r[key]);
    if (referenced) return `${r[key]} — ${label(referenced)}`;
    if (key === 'estadoSesion') return ['Planificada', 'En curso', 'Finalizada'][Number(r[key])] ?? String(r[key]);
    if (key === 'estado' && resource === 'misiones') return r[key] ? 'Completada' : 'Pendiente';
    return typeof r[key] === 'boolean' ? (r[key] ? 'Sí' : 'No') : String(r[key] ?? '—');
  };
  return <section className="module-page">
    <h1>{config.title}</h1>
    {error && <p role="alert">{error}</p>}
    {loading && <p role="status">Cargando…</p>}
    <button disabled={busy} onClick={() => { setError(''); setLoading(true); setRevision(n => n + 1); }}>Actualizar listado</button>
    {!editing && allowed() && <button onClick={() => startEdit()}>Crear</button>}
    {editing ? <form onSubmit={e => { e.preventDefault(); void save(); }}>
      <h2>{selected ? 'Editar' : 'Crear'} {config.title.toLowerCase()}</h2>
      {config.fields.filter(f => !selected || !f.createOnly).map(f => <label key={f.key}>{f.label}
        {f.ref ? <select required={!f.optional} value={String(values[f.key] ?? '')} onChange={e => setValues({ ...values, [f.key]: e.target.value })}>
          <option value="">Seleccionar</option>
          {(refs[f.ref] ?? []).filter(r => f.ref !== 'personajes' || r.idUsuarioJugador === userId).filter(r => f.ref !== 'partidas' || resource === 'personajes' || r.idUsuarioAnfitrion === userId).map(r => <option key={String(r[idKeys[f.ref!]])} value={String(r[idKeys[f.ref!]])}>{label(r)} (#{String(r[idKeys[f.ref!]])})</option>)}
        </select> : f.key === 'estado' ? <select value={String(values.estado)} onChange={e => setValues({ ...values, estado: e.target.value })}><option value="activa">Activa</option><option value="finalizada">Finalizada</option></select> :
        <input type={f.type === 'boolean' ? 'checkbox' : f.type ?? 'text'} required={!f.optional && f.type !== 'boolean'} min={f.min} max={f.max ?? (f.type === 'number' ? 2147483647 : undefined)} step={f.type === 'number' ? 1 : undefined} maxLength={f.type === 'password' ? 100 : undefined} checked={f.type === 'boolean' ? Boolean(values[f.key]) : undefined} value={f.type === 'boolean' ? undefined : String(values[f.key] ?? '')} onChange={e => setValues({ ...values, [f.key]: f.type === 'boolean' ? e.target.checked : e.target.value })} />}
      </label>)}
      <button disabled={busy} type="submit">Guardar</button><button type="button" disabled={busy} onClick={() => setEditing(false)}>Cancelar</button>
    </form> : <>
      <label>Buscar <input value={search} onChange={e => setSearch(e.target.value)} /></label>
      {resource === 'personajes' && <label>Filtrar por clase <select value={classFilter} onChange={e => setClassFilter(e.target.value)}><option value="">Todas</option>{refs.clases?.map(c => <option key={String(c.idClase)} value={String(c.idClase)}>{label(c)}</option>)}</select></label>}
      {resource === 'partidas' && <label><input type="checkbox" checked={activeOnly} onChange={e => setActiveOnly(e.target.checked)} />Solo partidas activas</label>}
      <div className="module-table"><table><thead><tr>{columns.map(k => <th key={k}>{config.fields.find(f => f.key === k)?.label ?? k}</th>)}<th>Acciones</th></tr></thead><tbody>{filtered.map(r => <tr key={url(r)}>{columns.map(k => <td key={k}>{display(r, k)}</td>)}<td><button onClick={() => void detail(r)}>Ver detalle</button>{allowed(r) && <><button onClick={() => startEdit(r)}>Editar</button><button disabled={busy} onClick={() => { if (window.confirm('¿Eliminar este registro?')) void perform(() => api(url(r), 'DELETE')); }}>Eliminar</button></>}</td></tr>)}</tbody></table></div>
      {!loading && !filtered.length && <p>No hay registros para mostrar.</p>}
      {selected && <article><h2>Detalle</h2><dl>{columns.map(k => <div key={k}><dt>{config.fields.find(f => f.key === k)?.label ?? k}</dt><dd>{display(selected, k)}</dd></div>)}</dl>
        <Workflow key={url(selected)} resource={resource} row={selected} refs={refs} canManage={allowed(selected)} busy={busy} perform={perform} />
        <button onClick={() => setSelected(null)}>Cerrar detalle</button>
      </article>}
    </>}
  </section>;
}

function Workflow({ resource, row, refs, canManage, busy, perform }: { resource: Resource; row: Row; refs: Record<string, Row[]>; canManage: boolean; busy: boolean; perform: (f: () => Promise<unknown>) => Promise<void> }) {
  const [participants, setParticipants] = useState<number[]>([]);
  const [rewards, setRewards] = useState<Record<number, { dinero: string; xp: string }>>({});
  const [attendees, setAttendees] = useState<Row[]>([]);
  const [error, setError] = useState('');
  const [object, setObject] = useState('');
  const [position, setPosition] = useState('0');
  const [store, setStore] = useState('');
  const [price, setPrice] = useState('');
  useEffect(() => {
    if (resource !== 'misiones') return;
    let active = true;
    api<{ participantes: Row[] }>(`/sesiones/${row.idPartida}/${row.numSesion}`).then(s => { if (active) setAttendees(s.participantes); }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [resource, row.idPartida, row.numSesion]);
  if (resource === 'sesiones') {
    const path = `/sesiones/${row.idPartida}/${row.numSesion}`;
    return <div><h3>Jugar sesión</h3>{Number(row.estadoSesion) === 0 && canManage && <form onSubmit={e => { e.preventDefault(); void perform(() => api(`${path}/jugar`, 'POST', { idPersonajes: participants })); }}>
      <fieldset><legend>Participantes</legend>{refs.personajes?.filter(p => p.idPartida === row.idPartida).map(p => <label key={String(p.idPersonaje)}><input type="checkbox" checked={participants.includes(Number(p.idPersonaje))} onChange={e => setParticipants(e.target.checked ? [...participants, Number(p.idPersonaje)] : participants.filter(id => id !== p.idPersonaje))} />{label(p)}</label>)}</fieldset><button disabled={busy || !participants.length}>Iniciar sesión</button>
    </form>}{Number(row.estadoSesion) === 1 && canManage && <button disabled={busy} onClick={() => void perform(() => api(`${path}/finalizar`, 'POST'))}>Finalizar sesión</button>}
      {Number(row.estadoSesion) === 2 && <><p>Si participaste, podés calificar al anfitrión una sola vez.</p>{[-1, 1].map(valor => <button key={valor} disabled={busy} onClick={() => void perform(() => api(`${path}/calificar`, 'POST', { valor }))}>{valor > 0 ? 'Buena experiencia (+1)' : 'Mala experiencia (-1)'}</button>)}</>}
    </div>;
  }
  if (resource === 'misiones' && canManage && !row.estado) return <form onSubmit={e => { e.preventDefault(); void perform(() => api(`/misiones/${row.idPartida}/${row.numSesion}/${row.numMision}/completar`, 'POST', { recompensas: attendees.map(p => ({ idPersonaje: p.idPersonaje, dinero: Number(rewards[Number(p.idPersonaje)]?.dinero ?? 0), xp: Number(rewards[Number(p.idPersonaje)]?.xp ?? 0) })) })); }}>
    <h3>Completar y repartir recompensas</h3><p>El anfitrión define el reparto. Las sumas deben coincidir con los totales de la misión.</p>{error && <p role="alert">{error}</p>}
    {attendees.map(p => <fieldset key={String(p.idPersonaje)}><legend>{String(p.nombre)}</legend>{(['dinero', 'xp'] as const).map(k => <label key={k}>{k}<input type="number" min="0" step="1" value={rewards[Number(p.idPersonaje)]?.[k] ?? '0'} onChange={e => setRewards({ ...rewards, [Number(p.idPersonaje)]: { dinero: '0', xp: '0', ...rewards[Number(p.idPersonaje)], [k]: e.target.value } })} /></label>)}</fieldset>)}<button disabled={busy || !attendees.length}>Completar misión</button>
  </form>;
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

    return (
      <div className="inventario-modulo" style={{ marginTop: '1rem' }}>
        <h3>Mochila / Inventario #{String(row.numInventario)}</h3>
        <p style={{ fontSize: '0.9rem', color: '#4a5568' }}>
          Capacidad: <strong>{objects.length} / {totalCapacity} espacios ocupados</strong> ({freePositions.length} libres)
        </p>

        <div className="grid-posiciones" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {Array.from({ length: totalCapacity }, (_, idx) => {
            const item = objects.find(o => Number(o.posicion) === idx);
            return (
              <div
                key={idx}
                style={{
                  border: item ? '1px solid #cbd5e0' : '1px dashed #cbd5e0',
                  background: item ? '#ffffff' : '#f7fafc',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ fontWeight: 600, color: '#718096', fontSize: '0.75rem' }}>Casillero #{idx}</div>
                {item ? (
                  <div style={{ marginTop: '0.2rem' }}>
                    <strong>{label(item)}</strong>
                    <div style={{ color: '#4a5568', fontSize: '0.8rem' }}>${String(item.valor)} {item.esUnico ? '⭐' : ''}</div>
                  </div>
                ) : (
                  <span style={{ color: '#a0aec0', fontStyle: 'italic' }}>[ Libre ]</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Mover objeto */}
        <form
          onSubmit={e => {
            e.preventDefault();
            const posNum = Number(position);
            if (occupiedPositions.has(posNum) && !objects.some(o => String(o.idObjeto) === object && Number(o.posicion) === posNum)) {
              setError('La posición seleccionada ya está ocupada.');
              return;
            }
            void perform(() => api(`/inventarios/${row.idPersonaje}/${row.numInventario}/mover`, 'POST', { idObjeto: Number(object), posicion: posNum }));
          }}
          style={{ background: '#f7fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}
        >
          <h4 style={{ marginTop: 0 }}>Mover objeto a este inventario</h4>
          {isFull && <p style={{ color: '#c53030', fontSize: '0.85rem' }}>⚠️ Capacidad insuficiente: Este inventario está lleno.</p>}
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Objeto del personaje
            <input
              type="number"
              min="1"
              required
              placeholder="ID del objeto"
              value={object}
              onChange={e => setObject(e.target.value)}
              style={{ display: 'block', width: '100%', padding: '0.4rem', marginTop: '0.2rem' }}
            />
          </label>
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

        {/* Vender objeto */}
        <form
          onSubmit={e => {
            e.preventDefault();
            void perform(() => api(`/objetos/${object}/vender`, 'POST', { idPersonaje: row.idPersonaje, idTienda: Number(store), precio: Number(price) }));
          }}
          style={{ background: '#f7fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
        >
          <h4 style={{ marginTop: 0 }}>Vender objeto de este inventario</h4>
          <p style={{ fontSize: '0.85rem', color: '#4a5568' }}>Elegí un precio entero entre el 70 % y el 100 % del valor base.</p>
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
