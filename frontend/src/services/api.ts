export const SESSION_EXPIRED_EVENT = 'rpg:session-expired';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}
export async function api<T>(path: string, method = 'GET', data?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
    method, credentials: 'same-origin',
    ...(data !== undefined ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) } : {}),
    });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. Revisá tu conexión e intentá nuevamente.');
  }
  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login' && path !== '/auth/register') {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    const body = await response.json().catch(() => null);
    const detail = Array.isArray(body?.errors) ? body.errors
      .filter((e: unknown): e is { campo: string; mensaje: string } => !!e && typeof e === 'object' && 'campo' in e && 'mensaje' in e && typeof e.campo === 'string' && typeof e.mensaje === 'string')
      .map((e: { campo: string; mensaje: string }) => `${e.campo}: ${e.mensaje}`).join('; ') : '';
    throw new ApiError(response.status, detail || (typeof body?.message === 'string' ? body.message : `Error HTTP ${response.status}`));
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
