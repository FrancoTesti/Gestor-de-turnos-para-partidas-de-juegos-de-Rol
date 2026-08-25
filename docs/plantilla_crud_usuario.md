# Guía y Plantilla de Referencia para Módulos CRUD (Basada en Usuario)

Este documento define la arquitectura limpia (Clean Architecture) y los estándares de diseño adoptados en el backend para el desarrollo de módulos CRUD. La entidad **Usuario** se utiliza como referencia estándar para implementar el resto de los módulos de la aplicación (`Anfitrion`, `Jugador`, `Partida`, `Clase`, `Objeto`, `Tienda`, etc.).

---

## 1. Estructura de Capas y Carpetas

Cada módulo CRUD debe estructurarse en las siguientes capas desacopladas:

```
src/
├── entities/            # Entidades ORM (MikroORM) que representan las tablas de MySQL.
│   └── Usuario.entity.ts
├── types/               # DTOs e Interfaces TypeScript para transporte de datos.
│   └── usuario.dto.ts
├── schemas/             # Esquemas de validación Zod en tiempo de ejecución.
│   └── usuario.schema.ts
├── repositories/        # Capa de datos (interacción con MikroORM / EntityManager).
│   └── usuario.repository.ts
├── services/            # Capa de negocio (reglas, excepciones y lógica de dominio).
│   └── usuario.service.ts
├── controllers/         # Capa HTTP (parseo de parámetros y respuestas Express).
│   └── usuario.controller.ts
├── routes/              # Declaración de endpoints e inyección de middleware de validación.
│   └── usuario.routes.ts
└── tests/               # Pruebas unitarias de Service, Controller y Schemas.
    ├── usuario.service.test.ts
    ├── usuario.controller.test.ts
    └── usuario.schema.test.ts
```

---

## 2. Responsabilidades por Capa

### 2.1 Entidad (`src/entities/Entidad.entity.ts`)
- Mapea la tabla correspondiente en MySQL utilizando `@Entity()` y decoradores de `@mikro-orm/core`.
- Debe ubicarse en `src/entities/`. No deben existir archivos de entidad duplicados en la raíz de `src/`.

### 2.2 DTOs (`src/types/entidad.dto.ts`)
- Define los tipos de datos que viajan entre cliente y backend.
- Debe separar los datos sensibles (ej. contraseñas) de los datos públicos mediante un DTO específico (ej: `UsuarioPublicoDTO`).

### 2.3 Validación Zod (`src/schemas/entidad.schema.ts`)
- Es el **único mecanismo de validación** aceptado en tiempo de ejecución.
- Reglas obligatorias:
  1. Uso de `.strict()` en el objeto base para **impedir campos no reconocidos** (ej: impedir la modificación de `idUsuario` o PK desde el body).
  2. Uso de `.refine((datos) => Object.keys(datos).length > 0, { message: 'Debe enviar al menos un campo para actualizar' })` en el esquema de actualización (`PUT`) para **rechazar bodies vacíos (`{}`)**.

### 2.4 Repositorio (`src/repositories/entidad.repository.ts`)
- Es el **único componente que conoce el EntityManager de MikroORM**.
- No debe contener lógica de negocio ni referencias a tipos HTTP (Express).
- **Prohibido el uso de `any`**: Los métodos de creación y actualización deben estar tipados con los DTOs correspondientes (`CrearUsuarioDTO`, `Partial<Usuario>`).

### 2.5 Servicio (`src/services/entidad.service.ts`)
- Contiene la lógica de negocio pura y aplica las reglas del dominio.
- Lanza excepciones personalizadas de negocio (ej. `NicknameEnUsoError`).
- **Manejo de Restricciones MySQL**: Captura `UniqueConstraintViolationException` de `@mikro-orm/core` durante el `flush()` / `guardarCambios()` para convertir errores de base de datos en errores de negocio legibles (ej: HTTP 409 Conflict).

### 2.6 Controlador (`src/controllers/entidad.controller.ts`)
- Recibe las peticiones HTTP y delega la ejecución al Servicio.
- Parsea y valida tipos simples como parámetros URL (`:id`).
- Maneja las respuestas de error a través de una función centralizada de manejo de errores.

### 2.7 Rutas (`src/routes/entidad.routes.ts`)
- Mapea las URLs hacia los métodos del controlador.
- Inyecta el middleware `validar(schema)` antes del controlador en los endpoints `POST` y `PUT`.
- **Tipado estricto**: Evitar casteos con `as any` en las funciones middleware/manejadores de Express.

---

## 3. Estandarización de Respuestas de Error

Todas las respuestas de error en la API deben devolver un objeto JSON homogéneo:

```json
{
  "message": "Mensaje principal describiendo el error",
  "errors": [
    {
      "campo": "nombreDelCampo",
      "mensaje": "Descripción detallada del problema de validación"
    }
  ]
}
```

### Tabla de Códigos de Estado HTTP Utilizados

| Método HTTP | Endpoint | Caso de Uso | Código HTTP |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/usuarios` | Lista todos los registros | `200 OK` |
| `GET` | `/api/usuarios/:id` | Registro encontrado | `200 OK` |
| `GET` | `/api/usuarios/:id` | ID inválido o no numérico | `400 Bad Request` |
| `GET` | `/api/usuarios/:id` | Registro no encontrado | `404 Not Found` |
| `POST` | `/api/usuarios` | Registro creado exitosamente | `201 Created` |
| `POST` | `/api/usuarios` | Datos de validación Zod inválidos / Campos extra | `400 Bad Request` |
| `POST` | `/api/usuarios` | Nickname o restricción única duplicada | `409 Conflict` |
| `PUT` | `/api/usuarios/:id` | Registro actualizado correctamente | `200 OK` |
| `PUT` | `/api/usuarios/:id` | Body vacío (`{}`) / Intento de cambiar `idUsuario` | `400 Bad Request` |
| `PUT` | `/api/usuarios/:id` | Registro a actualizar no existe | `404 Not Found` |
| `DELETE` | `/api/usuarios/:id` | Registro eliminado | `204 No Content` |
| `DELETE` | `/api/usuarios/:id` | Registro a eliminar no existe | `404 Not Found` |

---

## 4. Guía de Pruebas Automáticas

Cada CRUD debe incluir pruebas automáticas con **Vitest**:

1. **`src/tests/entidad.service.test.ts`**: Prueba la lógica del servicio mockeando los métodos del repositorio.
2. **`src/tests/entidad.controller.test.ts`**: Prueba las respuestas HTTP y códigos de estado del controlador mockeando el servicio.
3. **`src/tests/entidad.schema.test.ts`**: Prueba que las validaciones de Zod funcionen (ej. rechazo de idUsuario, validación de objeto vacío, min/max).

Ejecución de pruebas:
```bash
npm test
```
