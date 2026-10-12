/* muestra el detalle completo de una partida seleccionada.
 Recibe todo por props, no hace fetch directamente */
import type { PartidaPublica } from '../../services/partida.service';
import Loading from '../ui/Loading';
import { CloseIcon, CrownIcon, UsersIcon, LockIcon, UnlockIcon } from '../ui';
import './partidas.css';

export interface PersonajeUnido {
  idPersonaje: number;
  nombreFicticio: string;
  raza?: string;
  nivel?: number;
  jugadorNombre?: string;
  nickname?: string;
}

export interface PartidaDetalleProps {
  partida?: PartidaPublica | null;
  personajesUnidos?: PersonajeUnido[];
  cargando?: boolean;
  error?: string | null;
  onCerrar?: () => void;
  onEditar?: (partida: PartidaPublica) => void;
  onEliminar?: (idPartida: number) => void;
}

export default function PartidaDetalle({
  partida,
  personajesUnidos = [],
  cargando = false,
  error = null,
  onCerrar,
  onEditar,
  onEliminar,
}: PartidaDetalleProps) {

  // estado: cargando
  if (cargando) {
    return (
      <div className="partida-detalle-card cargando">
        <Loading message="Cargando información de la partida..." />
      </div>
    );
  }

  // estado: error
  if (error) {
    return (
      <div className="partida-detalle-card error">
        <h3>Ocurrió un error</h3>
        <p className="error-mensaje">{error}</p>
        {onCerrar && (
          <button type="button" className="btn-secundario" onClick={onCerrar}>
            Volver
          </button>
        )}
      </div>
    );
  }

  // estado: sin seleccion
  if (!partida) {
    return (
      <div className="partida-detalle-card vacio">
        <h3>Detalle de Partida</h3>
        <p>Seleccioná una partida de la lista para ver sus datos.</p>
      </div>
    );
  }

  return (
    <div className="partida-detalle-card">
      <div className="detalle-header">
        <h2>{partida.nombre}</h2>
        {onCerrar && (
          <button
            type="button"
            className="btn-cerrar"
            onClick={onCerrar}
            title="Cerrar detalle"
            aria-label="Cerrar detalle"
          >
            <CloseIcon size={16} />
          </button>
        )}
      </div>

      <div className="detalle-body">
        <div className="detalle-info-grid">

          <div className="detalle-campo">
            <span className="campo-etiqueta">ID de partida:</span>
            <span className="campo-valor badge">#{partida.idPartida}</span>
          </div>

          {/* estado: requerido por el plan */}
          <div className="detalle-campo">
            <span className="campo-etiqueta">Estado:</span>
            <span className={`badge ${partida.estado === 'activa' ? 'badge-activa' : 'badge-finalizada'}`}>
              {partida.estado === 'activa' ? 'Activa' : 'Finalizada'}
            </span>
          </div>

          {/* privacidad: requerida por el plan */}
          <div className="detalle-campo">
            <span className="campo-etiqueta">Privacidad:</span>
            <span className={`badge ${partida.esPrivada ? 'badge-privada' : 'badge-publica'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              {partida.esPrivada ? <><LockIcon size={12} /> Privada</> : <><UnlockIcon size={12} /> Pública</>}
            </span>
          </div>

          {/* anfitrion: requerido por el plan */}
          <div className="detalle-campo">
            <span className="campo-etiqueta">Anfitrión:</span>
            <span className="campo-valor" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <CrownIcon size={14} /> @{partida.nicknameAnfitrion}
            </span>
          </div>

          <div className="detalle-campo">
            <span className="campo-etiqueta">Límite de jugadores:</span>
            <span className="campo-valor" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <UsersIcon size={14} /> {partida.limiteJugadores}
            </span>
          </div>

        </div>

        {personajesUnidos.length > 0 ? (
          <div className="detalle-jugadores-unidos" style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: 'var(--text-h)' }}>
              Jugadores y Personajes unidos ({personajesUnidos.length} / {partida.limiteJugadores}):
            </h4>
            <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
              {personajesUnidos.map((p) => (
                <li key={p.idPersonaje} style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
                  <strong>{p.nombreFicticio}</strong> {p.raza ? `(${p.raza})` : ''} {p.nivel ? `— Nivel ${p.nivel}` : ''} {p.jugadorNombre || p.nickname ? `[@${p.jugadorNombre || p.nickname}]` : ''}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Aún no hay personajes unidos a esta partida.
          </div>
        )}
      </div>

      <div className="detalle-footer">
        {onEditar && (
          <button
            type="button"
            className="btn-editar"
            onClick={() => onEditar(partida)}
          >
            Editar
          </button>
        )}
        {onEliminar && (
          <button
            type="button"
            className="btn-eliminar"
            onClick={() => onEliminar(partida.idPartida)}
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
}