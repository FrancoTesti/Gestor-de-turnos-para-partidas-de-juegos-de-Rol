import './Loading.css';

interface LoadingProps {
  message?: string;
}

export default function Loading({ message = 'Cargando...' }: LoadingProps) {
  return (
    <div className="loading-container" role="status" aria-live="polite">
      <div className="spinner"></div>
      <p className="loading-message">{message}</p>
    </div>
  );
}
