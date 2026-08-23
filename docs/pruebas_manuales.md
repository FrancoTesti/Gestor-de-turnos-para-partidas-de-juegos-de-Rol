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
- [ ] *(Agregar aquí el resto de las rutas a medida que se desarrollen)*

## 3. Pruebas de Breakpoints (Frontend)
El diseño debe adaptarse correctamente en las siguientes resoluciones:
- [ ] **Mobile** (ej. 320px - 480px): Elementos apilados, menú hamburguesa si aplica.
- [ ] **Tablet** (ej. 768px - 1024px): Distribución ajustada, dos columnas.
- [ ] **Desktop** (ej. 1024px+): Diseño expandido a pantalla completa.

## 4. Pruebas de Flujo del Usuario
- [ ] Un usuario puede visualizar el listado de partidas activas.
- [ ] Un jugador puede ver los objetos sugeridos según su clase.
- [ ] *(Agregar los casos de uso definidos en el Alcance Mínimo)*
