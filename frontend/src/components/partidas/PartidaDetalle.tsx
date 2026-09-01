/* muestra el detalle completo de una partida seleccionada.
 Recibe todo por props, no hace fetch directamente */
import type { PartidaPublica } from '../../services/partida.service';
import './partidas.css';

export interface PartidaDetalleProps {
  partida?: PartidaPublica | null;
  cargando?: boolean;
  error?: string | null;
  onCerrar?: () => void;
  onEditar?: (partida: PartidaPublica) => void;
  onEliminar?: (idPartida: number) => void;
}

export default function PartidaDetalle({
  partida,
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
        <div className="loader-spinner">⏳</div>
        <p>Cargando información de la partida...</p>
      </div>
    );
  }

  // estado: error
  if (error) {
    return (
      <div className="partida-detalle-card error">
        <div className="error-icon">❌</div>
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
        <div className="info-icon">🎲</div>
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
          >
            ✖
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
              {partida.estado === 'activa' ? '▶ Activa' : '■ Finalizada'}
            </span>
          </div>

          {/* privacidad: requerida por el plan */}
          <div className="detalle-campo">
            <span className="campo-etiqueta">Privacidad:</span>
            <span className={`badge ${partida.esPrivada ? 'badge-privada' : 'badge-publica'}`}>
              {partida.esPrivada ? '🔒 Privada' : '🌐 Pública'}
            </span>
          </div>

          {/* anfitrion: requerido por el plan */}
          <div className="detalle-campo">
            <span className="campo-etiqueta">Anfitrión:</span>
            <span className="campo-valor">@{partida.nicknameAnfitrion}</span>
          </div>

          <div className="detalle-campo">
            <span className="campo-etiqueta">Límite de jugadores:</span>
            <span className="campo-valor">{partida.limiteJugadores}</span>
          </div>

        </div>
      </div>

      <div className="detalle-footer">
        {onEditar && (
          <button
            type="button"
            className="btn-editar"
            onClick={() => onEditar(partida)}
          >
            ✏️ Editar
          </button>
        )}
        {onEliminar && (
          <button
            type="button"
            className="btn-eliminar"
            onClick={() => onEliminar(partida.idPartida)}
          >
            🗑️ Eliminar
          </button>
        )}
      </div>
    </div>
  );
}