# Change: Panel de coordinación por municipio

## Why
Los coordinadores necesitan ver qué zonas se están quedando atrás para mover la ayuda. En el sismo, Armenia
concentró la ayuda mientras municipios como Quimbaya esperaban.

## What Changes
- Ruta `/coordinacion` (solo rol coordinador) con KPIs, barras apiladas por municipio (sin ayuda / en camino /
  atendidas), mapa de calor, tabla de necesidades prioritarias y alertas.
- Alertas: ofertas redirigidas por necesidad cubierta, recursos de la Red lista por reconfirmar, reportes pendientes.

## Impact
- Nueva capacidad: `coordinacion`.
- Diseño: `docs/design/stitch/panel-coordinacion`.
- Requiere roles de `cuentas-y-privacidad`.
