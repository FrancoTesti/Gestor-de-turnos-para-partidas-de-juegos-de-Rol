import type { ReactNode } from 'react';
import Alert from './Alert';

export type ErrorCategory = 'validation' | 'not_found' | 'conflict' | 'auth' | 'network' | 'server';

export interface ClassifiedError {
  category: ErrorCategory;
  title: string;
  message: string;
  alertType: 'warning' | 'error' | 'info';
}

export function classifyError(error: unknown): ClassifiedError {
  const rawMessage = typeof error === 'string'
    ? error
    : error instanceof Error
      ? error.message
      : 'No se pudo completar la operación.';

  const status = error && typeof error === 'object' && 'status' in error && typeof (error as { status: unknown }).status === 'number'
    ? (error as { status: number }).status
    : undefined;

  if (status === 0 || /no se pudo conectar|no está respondiendo|red|network/i.test(rawMessage)) {
    return {
      category: 'network',
      title: 'Error de Conexión',
      message: rawMessage,
      alertType: 'error',
    };
  }

  if (status === 401 || status === 403 || /no autorizado|permiso|prohibido|anfitrión propietario|dueño/i.test(rawMessage)) {
    return {
      category: 'auth',
      title: 'Permiso Denegado',
      message: rawMessage,
      alertType: 'error',
    };
  }

  if (status === 404 || /no encontrad[oa]|no existe/i.test(rawMessage)) {
    return {
      category: 'not_found',
      title: 'Recurso No Encontrado',
      message: rawMessage,
      alertType: 'info',
    };
  }

  if (status === 409 || /ya existe|en uso|en curso|finalizada|ocupad[oa]|insuficiente|datos relacionados/i.test(rawMessage)) {
    return {
      category: 'conflict',
      title: 'Conflicto de Regla de Negocio',
      message: rawMessage,
      alertType: 'warning',
    };
  }

  if (status === 400 || /inválid[oa]|obligatorio|debe ser|al menos un campo|demasiado grande|demasiado pequeño/i.test(rawMessage)) {
    return {
      category: 'validation',
      title: 'Datos de Entrada Inválidos',
      message: rawMessage,
      alertType: 'warning',
    };
  }

  return {
    category: 'server',
    title: 'Error del Sistema',
    message: rawMessage,
    alertType: 'error',
  };
}

export function renderValidationError(message: string, onClose?: () => void): ReactNode {
  return <Alert type="warning" message={message} onClose={onClose} />;
}

export function renderConflictError(message: string, onClose?: () => void): ReactNode {
  return <Alert type="warning" message={message} onClose={onClose} />;
}

export function renderNotFoundError(message: string, onClose?: () => void): ReactNode {
  return <Alert type="info" message={message} onClose={onClose} />;
}

export function renderAuthError(message: string, onClose?: () => void): ReactNode {
  return <Alert type="error" message={message} onClose={onClose} />;
}

export function renderServerError(message: string, onClose?: () => void): ReactNode {
  return <Alert type="error" message={message} onClose={onClose} />;
}

export function renderAppError(error: unknown, onClose?: () => void): ReactNode {
  if (!error) return null;
  const info = classifyError(error);
  switch (info.category) {
    case 'validation':
      return renderValidationError(info.message, onClose);
    case 'conflict':
      return renderConflictError(info.message, onClose);
    case 'not_found':
      return renderNotFoundError(info.message, onClose);
    case 'auth':
      return renderAuthError(info.message, onClose);
    case 'network':
    case 'server':
    default:
      return renderServerError(info.message, onClose);
  }
}

export function ErrorBanner({ error, onClose }: { error: unknown; onClose?: () => void }) {
  return <>{renderAppError(error, onClose)}</>;
}
