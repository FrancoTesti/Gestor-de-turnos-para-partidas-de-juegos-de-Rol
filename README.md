# Gestor de turnos para partidas de juegos de rol

Trabajo práctico de Desarrollo de Software: Node.js, Express, TypeScript, MikroORM, MySQL y React.

Integrantes: Franco Testi, Octavio Gudiño, Renzo Scollo, Alejandro Ciesco y Emanuel Salomón.

## Empezar

El backend está en la raíz; el frontend, en `frontend/`.

1. Seguir [Instalación y actualización](docs/instalacion.md), incluida la configuración de MySQL.
2. Iniciar el backend con `npm run dev` y, en otra terminal dentro de `frontend`, ejecutar `npm run dev`.
3. Abrir `http://localhost:5173`, registrar una cuenta y entrar.

Las cuentas se guardan en MySQL. Si ya tenían usuarios con contraseñas sin hash, deben ejecutar la migración explicada en la guía antes de iniciar sesión.

## Funciones

- Usuarios y perfiles de jugador/anfitrión, con sesión y permisos en el servidor.
- Clases, tiendas, partidas, personajes, objetos, inventarios, sesiones y misiones.
- Listado de partidas activas, personajes por clase y objetos sugeridos por clase.
- Compra, venta (70–100 % del valor), movimientos de inventario y recompensas transaccionales.
- Participación en sesiones y calificación del anfitrión una vez por jugador y sesión.

Ver [reglas y endpoints](docs/funcionalidad.md) y [pruebas](docs/pruebas_manuales.md).

## Cambios Implementados (Alejandro Ciesco & Octavio Gudiño)

### 1. Módulo de Alejandro Mario Ciesco (Clases, Personajes y Acceso a Partidas)
- **Integración UI & API:** Pantallas y componentes React conectadas a `/api/clases` y `/api/personajes`.
- **Estados de Carga, Vacío y Error:** Manejo visual completo en componentes y páginas.
- **Listado y Filtros:** Muestra de atributos requeridos (`nombreFicticio`, `jugadorNombre`, `xp`, `nivel`, `raza`, `idPersonaje`, `dinero`) con filtro dinámico por clase y opción para restablecer el filtro.
- **Creación Transaccional y Cupos:** Verificación en MySQL de existencia y estado activo de la clase, jugador y partida, contraseña en partidas privadas, límite de jugadores y creación atómica del inventario inicial (espacio 10, numInventario 1).
- **Seguridad:** Control en el servidor para evitar que el cliente se asigne dinero/XP o modifique personajes de otra cuenta.
- **Integridad de Datos:** Eliminación de personajes bloqueada si poseen historial de sesiones u objetos en inventario.

### 2. Módulo de Octavio Alejandro Gudiño (Tiendas, Objetos, Compra, Venta e Inventarios)
- **CRUD de Tiendas & Sugeridos:** Gestión de tiendas vinculadas a clases y listado de objetos sugeridos por clase (`/api/objetos/sugeridos/:character`).
- **Compra Transaccional con Bloqueos MySQL:** Bloqueo pesimista `LockMode.PESSIMISTIC_WRITE` para evitar condiciones de carrera. Validaciones de saldo, propietario, inventario y posición vacía. Rollback automático ante cualquier fallo.
- **Venta de Objetos:** Venta a tiendas con rango de precio configurable entre 70 % y 100 % del valor del objeto.
- **Gestión y Movimiento de Inventarios:** CRUD de inventarios y endpoint `/api/inventarios/:character/:number/mover` para mover objetos entre inventarios respetando la capacidad y posiciones desocupadas.
- **Pruebas de Concurrencia:** Verificación de atomicidad frente a solicitudes de compra o venta simultáneas.

## Verificación

```sh
npm install
npm run build
npm test
cd frontend
npm install
npm run build
npm run lint
npm test
```

Las pruebas reales de MySQL se ejecutan por separado con `npm run test:integration`; crean y eliminan exclusivamente una base temporal con nombre aleatorio. Su configuración está en la guía de instalación.

