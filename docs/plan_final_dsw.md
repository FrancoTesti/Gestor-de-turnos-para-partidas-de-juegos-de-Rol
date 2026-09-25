# Plan final de DSW: solo lo que falta

Fecha: 24 de septiembre de 2026. Base verificada: `main` en `4bb8ef6`, con la integración continua
en verde ([Actions 35610631280](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/actions/runs/35610631280)).

Este plan cubre únicamente lo pendiente. No repite lo ya entregado ni lo vuelve a asignar.

## Lo que queda fuera de este plan

El señor Emanuel Salomón ya presentó y está fusionado:

- Cuentas y perfiles de usuario, con sus pruebas.
- Índice de documentación `docs/README.md` y los documentos que enlaza: `api.md`, `modelo.md`,
  `demo.md`, `despliegue.md` y la matriz de requisitos de `entrega.md`.
- Aviso de backend caído en lugar de `Error HTTP 502`.
- Actualización de `proposal.md` y del `README.md` principal.

Todo eso se considera cerrado y no se reasigna. Las tareas de Emanuel que aparecen más abajo son
exclusivamente las que todavía no presentó.

## Punto de partida verificado

| Comprobación | Resultado al 24/9 |
| --- | --- |
| `main` | `4bb8ef6`, sin commits nuevos desde el 21/9 |
| Integración continua | Verde: frontend, backend (cobertura, integración MySQL, 9 recorridos de navegador) y documentación |
| Pruebas | 102 unitarias de backend, 22 de integración, 71 de frontend, 9 de navegador |
| Cobertura | Umbrales aprobados, con valores bajos (backend 30 % de líneas, frontend 47 %) |
| Verificación manual | 4 casillas marcadas de 25 en `docs/pruebas_manuales.md` |
| Documentación de gestión | `docs/minutas.md` y `docs/seguimiento.md` no existen |
| Video de demostración | No grabado |

## Requisitos de cátedra que siguen abiertos

