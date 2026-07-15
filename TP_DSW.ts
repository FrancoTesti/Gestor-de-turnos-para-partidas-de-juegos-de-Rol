// TP_DSW.ts — Modelo de dominio del Gestor de turnos para partidas de Rol
// Módulo de clases puro: NO pide datos por consola (eso vive en menu.ts).

export class Usuario {

  private static contadorId = 0;
  
  idUsuario: number;
  nickname: string;
  nombreUsuario: string;
  contrasena: string;
  imagen: string | null;

  constructor(
    nickname = '',
    nombreUsuario = '',
    contrasena = '',
    imagen: string | null = null
  ) {
    this.idUsuario = Usuario.contadorId;
    Usuario.contadorId++;
    this.nickname = nickname;
    this.nombreUsuario = nombreUsuario;
    this.contrasena = contrasena;
    this.imagen = imagen;
  }

  cambiarContrasena(nuevaContrasena: string): void {
    this.contrasena = nuevaContrasena;
  }

  cambiarImagen(nuevaImagen: string | null): void {
    this.imagen = nuevaImagen;
  }
}

export class Inventario {

  private static contInventario = 0;

  numInventario: number;
  cantidadDeEspacios: number;
  objetos: Objeto[];

  constructor(cantidadDeEspacios: number) {
    this.numInventario = Inventario.contInventario;
    Inventario.contInventario++;
    this.cantidadDeEspacios = cantidadDeEspacios;
    this.objetos = [];
  }

  agregarObjeto(objeto: Objeto): boolean {
    if (this.objetos.length >= this.cantidadDeEspacios) {
      console.log('Inventario lleno, tira algo.');
      return false;
    }

    this.objetos.push(objeto);
    return true;
  }
}

export class Objeto {
  idObjeto: number;
  nombre: string;
  descripcion: string;
  valor: number;
  nivelObjeto: number;
  tipoObjeto?: string; // "armadura" | "espada" | "escudo" | ...

  constructor(
    id: number,
    nombre: string,
    descripcion: string,
    valor: number,
    nivelObjeto: number,
    tipoObjeto?: string
  ) {
    this.idObjeto = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.valor = valor;
    this.nivelObjeto = nivelObjeto;
    this.tipoObjeto = tipoObjeto;
  }
}

export class Clase {
  idClase: number;
  nombreClase: string;
  descripcionClave: string;

  constructor(idClase: number, nombreClase: string, descripcionClave: string) {
    this.idClase = idClase;
    this.nombreClase = nombreClase;
    this.descripcionClave = descripcionClave;
  }
}

export class Mision {
  descripcion: string;
  dineroTotal: number;
  xpTotal: number;
  xpOtorgadoJugadores: number;
  dineroOtorgadoAJugadores: number;
  estado: 'pendiente' | 'completada';

  constructor(
    descripcion: string,
    dineroTotal: number,
    xpTotal: number,
    xpOtorgadoJugadores: number,
    dineroOtorgadoAJugadores: number
  ) {
    this.descripcion = descripcion;
    this.dineroTotal = dineroTotal;
    this.xpTotal = xpTotal;
    this.xpOtorgadoJugadores = xpOtorgadoJugadores;
    this.dineroOtorgadoAJugadores = dineroOtorgadoAJugadores;
    this.estado = 'pendiente';
  }

  completarMision(grupoDePersonajes: Personaje[]): boolean {
    if (this.estado === 'completada') {
      return false;
    }

    grupoDePersonajes.forEach(personaje => personaje.otorgarRecompensaMision(this));
    this.estado = 'completada';
    console.log(`Misión "${this.descripcion}" completada por el grupo.`);
    return true;
  }
}

// (2) Transaccion ahora se usa: registra cada compra/venta de un personaje.
export class Transaccion {
  private static contador = 0;

  idTransaccion: number;
  tipoDeTransaccion: 'compra' | 'venta';
  montoTotal: number;

