import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function NotFoundPage() {
  const { usuarioLogueado } = useUser();
  const { pathname } = useLocation();

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <section style={{
        padding: '2.5rem 2rem',
        maxWidth: '520px',
        width: '100%',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }} aria-hidden="true">🗺️</div>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.75rem' }}>Página no encontrada</h1>
        <p role="alert" style={{ color: 'var(--error-text)', background: 'var(--error-bg)', border: '1px solid var(--error-border)', padding: '0.65rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontWeight: 500 }}>
          No existe ninguna sección en {pathname}.
        </p>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Revisá la dirección escrita o volvé a una sección disponible del gestor.
        </p>
        <div>
          {usuarioLogueado ? (
            <Link to="/dashboard" className="btn-primary" style={{ display: 'inline-flex', padding: '0.65rem 1.25rem' }}>
              Volver al dashboard
            </Link>
          ) : (
            <Link to="/login" className="btn-primary" style={{ display: 'inline-flex', padding: '0.65rem 1.25rem' }}>
              Ir al inicio de sesión
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
