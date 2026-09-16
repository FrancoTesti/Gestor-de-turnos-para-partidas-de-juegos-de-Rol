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
    // 502/503/504 los devuelve el proxy o el servidor caído, no la API: el cuerpo no es
    // JSON nuestro, así que sin este caso la pantalla mostraría "Error HTTP 502" a secas.
    const caido = [502, 503, 504].includes(response.status)
      ? 'El servidor no está respondiendo. Verificá que el backend esté iniciado e intentá nuevamente.'
      : `Error HTTP ${response.status}`;
    throw new ApiError(response.status, detail || (typeof body?.message === 'string' ? body.message : caido));
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
