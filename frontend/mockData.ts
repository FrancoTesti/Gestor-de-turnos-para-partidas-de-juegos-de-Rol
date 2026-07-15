import type {
  Usuario, Jugador, Anfitrion, Partida, Sesion, Mision, Clase,
  Tienda, Personaje, Inventario, Personaje_Sesion, Objeto
} from './src/interfaces.ts'; // Asegúrense de que la ruta a sus interfaces sea la correcta

// 1. CLASES (Los arquetipos del juego)
export const MOCK_CLASES: Clase[] = [
  { idClase: 1, nombreClase: "Guerrero", descripcionClase: "Especialista en combate cuerpo a cuerpo y resistencia física." },
  { idClase: 2, nombreClase: "Mago", descripcionClase: "Maestro de los elementos y conjuros de alto alcance." },
  { idClase: 3, nombreClase: "Pícaro", descripcionClase: "Experto en sigilo, trampas y ataques furtivos desde las sombras." }
];

// 2. USUARIOS (Con sus sombreros opcionales)
export const MOCK_USUARIOS: Usuario[] = [
  {
    idUsuario: 1,
    nombreUsuario: "tomi_master",
    contrasena: "clave123",
    imagen: "https://api.dicebear.com/7.x/bottts/svg?seed=tomi",
    nickname: "Tomi El Master",
  },
  {
    idUsuario: 2,
    nombreUsuario: "sofi_rol",
    contrasena: "sofi456",
    imagen: "https://api.dicebear.com/7.x/bottts/svg?seed=sofi",
    nickname: "Sofi_Guerrera",
  },
  {
    idUsuario: 3,
    nombreUsuario: "carlos_narrador",
    contrasena: "carlos789",
    imagen: "https://api.dicebear.com/7.x/bottts/svg?seed=carlos",
    nickname: "CarlosDM",
  }
];
// Tomi (1) y Sofi (2) son jugadores
export const MOCK_JUGADORES: Jugador[] = [
  { idUsuario: 1, estado: true },
  { idUsuario: 2, estado: true }
];

// Tomi (1) tambien organiza, y Carlos (3)
export const MOCK_ANFITRIONES: Anfitrion[] = [
  { idUsuario: 1, cantPartidasActuales: 1, karma: 98 },
  { idUsuario: 3, cantPartidasActuales: 1, karma: 85 }
];
// 3. PARTIDAS (Campañas)
export const MOCK_PARTIDAS: Partida[] = [
  {
    idPartida: 101,
    nombre: "Las Crónicas de Eldoria",
    estado: true, // Activa
    limiteJugadores: 4,
    contrasenia: "", // Sin contrasenia
    idUsuario_Anfitrion: 1 // La organiza Tomi
  },
  {
    idPartida: 102,
    nombre: "La Tumba del Horror",
    estado: true,
    limiteJugadores: 3,
    contrasenia: "gandalf_rules", // Con contrasenia
    idUsuario_Anfitrion: 3 // La organiza Carlos
  }
];

// 4. SESIONES (Reuniones de juego dentro de una partida)
export const MOCK_SESIONES: Sesion[] = [
  { idPartida: 101, numSesion: 1, duracionSesion: 180, cantJugadores: 2, estadoSesion: 2 }, // Finalizada
  { idPartida: 101, numSesion: 2, duracionSesion: 120, cantJugadores: 2, estadoSesion: 1 }, // En curso
  { idPartida: 102, numSesion: 1, duracionSesion: 240, cantJugadores: 1, estadoSesion: 2 }
];

// 5. MISIONES (Objetivos dentro de las sesiones)
export const MOCK_MISIONES: Mision[] = [
  {
    idPartida: 101,
    numSesion: 1,
    numMision: 1,
    descripcion: "Limpiar el sótano de la taberna plagado de ratas gigantes.",
    dineroTotal: 100,
    xpTotal: 200,
    xpOtorgadoJugadores: 100,
    dineroOtorgadoAJugadores: 50,
    asistenciaGrupoGrande: 1,
    estado: true // Completada
  },
  {
    idPartida: 101,
    numSesion: 2,
    numMision: 2,
    descripcion: "Rescatar al herrero del campamento de trasgos en el bosque.",
    dineroTotal: 500,
    xpTotal: 1000,
    xpOtorgadoJugadores: 0,
    dineroOtorgadoAJugadores: 0,
    asistenciaGrupoGrande: 2,
    estado: false // Activa / No completada aún
  }
];

// 6. TIENDAS
export const MOCK_TIENDAS: Tienda[] = [
  { idTienda: 1, claseTienda: "Armería", nombre: "La tabernera del Guerrero", idClase: 1 }, // Orientada a Guerreros
  { idTienda: 2, claseTienda: "Bazar Arcano", nombre: "El oráculo de Delfos", idClase: 2 } // Orientada a Magos
];

// 7. PERSONAJES (Hojas de personaje vinculadas a usuario, clase y partida)
export const MOCK_PERSONAJES: Personaje[] = [
  {
    nivel: 6,
    idPersonaje: 501,
    nombreFicticio: "Thorin EscudoDeRoble",
    raza: "Enano",
    xp: 450,
    dinero: 120,
    idClase: 1, // Guerrero
    idUsuario_Jugador: 2, // Le pertenece a Sofi
    idPartida: 101 // Está jugando en la partida de Tomi
  },
  {
    nivel: 4,
    idPersonaje: 502,
    nombreFicticio: "Elminster Jr",
    raza: "Humano",
    xp: 900,
    dinero: 350,
    idClase: 2, // Mago
    idUsuario_Jugador: 1, // Le pertenece a Tomi (como jugador)
    idPartida: 102 // Está jugando en la partida de Carlos
  }
];

// 8. INVENTARIOS (Espacio de mochila de cada personaje)
export const MOCK_INVENTARIOS: Inventario[] = [
  { numInventario: 1, cantidadEspacio: 20, idPersonaje: 501 }, // Mochila de Thorin
  { numInventario: 2, cantidadEspacio: 15, idPersonaje: 502 }  // Mochila de Elminster
];

// 9. PERSONAJE_SESION (Historial de asistencia y comportamiento)
export const MOCK_PERSONAJE_SESION: Personaje_Sesion[] = [
  { idPersonaje: 501, idPartida: 101, numSesion: 1, dioKarma: true },
  { idPersonaje: 501, idPartida: 101, numSesion: 2, dioKarma: false }
];

// 10. OBJETOS (Ítems que pueden estar en tiendas o en el inventario de un personaje)
export const MOCK_OBJETOS: Objeto[] = [
  {
    idObjeto: 901,
    valor: 80,
    descripcion: "Espada de hierro templado, ideal para cortar enemigos.",
    nombre: "Espada Bastarda",
    nivelObjeto: 1,
    tipoObjeto: "Arma",
    idTienda: 1,
    idPersonaje: 501, // La tiene equipada Thorin
    numInventario: 1, // Está guardada en su inventario 1
    posicion: 1
  },
  {
    idObjeto: 902,
    valor: 150,
    descripcion: "Restaura 50 puntos de Maná de forma instantánea.",
    nombre: "Poción de Maná Mayor",
    nivelObjeto: 2,
    tipoObjeto: "Consumible",
    idTienda: 2,
    idPersonaje: 502, // La tiene Elminster
    numInventario: 2,
    posicion: 1
  }
];