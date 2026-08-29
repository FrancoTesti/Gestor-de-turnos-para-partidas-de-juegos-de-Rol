import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Alert } from '../components/ui';
import './MainLayout.css';
import { useEffect, useState } from 'react';

export default function MainLayout() {
  const { usuarioLogueado, logout, mensaje, limpiarMensaje } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAlert, setShowAlert] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Auto-limpiar mensaje después de 3 segundos
  useEffect(() => {
    if (mensaje) {
      setShowAlert(true);
      const timer = setTimeout(() => {
        setShowAlert(false);
        limpiarMensaje();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [mensaje, limpiarMensaje]);

  // Solo mostrar layout si está logueado
  if (!usuarioLogueado) {
    navigate('/login');
    return null;
  }

  return (
    <div className="main-layout">
      {/* Alert global */}
      {showAlert && mensaje && (
        <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 999 }}>
          <Alert
            type="success"
            message={mensaje}
            onClose={() => {
              setShowAlert(false);
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
