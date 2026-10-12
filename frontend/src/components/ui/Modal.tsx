import React, { useEffect } from 'react';
import { CloseIcon } from './Icons';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  children?: React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  onClose?: () => void;
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
  onClose,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'confirm',
}: ModalProps) {
  const handleCancel = () => {
    if (onCancel) onCancel();
    if (onClose) onClose();
  };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel} role="presentation">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={handleCancel} aria-label="Cerrar">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="modal-body">
          {message && <p>{message}</p>}
          {children}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={handleCancel}
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
