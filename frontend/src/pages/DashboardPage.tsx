import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Loading from '../components/ui/Loading';

export default function DashboardPage() {
  const { usuarioLogueado, usuarios, jugadores, anfitriones, rolDe, cargandoSesion } = useUser();
  const [paginaActual, setPaginaActual] = useState(1);
  const ITEMS_POR_PAGINA = 20;

  if (cargandoSesion) {
    return (
      <div style={{ width: '100%', maxWidth: 1040, margin: '1rem auto', padding: '0 0.75rem', boxSizing: 'border-box' }}>
        <Loading message="Cargando panel de control..." />
      </div>
    );
  }

  // Si no está logueado, redirige a login
  if (!usuarioLogueado) {
    return null;
  }

  const rol = rolDe(usuarioLogueado.idUsuario);
  const numberFormatter = new Intl.NumberFormat('es-AR');

  const jugadoresValidos = jugadores.filter(j => usuarios.some(u => u.idUsuario === j.idUsuario));
  const anfitrionesValidos = anfitriones.filter(a => usuarios.some(u => u.idUsuario === a.idUsuario));

  const totalPaginas = Math.ceil(usuarios.length / ITEMS_POR_PAGINA) || 1;
  const paginaValida = Math.min(Math.max(1, paginaActual), totalPaginas);
  const inicio = (paginaValida - 1) * ITEMS_POR_PAGINA;
  const usuariosPaginados = usuarios.slice(inicio, inicio + ITEMS_POR_PAGINA);

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
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--success-text)', background: 'var(--success-bg)', padding: '0.2rem 0.6rem', borderRadius: '9999px', border: '1px solid var(--success-border)', marginBottom: '0.6rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success-solid)', boxShadow: '0 0 8px var(--success-solid)' }}></span>
                Conexión activa
              </span>
              <h3 style={{ margin: '0.1rem 0 0.25rem', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-h)', letterSpacing: '-0.02em' }}>
                {usuarioLogueado.nickname}
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Panel de control de partidas y personajes
              </p>
            </div>
            <span className={`badge badge-${rol}`}>
              {rol === 'anfitrion' ? 'Anfitrión' : rol === 'jugador' ? 'Jugador' : 'Usuario'}
            </span>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', alignItems: 'center' }}>
            <div style={{ fontSize: '1.05rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>ID Usuario: </span>
              <strong style={{ color: 'var(--text-h)', fontFamily: 'var(--mono)', fontSize: '1.15rem' }}>#{usuarioLogueado.idUsuario}</strong>
            </div>
            <div style={{ fontSize: '1.05rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Rol actual: </span>
              <strong style={{ color: 'var(--accent-text)', textTransform: 'capitalize', fontSize: '1.15rem' }}>{rol}</strong>
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
              Partidas Activas
            </Link>
            <Link to="/characters" className="btn btn-secondary" style={{ justifyContent: 'flex-start', fontSize: '0.85rem' }}>
              Mis Personajes
            </Link>
            <Link to="/classes" className="btn btn-secondary" style={{ justifyContent: 'flex-start', fontSize: '0.85rem' }}>
              Catálogo de Clases
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
            {numberFormatter.format(jugadoresValidos.length)}
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
            {numberFormatter.format(anfitrionesValidos.length)}
          </p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Masters / Creadores de mesas
          </span>
        </div>

        {/* Celda 6 (12 cols): Directorio de Usuarios */}
        <div className="bento-card bento-col-12">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
                Directorio de usuarios registrados
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Máximo {ITEMS_POR_PAGINA} usuarios por página
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }} className="tabular-nums">
                Total: {usuarios.length} {usuarios.length === 1 ? 'usuario' : 'usuarios'} {totalPaginas > 1 ? `(Pág. ${paginaValida} de ${totalPaginas})` : ''}
              </span>
            </div>
          </div>

          {usuarios.length === 0 ? (
            <div className="empty-state">
              <p style={{ margin: 0, fontStyle: 'italic' }}>No hay usuarios registrados aún.</p>
            </div>
          ) : (
            <>
              <ul style={{
                margin: 0,
                padding: 0,
                listStyle: 'none',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '0.75rem',
                minHeight: '280px',
                alignContent: 'start',
              }}>
                {usuariosPaginados.map((u) => (
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

              {totalPaginas > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '1.25rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}
                    onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                    disabled={paginaValida === 1}
                  >
                    ← Anterior
                  </button>

                  <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={num === paginaValida ? 'btn btn-primary' : 'btn btn-secondary'}
                        style={{
                          minWidth: '2rem',
                          height: '2rem',
                          padding: '0 0.5rem',
                          fontSize: '0.85rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onClick={() => setPaginaActual(num)}
                        aria-current={num === paginaValida ? 'page' : undefined}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}
                    onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                    disabled={paginaValida === totalPaginas}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
