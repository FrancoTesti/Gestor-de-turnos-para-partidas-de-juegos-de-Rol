import React, { useEffect } from 'react';
import { AlertTriangleIcon, CloseIcon } from './Icons';
import './Modal.css';

export interface AvisoModalProps {
  isOpen?: boolean;
  titulo?: string;
  mensaje?: string | null;
  onClose?: () => void;
  onCerrar?: () => void;
  tipo?: 'advertencia' | 'error' | 'info';
}

export default function AvisoModal({
  isOpen,
  titulo = 'Aviso del Sistema',
  mensaje,
  onClose,
  onCerrar,
  tipo = 'advertencia',
}: AvisoModalProps) {
  const cerrar = () => {
    if (onClose) onClose();
    if (onCerrar) onCerrar();
  };

  const estaAbierto = isOpen !== undefined ? (isOpen && Boolean(mensaje)) : Boolean(mensaje);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && estaAbierto) {
        cerrar();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [estaAbierto, onClose, onCerrar]);

  if (!estaAbierto || !mensaje) return null;

  const colorIcono = tipo === 'error' ? 'var(--error-text, #ef4444)' : 'var(--warning-text, #f59e0b)';

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="aviso-modal-titulo"
      onClick={cerrar}
      style={{ zIndex: 1100 }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', textAlign: 'center', padding: '1.75rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-0.5rem' }}>
          <button
            type="button"
            className="modal-close"
            onClick={cerrar}
            aria-label="Cerrar aviso"
            style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--text-muted)' }}
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colorIcono,
            }}
          >
            <AlertTriangleIcon size={26} />
          </div>
        </div>

        <h3 id="aviso-modal-titulo" style={{ margin: '0 0 0.75rem 0', fontSize: '1.25rem', color: 'var(--text-h)' }}>
          {titulo}
        </h3>

        <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text)', fontSize: '0.95rem', lineHeight: 1.5 }}>
          {mensaje}
        </p>

        <button
          type="button"
          className="btn-primary"
          onClick={cerrar}
          autoFocus
          style={{ width: '100%', padding: '0.65rem 1.25rem', fontSize: '0.95rem' }}
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
