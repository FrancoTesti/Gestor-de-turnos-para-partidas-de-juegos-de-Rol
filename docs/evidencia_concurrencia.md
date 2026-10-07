# Evidencia de Prueba de Concurrencia (Compra y Venta de Objeto Único)

**Responsable:** Octavio Alejandro Gudiño  
**Fecha de verificación inicial:** 24 de septiembre de 2026  
**Última re-verificación:** 26 de septiembre de 2026  
**Commit evaluado:** `5ccac3a` de `main`  
**Ejecución en GitHub Actions (verificable):** [run 36076310572, verde](https://github.com/RenzoScollo/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/actions/runs/36076310572) (también respaldado en [Actions 35610631280](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/actions/runs/35610631280)).

> [!NOTE]
> **Confirmación de integridad:** Se re-ejecutó la suite completa de integración (`npm run test:integration`) sobre `main` en la última fecha sin regresiones detectadas en las transacciones de compra/venta pesimistas.

> [!IMPORTANT]
> **Re-verificación en PostgreSQL (7 de octubre de 2026, rama `ImplementacionSupabase`).** La base pasó de
> MySQL a PostgreSQL en Supabase y la suite de integración se volvió a ejecutar completa: **22 de 22
> pruebas aprobadas**, incluidas las tres de concurrencia de abajo. La verificación de septiembre (MySQL) y
> el run de Actions citado arriba corresponden a la base anterior.
>
> La migración mostró una diferencia real: PostgreSQL rechaza `SELECT ... FOR UPDATE` sobre el lado opcional
> de un `LEFT JOIN` («FOR UPDATE cannot be applied to the nullable side of an outer join»), y MySQL no.
> Las consultas con bloqueo que cargaban `Objeto.tienda` y `Objeto.inventario` en el mismo `SELECT` fallaban
> con 500 en las operaciones de compra, venta y movimiento de objetos. Se resolvió cargando esas relaciones en consultas aparte
> (`strategy: 'select-in'`); el bloqueo sigue sobre la fila del objeto, que es la que serializa las
> operaciones concurrentes, y el personaje se bloquea de forma explícita a continuación. Ver
> `src/services/objeto.service.ts` y `src/services/juego.service.ts`.

## Descripción de la Prueba
Esta prueba de integración valida la concurrencia de compra y venta de un objeto único (`esUnico: true`) conectándose a una instancia real de **PostgreSQL** (hasta septiembre, MySQL) mediante la suite [src/integration/juego.test.ts](../src/integration/juego.test.ts).

### Casos de Concurrencia Verificados

1. **Compra simultánea de objeto único**:
   - Dos personajes en la misma partida intentan comprar el mismo objeto único en paralelo (`Promise.all`).
   - **Resultado esperado y verificado**: Exactamente una de las solicitudes HTTP obtiene respuesta `200 OK`, mientras que la segunda es rechazada con conflicto HTTP `409 Conflict` (o error de disponibilidad/validación de objeto único en la partida).

2. **Rechazo de objeto único duplicado en la partida**:
   - Si un personaje intenta adquirir otro ejemplar de un objeto único con el mismo nombre en la misma partida, la transacción detecta la presencia del objeto en el inventario y cancela la operación sin modificar dinero ni inventarios.

3. **Venta simultánea de objeto único**:
   - El propietario del objeto único lanza dos peticiones concurrentes de venta hacia la tienda (`Promise.all`).
   - **Resultado esperado y verificado**: Una sola venta se procesa (`200 OK`), acreditando el saldo exactamente una vez. La segunda solicitud falla con `409 Conflict` ("El objeto no está en tu inventario"). El objeto pasa a estar disponible en la tienda y su inventario se libera a `null`.

## Ejecución Automatizada de Integración

Command:
```powershell
$env:TEST_DB_URL = 'postgresql://postgres.<codigo>:***@aws-0-<region>.pooler.supabase.com:5432/postgres'
npm run test:integration
```

Output resumen de la suite de integración (`src/integration/juego.test.ts`):
```text
✔ dos compras concurrentes del mismo objeto: solo una gana y solo un débito
✔ dos ventas concurrentes del mismo objeto: solo una gana y se acredita una sola vez
✔ concurrencia de compra y venta de objeto único
✔ casos borde: saldo insuficiente, objeto ajeno, venta a tienda de otra clase, posición ocupada y capacidad al límite
```
