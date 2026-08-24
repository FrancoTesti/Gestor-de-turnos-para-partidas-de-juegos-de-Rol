import type { Personaje, Clase } from '../../interfaces';
import './personajes.css';

export interface PersonajeDetalleProps {
  personaje: Personaje | null;
  clases?: Clase[];
  onVolver: () => void;
  onEditar?: (personaje: Personaje) => void;
}

export default function PersonajeDetalle({
  personaje,
  clases = [],
  onVolver,
  onEditar,
}: PersonajeDetalleProps) {
  if (!personaje) {
    return (
      <div className="personaje-form">
        <p>No se ha seleccionado ningún personaje.</p>
        <button type="button" className="btn-secondary" onClick={onVolver}>
          Volver al listado
        </button>
      </div>
    );
  }

  const nombreClase = (personaje as any).claseNombre ||
    clases.find((c) => c.idClase === personaje.idClase)?.nombreClase ||
    `Clase #${personaje.idClase}`;

  const jugadorNombre = (personaje as any).jugadorNombre || `Jugador #${personaje.idUsuarioJugador}`;
  const partidaNombre = (personaje as any).partidaNombre || `Partida #${personaje.idPartida}`;

  return (
    <div className="personaje-form">
      <div className="personaje-header">
        <h2>Ficha de Personaje #{personaje.idPersonaje}</h2>
        <button type="button" className="btn-secondary" onClick={onVolver}>
          ← Volver
        </button>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <div className="personaje-top">
          <h3 style={{ fontSize: '1.5rem', color: '#2d3748', margin: 0 }}>
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
            <span className="stat-val" style={{ fontSize: '1.4rem' }}>🪙 {personaje.dinero}</span>
            <span className="stat-lbl">Dinero en oro</span>
          </div>
        </div>

        <div style={{ background: '#f7fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <p style={{ margin: '0.4rem 0' }}>
            👤 <strong>Jugador Propietario:</strong> {jugadorNombre} (ID Usuario: #{personaje.idUsuarioJugador})
          </p>
          <p style={{ margin: '0.4rem 0' }}>
            ⚔️ <strong>Partida Actual:</strong> {partidaNombre} (ID Partida: #{personaje.idPartida})
          </p>
          <p style={{ margin: '0.4rem 0' }}>
            🛡️ <strong>Clase de Personaje:</strong> {nombreClase} (ID Clase: #{personaje.idClase})
          </p>
        </div>
      </div>

      {onEditar && (
        <div className="personaje-acciones" style={{ marginTop: '1.5rem' }}>
          <button type="button" className="btn-purple" onClick={() => onEditar(personaje)}>
            Editar este Personaje
          </button>
        </div>
      )}
    </div>
  );
}
