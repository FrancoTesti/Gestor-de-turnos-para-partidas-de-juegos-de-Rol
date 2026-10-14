export const VENTA_MIN_PORCENTAJE = 50;
export const VENTA_MAX_PORCENTAJE = 80;

/**
 * Calcula el rango de precio permitido para vender un objeto (50 % a 80 % de su valor base).
 * Redondeo para precios enteros:
 * - Mínimo: Math.ceil(valor * 0.50) asegura que el precio no baje del 50 % redondeado al entero superior.
 * - Máximo: Math.floor(valor * 0.80) asegura que el precio no supere el 80 % del valor del objeto.
 */
export function rangoVenta(valor: number) {
  const minimo = Math.ceil(valor * VENTA_MIN_PORCENTAJE / 100);
  const maximo = Math.max(minimo, Math.floor(valor * VENTA_MAX_PORCENTAJE / 100));
  return { minimo, maximo };
}

