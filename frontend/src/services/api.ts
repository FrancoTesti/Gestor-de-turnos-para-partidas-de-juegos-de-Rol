export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}
export async function api<T>(path: string, method = 'GET', data?: unknown): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method, credentials: 'same-origin',
    ...(data !== undefined ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) } : {}),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.errors?.map((e: { campo: string; mensaje: string }) => `${e.campo}: ${e.mensaje}`).join('; ');
    throw new ApiError(response.status, detail || body?.message || `Error HTTP ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