Según el [TP de la cátedra](https://github.com/utnfrrodsw/tp) y su [guía de documentación](https://github.com/utnfrrodsw/tp/blob/main/docs.md):

| Requisito | Instancia | Estado | Qué falta |
| --- | --- | --- | --- |
| Minutas de reunión y avance | Regularidad y AD | Ausente | Crear `docs/minutas.md` |
| Tracking de features, bugs e issues | Regularidad y AD | Ausente | Crear `docs/seguimiento.md` |
| Evidencia de ejecución de los tests automáticos | AD | Parcial | Documento con la salida real de cada suite y enlace al run de Actions |
| Video de demostración | AD | Ausente | Grabar y enlazar |
| Deploy y credenciales | AD (TBD) | Sin decisión | Definir si se despliega o se declara entrega local por escrito |
| Contacto para coordinar la defensa | AD | Ausente | Agregar el contacto del grupo en `proposal.md` |
| Verificación manual del sistema | Ambas | 4 de 25 | Completar el checklist con fecha y responsable |
| Revisión en tres tamaños de pantalla | Regularidad | Automatizada | Falta la mirada humana sobre las capturas del run |
| Alcance adicional voluntario | Opcional | No iniciado | Decisión del grupo: se puede declarar fuera de alcance |

## Reparto de lo pendiente

Cada integrante tiene entre tres y cuatro entregables. Nadie queda con un bloque completo y nadie
queda solo con casillas del checklist.

| Integrante | Entregables | Peso |
| --- | --- | ---: |
| Franco Testi | Video de demostración, checklist de juego, contraste de `api.md` de sesiones y misiones | 3 |
| Alejandro Ciesco | Instalación desde cero, checklist de clases y personajes, contraste de `api.md` de su módulo | 3 |
| Octavio Gudiño | Evidencia de tests de concurrencia, checklist de objetos y tiendas, contraste de `api.md` de su módulo | 3 |
| Emanuel Salomón | Minutas, seguimiento, decisión de despliegue con credenciales, contacto para la defensa | 4 |
| Renzo Scollo | Evidencia de tests automáticos, revisión de capturas, actualización de la matriz, umbrales de cobertura | 4 |

### Franco Testi — Demostración y flujo de juego

1. Grabar el video de demostración siguiendo `docs/demo.md`: dos roles, entre ocho y diez minutos,
   con los datos que preparó Emanuel. Es el requisito de aprobación directa que más tiempo lleva.
2. Ejecutar y firmar el checklist de partidas, sesiones, misiones, recompensas, karma y cierre.
3. Contrastar `docs/api.md` con las rutas de sesiones y misiones: ruta, cuerpo, respuesta y código de
   error. Corregir el documento donde no coincida.

Criterio de terminado: video enlazado, casillas firmadas con fecha y documento de API corregido.

### Alejandro Ciesco — Instalación y módulo de personajes

1. Probar la instalación completa desde cero, como si fuera el corrector: clonar, `npm ci`, crear la
   base, completar el `.env`, `schema:create`, arrancar y entrar. Anotar cualquier paso que falte en
   `docs/instalacion.md` y corregirlo. Es la mejor prueba de que el README sirve.
2. Ejecutar y firmar el checklist de clases, personajes, filtros y acceso a partidas públicas y
   privadas.
3. Contrastar `docs/api.md` con las rutas de clases, personajes y partidas.

Criterio de terminado: instalación reproducible en una máquina distinta a la del desarrollo, con las
correcciones ya escritas en la guía.

### Octavio Gudiño — Comercio e integridad de datos

1. Consolidar la evidencia de concurrencia: enlazar en `docs/evidencia_concurrencia.md` el run de
   integración que la respalda y la fecha, para que no sea solo un relato.
2. Ejecutar y firmar el checklist de objetos, tiendas, inventarios, compra, venta y rango de precio.
3. Contrastar `docs/api.md` con las rutas de objetos, tiendas e inventarios.

Criterio de terminado: evidencia con enlace verificable y checklist de su módulo firmado.

### Emanuel Salomón — Gestión y cierre de la entrega

1. `docs/minutas.md`: una minuta por reunión con fecha, participantes, decisiones y tareas. Alcanza
   con tres, incluida la previa a la entrega de octubre.
2. `docs/seguimiento.md`: tabla de funcionalidades, defectos y estado, con el PR que los resuelve, y
   la metodología de trabajo declarada. Los dos documentos son requisito de la cátedra.
3. Decisión escrita sobre el despliegue en `docs/despliegue.md`. Si la entrega es local, decir cómo
   la levanta el corrector y qué credenciales de demostración debe crear.
4. Contacto del grupo para coordinar la defensa, en `proposal.md`.

Criterio de terminado: la cátedra puede leer quién hizo qué y cómo se levanta el sistema sin
preguntar nada al grupo.

### Renzo Scollo — Evidencia automática y coherencia documental

1. `docs/evidencia_tests.md` con la salida real de cada suite y el enlace al run de Actions:
   `npm test`, `npm run test:integration`, `npm run test:coverage` en backend y frontend, y
   `npm run test:e2e`. Es requisito de aprobación directa.
2. Revisar a ojo las capturas del recorrido responsive en los tres tamaños, en especial juego,
   misiones e inventarios. La automatización detecta desborde, no fealdad.
3. Actualizar la fila «Revisión responsive y de accesibilidad» de `docs/entrega.md`, que todavía dice
   «Parcial» aunque la auditoría se cerró el 21/9.
4. Subir los umbrales de cobertura instrumentando las pruebas de integración, hoy fuera del cálculo.
   Es lo único que permite pasar de 30 % a un número presentable. No bloquea la entrega.

Criterio de terminado: evidencia publicada, matriz sin datos viejos y cobertura medida sobre lo que
realmente se prueba.

## Ya está hecho: no reasignar

Para evitar trabajo duplicado, esto se verificó en `main` y no vuelve a la lista:

- Etiquetas `htmlFor` asociadas en los formularios de clases y personajes.
- Saldo actual y saldo resultante visibles antes de vender un objeto.
- Resumen de monedas y XP entregados por sesión, sumando las misiones completadas.
- Rechazos cubiertos con pruebas de integración: reparto con suma incorrecta, segunda sesión en
  curso, misión repetida, autocalificación y doble calificación.
- Responsive y accesibilidad automatizados: 12 pantallas en tres tamaños y axe-core sin violaciones
  graves.
- Verificador de enlaces de la documentación y cobertura publicada como artefacto en Actions.

## Calendario

| Fecha | Instancia de cátedra | Qué tiene que estar listo |
| --- | --- | --- |
| 24/9 al 28/9 | Trabajo interno | Minutas y seguimiento creados; checklist manual al menos a la mitad |
| 29/9 al 3/10 | Trabajo interno | Checklist completo; defectos corregidos con su PR |
| 4/10 al 8/10 | Preparación | Evidencia de tests, revisión de capturas, video grabado, decisión de despliegue |
| 9/10 | **Fin del TP con alcance de regularidad** | `main` verde, documentación de regularidad completa |
| 10/10 y 11/10 | Ensayo | Ensayo general con dos roles y corrección de lo que aparezca |
| 12/10 al 16/10 | **Primera presentación de regularidad o aprobación directa** | Defensa oral y entrega por el formulario de la cátedra |
| 26/10 al 30/10 | Primer recuperatorio o globalizador | Solo si hizo falta |
| 9/11 al 13/11 | Última instancia y defensa del TP | Cierre definitivo |

## Actividades de la materia fuera del TP

La nota de regularidad combina el TP de backend (40), el TP de frontend (40), la Prueba de Concepto
(30) y la evaluación de desarrollo (40). De esos cuatro, el repositorio solo da cuenta de los dos
del TP. La Prueba de Concepto y la evaluación no dejan evidencia acá: conviene confirmar con la
cátedra que están aprobadas y guardar el comprobante junto con la carpeta de entrega.

## Reglas de trabajo

1. Nadie fusiona con la integración continua en rojo. La plantilla de PR ya lo recuerda.
2. Una rama por objetivo, creada desde `main` actualizado.
3. Toda corrección funcional entra con su prueba.
4. Lo que no se puede demostrar no se declara como hecho.
5. A partir del 9 de octubre no se agrega funcionalidad: solo se corrige y se ensaya.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Llegar al 12/10 sin haber probado a mano | Cada integrante ejecuta su parte esta semana, no la anterior a la entrega |
| Grabar el video con datos improvisados | Datos de demostración reproducibles antes de grabar |
| Descubrir en la defensa que la documentación no coincide con el código | Contraste de `api.md` y revisión de la matriz de requisitos esta semana |
| Que el corrector no pueda levantar el proyecto | Probar la instalación desde cero en una máquina que no sea la del desarrollo |
| Que un merge tarde vuelva a romper `main` | Nadie fusiona sin el run verde de su propia rama |

## Definición de terminado

Para la entrega del 12 al 16 de octubre:

- checklist manual completo, firmado y con los defectos corregidos;
- `docs/minutas.md` y `docs/seguimiento.md` publicados;
- video de demostración grabado y enlazado;
- evidencia de los tests automáticos con salida real y enlace al run;
- decisión de despliegue escrita y credenciales de demostración si corresponde;
- `main` en verde, sin ramas pendientes de merge;
- `proposal.md` con los links a los PR y el contacto del grupo.