  constructor(idTransaccion: number, tipoDeTransaccion: 'compra' | 'venta', montoTotal: number) {
    this.idTransaccion = idTransaccion;
    this.tipoDeTransaccion = tipoDeTransaccion;
    this.montoTotal = montoTotal;
  }

  // Fábrica con id autoincremental, para no tener que pasarlo a mano.
  static crear(tipo: 'compra' | 'venta', monto: number): Transaccion {
    Transaccion.contador += 1;
    return new Transaccion(Transaccion.contador, tipo, monto);
  }
}

export class Personaje {
  static razasValidas = [
    'elfo',
    'orco',
    'draconico',
    'humano',
    'enano',
    'gnomo',
    'goliat',
    'mediano',
    'tiefling',
    'aasimar'
  ];

  idPersonaje: number;
  nombreFicticio: string;
  raza: string | null;
  xp: number;
  dinero: number;
  clase: Clase | null; // (3) antes era string
  nivel: number;
  inventario: Inventario | null;
  armadura: Objeto | null;
  espada: Objeto | null;
  escudo: Objeto | null;
  transacciones: Transaccion[];

  constructor(
    idPersonaje: number,
    nombreFicticio: string,
    raza: string,
    xp: number,
    dinero: number,
    clase: Clase | null,
    nivel: number
  ) {
    this.idPersonaje = idPersonaje;
    this.nombreFicticio = nombreFicticio;
    this.raza = Personaje.validarRaza(raza) ? raza.toLowerCase() : null;
    this.xp = xp;
    this.dinero = dinero;
    this.clase = clase;
    this.nivel = nivel;
    this.inventario = null;
    this.armadura = null;
    this.espada = null;
    this.escudo = null;
    this.transacciones = [];
  }

  static validarRaza(raza: unknown): raza is string {
    return typeof raza === 'string' && Personaje.razasValidas.includes(raza.toLowerCase());
  }

  static obtenerRazasValidas(): string[] {
    return [...Personaje.razasValidas];
  }

  obtenerRaza(): string | null {
    return this.raza;
  }

  cambiarRaza(nuevaRaza: string): boolean {
    if (!Personaje.validarRaza(nuevaRaza)) {
      console.log(`Raza inválida: ${nuevaRaza}`);
      return false;
    }

    this.raza = nuevaRaza.toLowerCase();
    return true;
  }

  comprarObjeto(objeto: Objeto): boolean {
    if (this.dinero < objeto.valor || this.inventario === null) {
      return false;
    }

    if (this.inventario.agregarObjeto(objeto)) {
      this.dinero -= objeto.valor;
      this.transacciones.push(Transaccion.crear('compra', objeto.valor)); // (2)
      return true;
    }

    return false;
  }

  // (1) Método recuperado: vender un objeto del inventario.
  venderObjeto(idObjeto: number, factor: number): Objeto | null {
    if (this.inventario === null) {
      return null;
    }

    const index = this.inventario.objetos.findIndex(obj => obj.idObjeto === idObjeto);
    if (index === -1) {
      return null;
    }

    const objeto = this.inventario.objetos[index];
    this.inventario.objetos.splice(index, 1); // lo saca del inventario

    const monto = Math.floor(objeto.valor * factor);
    this.dinero += monto;
    this.transacciones.push(Transaccion.crear('venta', monto)); // (2)
    return objeto; // lo devuelve para que la tienda lo reponga en stock
  }

