import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function DashboardPage() {
  const { usuarioLogueado, usuarios, jugadores, anfitriones, rolDe } = useUser();

  // Si no está logueado, redirige a login
  if (!usuarioLogueado) {
    return null;
  }

  const rol = rolDe(usuarioLogueado.idUsuario);
  const numberFormatter = new Intl.NumberFormat('es-AR');

  return (
    <div style={{ width: '100%', maxWidth: 1040, margin: '1rem auto', padding: '0 0.75rem', boxSizing: 'border-box' }}>
      <header style={{ marginBottom: '1.75rem' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', margin: 0 }}>
          Centro de Control
        </p>
        <h2 style={{ margin: '0.25rem 0 0', fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-h)' }}>Dashboard</h2>
      </header>

      {/* Bento Grid Principal */}
      <div className="bento-grid">
        {/* Celda 1 (8 cols): Sesión Activa e Identidad */}
        <div className="bento-card bento-col-8" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                Sesión Activa
              </span>
              <h3 style={{ margin: '0.35rem 0 0.25rem', fontSize: '1.4rem', color: 'var(--text-h)' }}>
                {usuarioLogueado.nickname}
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Perfil conectado al sistema de rol
              </p>
            </div>
            <span className={`badge badge-${rol}`}>
              {rol === 'anfitrion' ? '👑 Anfitrión' : rol === 'jugador' ? '⚔️ Jugador' : '👤 Usuario'}
            </span>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>ID Usuario: </span>
              <strong style={{ color: 'var(--text-h)', fontFamily: 'var(--mono)' }}>#{usuarioLogueado.idUsuario}</strong>
            </div>
            <div style={{ fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Rol actual: </span>
              <strong style={{ color: 'var(--accent-text)', textTransform: 'capitalize' }}>{rol}</strong>
            </div>
          </div>
        </div>

        {/* Celda 2 (4 cols): Accesos Rápidos */}
        <div className="bento-card bento-col-4" style={{ justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Acciones Rápidas
            </span>
            <h3 style={{ margin: '0.35rem 0 0.75rem', fontSize: '1.15rem', color: 'var(--text-h)' }}>
              Navegación
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link to="/games" className="btn btn-secondary" style={{ justifyContent: 'flex-start', fontSize: '0.85rem' }}>
              🎲 Partidas Activas
            </Link>
            <Link to="/characters" className="btn btn-secondary" style={{ justifyContent: 'flex-start', fontSize: '0.85rem' }}>
              ⚔️ Mis Personajes
            </Link>
            <Link to="/classes" className="btn btn-secondary" style={{ justifyContent: 'flex-start', fontSize: '0.85rem' }}>
              📜 Catálogo de Clases
            </Link>
          </div>
        </div>

        {/* Celda 3 (4 cols): Métrica Usuarios */}
        <div className="bento-card bento-col-4" style={{ borderLeft: '4px solid var(--info-solid)' }}>
          <strong style={{ color: 'var(--info-text)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Usuarios Totales
          </strong>
          <p className="tabular-nums" style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0.5rem 0 0', color: 'var(--text-h)' }}>
            {numberFormatter.format(usuarios.length)}
          </p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Cuentas registradas
          </span>
        </div>

        {/* Celda 4 (4 cols): Métrica Jugadores */}
        <div className="bento-card bento-col-4" style={{ borderLeft: '4px solid var(--success-solid)' }}>
          <strong style={{ color: 'var(--success-text)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Jugadores
          </strong>
          <p className="tabular-nums" style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0.5rem 0 0', color: 'var(--text-h)' }}>
            {numberFormatter.format(jugadores.length)}
          </p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Perfiles de jugador activos
          </span>
        </div>

        {/* Celda 5 (4 cols): Métrica Anfitriones */}
        <div className="bento-card bento-col-4" style={{ borderLeft: '4px solid var(--warning-solid)' }}>
          <strong style={{ color: 'var(--warning-text)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Anfitriones
          </strong>
          <p className="tabular-nums" style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0.5rem 0 0', color: 'var(--text-h)' }}>
            {numberFormatter.format(anfitriones.length)}
          </p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Masters / Creadores de mesas
          </span>
        </div>

        {/* Celda 6 (12 cols): Directorio de Usuarios */}
        <div className="bento-card bento-col-12">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
              <span>👥</span> Directorio de usuarios registrados
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }} className="tabular-nums">
              Total: {usuarios.length}
            </span>
          </div>

          {usuarios.length === 0 ? (
            <div className="empty-state">
              <p style={{ margin: 0, fontStyle: 'italic' }}>No hay usuarios registrados aún.</p>
            </div>
          ) : (
            <ul style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '0.75rem'
            }}>
              {usuarios.map((u) => (
                <li key={u.idUsuario} style={{
                  background: 'var(--bg-card-secondary)',
                  border: '1px solid var(--border-subtle)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem'
                }}>
                  <span className="truncate" style={{ fontWeight: 600, color: 'var(--text-h)' }} title={u.nickname}>
                    {u.nickname}
                  </span>
                  <span className={`badge badge-${rolDe(u.idUsuario)}`} style={{ fontSize: '0.7rem' }}>
                    {rolDe(u.idUsuario)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
