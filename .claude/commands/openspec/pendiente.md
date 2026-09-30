---
description: Registrar un pendiente entre agentes en el change en curso
argument-hint: <de> <para> <descripción>
---
Registra un pendiente con:
`node .claude/scripts/orquestacion.mjs pendiente <change-en-curso> $ARGUMENTS`

- El change en curso aparece en `node .claude/scripts/orquestacion.mjs estado --activo`. Si no hay ninguno, pregunta al usuario a cuál change pertenece.
- Agentes válidos: `backend-dev`, `frontend-dev`, `test-engineer`, `principal`.
- La descripción debe decir **qué** se necesita (firma, pantalla, prueba) y **por qué**.
Muestra el ID `H-###` creado.
