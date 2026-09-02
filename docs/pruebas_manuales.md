# Pruebas Manuales y Verificación

## 1. Instalación y Ejecución
- [ ] La base de datos puede crearse desde el archivo `SQL/rpg.sql` sin errores.
- [ ] Las dependencias del backend se instalan correctamente (`npm install`).
- [ ] El backend se levanta en el puerto 3000 (`npm run dev`).
- [ ] Las dependencias del frontend se instalan correctamente.
- [ ] El frontend se levanta correctamente en el puerto asignado por vite.

## 2. Pruebas de Endpoints (Backend)
- [ ] **GET /api/usuarios**: Retorna la lista de usuarios.
- [ ] **POST /api/usuarios**: Crea un usuario nuevo correctamente.
- [ ] **POST /api/objetos/1/comprar** con `{ "idPersonaje": 1, "numInventario": 1, "posicion": 1 }`: descuenta 50 monedas y mueve la Espada Corta al inventario.
- [ ] Repetir la compra anterior: responde `409` porque el objeto ya no está disponible en una tienda.
- [ ] Comprar con un personaje sin dinero suficiente: responde `409` y no modifica el objeto ni el dinero.
- [ ] Comprar hacia un inventario lleno o una posición ocupada: responde `409` y no modifica ningún dato.
- [ ] *(Agregar aquí el resto de las rutas a medida que se desarrollen)*

## 3. Pruebas de Breakpoints (Frontend)
El diseño debe adaptarse correctamente en las siguientes resoluciones:
- [ ] **Mobile** (ej. 320px - 480px): Elementos apilados, menú hamburguesa si aplica.
- [ ] **Tablet** (ej. 768px - 1024px): Distribución ajustada, dos columnas.
- [ ] **Desktop** (ej. 1024px+): Diseño expandido a pantalla completa.

## 4. Pruebas de Flujo del Usuario
- [ ] Un usuario puede visualizar el listado de partidas activas.
- [ ] Un jugador puede ver los objetos sugeridos según su clase.
- [ ] Un jugador puede comprar un objeto de una tienda, elegir inventario y posición, y ver su dinero restante.
- [ ] *(Agregar los casos de uso definidos en el Alcance Mínimo)*
