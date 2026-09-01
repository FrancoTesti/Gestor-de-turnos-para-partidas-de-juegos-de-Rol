/* muestra el listado de partidas.
no hace fetch directamente: recibe los datos por props desde el componente padre. */

import type { MouseEvent } from 'react';
import type { PartidaPublica } from '../../services/partida.service';
import './partidas.css';

// contrato de props: que datos y funciones espera este componente
export interface PartidaListaProps {
  partidas: PartidaPublica[];
  partidaSeleccionadaId?: number | null;
  onSeleccionar?: (partida: PartidaPublica) => void;
  onEditar?: (partida: PartidaPublica) => void;
  onEliminar?: (idPartida: number) => void;
  cargando?: boolean;
}

export default function PartidaLista({
  partidas,
  partidaSeleccionadaId,
  onSeleccionar,
  onEditar,
  onEliminar,
  cargando = false,
}: PartidaListaProps) {

  // evitamps que el click en editar/eliminar dispare tambioen el onSeleccionar
  function editarPartida(event: MouseEvent<HTMLButtonElement>, partida: PartidaPublica) {
    event.stopPropagation();
    onEditar?.(partida);
  }

  function eliminarPartida(event: MouseEvent<HTMLButtonElement>, idPartida: number) {
    event.stopPropagation();
    onEliminar?.(idPartida);
  }

  // estado de carga
  if (cargando) {
    return (
      <section className="partida-lista-container">
        <h2>Partidas activas</h2>
        <div className="estado-cargando" role="status">
          <span aria-hidden="true">⏳</span>
          <span>Cargando partidas...</span>
        </div>
      </section>
    );
  }

  // lista vacia
  if (partidas.length === 0) {
    return (
      <section className="partida-lista-container">
        <h2>Partidas activas</h2>
        <div className="lista-vacia">
          <p>No hay partidas activas en este momento.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="partida-lista-container">
      <header className="partida-lista-header">
        <h2>Partidas activas ({partidas.length})</h2>
      </header>

      <div className="partida-grid">
        {partidas.map((partida) => {
          const esSeleccionada = partidaSeleccionadaId === partida.idPartida;

          return (
            <div
              key={partida.idPartida}
              className={`partida-card ${esSeleccionada ? 'seleccionada' : ''}`}
              onClick={() => onSeleccionar?.(partida)}
              role={onSeleccionar ? 'button' : undefined}
              tabIndex={onSeleccionar ? 0 : undefined}
            >
              {/* encabeza con nombre y badge de privacidad */}
              <div className="partida-card-header">
                <h3 className="partida-nombre">{partida.nombre}</h3>
                {/* privacidad: requerida por el plan */}
                <span className={`badge ${partida.esPrivada ? 'badge-privada' : 'badge-publica'}`}>
                  {partida.esPrivada ? '🔒 Privada' : '🌐 Pública'}
                </span>
              </div>

              <div className="partida-info">
                {/* estado: requerido por el plan */}
                <p>
                  <span className="info-label">Estado:</span>
                  <span className={`badge ${partida.estado === 'activa' ? 'badge-activa' : 'badge-finalizada'}`}>
                    {partida.estado === 'activa' ? '▶ Activa' : '■ Finalizada'}
                  </span>
                </p>

                {/* anfitrion: requerido por el plan */}
                <p>
                  <span className="info-label">Anfitrión:</span>
                  <span>@{partida.nicknameAnfitrion}</span>
                </p>

                {/* limite de jugadores */}
                <p>
                  <span className="info-label">Límite:</span>
                  <span>{partida.limiteJugadores} jugadores</span>
                </p>
              </div>

              {/* botones de acción */}
              {(onEditar || onEliminar) && (
                <div className="partida-acciones">
                  {onEditar && (
                    <button
                      type="button"
                      onClick={(e) => editarPartida(e, partida)}
                    >
                      Editar
                    </button>
                  )}
                  {onEliminar && (
                    <button
                      type="button"
                      className="boton-eliminar"
                      onClick={(e) => eliminarPartida(e, partida.idPartida)}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}