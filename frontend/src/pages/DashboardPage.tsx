import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function DashboardPage() {
  const { usuarioLogueado, usuarios, jugadores, anfitriones, rolDe } = useUser();

  if (!usuarioLogueado) {
    return null;
  }

  const rol = rolDe(usuarioLogueado.idUsuario);
  const numberFormatter = new Intl.NumberFormat('es-AR');

  return (
    <div className="dashboard-container">
      {/* Cabecera del Centro de Mando */}
      <header className="dashboard-header">
        <div>
          <div className="dashboard-eyebrow">
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-solid)', boxShadow: '0 0 10px var(--accent)' }} />
            TTRPG Master Command Hub
          </div>
          <h2 className="dashboard-title">Centro de Mando</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mesa activa:</span>
          <span className="badge badge-activa">En Línea</span>
        </div>
      </header>

      {/* Bento Grid Asimétrica */}
      <div className="bento-grid">
        {/* PANEL 1: Estado de partida activa / Personaje vinculado y Rol actual (8 cols) */}
        <div className="bento-card bento-col-8" style={{ justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--accent)',
                  background: 'var(--accent-bg)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  border: '1px solid var(--accent-border)',
                  marginBottom: '0.75rem'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-solid)' }} />
                  Sesión Vinculada
                </span>
                <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-h)', letterSpacing: '-0.02em' }}>
                  {usuarioLogueado.nickname}
                </h3>
                <p className="bento-card-sub">
                  {rol === 'anfitrion' ? 'Director de juego (Game Master) con control total de mesas y encuentros.' : 'Aventurero activo preparado para iniciativa y combate por turnos.'}
                </p>
              </div>
              <span className={`badge badge-${rol}`}>
                {rol === 'anfitrion' ? '👑 Anfitrión' : rol === 'jugador' ? '⚔️ Jugador' : '👤 Usuario'}
              </span>
            </div>

            {/* Ficha rápida de estado TTRPG */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.75rem',
              marginTop: '1rem',
              padding: '0.85rem 1rem',
              background: 'var(--bg-card-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>ID Identidad</span>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-h)' }} className="tabular-nums">
                  #{usuarioLogueado.idUsuario}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Estado Mesa</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--success-text)' }}>
                  Listo para Partida
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Iniciativa</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent)' }} className="tabular-nums">
                  Fase de Espera
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Acceso a reglas y combate en tiempo real
            </span>
            <Link to="/profiles" className="btn btn-secondary btn-small">
              Configuración →
            </Link>
          </div>
        </div>

        {/* PANEL 2: Acciones Rápidas (4 cols) */}
        <div className="bento-card bento-col-4" style={{ justifyContent: 'space-between' }}>
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <span className="bento-stat-label">Comandos Directos</span>
              <h3 className="bento-card-title" style={{ marginTop: '0.35rem' }}>
                Acciones Rápidas
              </h3>
            </div>

            <div className="bento-actions-list">
              <Link to="/games" className="bento-action-btn">
                <span>🎲</span>
                <span><strong>Nueva Partida</strong> / Mesas</span>
              </Link>
              <Link to="/sessions" className="bento-action-btn">
                <span>⏱️</span>
                <span><strong>Tirada</strong> / Nuevo Turno</span>
              </Link>
              <Link to="/characters" className="bento-action-btn">
                <span>⚔️</span>
                <span><strong>Crear Personaje</strong> / Héroes</span>
              </Link>
              <Link to="/classes" className="bento-action-btn">
                <span>📜</span>
                <span><strong>Catálogo</strong> de Clases</span>
              </Link>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
            <Link to="/missions" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              🗡️ Explorar Misiones
            </Link>
          </div>
        </div>

        {/* PANEL 3: Métricas de Campaña con Números Tabulares (3 columnas de 4 spans) */}
        <div className="bento-card bento-col-4" style={{ borderTop: '3px solid var(--accent-solid)' }}>
          <span className="bento-stat-label">Jugadores Activos</span>
          <p className="bento-stat-num">
            {numberFormatter.format(jugadores.length)}
          </p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Perfiles de aventurero listos para combate
          </span>
        </div>

        <div className="bento-card bento-col-4" style={{ borderTop: '3px solid #94a3b8' }}>
          <span className="bento-stat-label">Maestros de Juego</span>
          <p className="bento-stat-num">
            {numberFormatter.format(anfitriones.length)}
          </p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Anfitriones registrados en el reino
          </span>
        </div>

        <div className="bento-card bento-col-4" style={{ borderTop: '3px solid var(--info-solid)' }}>
          <span className="bento-stat-label">Comunidad Total</span>
          <p className="bento-stat-num">
            {numberFormatter.format(usuarios.length)}
          </p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Cuentas sincronizadas en la base de datos
          </span>
        </div>

        {/* PANEL 4: Directorio Rápido de Aventureros / Usuarios (12 cols) */}
        <div className="bento-card bento-col-12">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 className="bento-card-title" style={{ margin: 0 }}>
                <span>🛡️</span> Directorio de Aventureros & Usuarios Activos
              </h3>
              <p className="bento-card-sub">
                Visualización compacta del roster disponible para reclutamiento
              </p>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }} className="tabular-nums">
              Total registrados: <strong>{numberFormatter.format(usuarios.length)}</strong>
            </span>
          </div>

          {usuarios.length === 0 ? (
            <div className="empty-state">
              <p style={{ margin: 0, fontStyle: 'italic' }}>No hay usuarios registrados en el reino.</p>
            </div>
          ) : (
            <ul className="bento-user-grid">
              {usuarios.map((u) => {
                const userRole = rolDe(u.idUsuario);
                return (
                  <li key={u.idUsuario} className="bento-user-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        fontSize: '0.85rem'
                      }}>
                        {userRole === 'anfitrion' ? '👑' : userRole === 'jugador' ? '⚔️' : '👤'}
                      </span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="truncate" style={{ fontWeight: 700, color: 'var(--text-h)' }} title={u.nickname}>
                          {u.nickname}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }} className="tabular-nums">
                          #{u.idUsuario}
                        </div>
                      </div>
                    </div>
                    <span className={`badge badge-${userRole}`} style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                      {userRole}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
