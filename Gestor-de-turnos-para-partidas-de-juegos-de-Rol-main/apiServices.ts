import { pool } from './db';
import type { ResultSetHeader } from 'mysql2';

export async function crearUsuario(
  nombreUsuario: string,
  contrasenia: string,
  imagen: string,
  nickname: string
): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO usuarios (nombreUsuario, contrasenia, imagen, nickname) VALUES (?, ?, ?, ?)',
    [nombreUsuario, contrasenia, imagen, nickname]
  );
  return result.insertId;
}