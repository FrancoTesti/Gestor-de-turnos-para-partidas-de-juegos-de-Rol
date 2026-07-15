// menu.ts — Capa de interfaz (consola). Usa el modelo pero vive SEPARADA de él.
// (4) Todo lo que sea prompt/console de ENTRADA está acá, no en las clases.
import { Jugador, Anfitrion, Usuario, crearColeccionesIniciales } from './TP_DSW';
import promptSync from 'prompt-sync';

const pedir = promptSync({ sigint: true }) as (mensaje?: string) => string;

const { jugadores, anfitriones } = crearColeccionesIniciales();

function separador(): void {
  console.log('_'.repeat(50));
}

// Antes esto vivía dentro de Usuario (ingresarNickname / ingresarContrasena).
// Ahora es una función de la UI: pide un valor y lo confirma.
function pedirConConfirmacion(etiqueta: string): string {
  while (true) {
    const valor = pedir(`Ingrese su ${etiqueta}: `);
    separador();
    console.log(`Su ${etiqueta} es: ${valor}`);
    console.log('1- Confirmar');
    console.log('2- Volver a ingresar');
    separador();
    const opcion = pedir('Ingrese el número de opción: ');
    if (opcion === '1') {
      console.log(`${etiqueta} confirmado.`);
      return valor;
    }
  }
}

function registrarJugador(): void {
  const nickname = pedirConConfirmacion('nickname');
  const contrasena = pedirConConfirmacion('contraseña');
  jugadores.push(new Jugador(nickname, '', contrasena, 'activo'));
  console.log('Jugador registrado con éxito.');
}

function registrarAnfitrion(): void {
  const nickname = pedirConConfirmacion('nickname');
  const contrasena = pedirConConfirmacion('contraseña');
  anfitriones.push(new Anfitrion(nickname, '', contrasena));
  console.log('Anfitrión registrado con éxito.');
}

function loguearse(): void {
  const nickname = pedir('Ingrese su nickname: ');
  const contrasena = pedir('Ingrese su contraseña: ');

  const jugador = jugadores.find(j => j.nickname === nickname && j.contrasena === contrasena);
  if (jugador) {
    console.log(`Bienvenido jugador ${jugador.nickname}.`);
    return;
  }

  const anfitrion = anfitriones.find(a => a.nickname === nickname && a.contrasena === contrasena);
  if (anfitrion) {
    console.log(`Bienvenido anfitrión ${anfitrion.nickname}.`);
    return;
  }

  console.log('Usuario no encontrado.');
}

function menuRegistro(): void {
  let seguir = true;
  while (seguir) {
    separador();
    console.log('1- Registrarse como Jugador');
    console.log('2- Registrarse como Anfitrion');
    console.log('3- Volver');
    separador();
    switch (pedir('Ingrese el número de opción: ')) {
      case '1': registrarJugador(); break;
      case '2': registrarAnfitrion(); break;
      case '3': seguir = false; break;
      default: console.log('Opción no válida'); break;
    }
  }
}

function menuPrincipal(): void {
  let seguir = true;
  while (seguir) {
    separador();
    console.log('Seleccione una opción:');
    console.log('1- Loguearse');
    console.log('2- Registrarse');
    console.log('3- Salir');
    separador();
    switch (pedir('Ingrese el número de opción: ')) {
      case '1': loguearse(); break;
      case '2': menuRegistro(); break;
      case '3': seguir = false; console.log('Chau.'); break;
      default: console.log('Opción no válida'); break;
    }
  }

  console.log('Jugadores registrados:', jugadores.map(j => j.nickname));
}

menuPrincipal();