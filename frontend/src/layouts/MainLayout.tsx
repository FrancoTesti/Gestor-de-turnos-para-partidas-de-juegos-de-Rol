import { Outlet, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Alert } from '../components/ui';
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
          <h1>Gestor de Turnos - Juegos de Rol</h1>
        </div>
        <div className="navbar-user">
          <span>Hola, {usuarioLogueado.nickname}</span>
          <button onClick={handleLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Sidebar */}
      <div className="layout-container">
        <aside className="sidebar">
          <ul className="nav-menu">
            {[['/classes', 'Clases'], ['/stores', 'Tiendas'], ['/sessions', 'Sesiones'], ['/missions', 'Misiones'], ['/inventory', 'Inventarios'], ['/profiles', 'Perfiles']].map(([path, label]) => <li key={path}><Link to={path}>{label}</Link></li>)}
            <li
              onClick={() => navigate('/dashboard')}
              className={location.pathname === '/dashboard' ? 'active' : ''}
            >
              📊 Dashboard
            </li>
            <li
              onClick={() => navigate('/users')}
              className={location.pathname === '/users' ? 'active' : ''}
            >
              👥 Usuarios
            </li>
            <li
              onClick={() => navigate('/games')}
              className={location.pathname === '/games' ? 'active' : ''}
            >
              🎮 Partidas
            </li>
            <li
              onClick={() => navigate('/objects')}
              className={location.pathname === '/objects' ? 'active' : ''}
            >
              🎒 Objetos
            </li>
            <li
              onClick={() => navigate('/characters')}
              className={location.pathname === '/characters' ? 'active' : ''}
            >
              ⚔️ Personajes
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
