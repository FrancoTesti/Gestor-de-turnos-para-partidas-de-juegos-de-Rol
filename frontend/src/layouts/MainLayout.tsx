import { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import { Outlet, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Alert } from '../components/ui';
import ThemeToggle from '../components/ui/ThemeToggle';
import './MainLayout.css';

export default function MainLayout() {
  const { usuarioLogueado, logout, mensaje, limpiarMensaje, cargandoSesion } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setOpenDropdown(null);
  }

  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleLogout = async () => {
    try { await logout(); navigate('/login'); }
    catch { window.alert('No se pudo cerrar la sesión. Reintentá.'); }
  };

  if (cargandoSesion) return <p role="status">Recuperando sesión…</p>;
  if (!usuarioLogueado) return <Navigate to="/login" replace />;

  const isActive = (paths: string[]) => paths.includes(location.pathname) ? 'active' : '';

  const handleTriggerKeyDown = (key: string, e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpenDropdown(prev => prev === key ? null : key);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpenDropdown(null);
    }
  };

  const toggleDropdown = (key: string) => {
    setOpenDropdown(prev => prev === key ? null : key);
  };

  return (
    <div className="main-layout">
      {mensaje && (
        <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999 }}>
          <Alert type="success" message={mensaje} onClose={limpiarMensaje} />
        </div>
      )}

      <header className="top-navbar">
        <div className="navbar-brand">
          <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span aria-hidden="true" style={{ fontSize: '1.4rem' }}>🎲</span>
            <h1>Gestor de Rol</h1>
          </Link>
        </div>

        <nav className="navbar-menu nav-menu" ref={navRef}>
          <ul className="nav-horizontal">
            <li className={`nav-dropdown ${isActive(['/games', '/sessions', '/missions'])} ${openDropdown === 'juego' ? 'is-open' : ''}`}>
              <span
                className="nav-item"
                role="button"
                tabIndex={0}
                aria-haspopup="true"
                aria-expanded={openDropdown === 'juego'}
                onClick={() => toggleDropdown('juego')}
                onKeyDown={(e) => handleTriggerKeyDown('juego', e)}
              >
                Juego ▾
              </span>
              <div className="dropdown-content">
                <Link to="/games" onClick={() => setOpenDropdown(null)}>Partidas</Link>
                <Link to="/sessions" onClick={() => setOpenDropdown(null)}>Sesiones</Link>
                <Link to="/missions" onClick={() => setOpenDropdown(null)}>Misiones</Link>
              </div>
            </li>

            <li className={`nav-dropdown ${isActive(['/characters', '/inventory'])} ${openDropdown === 'personajes' ? 'is-open' : ''}`}>
              <span
                className="nav-item"
                role="button"
                tabIndex={0}
                aria-haspopup="true"
                aria-expanded={openDropdown === 'personajes'}
                onClick={() => toggleDropdown('personajes')}
                onKeyDown={(e) => handleTriggerKeyDown('personajes', e)}
              >
                Personajes ▾
              </span>
              <div className="dropdown-content">
                <Link to="/characters" onClick={() => setOpenDropdown(null)}>Personajes</Link>
                <Link to="/inventory" onClick={() => setOpenDropdown(null)}>Inventarios</Link>
              </div>
            </li>

            <li className={`nav-dropdown ${isActive(['/classes', '/objects', '/stores'])} ${openDropdown === 'catalogo' ? 'is-open' : ''}`}>
              <span
                className="nav-item"
                role="button"
                tabIndex={0}
                aria-haspopup="true"
                aria-expanded={openDropdown === 'catalogo'}
                onClick={() => toggleDropdown('catalogo')}
                onKeyDown={(e) => handleTriggerKeyDown('catalogo', e)}
              >
                Catálogo ▾
              </span>
              <div className="dropdown-content">
                <Link to="/classes" onClick={() => setOpenDropdown(null)}>Clases</Link>
                <Link to="/objects" onClick={() => setOpenDropdown(null)}>Objetos</Link>
                <Link to="/stores" onClick={() => setOpenDropdown(null)}>Tiendas</Link>
              </div>
            </li>

            <li className={`nav-dropdown ${isActive(['/dashboard', '/users', '/profiles'])} ${openDropdown === 'sistema' ? 'is-open' : ''}`}>
              <span
                className="nav-item"
                role="button"
                tabIndex={0}
                aria-haspopup="true"
                aria-expanded={openDropdown === 'sistema'}
                onClick={() => toggleDropdown('sistema')}
                onKeyDown={(e) => handleTriggerKeyDown('sistema', e)}
              >
                Sistema ▾
              </span>
              <div className="dropdown-content">
                <Link to="/dashboard" onClick={() => setOpenDropdown(null)}>Dashboard</Link>
                <Link to="/users" onClick={() => setOpenDropdown(null)}>Usuarios</Link>
                <Link to="/profiles" onClick={() => setOpenDropdown(null)}>Mis Perfiles</Link>
              </div>
            </li>
          </ul>
        </nav>

        <div className="navbar-user">
          <ThemeToggle />
          <span className="user-greeting truncate" title={usuarioLogueado.nickname}>Hola, {usuarioLogueado.nickname}</span>
          <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
