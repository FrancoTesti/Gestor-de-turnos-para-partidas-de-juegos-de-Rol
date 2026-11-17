import { useCallback, useEffect } from 'react';
import { CloseIcon } from './Icons';
import './Alert.css';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  onCerrar?: () => void;
}

export default function Alert({ type, message, onClose, onCerrar }: AlertProps) {
  const cerrar = useCallback(() => {
    if (onClose) onClose();
    if (onCerrar) onCerrar();
  }, [onClose, onCerrar]);

  useEffect(() => {
    if (!onClose && !onCerrar) return;
    const timer = window.setTimeout(cerrar, 3000);
    return () => window.clearTimeout(timer);
  }, [onClose, onCerrar, cerrar]);

  return (
    <div className={`alert alert-${type}`} role="alert">
      <span className="alert-message">{message}</span>
      {(onClose || onCerrar) && (
        <button className="alert-close" onClick={cerrar} aria-label="Cerrar alerta">
          <CloseIcon size={14} />
        </button>
      )}
    </div>
  );
}
