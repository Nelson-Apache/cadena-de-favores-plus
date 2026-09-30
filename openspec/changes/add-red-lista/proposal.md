# Change: Red lista — registrar recursos antes de la emergencia

## Why
Hallazgo principal: la ayuda existía en la región, pero se perdieron días organizándola. La Red lista permite
registrar desde ahora lo que se podría prestar, para que la ayuda salga en horas y no en semanas. Cubre la fase
de preparación que pide la Ley 1523 de 2012.

## What Changes
- Formulario por pasos `/red-lista/registrar`: tipo, detalles, ubicación y disponibilidad, contacto y verificación.
- Recursos visibles en el mapa como cuadrado azul "Disponible".
- Reconfirmación cada 6 meses: aviso al dueño y ocultamiento de recursos vencidos.
- "Mis recursos": pausar, editar o retirar un recurso.

## Impact
- Nueva capacidad: `red-lista`.
- Reutiliza `domain/availability.ts` (`needsReconfirmation`).
- Diseño: `docs/design/stitch/registrar-recurso`.

## Preguntas abiertas
- Canal del recordatorio semestral: correo, SMS o WhatsApp (depende de costos).
