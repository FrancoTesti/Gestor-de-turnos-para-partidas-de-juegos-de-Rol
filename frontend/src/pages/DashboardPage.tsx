import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function DashboardPage() {
  const { usuarioLogueado, usuarios, jugadores, anfitriones, rolDe } = useUser();
  const navigate = useNavigate();

  // Si no está logueado, redirige a login
  if (!usuarioLogueado) {
    navigate('/login');
    return null;
  }

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', fontFamily: 'sans-serif', color: 'black' }}>
      <h2>Dashboard</h2>

      <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: 4, marginBottom: '1rem', color: 'black' }}>
        <p>
          <strong>Sesión activa:</strong> {usuarioLogueado.nickname}
        </p>
        <p>
          <strong>Rol:</strong> {rolDe(usuarioLogueado.idUsuario)}
        </p>
      </div>

      <h3>Usuarios registrados</h3>
      {usuarios.length === 0 ? (
        <p>No hay usuarios registrados aún.</p>
      ) : (
        <ul>
          {usuarios.map((u) => (
            <li key={u.idUsuario}>
              {u.nickname} — {rolDe(u.idUsuario)}
            </li>
          ))}
        </ul>
      )}

      <hr />

      <h3>Estadísticas</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', color: '#161616 '}}>
        <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: 4 }}>
          <strong>Usuarios</strong>
          <p style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{usuarios.length}</p>
        </div>
        <div style={{ background: '#e8f5e9', padding: '1rem', borderRadius: 4 }}>
          <strong>Jugadores</strong>
          <p style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{jugadores.length}</p>
        </div>
        <div style={{ background: '#fff3e0', padding: '1rem', borderRadius: 4 }}>
          <strong>Anfitriones</strong>
          <p style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{anfitriones.length}</p>
        </div>
      </div>
    </div>
  );
}
