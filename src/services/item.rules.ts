/**
 * Constante del factor de incremento de valor por nivel (25 % por cada nivel adicional).
 */
export const INCREMENTO_VALOR_POR_NIVEL = 0.25;
export const VALUE_INCREASE_PER_LEVEL = INCREMENTO_VALOR_POR_NIVEL;

/**
 * Calcula el valor escalado de un objeto según su incremento de nivel.
 * Fórmula RPG:
 * - Si el nuevo nivel es mayor al nivel previo, el valor base escala un 25 % por cada nivel de diferencia:
 *   ValorNuevo = Math.round(valorBase * (1 + (nivelNuevo - nivelAnterior) * INCREMENTO_VALOR_POR_NIVEL))
 * - Si el nivel es menor o igual, mantiene el valor base.
 */
export function calculateValueByLevel(valorBase: number, nivelNuevo: number, nivelAnterior = 1): number {
  if (nivelNuevo <= nivelAnterior || valorBase <= 0) return valorBase;
  const factor = 1 + (nivelNuevo - nivelAnterior) * INCREMENTO_VALOR_POR_NIVEL;
  return Math.round(valorBase * factor);
}

export const calcularValorPorNivel = calculateValueByLevel;

