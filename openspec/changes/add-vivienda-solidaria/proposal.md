# Change: Vivienda solidaria

## Why
Cadena de Favores atiende negocios, pero la pérdida de vivienda es igual de urgente y no tenía canal propio.
Después de un desastre los arriendos tienden a subir; el precio de referencia y el sello desincentivan ese alza.

## What Changes
- Formulario `/vivienda/ofrecer`: tipo de oferta, precio frente a la referencia, capacidad, tiempo, habitabilidad,
  ubicación y contacto.
- Ficha pública `/vivienda/:id` con sello "Arriendo solidario" o "Alojamiento solidario".
- Solicitud de vivienda por parte de una familia, con **consentimiento mutuo** antes de revelar dirección y teléfono.
- Búsqueda de viviendas por municipio, tipo de oferta y condiciones (niños, adultos mayores, mascotas).

## Impact
- Nueva capacidad: `vivienda-solidaria`.
- Reutiliza `domain/referencePrice.ts` (`referencePrice`, `sealFor`, `percentBelow`), ya probado.
- Diseños: `docs/design/stitch/ofrecer-vivienda`, `docs/design/stitch/ficha-vivienda`.
- Depende de `cuentas-y-privacidad` para el consentimiento mutuo real.

## Preguntas abiertas
- ¿Mínimo de arriendos para publicar una referencia? (hoy: 3 por barrio, si no, por municipio).
- ¿Quién puede certificar la inspección de habitabilidad? (propuesta: ingenieros de la Red lista o la alcaldía).
