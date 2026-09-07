import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const derive = promisify(scrypt);
// 99 caracteres: compatible con la columna existente de 100.
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const key = await derive(password, salt, 32) as Buffer;
  return `s$${salt}$${key.toString('hex')}`;
}

export function isPasswordHash(value: string): boolean {
  return /^s\$[a-f0-9]{32}\$[a-f0-9]{64}$/.test(value);
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  if (!isPasswordHash(encoded)) return false;
  const [, salt, hash] = encoded.split('$');
  const actual = await derive(password, salt, 32) as Buffer;
  return timingSafeEqual(actual, Buffer.from(hash, 'hex'));
}