  // (1) Método recuperado: equipar armadura / espada / escudo.
  equiparObjeto(idObjeto: number): boolean {
    if (this.inventario === null) {
      return false;
    }

    const idx = this.inventario.objetos.findIndex(item => item.idObjeto === idObjeto);
    if (idx === -1) {
      console.log('No tenés ese objeto en el inventario.');
      return false;
    }

    const objeto = this.inventario.objetos[idx];
    if (objeto.nivelObjeto > this.nivel) {
      console.log(
        `No tenés el nivel suficiente. Tenés ${this.nivel} y precisás ${objeto.nivelObjeto}.`
      );
      return false;
    }

    this.inventario.objetos.splice(idx, 1);
    switch (objeto.tipoObjeto) {
      case 'armadura':
        if (this.armadura) this.inventario.objetos.push(this.armadura);
        this.armadura = objeto;
        return true;
      case 'espada':
        if (this.espada) this.inventario.objetos.push(this.espada);
        this.espada = objeto;
        return true;
      case 'escudo':
        if (this.escudo) this.inventario.objetos.push(this.escudo);
        this.escudo = objeto;
        return true;
      default:
        this.inventario.objetos.push(objeto); // no se equipa: lo devolvemos
        console.log('Ese objeto no se puede equipar.');
        return false;
    }
  }

  otorgarRecompensaMision(mision: Mision): void {
    this.xp += mision.xpOtorgadoJugadores;
    this.dinero += mision.dineroOtorgadoAJugadores;
    this.nivel = Math.floor(this.xp / 1000) + 1;
  }
}

export class Jugador extends Usuario {
  estado: string;
  personajes: Personaje[];

  constructor(
    nickname = '',
    nombreUsuario = '',
    contrasena = '',
    estado = '',
    imagen: string | null = null
  ) {
    super(nickname, nombreUsuario, contrasena, imagen);
    this.estado = estado;
    this.personajes = [];
  }

  // (3) clase ahora es una instancia de Clase (o null).
  crearPersonaje(
    idPersonaje: number,
    nombreFicticio: string,
    raza: string,
    clase: Clase | null
  ): Personaje {
    const nuevoPersonaje = new Personaje(idPersonaje, nombreFicticio, raza, 0, 0, clase, 1);
    nuevoPersonaje.inventario = new Inventario(20);
    this.personajes.push(nuevoPersonaje);
    return nuevoPersonaje;
  }
}

export class Anfitrion extends Usuario {
  karma: number;
  cantPartidasActuales: number;
  partidas: Partida[];

  constructor(
    nickname = '',
    nombreUsuario = '',
    contrasena = '',
    karma = 0,
    cantPartidasActuales = 0,
    imagen: string | null = null
  ) {
    super(nickname, nombreUsuario, contrasena, imagen);
    this.karma = karma;
    this.cantPartidasActuales = cantPartidasActuales;
    this.partidas = [];
  }

  crearPartida(id: number, nombre: string, limiteJugadores: number, contrasena: string | null = null): Partida {
    const nuevaPartida = new Partida(id, nombre, 'activa', limiteJugadores, this, contrasena);
    this.partidas.push(nuevaPartida);
    this.cantPartidasActuales += 1;
    return nuevaPartida;
  }

  terminarPartida(idPartida: number): void {
    const partida = this.partidas.find(p => p.id === idPartida);
    if (partida) {
      partida.estado = 'finalizada';
      this.cantPartidasActuales -= 1;
      console.log(`La partida ${partida.nombre} ha sido cerrada.`);
    }
  }
}

export class Partida {
  id: number;
  nombre: string;
  estado: string;
  limiteJugadores: number;
  contrasena: string | null;
  anfitrion: Anfitrion;
  sesiones: Sesion[];
  jugadoresActivos: Jugador[];
  indiceTurnoActual: number | null;

  constructor(
    id: number,
    nombre: string,
    estado: string,
    limiteJugadores: number,
    anfitrion: Anfitrion,
    contrasena: string | null = null
  ) {
    this.id = id;
    this.nombre = nombre;
    this.estado = estado;
    this.limiteJugadores = limiteJugadores;
    this.contrasena = contrasena;
    this.anfitrion = anfitrion;
    this.sesiones = [];
    this.jugadoresActivos = [];
    this.indiceTurnoActual = null;
  }

  iniciarSesion(fechaYHora: Date, duracionSesion: number): Sesion {
    const nuevaSesion = new Sesion(this.sesiones.length + 1, fechaYHora, duracionSesion, this);
    nuevaSesion.cantJugadores = this.jugadoresActivos.length;
    this.sesiones.push(nuevaSesion);
    return nuevaSesion;
  }

