# Guía de Instalación y Ejecución

## Requisitos Previos
- Node.js (v18+)
- MySQL (v8+)
- ...

## Configuración de la Base de Datos
1. Crear una base de datos en MySQL.
2. Ejecutar el script `SQL/rpg.sql` (o generar las tablas con MikroORM usando `npm run schema:create`).
3. ...

## Variables de Entorno
1. Copiar el archivo `.env.example` y renombrarlo a `.env`.
2. Completar las variables con los datos de tu entorno local.

## Ejecución del Backend
```bash
cd backend (o ruta del backend)
npm install
npm run dev
```

## Ejecución del Frontend
```bash
cd frontend
npm install
npm run dev
```
