# Evidencia de Prueba de Concurrencia (Compra y Venta de Objeto Único)

## Descripción de la Prueba
Esta prueba de integración valida la concurrencia de compra y venta de un objeto único (`esUnico: true`) conectándose a una instancia real de **MySQL**.

### Casos de Concurrencia Verificados

1. **Compra simultánea de objeto único**:
   - Dos personajes en la misma partida intentan comprar el mismo objeto único en paralelo (`Promise.all`).
   - **Resultado esperado y verificado**: Exactamente uno de los requerimientos HTTP obtiene respuesta `200 OK`, mientras que el segundo es rechazado con conflicto HTTP `409 Conflict` (o error de disponibilidad/validación de objeto único en la partida).

2. **Rechazo de objeto único duplicado en la partida**:
   - Si un personaje intenta adquirir otro ejemplar de un objeto único con el mismo nombre en la misma partida, la transacción detecta la presencia del objeto en el inventario y cancela la operación sin modificar dinero ni inventarios.

3. **Venta simultánea de objeto único**:
   - El propietario del objeto único lanza dos peticiones concurrentes de venta hacia la tienda (`Promise.all`).
   - **Resultado esperado y verificado**: Una sola venta se procesa (`200 OK`), acreditando el saldo exactamente una vez. La segunda solicitud falla con `409 Conflict` ("El objeto no está en tu inventario"). El objeto pasa a estar disponible en la tienda y su inventario se libera a `null`.

## Ejecución Automatizada de Integración

Command:
```powershell
$env:TEST_DB_HOST = '127.0.0.1'
$env:TEST_DB_PORT = '3306'
$env:TEST_DB_USER = 'root'
$env:TEST_DB_PASSWORD = '***'
npm run test:integration
```

Output resumen de ejecución:
```text
✔ dos compras concurrentes del mismo objeto: solo una gana y solo un débito
✔ dos ventas concurrentes del mismo objeto: solo una gana y se acredita una sola vez
✔ concurrencia de compra y venta de objeto único
✔ casos borde: saldo insuficiente, objeto ajeno, venta a tienda de otra clase, posición ocupada y capacidad al límite
```
