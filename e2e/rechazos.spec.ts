import { test, expect, type Page } from '@playwright/test';
import { crearCatalogoBase, ingresar, registrar, type CatalogoBase } from './helpers';

async function crearPersonaje(page: Page, base: CatalogoBase, nombre: string) {
  const sesion = await page.request.get('/api/auth/me');
  expect(sesion.ok()).toBeTruthy();
  const idUsuarioJugador = (await sesion.json()).usuario.idUsuario as number;
  const respuesta = await page.request.post('/api/personajes', {
    data: { nombreFicticio: nombre, raza: 'Humano', idClase: base.idClase, idPartida: base.idPartida, idUsuarioJugador },
  });
  expect(respuesta.status(), await respuesta.text()).toBe(201);
  return (await respuesta.json()).idPersonaje as number;
}

test('el servidor rechaza reparto incorrecto, doble calificación y segunda sesión en curso', async ({ page, browser }) => {
  await registrar(page, 'host_rechazos');
  await ingresar(page, 'host_rechazos');
  const base = await crearCatalogoBase(page, 'rechazos');

  const jugador = await browser.newPage({ baseURL: 'http://127.0.0.1:5174' });
  try {
    await registrar(jugador, 'jugador_rechazos', 'Jugador');
    await ingresar(jugador, 'jugador_rechazos');
    const idPersonaje = await crearPersonaje(jugador, base, 'Pj Rechazos');

    const jugar = await page.request.post(`/api/sesiones/${base.idPartida}/1/jugar`, { data: { idPersonajes: [idPersonaje] } });
    expect(jugar.status(), await jugar.text()).toBe(200);

    // Una segunda sesión no puede quedar en curso en la misma partida.
    const crearSegunda = await page.request.post('/api/sesiones', { data: { idPartida: base.idPartida, numSesion: 2, duracionSesion: 30 } });
    expect(crearSegunda.status()).toBe(201);
    const jugarSegunda = await page.request.post(`/api/sesiones/${base.idPartida}/2/jugar`, { data: { idPersonajes: [idPersonaje] } });
    expect(jugarSegunda.status()).toBe(409);
    expect(await jugarSegunda.json()).toMatchObject({ message: expect.stringMatching(/sesión en curso/i) });

    const mision = await page.request.post('/api/misiones', {
      data: { idPartida: base.idPartida, numSesion: 1, numMision: 1, descripcion: 'Misión de rechazos', dineroTotal: 100, xpTotal: 50, asistenciaGrupoGrande: 0 },
    });
    expect(mision.status()).toBe(201);

    // En la interfaz, un reparto que no coincide con los totales mantiene el botón deshabilitado.
    await page.goto('/missions');
    const filaMision = page.getByRole('row').filter({ hasText: 'Misión de rechazos' });
    await filaMision.getByRole('button', { name: 'Repartir' }).click();
    await page.getByLabel(/^\$\$:/).fill('10');
    await page.getByLabel(/^XP:/).fill('50');
    await expect(page.getByRole('button', { name: 'Confirmar y Completar Misión', exact: true })).toBeDisabled();
    await expect(page.getByText(/debe coincidir/i)).toBeVisible();

    const repartoIncorrecto = await page.request.post(`/api/misiones/${base.idPartida}/1/1/completar`, {
      data: { recompensas: [{ idPersonaje, dinero: 10, xp: 50 }] },
    });
    // El backend responde 409 cuando el reparto no coincide con los totales de la misión.
    expect(repartoIncorrecto.status()).toBe(409);
    expect(await repartoIncorrecto.json()).toMatchObject({ message: expect.stringMatching(/coincidir exactamente/i) });

    const repartoCorrecto = await page.request.post(`/api/misiones/${base.idPartida}/1/1/completar`, {
      data: { recompensas: [{ idPersonaje, dinero: 100, xp: 50 }] },
    });
    expect(repartoCorrecto.status(), await repartoCorrecto.text()).toBe(200);

    // No se puede completar dos veces la misma misión.
    const repetido = await page.request.post(`/api/misiones/${base.idPartida}/1/1/completar`, {
      data: { recompensas: [{ idPersonaje, dinero: 100, xp: 50 }] },
    });
    expect([400, 409]).toContain(repetido.status());

    const finalizar = await page.request.post(`/api/sesiones/${base.idPartida}/1/finalizar`);
    expect(finalizar.status(), await finalizar.text()).toBe(200);

    // El anfitrión no puede calificarse a sí mismo.
    const autocalificacion = await page.request.post(`/api/sesiones/${base.idPartida}/1/calificar`, { data: { valor: 1 } });
    expect([403, 409]).toContain(autocalificacion.status());

    const primera = await jugador.request.post(`/api/sesiones/${base.idPartida}/1/calificar`, { data: { valor: 1 } });
    expect(primera.status(), await primera.text()).toBe(200);
    const segunda = await jugador.request.post(`/api/sesiones/${base.idPartida}/1/calificar`, { data: { valor: 1 } });
    expect(segunda.status()).toBe(409);
    expect(await segunda.json()).toMatchObject({ message: 'Ya calificaste esta sesión' });
  } finally {
    await jugador.close();
  }
});
