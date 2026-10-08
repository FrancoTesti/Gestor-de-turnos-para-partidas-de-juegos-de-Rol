import { useUser } from '../context/UserContext';

export default function DashboardPage() {
  const { usuarioLogueado, usuarios, jugadores, anfitriones, rolDe } = useUser();

  // Si no está logueado, redirige a login
  if (!usuarioLogueado) {
    return null;
  }

  const rol = rolDe(usuarioLogueado.idUsuario);

  return (
    <div style={{ width: '100%', maxWidth: 860, margin: '1rem auto', padding: '0 0.5rem', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', margin: 0 }}>
          Centro de Control
        </p>
        <h2 style={{ margin: '0.25rem 0 0.5rem', fontSize: '1.85rem' }}>Dashboard</h2>
      </div>

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        padding: '1.25rem 1.5rem',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.5rem',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <strong>Sesión activa:</strong> <span style={{ color: 'var(--text-h)', fontWeight: 700 }}>{usuarioLogueado.nickname}</span>
          </p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <strong>Rol:</strong> <span style={{ textTransform: 'capitalize', color: 'var(--accent-text)', fontWeight: 600 }}>{rol}</span>
          </p>
        </div>
        <span className={`badge badge-${rol}`}>
          {rol === 'anfitrion' ? '👑 Anfitrión' : rol === 'jugador' ? '⚔️ Jugador' : '👤 Usuario'}
        </span>
      </div>

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        padding: '1.5rem',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow)'
      }}>
        <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>👥</span> Usuarios registrados
        </h3>
        {usuarios.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No hay usuarios registrados aún.</p>
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
                <span style={{ fontWeight: 600, color: 'var(--text-h)' }}>{u.nickname}</span>
                <span className={`badge badge-${rolDe(u.idUsuario)}`} style={{ fontSize: '0.7rem' }}>
                  {rolDe(u.idUsuario)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <hr />

      <h3 style={{ margin: '1.5rem 0 1rem' }}>Estadísticas</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(11rem, 1fr))', gap: '1rem' }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--info-border)',
          borderTop: '4px solid var(--info-solid)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow)'
        }}>
          <strong style={{ color: 'var(--info-text)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Usuarios</strong>
          <p style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0.5rem 0 0', color: 'var(--text-h)' }}>{usuarios.length}</p>
        </div>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--success-border)',
          borderTop: '4px solid var(--success-solid)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow)'
        }}>
          <strong style={{ color: 'var(--success-text)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Jugadores</strong>
          <p style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0.5rem 0 0', color: 'var(--text-h)' }}>{jugadores.length}</p>
        </div>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--warning-border)',
          borderTop: '4px solid var(--warning-solid)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow)'
        }}>
          <strong style={{ color: 'var(--warning-text)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Anfitriones</strong>
          <p style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0.5rem 0 0', color: 'var(--text-h)' }}>{anfitriones.length}</p>
        </div>
      </div>
    </div>
  );
}
