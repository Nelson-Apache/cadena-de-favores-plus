# Tareas: add-necesidades

## 1. Dominio · backend-dev
- [ ] 1.1 Tipo `Commitment` (id, needId, itemLabel, quantity, helperId, status: comprometido | entregado | confirmado, fechas)
- [ ] 1.2 Función `applyCommitment(need, commitment)` que rechaza cantidades por encima de lo que falta (con pruebas)
- [ ] 1.3 Función `confirmDelivery` que actualiza `delivered` (con pruebas)
- [ ] 1.4 Validación del formulario de necesidad (con pruebas)

## 2. Datos · backend-dev
- [ ] 2.1 Ampliar `Repository`: `createNeed`, `commit`, `confirmDelivery`, `listCommitments`, `reportNeed`
- [ ] 2.2 Implementar en `mockRepository` (estado en memoria)

## 3. UI · frontend-dev
- [ ] 3.1 `features/help/RequestHelpPage.tsx` según `docs/design/stitch/pedir-ayuda`
- [ ] 3.2 Preselección de perfil por `?perfil=comerciante|familia`
- [ ] 3.3 `features/needs/NeedDetailPage.tsx` según `docs/design/stitch/detalle-necesidad`
- [ ] 3.4 Tarjeta "¿Cómo quieres ayudar?" con ítem, cantidad y botón "Me comprometo"
- [ ] 3.5 Bloque "Puntos cercanos sin ayuda" y redirección cuando la necesidad está cerrada
- [ ] 3.6 Reemplazar las rutas pendientes en `App.tsx`

## 4. Verificación · test-engineer
- [ ] Pruebas de los escenarios del delta de spec (una prueba por `#### Scenario:` con lógica)
- [ ] Revisión responsive 360 / 390 / 768 / 1024 / 1440 px y accesibilidad básica
- [ ] 4.1 Pruebas de dominio en verde
- [ ] 4.2 Tareas 1 y 5 del plan de pruebas de usuario (`docs/05-plan-de-pruebas.md`)
- [ ] 4.3 Revisión visual contra Stitch en desktop y celular
