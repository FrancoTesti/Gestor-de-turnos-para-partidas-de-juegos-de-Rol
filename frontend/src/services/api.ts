export const SESSION_EXPIRED_EVENT = 'rpg:session-expired';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}
export function traducirErrorEspanol(msg: string): string {
  if (!msg) return 'Ocurrió un error inesperado.';

  const partes: string[] = [];

  if (/\bnumSesion\b.*too big|too big.*\bnumSesion\b/i.test(msg)) {
    partes.push('El número de sesión es demasiado grande (máximo 2.147.483.647).');
  }
  if (/\bduracionSesion\b.*too big|too big.*\bduracionSesion\b/i.test(msg)) {
    partes.push('La duración de la sesión es demasiado grande (máximo 2.147.483.647 minutos).');
  }
  if (/\bprecio\b.*too big|too big.*\bprecio\b/i.test(msg)) {
    partes.push('El precio es demasiado grande (máximo $2.147.483.647).');
  }
  if (/\blimiteJugadores\b.*too big|too big.*\blimiteJugadores\b/i.test(msg)) {
    partes.push('El límite de jugadores es demasiado grande (máximo 2.147.483.647).');
  }
  if (/\bdinero(Total)?\b.*too big|too big.*\bdinero(Total)?\b/i.test(msg)) {
    partes.push('La cantidad de dinero es demasiado grande (máximo 2.147.483.647).');
  }
  if (/\bxp(Total)?\b.*too big|too big.*\bxp(Total)?\b/i.test(msg)) {
    partes.push('La cantidad de XP es demasiado grande (máximo 2.147.483.647).');
  }
  if (/\bcantidadEspacio\b.*too big|too big.*\bcantidadEspacio\b/i.test(msg)) {
    partes.push('La capacidad del inventario es demasiado grande (máximo 1.000).');
  }
  if (/\bnumMision\b.*too big|too big.*\bnumMision\b/i.test(msg)) {
    partes.push('El número de misión es demasiado grande (máximo 2.147.483.647).');
  }

  if (partes.length > 0) return partes.join(' ');

  if (/too big/i.test(msg)) {
    return 'Uno de los números ingresados es demasiado grande. El valor máximo permitido es 2.147.483.647.';
  }
  if (/too small/i.test(msg)) {
    if (/\bidPartida\b|\bnumSesion\b/i.test(msg)) {
      return 'Debes seleccionar una partida y sesión en curso válidas.';
    }
    return 'Uno de los números ingresados es demasiado pequeño. Debe ser mayor a 0.';
  }
  if (/expected number/i.test(msg) || /invalid_type/i.test(msg)) {
    return 'El valor ingresado debe ser un número válido.';
  }

  return msg;
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
    const rawMessage = detail || (typeof body?.message === 'string' ? body.message : caido);
    throw new ApiError(response.status, traducirErrorEspanol(rawMessage));
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
