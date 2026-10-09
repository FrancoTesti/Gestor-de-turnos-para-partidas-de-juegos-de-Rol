import { useState, useEffect, useRef } from 'react';
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
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setOpenDropdown(null);
  }, [location.pathname]);

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

  const toggleDropdown = (menu: string) => {
    setOpenDropdown(prev => (prev === menu ? null : menu));
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
            <li className={`nav-dropdown ${isActive(['/games', '/sessions', '/missions'])} ${openDropdown === 'juego' ? 'open' : ''}`}>
              <span
                className="nav-item"
                role="button"
                tabIndex={0}
                aria-haspopup="true"
                aria-expanded={openDropdown === 'juego'}
                onClick={() => toggleDropdown('juego')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleDropdown('juego'); } }}
              >
                Juego ▾
              </span>
              <div className="dropdown-content">
                <Link to="/games" onClick={() => setOpenDropdown(null)}>Partidas</Link>
                <Link to="/sessions" onClick={() => setOpenDropdown(null)}>Sesiones</Link>
                <Link to="/missions" onClick={() => setOpenDropdown(null)}>Misiones</Link>
              </div>
            </li>

            <li className={`nav-dropdown ${isActive(['/characters', '/inventory'])} ${openDropdown === 'personajes' ? 'open' : ''}`}>
              <span
                className="nav-item"
                role="button"
                tabIndex={0}
                aria-haspopup="true"
                aria-expanded={openDropdown === 'personajes'}
                onClick={() => toggleDropdown('personajes')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleDropdown('personajes'); } }}
              >
                Personajes ▾
              </span>
              <div className="dropdown-content">
                <Link to="/characters" onClick={() => setOpenDropdown(null)}>Personajes</Link>
                <Link to="/inventory" onClick={() => setOpenDropdown(null)}>Inventarios</Link>
              </div>
            </li>

            <li className={`nav-dropdown ${isActive(['/classes', '/objects', '/stores'])} ${openDropdown === 'catalogo' ? 'open' : ''}`}>
              <span
                className="nav-item"
                role="button"
                tabIndex={0}
                aria-haspopup="true"
                aria-expanded={openDropdown === 'catalogo'}
                onClick={() => toggleDropdown('catalogo')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleDropdown('catalogo'); } }}
              >
                Catálogo ▾
              </span>
              <div className="dropdown-content">
                <Link to="/classes" onClick={() => setOpenDropdown(null)}>Clases</Link>
                <Link to="/objects" onClick={() => setOpenDropdown(null)}>Objetos</Link>
                <Link to="/stores" onClick={() => setOpenDropdown(null)}>Tiendas</Link>
              </div>
            </li>

            <li className={`nav-dropdown ${isActive(['/dashboard', '/users', '/profiles'])} ${openDropdown === 'sistema' ? 'open' : ''}`}>
              <span
                className="nav-item"
                role="button"
                tabIndex={0}
                aria-haspopup="true"
                aria-expanded={openDropdown === 'sistema'}
                onClick={() => toggleDropdown('sistema')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleDropdown('sistema'); } }}
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
          <button onClick={handleLogoutClick} className="btn-logout">Cerrar Sesión</button>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
