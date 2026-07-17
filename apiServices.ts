import { pool } from './db';
import type { ResultSetHeader } from 'mysql2';

export async function crearUsuario(
  nombreUsuario: string,
  contrasena: string,
  imagen: string,
  nickname: string
): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO usuarios (nombreUsuario, contrasena, imagen, nickname) VALUES (?, ?, ?, ?)',
    [nombreUsuario, contrasena, imagen, nickname]
  );
  return result.insertId;
}