import { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import { Outlet, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Alert } from '../components/ui';
import Modal from '../components/ui/Modal';
import ThemeToggle from '../components/ui/ThemeToggle';
import './MainLayout.css';

export default function MainLayout() {
  const { usuarioLogueado, logout, mensaje, limpiarMensaje, cargandoSesion } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [mostrarModalLogout, setMostrarModalLogout] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [prevPath, setPrevPath] = useState(location.pathname);
  const navRef = useRef<HTMLElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setMostrarModalLogout(true);
  };

  const confirmarLogout = async () => {
    setMostrarModalLogout(false);
    try {
      await logout();
      navigate('/login');
    } catch {
      window.alert('No se pudo cerrar la sesión. Reintentá.');
    }
  };

  const toggleDropdown = (key: string) => {
    setOpenDropdown(prev => (prev === key ? null : key));
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleTriggerKeyDown = (key: string, e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleDropdown(key);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpenDropdown(null);
    }
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

      <Modal
        isOpen={mostrarModalLogout}
        title="Cerrar Sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        onConfirm={confirmarLogout}
        onCancel={() => setMostrarModalLogout(false)}
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
        type="confirm"
      />

      <header className="top-navbar">
        <div className="navbar-brand">
          <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span aria-hidden="true" style={{ fontSize: '1.4rem' }}>🎲</span>
            <h1>Gestor de Rol</h1>
          </Link>
        </div>

        <nav className="navbar-menu nav-menu" ref={navRef}>
          <ul className="nav-horizontal">
            <li className={`nav-dropdown ${isActive(['/games', '/sessions', '/missions'])} ${openDropdown === 'juego' ? 'is-open open' : ''}`}>
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
                <Link to="/games" onClick={closeDropdown}>Partidas</Link>
                <Link to="/sessions" onClick={closeDropdown}>Sesiones</Link>
                <Link to="/missions" onClick={closeDropdown}>Misiones</Link>
              </div>
            </li>

            <li className={`nav-dropdown ${isActive(['/characters', '/inventory'])} ${openDropdown === 'personajes' ? 'is-open open' : ''}`}>
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
                <Link to="/characters" onClick={closeDropdown}>Personajes</Link>
                <Link to="/inventory" onClick={closeDropdown}>Inventarios</Link>
              </div>
            </li>

            <li className={`nav-dropdown ${isActive(['/classes', '/objects', '/stores'])} ${openDropdown === 'catalogo' ? 'is-open open' : ''}`}>
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
                <Link to="/classes" onClick={closeDropdown}>Clases</Link>
                <Link to="/objects" onClick={closeDropdown}>Objetos</Link>
                <Link to="/stores" onClick={closeDropdown}>Tiendas</Link>
              </div>
            </li>

            <li className={`nav-dropdown ${isActive(['/dashboard', '/users', '/profiles'])} ${openDropdown === 'sistema' ? 'is-open open' : ''}`}>
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
                <Link to="/dashboard" onClick={closeDropdown}>Dashboard</Link>
                <Link to="/users" onClick={closeDropdown}>Usuarios</Link>
                <Link to="/profiles" onClick={closeDropdown}>Configuración</Link>
              </div>
            </li>
          </ul>
        </nav>

        <div className="navbar-user">
          <ThemeToggle />
          <span className="user-greeting truncate" title={usuarioLogueado.nickname}>Hola, {usuarioLogueado.nickname}</span>
          <button onClick={handleLogoutClick} className="btn-logout">Cerrar Sesión</button>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
