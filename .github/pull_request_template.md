## Qué cambia

Describir el objetivo y el alcance. Una rama, un objetivo.

## Cómo se probó

- [ ] Backend: `npm run build` y `npm test`
- [ ] Frontend: `cd frontend && npm run build && npm run lint && npm test`
- [ ] Integración MySQL: `npm run test:integration` (si toca datos, permisos o transacciones)
- [ ] Recorridos de navegador: `npm run test:e2e` (si toca flujos de pantalla)
- [ ] Documentación: `npm run docs:check` (si toca archivos `.md`)
- [ ] Cobertura: `npm run test:coverage` y `cd frontend && npm run test:coverage`

## Antes de pedir el merge

- [ ] El último run de Actions de esta rama está en verde
- [ ] Ninguna prueba quedó deshabilitada ni marcada como pendiente
- [ ] Si cambió el alcance o una regla, actualicé `docs/`

## Qué queda pendiente

Escribir «nada» solo si realmente no queda nada.