  finalizarSesion(id: number): boolean {
    const sesion = this.sesiones.find(s => s.id === id);
    if (!sesion) {
      return false;
    }

    sesion.estadoSesion = 'terminada';
    console.log('Sesión finalizada con éxito.');
    return true;
  }

  agregarJugador(jugador: Jugador, intentoContrasena: string | null = null): boolean {
    if (this.jugadoresActivos.length >= this.limiteJugadores) {
      console.log('Partida llena bro.');
      return false;
    }

    if (this.contrasena !== null && this.contrasena !== intentoContrasena) {
      console.log('Contraseña incorrecta.');
      return false;
    }

    this.jugadoresActivos.push(jugador);
    console.log(`Bienvenido a la partida, ${jugador.nickname}.`);
    return true;
  }

  iniciarTurno(): Jugador | null {
    if (this.jugadoresActivos.length === 0) {
      return null;
    }

    this.indiceTurnoActual = 0;
    return this.jugadoresActivos[this.indiceTurnoActual];
  }

  avanzarTurno(): Jugador | null {
    if (this.indiceTurnoActual === null || this.jugadoresActivos.length === 0) {
      return null;
    }

    this.indiceTurnoActual = (this.indiceTurnoActual + 1) % this.jugadoresActivos.length;
    return this.jugadoresActivos[this.indiceTurnoActual];
  }

  removerJugador(idUsuario: string): boolean {
    const indice = this.jugadoresActivos.findIndex(jugador => jugador.nombreUsuario === idUsuario);
    if (indice === -1) {
      return false;
    }

    this.jugadoresActivos.splice(indice, 1);
    return true;
  }
}

export class Tienda {
  idTienda: number;
  nombre: string;
  tipoTienda: string;
  objetos: Objeto[];

  constructor(idTienda: number, nombre: string, tipoTienda: string, nivelDeTienda: number) {
    this.idTienda = idTienda;
    this.nombre = nombre;
    this.tipoTienda = tipoTienda;
    this.objetos = [];
  }

  buscarObjeto(idObjeto: number): Objeto | undefined {
    return this.objetos.find(objeto => objeto.idObjeto === idObjeto);
  }

  agregarStock(objeto: Objeto): void {
    this.objetos.push(objeto);
  }

  procesarVenta(personaje: Personaje, idObjeto: number): boolean {
    const indexObjeto = this.objetos.findIndex(obj => obj.idObjeto === idObjeto);
    if (indexObjeto === -1) {
      console.log('No nos queda ese ítem.');
      return false;
    }

    const objeto = this.objetos[indexObjeto];
    if (personaje.comprarObjeto(objeto)) {
      this.objetos.splice(indexObjeto, 1);
      console.log(`Venta realizada: ${objeto.nombre}`);
      return true;
    }

    console.log('La venta falló (sin plata o sin espacio).');
    return false;
  }
}

export class Sesion {
  id: number;
  fechaYHora: Date;
  duracionSesion: number;
  partida: Partida;
  cantJugadores: number;
  estadoSesion: 'activa' | 'terminada';
  misiones: Mision[];
  historial: string[];

  constructor(id: number, fechaYHora: Date, duracionSesion: number, partida: Partida) {
    this.id = id;
    this.fechaYHora = fechaYHora;
    this.duracionSesion = duracionSesion;
    this.partida = partida;
    this.cantJugadores = 0;
    this.estadoSesion = 'activa';
    this.misiones = [];
    this.historial = [];
  }

  registrarAccion(descripcion: string): void {
    const fecha = new Date().toLocaleString();
    this.historial.push(`[${fecha}] ${descripcion}`);
  }
}

export const crearColeccionesIniciales = () => ({
  jugadores: [] as Jugador[],
  anfitriones: [] as Anfitrion[]
});