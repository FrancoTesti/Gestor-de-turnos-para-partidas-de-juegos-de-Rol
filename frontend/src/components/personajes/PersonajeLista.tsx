import { useState, type MouseEvent } from 'react';
import type { Personaje, Clase } from '../../interfaces';
import './personajes.css';

export interface PersonajeListaProps {
  personajes: Personaje[];
  clases: Clase[];
  personajeSeleccionadoId?: number | null;
  onSeleccionar?: (personaje: Personaje) => void;
  onEditar?: (personaje: Personaje) => void;
  onEliminar?: (idPersonaje: number) => void;
  onNuevo?: () => void;
  cargando?: boolean;
}

export default function PersonajeLista({
  personajes,
  clases,
  personajeSeleccionadoId,
  onSeleccionar,
  onEditar,
  onEliminar,
  onNuevo,
  cargando = false,
}: PersonajeListaProps) {
  const [filtroClase, setFiltroClase] = useState<number | 'todas'>('todas');

  const personajesFiltrados = filtroClase === 'todas'
    ? personajes
    : personajes.filter((p) => p.idClase === filtroClase);

  function handleEditar(event: MouseEvent<HTMLButtonElement>, personaje: Personaje) {
    event.stopPropagation();
    onEditar?.(personaje);
  }

  function handleEliminar(event: MouseEvent<HTMLButtonElement>, idPersonaje: number) {
    event.stopPropagation();
    if (window.confirm('¿Está seguro de eliminar este personaje?')) {
      onEliminar?.(idPersonaje);
    }
  }

  function obtenerNombreClase(idClase: number): string {
    const clase = clases.find((c) => c.idClase === idClase);
    return clase ? clase.nombreClase : `Clase #${idClase}`;
  }

  if (cargando) {
    return (
      <section className="personaje-container">
        <div className="personaje-header">
          <h2>Personajes de Juego</h2>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <span>⏳ Cargando personajes...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="personaje-container">
      <header className="personaje-header">
        <div>
          <h2>Personajes de Juego ({personajesFiltrados.length})</h2>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="personaje-filtros">
            <label htmlFor="filtroClase">Filtrar por Clase:</label>
            <select
              id="filtroClase"
              value={filtroClase}
              onChange={(e) => {
                const val = e.target.value;
                setFiltroClase(val === 'todas' ? 'todas' : Number(val));
              }}
            >
              <option value="todas">Todas las clases</option>
              {clases.map((c) => (
                <option key={c.idClase} value={c.idClase}>
                  {c.nombreClase}
                </option>
              ))}
            </select>
          </div>

          {onNuevo && (
            <button type="button" className="btn-purple" onClick={onNuevo}>
              + Crear Personaje
            </button>
          )}
        </div>
      </header>

      {personajesFiltrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', background: '#f7fafc', borderRadius: '8px' }}>
          <p>
            {filtroClase === 'todas'
              ? 'No hay personajes registrados en el sistema.'
              : 'No hay personajes creados con la clase seleccionada.'}
          </p>
        </div>
      ) : (
        <div className="personaje-grid">
          {personajesFiltrados.map((p) => {
            const esSeleccionado = personajeSeleccionadoId === p.idPersonaje;
            const nombreClase = (p as any).claseNombre || obtenerNombreClase(p.idClase);
            const jugadorNombre = (p as any).jugadorNombre || `Jugador #${p.idUsuarioJugador}`;

            return (
              <div
                key={p.idPersonaje}
                className={`personaje-card ${esSeleccionado ? 'seleccionado' : ''}`}
                onClick={() => onSeleccionar?.(p)}
                role={onSeleccionar ? 'button' : undefined}
                tabIndex={onSeleccionar ? 0 : undefined}
              >
                <div>
                  <div className="personaje-top">
                    <h3 className="personaje-nombre">{p.nombreFicticio}</h3>
                    <span className="personaje-badge-id">ID: #{p.idPersonaje}</span>
                  </div>

                  <div className="personaje-clase-raza">
                    {p.raza} • {nombreClase}
                  </div>

                  <div className="personaje-stats">
                    <div className="stat-item">
                      <span className="stat-val">{p.nivel}</span>
                      <span className="stat-lbl">Nivel</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-val">{p.xp}</span>
                      <span className="stat-lbl">XP</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-val">🪙 {p.dinero}</span>
                      <span className="stat-lbl">Dinero</span>
                    </div>
                  </div>

                  <div className="personaje-meta">
                    👤 <strong>Jugador:</strong> {jugadorNombre}
                    <br />
                    ⚔️ <strong>Partida ID:</strong> #{p.idPartida}
                  </div>
                </div>

                {(onEditar || onEliminar) && (
                  <div className="personaje-acciones">
                    {onEditar && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={(event) => handleEditar(event, p)}
                      >
                        Editar
                      </button>
                    )}
                    {onEliminar && (
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={(event) => handleEliminar(event, p.idPersonaje)}
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
      )}
    </section>
  );
}
