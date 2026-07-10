// Acá SÍ va el import, porque el pool está en el otro archivo (db.ts)
import { pool } from './db'; 

export async function obtenerDatos() {
  const [filas] = await pool.query('SELECT nro_contrato AS "Numero contrato" FROM tu_tabla'); 
  return filas;
}