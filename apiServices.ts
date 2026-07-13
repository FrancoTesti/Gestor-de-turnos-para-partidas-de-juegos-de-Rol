const pool = require('./db');

async function crearUsuario(nombre:string, email:string) {
  const [result] = await pool.query(
    'INSERT INTO usuarios (nombre, email) VALUES (?, ?)',
    [nombre, email]
  );
  console.log('ID insertado:', result.insertId);
  return result.insertId;
}