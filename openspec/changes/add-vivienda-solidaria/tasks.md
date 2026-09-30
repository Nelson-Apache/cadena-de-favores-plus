# Tareas: add-vivienda-solidaria

## 1. Dominio · backend-dev
- [x] 1.1 Precio de referencia por barrio con respaldo por municipio (`referencePrice.ts`, hecho en bootstrap)
- [x] 1.2 Sello arriendo/alojamiento solidario (`sealFor`, hecho en bootstrap)
- [ ] 1.3 Estado de solicitud: pendiente → aceptada por ambas partes → contacto compartido | rechazada (con pruebas)
- [ ] 1.4 Filtro de viviendas por condiciones de la familia (con pruebas)

## 2. Datos · backend-dev
- [ ] 2.1 `Repository.createHousing`, `requestHousing`, `respondRequest`
- [ ] 2.2 Implementación en `mockRepository`

## 3. UI · frontend-dev
- [ ] 3.1 `features/housing/OfferHousingPage.tsx` con comparación visual contra la referencia (ver Stitch)
- [ ] 3.2 `features/housing/HousingDetailPage.tsx` con galería, sello y tarjeta "Solicitar esta vivienda"
- [ ] 3.3 Zona aproximada (círculo) en el mini mapa, nunca el punto exacto
- [ ] 3.4 Reemplazar rutas pendientes en `App.tsx`

## 4. Verificación · test-engineer
- [ ] Pruebas de los escenarios del delta de spec (una prueba por `#### Scenario:` con lógica)
- [ ] Revisión responsive 360 / 390 / 768 / 1024 / 1440 px y accesibilidad básica
- [ ] 4.1 Tarea 2: "Como persona que quiere ayudar, ofrecer una habitación para una familia"
- [ ] 4.2 Tarea 3: "Como familia, encontrar una vivienda gratis o en arriendo solidario en su municipio"
