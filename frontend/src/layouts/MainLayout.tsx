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

  if (cargandoSesion) return <p role="status">Recuperando sesión…</p>;
  if (!usuarioLogueado) return <Navigate to="/login" replace />;

  const isActive = (paths: string[]) => paths.includes(location.pathname) ? 'active' : '';

  return (
    <div className="main-layout">
      {mensaje && (
        <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999 }}>
          <Alert type="success" message={mensaje} onClose={limpiarMensaje} />
        </div>
      )}

      <header className="top-navbar">
        <div className="navbar-brand">
          <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>Gestor de Rol</h1>
          </Link>
        </div>

        <nav className="navbar-menu nav-menu">
          <ul className="nav-horizontal">
            <li className={`nav-dropdown ${isActive(['/games', '/sessions', '/missions'])}`}>
              <span className="nav-item">Juego ▾</span>
              <div className="dropdown-content">
                <Link to="/games">Partidas</Link>
                <Link to="/sessions">Sesiones</Link>
                <Link to="/missions">Misiones</Link>
              </div>
            </li>

            <li className={`nav-dropdown ${isActive(['/characters', '/inventory'])}`}>
              <span className="nav-item">Personajes ▾</span>
              <div className="dropdown-content">
                <Link to="/characters">Personajes</Link>
                <Link to="/inventory">Inventarios</Link>
              </div>
            </li>

            <li className={`nav-dropdown ${isActive(['/classes', '/objects', '/stores'])}`}>
              <span className="nav-item">Catálogo ▾</span>
              <div className="dropdown-content">
                <Link to="/classes">Clases</Link>
                <Link to="/objects">Objetos</Link>
                <Link to="/stores">Tiendas</Link>
              </div>
            </li>

            <li className={`nav-dropdown ${isActive(['/dashboard', '/users', '/profiles'])}`}>
              <span className="nav-item">Sistema ▾</span>
              <div className="dropdown-content">
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/users">Usuarios</Link>
                <Link to="/profiles">Mis Perfiles</Link>
              </div>
            </li>
          </ul>
        </nav>

        <div className="navbar-user">
          <span className="user-greeting">Hola, {usuarioLogueado.nickname}</span>
          <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
