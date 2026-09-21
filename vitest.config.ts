import { defineConfig } from 'vitest/config';

/**
 * Configuración de las pruebas unitarias del backend.
 * La cobertura se mide sobre las capas con lógica (servicios, controladores, validadores y
 * seguridad). Las entidades y los tipos son declarativos y no aportan al cálculo.
 *
 * Los umbrales arrancan en el valor real medido el 21/9/2026 y sirven de freno contra
 * regresiones, no como objetivo de calidad: las pruebas de integración contra MySQL cubren
 * buena parte de estos archivos y todavía no reportan cobertura. Subirlos es trabajo pendiente
 * del grupo, con su propia rama y su propia medición.
 */
export default defineConfig({
  test: {
    include: ['src/tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      reportsDirectory: 'coverage',
      include: [
        'src/services/**/*.ts',
        'src/controllers/**/*.ts',
        'src/validators/**/*.ts',
        'src/security/**/*.ts',
      ],
      exclude: ['src/**/*.test.ts'],
      thresholds: {
        lines: 30,
        statements: 30,
        functions: 35,
        branches: 24,
      },
    },
  },
});
