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

## Verificación

```sh
npm run build
npm test
cd frontend
npm run build
npm run lint
npm test
```

Las pruebas reales de MySQL se ejecutan por separado con `npm run test:integration`; crean y eliminan exclusivamente una base temporal con nombre aleatorio. Su configuración está en la guía de instalación.
