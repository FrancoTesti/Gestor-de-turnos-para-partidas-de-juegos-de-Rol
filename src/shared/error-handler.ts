import type { Response, Request, NextFunction, RequestHandler } from 'express';
import { ForeignKeyConstraintViolationException, UniqueConstraintViolationException } from '@mikro-orm/core';
import { ZodError } from 'zod';
import { HttpError } from '../security/authorization';

// Errores de validación
import { ClassValidationError } from '../validators/class.validator';
import { ItemValidationError } from '../validators/item.validator';
import { MatchValidationError } from '../validators/match.validator';
import { CharacterValidationError } from '../validators/character.validator';
import { PlayerValidationError } from '../validators/player.validator';
import { HostValidationError } from '../validators/host.validator';

// Errores de dominio / servicios
import { HostNotFoundError } from '../services/match.service';
import { UserNotFoundError as HostUserNotFoundError, HostAlreadyExistsError } from '../services/host.service';
import { UserNotFoundError as PlayerUserNotFoundError, PlayerAlreadyExistsError } from '../services/player.service';
import { NicknameInUseError } from '../services/user.service';
import { ReferenceNotFoundError } from '../services/character.service';
import {
  ItemNotFoundError,
  CharacterNotFoundError,
  InventoryNotFoundError,
  ItemNotAvailableError,
  InsufficientMoneyError,
  InventoryFullError,
  PositionOccupiedError,
  InsufficientLevelError,
} from '../services/item.service';

type ErrorConstructor = new (...args: any[]) => any;

interface ErrorRule {
  status: number;
  message?: string | ((err: any) => string);
}

// Mapa de errores por constructor / tipo de clase
const errorRegistry = new Map<ErrorConstructor, ErrorRule>();

export function registerError(ctor: ErrorConstructor, rule: ErrorRule): void {
  errorRegistry.set(ctor, rule);
}

// --- Registro inicial de constructores de error ---

// 400: Validaciones
registerError(ClassValidationError, { status: 400 });
registerError(ItemValidationError, { status: 400 });
registerError(MatchValidationError, { status: 400 });
registerError(CharacterValidationError, { status: 400 });
registerError(PlayerValidationError, { status: 400 });
registerError(HostValidationError, { status: 400 });

// 404: No encontrados
registerError(HostNotFoundError, { status: 404 });
registerError(HostUserNotFoundError, { status: 404 });
registerError(PlayerUserNotFoundError, { status: 404 });
registerError(ReferenceNotFoundError, { status: 404 });
registerError(ItemNotFoundError, { status: 404 });
registerError(CharacterNotFoundError, { status: 404 });
registerError(InventoryNotFoundError, { status: 404 });

// 409: Conflictos de regla de negocio o restricciones
registerError(HostAlreadyExistsError, { status: 409 });
registerError(PlayerAlreadyExistsError, { status: 409 });
registerError(NicknameInUseError, { status: 409 });
registerError(ItemNotAvailableError, { status: 409 });
registerError(InsufficientMoneyError, { status: 409 });
registerError(InventoryFullError, { status: 409 });
registerError(PositionOccupiedError, { status: 409 });
registerError(InsufficientLevelError, { status: 409 });
registerError(UniqueConstraintViolationException, { status: 409, message: 'Ese registro ya existe' });
registerError(ForeignKeyConstraintViolationException, {
  status: 409,
  message: 'El registro tiene datos relacionados. Resolvé esas relaciones antes de eliminarlo.',
});

/**
 * Resuelve y responde errores basándose en el tipo del constructor del error,
 * evitando cadenas de `if (err instanceof ...)` hardcodeadas en cada controlador.
 */
export function handleControllerError(error: unknown, res: Response, fallbackMessage: string): void {
  if (error instanceof HttpError) {
    res.status(error.status).json({ message: error.message });
    return;
  }

  if (error && typeof error === 'object') {
    // Buscar en el registro por constructor o prototipo
    for (const [ctor, rule] of errorRegistry.entries()) {
      if (error instanceof ctor) {
        const message = typeof rule.message === 'function'
          ? rule.message(error)
          : rule.message ?? (error as Error).message;
        res.status(rule.status).json({ message });
        return;
      }
    }
  }

  console.error(fallbackMessage, error);
  res.status(500).json({ message: fallbackMessage });
}

/**
 * Middleware para validar IDs numéricos en parámetros de ruta (ej: /:id).
 */
export function validateParamId(paramName: string = 'id'): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const paramVal = req.params[paramName];
    const raw = Array.isArray(paramVal) ? paramVal[0] : paramVal;
    if (!raw || typeof raw !== 'string' || !/^\d+$/.test(raw)) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }
    const num = Number(raw);
    if (!Number.isSafeInteger(num) || num <= 0) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }
    next();
  };
}
