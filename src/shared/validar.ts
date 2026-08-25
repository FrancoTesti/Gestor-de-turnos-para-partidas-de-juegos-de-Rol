import type { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod';

/*
Nota: // Zod es una libreria que valida los datos en "tiempo real". 
 Se asegura de que el body traiga exactamente lo que pedimos (ej: que la contraseña 
 tenga mínimo 6 letras) sin que tengamos que programar un montón de "ifs" a mano.
*/

/* Middleware: funcion transversal que valida CUALQUIER esquema de Zod.
Si los datos están mal, frena la petición y devuelve un error 400.
Si están bien, pasa al controlador */
export function validar(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    // safeParse valida los datos recibidos sin que explote el programa
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      return res.status(400).json({
        message: 'Datos de entrada inválidos',
        errors: resultado.error.issues.map((i) => ({
          campo: i.path.join('.') || 'body',
          mensaje: i.message,
        })),
      });
    }

    req.body = resultado.data; // limpiamos y reemplazamos el body para el controlador
    next(); // pasa al siguiente paso (el controlador)
  };
}