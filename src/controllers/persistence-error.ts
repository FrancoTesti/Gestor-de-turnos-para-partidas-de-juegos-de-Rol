import { ForeignKeyConstraintViolationException, UniqueConstraintViolationException } from '@mikro-orm/core';
import type { Response } from 'express';
export function persistenceError(error: unknown, res: Response): boolean {
  if (error instanceof ForeignKeyConstraintViolationException) {
    res.status(409).json({ message: 'El registro tiene datos relacionados. Resolvé esas relaciones antes de eliminarlo.' }); return true;
  }
  if (error instanceof UniqueConstraintViolationException) {
    res.status(409).json({ message: 'Ese registro ya existe' }); return true;
  }
  return false;
}
