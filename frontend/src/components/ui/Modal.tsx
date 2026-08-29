import React from 'react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  children?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'confirm' | 'info';
}

export default function Modal({
  isOpen,
  title,
  message,
  children,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'confirm',
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} role="presentation">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onCancel} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {message && <p>{message}</p>}
          {children}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            aria-label={cancelText}
          >
            {cancelText}
          </button>
          <button
            className={`btn btn-${type === 'confirm' ? 'primary' : 'info'}`}
            onClick={onConfirm}
            aria-label={confirmText}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
