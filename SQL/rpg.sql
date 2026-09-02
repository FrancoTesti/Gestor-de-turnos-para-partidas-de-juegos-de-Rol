-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS RPG;
USE RPG;

-- ==========================================
-- CORRECCIÓN DE INCONSISTENCIAS:
-- Las entidades de Mikro-ORM usan nombres en minúscula y plural por defecto
-- (usuarios, anfitriones, jugadores, clases, etc.)
-- ==========================================

CREATE TABLE `clases` (
  `idClase` int unsigned not null auto_increment primary key,
  `nombreClase` varchar(50) not null,
  `descripcionClase` text not null
) ENGINE = InnoDB;

CREATE TABLE `tiendas` (
  `idTienda` int unsigned not null auto_increment primary key,
  `claseTienda` varchar(50) not null,
  `nombre` varchar(100) not null,
  `idClase` int unsigned null,
  FOREIGN KEY (`idClase`) REFERENCES `clases` (`idClase`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE = InnoDB;

CREATE TABLE `usuarios` (
  `idUsuario` int unsigned not null auto_increment primary key,
  `nombreUsuario` varchar(50) not null,
  `contrasena` varchar(100) not null,
  `imagen` varchar(255) not null,
  `nickname` varchar(50) not null,
  UNIQUE (`nickname`)
) ENGINE = InnoDB;

CREATE TABLE `jugadores` (
  `idUsuario` int unsigned not null,
  `estado` tinyint(1) not null,
  PRIMARY KEY (`idUsuario`),
  FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE `anfitriones` (
  `idUsuario` int unsigned not null,
  `cantPartidasActuales` int not null,
  `karma` int not null,
  PRIMARY KEY (`idUsuario`),
  FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE `partidas` (
  `idPartida` int unsigned not null auto_increment primary key,
  `nombre` varchar(100) not null,
  `estado` tinyint(1) not null,
  `limiteJugadores` int not null,
  `contrasena` varchar(100) not null,
  `idUsuarioAnfitrion` int unsigned not null,
  FOREIGN KEY (`idUsuarioAnfitrion`) REFERENCES `anfitriones` (`idUsuario`) ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE `sesiones` (
  `idPartida` int unsigned not null,
  `numSesion` int unsigned not null,
  `duracionSesion` int not null,
  `cantJugadores` int not null,
  `estadoSesion` int not null,
  PRIMARY KEY (`idPartida`, `numSesion`),
  FOREIGN KEY (`idPartida`) REFERENCES `partidas` (`idPartida`) ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE `misiones` (
  `idPartida` int unsigned not null,
  `numSesion` int unsigned not null,
  `numMision` int unsigned not null,
  `descripcion` text not null,
  `dineroTotal` int not null,
  `xpTotal` int not null,
  `xpOtorgadoJugadores` int not null,
  `dineroOtorgadoAJugadores` int not null,
  `asistenciaGrupoGrande` int not null,
  `estado` tinyint(1) not null,
  PRIMARY KEY (`idPartida`, `numSesion`, `numMision`),
  FOREIGN KEY (`idPartida`, `numSesion`) REFERENCES `sesiones` (`idPartida`, `numSesion`) ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE `personajes` (
  `idPersonaje` int unsigned not null auto_increment primary key,
  `nombreFicticio` varchar(100) not null,
  `raza` varchar(50) not null,
  `xp` int not null,
  `nivel` int not null,
  `dinero` int not null,
  `idClase` int unsigned not null,
  `idUsuarioJugador` int unsigned not null,
  `idPartida` int unsigned not null,
  FOREIGN KEY (`idClase`) REFERENCES `clases` (`idClase`) ON UPDATE CASCADE,
  FOREIGN KEY (`idUsuarioJugador`) REFERENCES `jugadores` (`idUsuario`) ON UPDATE CASCADE,
  FOREIGN KEY (`idPartida`) REFERENCES `partidas` (`idPartida`) ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE `personaje_sesion` (
  `idPersonaje` int unsigned not null,
  `idPartida` int unsigned not null,
  `numSesion` int unsigned not null,
  `dioKarma` tinyint(1) not null,
  PRIMARY KEY (`idPersonaje`, `idPartida`, `numSesion`),
  FOREIGN KEY (`idPersonaje`) REFERENCES `personajes` (`idPersonaje`) ON UPDATE CASCADE,
  FOREIGN KEY (`idPartida`, `numSesion`) REFERENCES `sesiones` (`idPartida`, `numSesion`) ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE `inventarios` (
  `idPersonaje` int unsigned not null,
  `numInventario` int unsigned not null,
  `cantidadEspacio` int not null,
  PRIMARY KEY (`idPersonaje`, `numInventario`),
  FOREIGN KEY (`idPersonaje`) REFERENCES `personajes` (`idPersonaje`) ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE `objetos` (
  `idObjeto` int unsigned not null auto_increment primary key,
  `valor` int not null,
  `descripcion` text not null,
  `nombre` varchar(100) not null,
  `nivelObjeto` int not null,
  `tipoObjeto` varchar(50) not null,
  `idTienda` int unsigned null,
  `idPersonaje` int unsigned null,
  `numInventario` int unsigned null,
  `posicion` int not null,
  FOREIGN KEY (`idTienda`) REFERENCES `tiendas` (`idTienda`) ON UPDATE CASCADE ON DELETE SET NULL,
  FOREIGN KEY (`idPersonaje`, `numInventario`) REFERENCES `inventarios` (`idPersonaje`, `numInventario`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE = InnoDB;

-- ==========================================
-- DATOS MÍNIMOS DE PRUEBA
-- ==========================================

INSERT INTO `clases` (`idClase`, `nombreClase`, `descripcionClase`) VALUES 
(1, 'Guerrero', 'Especialista en combate cuerpo a cuerpo.'),
(2, 'Mago', 'Lanza hechizos poderosos.'),
(3, 'Picaro', 'Experto en sigilo y trampas.');

INSERT INTO `usuarios` (`idUsuario`, `nombreUsuario`, `contrasena`, `imagen`, `nickname`) VALUES 
(1, 'Juan Perez', '123456', 'img1.png', 'juanito'),
(2, 'Maria Lopez', 'abcdef', 'img2.png', 'mary99');

INSERT INTO `jugadores` (`idUsuario`, `estado`) VALUES 
(1, 1);

INSERT INTO `anfitriones` (`idUsuario`, `cantPartidasActuales`, `karma`) VALUES 
(2, 1, 100);

INSERT INTO `partidas` (`idPartida`, `nombre`, `estado`, `limiteJugadores`, `contrasena`, `idUsuarioAnfitrion`) VALUES 
(1, 'Aventura Épica', 1, 5, 'secreta', 2);

INSERT INTO `personajes` (`idPersonaje`, `nombreFicticio`, `raza`, `xp`, `nivel`, `dinero`, `idClase`, `idUsuarioJugador`, `idPartida`) VALUES 
(1, 'Arthur', 'Humano', 0, 1, 100, 1, 1, 1);

INSERT INTO `inventarios` (`idPersonaje`, `numInventario`, `cantidadEspacio`) VALUES
(1, 1, 10);

INSERT INTO `tiendas` (`idTienda`, `claseTienda`, `nombre`, `idClase`) VALUES 
(1, 'Armeria', 'El Yunque', 1);

INSERT INTO `objetos` (`idObjeto`, `valor`, `descripcion`, `nombre`, `nivelObjeto`, `tipoObjeto`, `idTienda`, `idPersonaje`, `numInventario`, `posicion`) VALUES 
(1, 50, 'Espada de hierro básica', 'Espada Corta', 1, 'Arma', 1, NULL, NULL, 0);
