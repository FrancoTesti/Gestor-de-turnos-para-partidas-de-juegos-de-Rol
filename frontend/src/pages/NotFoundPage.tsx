import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function NotFoundPage() {
  const { usuarioLogueado } = useUser();
  const { pathname } = useLocation();

  return (
    <section style={{ padding: '2rem', maxWidth: '560px' }}>
      <h1>Página no encontrada</h1>
      <p role="alert">No existe ninguna sección en {pathname}.</p>
      <p>
        Revisá la dirección escrita o volvé a una sección disponible del gestor.
      </p>
      {usuarioLogueado
        ? <Link to="/dashboard">Volver al dashboard</Link>
        : <Link to="/login">Ir al inicio de sesión</Link>}
    </section>
  );
}
