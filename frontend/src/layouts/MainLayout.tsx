import { Outlet, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Alert } from '../components/ui';
import ThemeToggle from '../components/ui/ThemeToggle';
import './MainLayout.css';

export default function MainLayout() {
  const { usuarioLogueado, logout, mensaje, limpiarMensaje, cargandoSesion } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try { await logout(); navigate('/login'); }
    catch { window.alert('No se pudo cerrar la sesión. Reintentá.'); }
  };

  // Solo mostrar layout si está logueado
  if (cargandoSesion) return <p role="status">Recuperando sesión…</p>;
  if (!usuarioLogueado) return <Navigate to="/login" replace />;

  return (
    <div className="main-layout">
      {/* Alert global */}
      {mensaje && (
        <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 999 }}>
          <Alert
            type="success"
            message={mensaje}
            onClose={() => {
              limpiarMensaje();
            }}
          />
        </div>
      )}

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="brand-logo-badge" aria-hidden="true">🎲</div>
          <h1>Gestor de Turnos - Juegos de Rol</h1>
        </div>
        <div className="navbar-user">
          <ThemeToggle />
          <div className="user-greeting-badge">
            <span className="user-dot" aria-hidden="true" />
            <span>Hola, <strong>{usuarioLogueado.nickname}</strong></span>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Sidebar */}
      <div className="layout-container">
        <aside className="sidebar">
          <div className="sidebar-header-label">Menú de Navegación</div>
          <ul className="nav-menu">
            {[['/classes', '🛡️ Clases'], ['/stores', '🏪 Tiendas'], ['/sessions', '📅 Sesiones'], ['/missions', '📜 Misiones'], ['/inventory', '📦 Inventarios'], ['/profiles', '👤 Perfiles']].map(([path, label]) => (
              <li
                key={path}
                className={location.pathname === path ? 'active' : ''}
              >
                <Link className={location.pathname === path ? 'active' : ''} style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }} to={path}>{label}</Link>
              </li>
            ))}
            <li
              className={location.pathname === '/dashboard' ? 'active' : ''}
            >
              <Link className={location.pathname === '/dashboard' ? 'active' : ''} style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }} to="/dashboard">📊 Dashboard</Link>
            </li>
            <li
              className={location.pathname === '/users' ? 'active' : ''}
            >
              <Link className={location.pathname === '/users' ? 'active' : ''} style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }} to="/users">👥 Usuarios</Link>
            </li>
            <li
              className={location.pathname === '/games' ? 'active' : ''}
            >
              <Link className={location.pathname === '/games' ? 'active' : ''} style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }} to="/games">🎮 Partidas</Link>
            </li>
            <li
              className={location.pathname === '/objects' ? 'active' : ''}
            >
              <Link className={location.pathname === '/objects' ? 'active' : ''} style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }} to="/objects">🎒 Objetos</Link>
            </li>
            <li
              className={location.pathname === '/characters' ? 'active' : ''}
            >
              <Link className={location.pathname === '/characters' ? 'active' : ''} style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }} to="/characters">⚔️ Personajes</Link>
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
