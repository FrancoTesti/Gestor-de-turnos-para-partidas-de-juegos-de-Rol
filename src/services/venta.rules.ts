export const VENTA_MIN_PORCENTAJE = 70;
export const VENTA_MAX_PORCENTAJE = 100;
export function rangoVenta(valor: number) {
  return { minimo: Math.ceil(valor * VENTA_MIN_PORCENTAJE / 100), maximo: Math.floor(valor * VENTA_MAX_PORCENTAJE / 100) };
}
