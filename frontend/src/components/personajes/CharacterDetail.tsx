import { Link, useInRouterContext } from 'react-router-dom';
import type { Personaje, Clase } from '../../interfaces';
import { CoinIcon, UserIcon, SwordsIcon, ShieldIcon, PackageIcon } from '../ui/Icons';
import './characters.css';

export interface CharacterDetailProps {
  personaje: Personaje | null;
  clases?: Clase[];
  partidas?: Array<{ idPartida: number; nombre: string }>;
  onVolver?: () => void;
  onCerrar?: () => void;
  onEditar?: (personaje: Personaje) => void;
}
export type PersonajeDetalleProps = CharacterDetailProps;

export function CharacterDetail({
  personaje,
  clases = [],
  partidas = [],
  onVolver,
  onCerrar,
  onEditar,
}: CharacterDetailProps) {
  const inRouter = useInRouterContext();
  const volver = onVolver || onCerrar;

  if (!personaje) {
    return (
      <div className="personaje-form">
        <p>No se ha seleccionado ningún personaje.</p>
        {volver && (
          <button type="button" className="btn-secondary" onClick={volver}>
            Volver al listado
          </button>
        )}
      </div>
    );
  }

  const nombreClase = (personaje as any).claseNombre ||
    clases.find((c) => c.idClase === personaje.idClase)?.nombreClase ||
    `Clase #${personaje.idClase}`;

  const jugadorNombre = (personaje as any).jugadorNombre || `Jugador #${personaje.idUsuarioJugador}`;
  const partidaNombre = (personaje as any).partidaNombre ||
    partidas.find((pt) => pt.idPartida === personaje.idPartida)?.nombre ||
    `Partida #${personaje.idPartida}`;

  return (
    <div className="personaje-form">
      <div className="personaje-header">
        <h2>Ficha de Personaje #{personaje.idPersonaje}</h2>
        {volver && (
          <button type="button" className="btn-secondary" onClick={volver}>
            ← Volver
          </button>
        )}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <div className="personaje-top">
          <h3 style={{ fontSize: '1.5rem', color: 'var(--text-h)', margin: 0 }}>
            {personaje.nombreFicticio}
          </h3>
          <span className="personaje-badge-id">ID: #{personaje.idPersonaje}</span>
        </div>

        <div className="personaje-clase-raza" style={{ fontSize: '1.1rem', marginTop: '0.2rem' }}>
          {personaje.raza} • {nombreClase}
        </div>

        <div className="personaje-stats" style={{ margin: '1.2rem 0', padding: '1rem' }}>
          <div className="stat-item">
            <span className="stat-val" style={{ fontSize: '1.4rem' }}>{personaje.nivel}</span>
            <span className="stat-lbl">Nivel actual</span>
          </div>
          <div className="stat-item">
            <span className="stat-val" style={{ fontSize: '1.4rem' }}>{personaje.xp}</span>
            <span className="stat-lbl">Puntos XP</span>
          </div>
          <div className="stat-item">
            <span className="stat-val" style={{ fontSize: '1.4rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
              <CoinIcon size={18} style={{ color: '#f59e0b', flexShrink: 0 }} /> {personaje.dinero}
            </span>
            <span className="stat-lbl">Dinero en oro</span>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card-secondary)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <p style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <UserIcon size={16} /> <span><strong>Jugador Propietario:</strong> {jugadorNombre} (ID Usuario: #{personaje.idUsuarioJugador})</span>
          </p>
          <p style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <SwordsIcon size={16} /> <span><strong>Partida Actual:</strong> {partidaNombre} (ID Partida: #{personaje.idPartida})</span>
          </p>
          <p style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <ShieldIcon size={16} /> <span><strong>Clase de Personaje:</strong> {nombreClase} (ID Clase: #{personaje.idClase})</span>
          </p>
        </div>
      </div>

      <div className="personaje-acciones" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {inRouter ? (
          <Link
            to={`/inventory?personaje=${encodeURIComponent(personaje.nombreFicticio)}`}
            className="btn btn-emerald"
            style={{ textDecoration: 'none' }}
          >
            <PackageIcon size={16} /> Ver inventarios
          </Link>
        ) : (
          <a
            href={`/inventory?personaje=${encodeURIComponent(personaje.nombreFicticio)}`}
            className="btn btn-emerald"
            style={{ textDecoration: 'none' }}
          >
            <PackageIcon size={16} /> Ver inventarios
          </a>
        )}
        {onEditar && (
          <button type="button" className="btn-purple" onClick={() => onEditar(personaje)}>
            Editar este Personaje
          </button>
        )}
      </div>
    </div>
  );
}

export const PersonajeDetalle = CharacterDetail;
export default CharacterDetail;

