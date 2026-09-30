---
description: Orquestar la implementación de un change aprobado delegando en backend-dev, frontend-dev y test-engineer hasta cerrar todas las tareas y pendientes
argument-hint: <change-id>
---
Eres el **coordinador**. Orquesta el change `$ARGUMENTS` siguiendo `docs/06-agentes-y-delegacion.md`.
No escribas código de otros territorios: delega.

## 1. Preparar
1. Lee `openspec/changes/$ARGUMENTS/` (proposal, design, tasks, deltas de spec, handoffs), `AGENTS.md` y `docs/07-guia-de-estilo.md`.
2. Confirma que la propuesta está aprobada. Si hay **preguntas abiertas que bloquean**, pregúntalas al usuario y detente.
3. Marca el change en curso:
   `node .claude/scripts/orquestacion.mjs iniciar $ARGUMENTS`

## 2. Ciclo de orquestación (repetir hasta "LISTO")
1. Consulta a quién delegar:
   `node .claude/scripts/orquestacion.mjs siguiente`
2. Delega con la herramienta de agentes al agente indicado (si dice "en paralelo", lanza ambos a la vez). En el mensaje incluye:
   - `change-id`, las tareas exactas (texto de `tasks.md`) o el pendiente `H-###` a resolver,
   - el resumen de entrega del agente anterior (firmas nuevas, archivos, casos a probar),
   - la instrucción: "Marca `- [x]` tus tareas al terminar y registra lo que necesites de otro agente con
     `node .claude/scripts/orquestacion.mjs pendiente $ARGUMENTS <tu-agente> <agente-destino> \"<qué y por qué>\"`".
3. Al recibir el resumen:
   - Si el agente resolvió un pendiente, ciérralo: `node .claude/scripts/orquestacion.mjs resolver $ARGUMENTS H-### "<resultado>"`.
   - Si `test-engineer` reporta un fallo, crea un pendiente para el dueño del código (`test-engineer → backend-dev|frontend-dev`).
   - Revisa `node .claude/scripts/orquestacion.mjs estado --activo`.
4. Vuelve al paso 1.

Reglas del ciclo:
- **Pendientes primero:** un `H-###` abierto bloquea a otro agente; se resuelve antes de seguir con tareas nuevas.
- Máximo **3 rondas** sobre el mismo pendiente o fallo; si no se resuelve, detente y explica al usuario qué decidir.
- Si un agente necesita una decisión de negocio, no la inventes: pregunta al usuario.

## 3. Cerrar
Cuando `siguiente` responda **LISTO**:
1. Ejecuta el subagente `spec-reviewer` sobre `$ARGUMENTS`. Si encuentra "No cumple", crea los pendientes y vuelve al ciclo.
2. Desde `app/`: `npm run check` y `npm run build`.
3. `node .claude/scripts/orquestacion.mjs terminar`
4. Resume: tareas por agente, pendientes resueltos, escenarios verificados. Propón `/openspec:archive $ARGUMENTS`.

Para pausar a pedido del usuario: `node .claude/scripts/orquestacion.mjs terminar` (el avance queda en `tasks.md` y `handoffs.md`).
