import 'dotenv/config';
import mysql from 'mysql2/promise';

// Lee una variable del .env y falla con un mensaje claro si no está.
function requerido(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(`Falta la variable ${nombre} en el archivo .env`);
  }
  return valor;
}

export const pool = mysql.createPool({
  host: requerido('DB_HOST'),
  user: requerido('DB_USER'),
  password: requerido('DB_PASSWORD'),
  database: requerido('DB_NAME'),
  port: Number(requerido('DB_PORT')),
});