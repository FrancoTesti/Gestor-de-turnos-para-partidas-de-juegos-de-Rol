SET FOREIGN_KEY_CHECKS=0;

DROP DATABASE IF EXISTS `agencia_personal`;

CREATE DATABASE `agencia_personal`
    CHARACTER SET 'utf8'
    COLLATE 'utf8_general_ci';

USE `agencia_personal`;

#
# Structure for the `cargos` table : 
#

DROP TABLE IF EXISTS `cargos`;

CREATE TABLE `cargos` (
  `cod_cargo` int(11) NOT NULL,
  `desc_cargo` varchar(50) NOT NULL,
  PRIMARY KEY  (`cod_cargo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

#
# Structure for the `empresas` table : 
#

DROP TABLE IF EXISTS `empresas`;

CREATE TABLE `empresas` (
  `cuit` varchar(20) NOT NULL,
  `razon_social` varchar(50) NOT NULL,
  `direccion` varchar(50) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `e_mail` varchar(50) default NULL,
  PRIMARY KEY  (`cuit`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

#
# Structure for the `personas` table : 
#

DROP TABLE IF EXISTS `personas`;

CREATE TABLE `personas` (
  `dni` varchar(20) NOT NULL,
  `apellido` varchar(30) NOT NULL,
  `nombre` varchar(30) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `fecha_registro_agencia` date NOT NULL,
  `direccion` varchar(50) default NULL,
  `Telefono` varchar(20) default NULL,
  PRIMARY KEY  (`dni`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

#
# Structure for the `antecedentes` table : 
#

DROP TABLE IF EXISTS `antecedentes`;

CREATE TABLE `antecedentes` (
  `dni` varchar(20) NOT NULL,
  `cod_cargo` int(11) NOT NULL,
  `cuit` varchar(20) NOT NULL,
  `fecha_desde` date NOT NULL,
  `fecha_hasta` date default NULL,
  `persona_contacto` varchar(50) default NULL,
  PRIMARY KEY  (`dni`,`cod_cargo`,`cuit`,`fecha_desde`),
  KEY `cuit` (`cuit`),
  KEY `trabajo_cargos_fk` (`cod_cargo`),
  CONSTRAINT `trabajo_cargos_fk` FOREIGN KEY (`cod_cargo`) REFERENCES `cargos` (`cod_cargo`) ON UPDATE CASCADE,
  CONSTRAINT `trabajo_empresas_fk` FOREIGN KEY (`cuit`) REFERENCES `empresas` (`cuit`) ON UPDATE CASCADE,
  CONSTRAINT `trabajo_personas_fk` FOREIGN KEY (`dni`) REFERENCES `personas` (`dni`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

#
# Structure for the `solicitudes_empresas` table : 
#

DROP TABLE IF EXISTS `solicitudes_empresas`;

CREATE TABLE `solicitudes_empresas` (
  `cuit` varchar(20) NOT NULL,
  `cod_cargo` int(11) NOT NULL,
  `fecha_solicitud` date NOT NULL,
  `anios_experiencia` int(11) default NULL,
  `edad_minima` int(11) default NULL,
  `edad_maxima` int(11) default NULL,
  `sexo` varchar(9) default NULL,
  PRIMARY KEY  (`cuit`,`cod_cargo`,`fecha_solicitud`),
  KEY `cuit` (`cuit`),
  KEY `solicita_cargos_fk` (`cod_cargo`),
  CONSTRAINT `solicita_cargos_fk` FOREIGN KEY (`cod_cargo`) REFERENCES `cargos` (`cod_cargo`) ON UPDATE CASCADE,
  CONSTRAINT `solicita_empresas_fk` FOREIGN KEY (`cuit`) REFERENCES `empresas` (`cuit`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

#
# Structure for the `contratos` table : 
#

DROP TABLE IF EXISTS `contratos`;

CREATE TABLE `contratos` (
  `nro_contrato` int(11) NOT NULL auto_increment,
  `fecha_incorporacion` date NOT NULL,
  `fecha_finalizacion_contrato` date default NULL,
  `fecha_caducidad` date default NULL,
  `sueldo` decimal(9,3) NOT NULL,
  `porcentaje_comision` decimal(9,3) NOT NULL,
  `dni` varchar(20) NOT NULL,
  `cuit` varchar(20) NOT NULL,
  `cod_cargo` int(11) NOT NULL,
  `fecha_solicitud` date NOT NULL,
  PRIMARY KEY  (`nro_contrato`),
  KEY `dni` (`dni`),
  KEY `cuit` (`cuit`,`cod_cargo`,`fecha_solicitud`),
  CONSTRAINT `contratos_personas_fk` FOREIGN KEY (`dni`) REFERENCES `personas` (`dni`) ON UPDATE CASCADE,
  CONSTRAINT `contratos_solicitudes_empresas_fk` FOREIGN KEY (`cuit`, `cod_cargo`, `fecha_solicitud`) REFERENCES `solicitudes_empresas` (`cuit`, `cod_cargo`, `fecha_solicitud`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

#
# Structure for the `comisiones` table : 
#

DROP TABLE IF EXISTS `comisiones`;

CREATE TABLE `comisiones` (
  `nro_contrato` int(11) NOT NULL,
  `anio_contrato` int(5) NOT NULL,
  `mes_contrato` int(3) NOT NULL,
  `fecha_pago` date default NULL,
  `importe_comision` decimal(9,3) default NULL,
  PRIMARY KEY  (`nro_contrato`,`anio_contrato`,`mes_contrato`),
  CONSTRAINT `comisiones_contrato_fk` FOREIGN KEY (`nro_contrato`) REFERENCES `contratos` (`nro_contrato`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

#
# Structure for the `entrevistas` table : 
#

DROP TABLE IF EXISTS `entrevistas`;

CREATE TABLE `entrevistas` (
  `nro_entrevista` int(11) NOT NULL,
  `fecha_entrevista` date NOT NULL,
  `hora_entrevista` time NOT NULL,
  `nombre_entrevistador` varchar(50) NOT NULL,
  `resultado_final` varchar(20) default NULL,
  `dni` varchar(20) NOT NULL,
  `cuit` varchar(20) NOT NULL,
  `cod_cargo` int(11) NOT NULL,
  `fecha_solicitud` date NOT NULL,
  PRIMARY KEY  (`nro_entrevista`),
  KEY `dni` (`dni`),
  KEY `cuit` (`cuit`,`cod_cargo`,`fecha_solicitud`),
  CONSTRAINT `entrevistas_fk` FOREIGN KEY (`cuit`, `cod_cargo`, `fecha_solicitud`) REFERENCES `solicitudes_empresas` (`cuit`, `cod_cargo`, `fecha_solicitud`) ON UPDATE CASCADE,
  CONSTRAINT `entrevistas_personas_fk` FOREIGN KEY (`dni`) REFERENCES `personas` (`dni`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

#
# Structure for the `evaluaciones` table : 
#

DROP TABLE IF EXISTS `evaluaciones`;

CREATE TABLE `evaluaciones` (
  `cod_evaluacion` int(11) NOT NULL,
  `desc_evaluacion` varchar(50) NOT NULL,
  PRIMARY KEY  (`cod_evaluacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

#
# Structure for the `entrevistas_evaluaciones` table : 
#

DROP TABLE IF EXISTS `entrevistas_evaluaciones`;

CREATE TABLE `entrevistas_evaluaciones` (
  `nro_entrevista` int(11) NOT NULL,
  `cod_evaluacion` int(11) NOT NULL,
  `resultado` int(11) NOT NULL,
  PRIMARY KEY  (`nro_entrevista`,`cod_evaluacion`),
  KEY `nro_entrevista` (`nro_entrevista`),
  KEY `cod_evaluacion` (`cod_evaluacion`),
  CONSTRAINT `incluyen_entrevistas_fk` FOREIGN KEY (`nro_entrevista`) REFERENCES `entrevistas` (`nro_entrevista`) ON UPDATE CASCADE,
  CONSTRAINT `incluyen_evaluaciones_fk` FOREIGN KEY (`cod_evaluacion`) REFERENCES `evaluaciones` (`cod_evaluacion`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

#
# Structure for the `titulos` table : 
#

DROP TABLE IF EXISTS `titulos`;

CREATE TABLE `titulos` (
  `cod_titulo` int(11) NOT NULL,
  `desc_titulo` varchar(50) NOT NULL,
  `tipo_titulo` varchar(50) default NULL,
  PRIMARY KEY  (`cod_titulo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

#
# Structure for the `personas_titulos` table : 
#

DROP TABLE IF EXISTS `personas_titulos`;

CREATE TABLE `personas_titulos` (
  `dni` varchar(20) NOT NULL,
  `cod_titulo` int(11) NOT NULL,
  `fecha_graduacion` date default NULL,
  PRIMARY KEY  (`dni`,`cod_titulo`),
  KEY `cod_titulo` (`cod_titulo`),
  CONSTRAINT `tienen_personas_fk` FOREIGN KEY (`dni`) REFERENCES `personas` (`dni`) ON UPDATE CASCADE,
  CONSTRAINT `tienen_titulos_fk` FOREIGN KEY (`cod_titulo`) REFERENCES `titulos` (`cod_titulo`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

#
# Data for the `cargos` table  (LIMIT 0,500)
#

INSERT INTO `cargos` (`cod_cargo`, `desc_cargo`) VALUES 
  (1,'cadete'),
  (2,'mozo'),
  (3,'cocinero'),
  (4,'organizador de eventos'),
  (5,'decorador'),
  (6,'Jefe de Desarrollo'),
  (7,'Director de Obras'),
  (8,'Programador');

COMMIT;

#
# Data for the `empresas` table  (LIMIT 0,500)
#

INSERT INTO `empresas` (`cuit`, `razon_social`, `direccion`, `telefono`, `e_mail`) VALUES 
  ('30-10504876-5','Viejos Amigos','Buenos Aires 4444','4444444','rrhh@viejosamigos.com.ar'),
  ('30-15876543-4','Reuniones Improvisadas','Oroño 3333','4576879',NULL),
  ('30-20987654-4','Porciones Reducidas','Viedma 1830','4556677',NULL),
  ('30-21008765-5','Traigame eso','Zeballos 7456','4455667','traigameeso@gmail.com'),
  ('30-21098732-4','Informatiks srl','Dorrego 2213 4 A','4857339','info@informatiks.biz'),
  ('30-23456328-5','Constructora Gaia S.A.','Tucuman 649 PA','4647125',NULL);

COMMIT;

#
# Data for the `personas` table  (LIMIT 0,500)
#

INSERT INTO `personas` (`dni`, `apellido`, `nombre`, `fecha_nacimiento`, `fecha_registro_agencia`, `direccion`, `Telefono`) VALUES 
  ('27890765','Garcia','Eliseo','1981-01-10','2014-06-13','Tucuman 1111 piso 1 dpto 1','4641198'),
  ('28675888','Lopez','Stefanía','1982-05-20','2005-12-12','San Juan 3498','154876398'),
  ('29345777','Wingdam','Raul','1983-03-01','2014-07-15','Juan Manuel de Rosas 1981','155287433'),
  ('30425782','Losteau','Pedro','1982-08-25','2015-02-26','Laines 765','4854431'),
  ('30987654','Guftafson','Juana','1984-07-02','2014-08-12','Arijon 3','4378900'),
  ('31345778','Ruiz','Aquiles','1982-02-01','2014-06-18','Avellaneda 1165','4678922');

COMMIT;

#
# Data for the `antecedentes` table  (LIMIT 0,500)
#

INSERT INTO `antecedentes` (`dni`, `cod_cargo`, `cuit`, `fecha_desde`, `fecha_hasta`, `persona_contacto`) VALUES 
  ('27890765',2,'30-20987654-4','2005-03-01',NULL,'Belen Arisa'),
  ('28675888',2,'30-20987654-4','2004-06-01','2013-08-31','Belen Arisa'),
  ('28675888',3,'30-20987654-4','2013-09-01','2014-11-16','Belen Arisa'),
  ('29345777',4,'30-15876543-4','2013-01-01',NULL,'Armando Esteban Quito'),
  ('29345777',5,'30-15876543-4','2005-04-01','2005-12-31','Armando Esteban Quito'),
  ('30425782',6,'30-21098732-4','2005-01-05','2013-12-31','Juan Perez'),
  ('30987654',6,'30-10504876-5','2014-04-15',NULL,NULL),
  ('30987654',8,'30-21098732-4','2003-08-01','2013-04-14','Felipe Rojas'),
  ('31345778',7,'30-23456328-5','2014-06-01',NULL,'Alicia Ramos');

COMMIT;

#
# Data for the `solicitudes_empresas` table  (LIMIT 0,500)
#

INSERT INTO `solicitudes_empresas` (`cuit`, `cod_cargo`, `fecha_solicitud`, `anios_experiencia`, `edad_minima`, `edad_maxima`, `sexo`) VALUES 
  ('30-10504876-5',3,'2014-09-21',NULL,NULL,NULL,NULL),
  ('30-10504876-5',4,'2014-09-13',NULL,NULL,NULL,NULL),
  ('30-10504876-5',5,'2014-09-21',1,25,65,NULL),
  ('30-21008765-5',1,'2014-09-23',NULL,NULL,NULL,NULL),
  ('30-21008765-5',2,'2014-09-20',NULL,NULL,NULL,'Femenino'),
  ('30-21098732-4',6,'2014-01-09',NULL,NULL,NULL,NULL),
  ('30-21098732-4',6,'2014-09-23',NULL,NULL,NULL,NULL);

COMMIT;

#
# Data for the `contratos` table  (LIMIT 0,500)
#

INSERT INTO `contratos` (`nro_contrato`, `fecha_incorporacion`, `fecha_finalizacion_contrato`, `fecha_caducidad`, `sueldo`, `porcentaje_comision`, `dni`, `cuit`, `cod_cargo`, `fecha_solicitud`) VALUES 
  (1,'2014-11-01','2015-12-26',NULL,1200,10,'27890765','30-21008765-5',2,'2014-09-20'),
  (3,'2014-11-15','2015-12-24',NULL,1600,11,'28675888','30-10504876-5',3,'2014-09-21'),
  (4,'2014-12-01','2015-12-16','2015-12-15',1900,13,'29345777','30-10504876-5',4,'2014-09-13'),
  (5,'2015-01-02','2015-12-24','2015-03-12',2063,14,'29345777','30-10504876-5',5,'2014-09-21'),
  (6,'2015-01-02','2015-12-24',NULL,5870,20,'30987654','30-21098732-4',6,'2014-09-23'),
  (7,'2015-01-02','2014-09-24','2015-12-24',5870,20,'28675888','30-10504876-5',3,'2014-09-21');

COMMIT;

#
# Data for the `comisiones` table  (LIMIT 0,500)
#

INSERT INTO `comisiones` (`nro_contrato`, `anio_contrato`, `mes_contrato`, `fecha_pago`, `importe_comision`) VALUES 
  (1,2014,11,'2014-12-03',120),
  (1,2014,12,'2015-01-05',120),
  (1,2015,1,'2015-02-03',120),
  (1,2015,2,NULL,120),
  (3,2014,11,'2014-11-30',176),
  (3,2014,12,'2014-12-28',176),
  (3,2015,1,'2015-01-26',176),
  (3,2015,2,'2015-01-26',176),
  (4,2014,12,'2015-02-01',247),
  (4,2015,1,NULL,247),
  (4,2015,2,NULL,247),
  (5,2015,1,'2015-02-01',288.82),
  (5,2015,2,NULL,288.82),
  (6,2015,1,NULL,1174),
  (6,2015,2,NULL,1174);

COMMIT;

#
# Data for the `entrevistas` table  (LIMIT 0,500)
#

INSERT INTO `entrevistas` (`nro_entrevista`, `fecha_entrevista`, `hora_entrevista`, `nombre_entrevistador`, `resultado_final`, `dni`, `cuit`, `cod_cargo`, `fecha_solicitud`) VALUES 
  (1,'2014-10-09','18:00:00','Raul Somias','Apto','27890765','30-21008765-5',2,'2014-09-20'),
  (2,'2014-10-09','18:30:00','Tomas Sanchez','Apto','28675888','30-21008765-5',2,'2014-09-20'),
  (3,'2014-10-07','18:00:00','Angelica Doria','Apto','28675888','30-10504876-5',3,'2014-09-21'),
  (4,'2014-09-29','18:00:00','Angelica Doria','Apto','29345777','30-10504876-5',4,'2014-09-13'),
  (5,'2014-10-07','18:30:00','Angelica Doria','Apto','29345777','30-10504876-5',5,'2014-09-21'),
  (6,'2014-10-09','19:00:00','Tomas Sanchez','Apto','30987654','30-21098732-4',6,'2014-09-23');

COMMIT;

#
# Data for the `evaluaciones` table  (LIMIT 0,500)
#

INSERT INTO `evaluaciones` (`cod_evaluacion`, `desc_evaluacion`) VALUES 
  (1,'Test de Personalidad'),
  (2,'Test de Aptitud y Eficiencia'),
  (3,'Test de Inteligencia');

COMMIT;

#
# Data for the `entrevistas_evaluaciones` table  (LIMIT 0,500)
#

INSERT INTO `entrevistas_evaluaciones` (`nro_entrevista`, `cod_evaluacion`, `resultado`) VALUES 
  (1,1,80),
  (1,2,67),
  (1,3,82),
  (2,1,63),
  (2,2,72),
  (2,3,69),
  (3,1,67),
  (3,2,78),
  (3,3,81),
  (4,1,64),
  (4,2,57),
  (4,3,61),
  (5,1,81),
  (5,2,88),
  (5,3,73),
  (6,1,91),
  (6,2,95),
  (6,3,84);

COMMIT;

#
# Data for the `titulos` table  (LIMIT 0,500)
#

INSERT INTO `titulos` (`cod_titulo`, `desc_titulo`, `tipo_titulo`) VALUES 
  (1,'Tecnico Electronico','Secundario'),
  (2,'Diseñador de Interiores','Terciario'),
  (3,'Tecnico Mecanico','Secundario'),
  (4,'Payaso de Circo','Educacion no formal'),
  (5,'Arquitecto','Universitario'),
  (6,'Entrenado de Lemures','Educacion no formal'),
  (7,'Ing en Sist de Inf','Universitario'),
  (8,'Bachiller','Secundario');

COMMIT;

#
# Data for the `personas_titulos` table  (LIMIT 0,500)
#

INSERT INTO `personas_titulos` (`dni`, `cod_titulo`, `fecha_graduacion`) VALUES 
  ('27890765',6,'2001-07-05'),
  ('27890765',8,'1998-11-23'),
  ('28675888',8,'2000-03-02'),
  ('29345777',2,'2003-12-02'),
  ('29345777',4,'2002-12-02'),
  ('29345777',8,'2000-12-02'),
  ('30425782',7,'2014-12-25'),
  ('30987654',1,'2001-12-03'),
  ('30987654',7,'2014-06-05'),
  ('31345778',3,'1999-11-29'),
  ('31345778',5,'2011-12-25');

COMMIT;

