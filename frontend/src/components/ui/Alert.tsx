import { useEffect } from 'react';
import './Alert.css';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export default function Alert({ type, message, onClose }: AlertProps) {
  useEffect(() => {
    if (!onClose) return;
    const timer = window.setTimeout(onClose, 3000);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`alert alert-${type}`} role="alert">
      <span className="alert-message">{message}</span>
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Cerrar alerta">
          ✕
        </button>
      )}
    </div>
  );
}
