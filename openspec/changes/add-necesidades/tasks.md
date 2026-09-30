# Tareas: add-necesidades

## 1. Dominio · backend-dev
- [x] 1.1 Tipo `Commitment` (id, needId, itemLabel, quantity, helperId, status: comprometido | entregado | confirmado, fechas)
- [x] 1.2 Función `applyCommitment(need, commitment)` que rechaza cantidades por encima de lo que falta (con pruebas)
- [x] 1.3 Función `confirmDelivery` que actualiza `delivered` (con pruebas)
- [x] 1.4 Validación del formulario de necesidad (con pruebas)
- [x] 1.5 Regla: máximo 3 necesidades activas por usuario, con `canPublishNeed(activeCount)` (con pruebas)
- [x] 1.6 `confirmDelivery` acepta al receptor o a un coordinador (con pruebas)

## 2. Datos · backend-dev
- [x] 2.1 Ampliar `Repository`: `createNeed`, `commit`, `confirmDelivery`, `listCommitments`, `reportNeed`
- [x] 2.2 Implementar en `mockRepository` (estado en memoria)

## 3. UI · frontend-dev
- [x] 3.1 `features/help/RequestHelpPage.tsx` según `docs/design/stitch/pedir-ayuda`
- [x] 3.2 Preselección de perfil por `?perfil=comerciante|familia`
- [x] 3.3 `features/needs/NeedDetailPage.tsx` según `docs/design/stitch/detalle-necesidad`
- [x] 3.4 Tarjeta "¿Cómo quieres ayudar?" con ítem, cantidad y botón "Me comprometo"
- [x] 3.5 Bloque "Puntos cercanos sin ayuda" y redirección cuando la necesidad está cerrada
- [x] 3.6 Reemplazar las rutas pendientes en `App.tsx`

## 4. Verificación · test-engineer
- [x] Pruebas de los escenarios del delta de spec (una prueba por `#### Scenario:` con lógica)
- [x] Revisión responsive 360 / 390 / 768 / 1024 / 1440 px y accesibilidad básica
- [x] 4.1 Pruebas de dominio en verde
- [x] 4.2 Tareas 1 y 5 del plan de pruebas de usuario (`docs/05-plan-de-pruebas.md`)
- [x] 4.3 Revisión visual contra Stitch en desktop y celular
