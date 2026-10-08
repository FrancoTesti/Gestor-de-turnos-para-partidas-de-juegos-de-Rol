import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/setup.cjs',
  workers: 1,
  // 60 s alcanza con una base local o cercana. Contra una base lejana (ej. Supabase desde otro continente)
  // cada consulta cuesta ~190 ms: E2E_TIMEOUT_MS permite ampliarlo sin tocar el código.
  timeout: Number(process.env.E2E_TIMEOUT_MS ?? 60_000),
  use: {
    baseURL: 'http://127.0.0.1:5174',
    browserName: 'chromium',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
