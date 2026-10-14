export const VENTA_MIN_PORCENTAJE = 70;
export const VENTA_MAX_PORCENTAJE = 100;

/**
 * Calcula el rango de precio permitido para vender un objeto (70 % a 100 % de su valor base).
 * Redondeo para precios enteros:
 * - Mínimo: Math.ceil(valor * 0.70) asegura que el precio no baje del 70 % redondeado al entero superior.
 * - Máximo: Math.floor(valor * 1.00) asegura que el precio no supere el 100 % del valor del objeto.
 */
export function rangoVenta(valor: number) {
  return {
    minimo: Math.ceil(valor * VENTA_MIN_PORCENTAJE / 100),
    maximo: Math.floor(valor * VENTA_MAX_PORCENTAJE / 100),
  };
}

