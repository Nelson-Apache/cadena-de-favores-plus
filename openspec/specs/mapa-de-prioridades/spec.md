# mapa-de-prioridades Specification

## Purpose
Mostrar en un mapa del Quindío las necesidades, los recursos de la Red lista y las viviendas solidarias, con el
estado de la ayuda y la prioridad de cada necesidad, para que la ayuda se reparta y no se sature un solo lugar.

## Requirements

### Requirement: Mapa con tres tipos de elementos
El sistema SHALL mostrar necesidades, recursos y viviendas en el mapa con íconos de forma diferente:
pin circular para necesidades, cuadrado azul para recursos y casa lila para viviendas.

#### Scenario: Leyenda visible
- **WHEN** el usuario abre `/mapa`
- **THEN** ve el mapa del Quindío centrado en el departamento
- **AND** una leyenda con Sin ayuda, Ayuda en camino, Atendida, Recurso Red lista y Vivienda disponible

#### Scenario: Ubicación aproximada
- **WHEN** se dibuja cualquier elemento en el mapa
- **THEN** se usa la coordenada aproximada del barrio y nunca la dirección exacta

### Requirement: Estado de la ayuda
El sistema SHALL asignar a cada necesidad un estado que define el color de su marcador:
- **Sin ayuda (rojo):** nadie se ha comprometido.
- **Ayuda en camino (amarillo):** hay compromisos, pero falta cubrir o entregar.
- **Atendida (verde):** todo lo pedido fue entregado y confirmado.

#### Scenario: Sin compromisos
- **WHEN** una necesidad de 5 carpas tiene 0 comprometidas
- **THEN** su estado es "Sin ayuda"

#### Scenario: Compromiso parcial
- **WHEN** una necesidad de 5 carpas tiene 2 comprometidas
- **THEN** su estado es "Ayuda en camino"
- **AND** la tarjeta muestra la barra de avance "2 de 5 carpas"

#### Scenario: Comprometida pero no entregada
- **WHEN** una necesidad tiene el 100 % comprometido pero no todo entregado
- **THEN** su estado sigue siendo "Ayuda en camino"

#### Scenario: Entregada
- **WHEN** todo lo pedido fue entregado
- **THEN** su estado es "Atendida"

### Requirement: Cierre al 100 %
El sistema SHALL dejar de aceptar ofertas para una necesidad cuando todos sus ítems están comprometidos al 100 %,
sin contar compromisos que superen la cantidad pedida.

#### Scenario: Necesidad cubierta
- **WHEN** todos los ítems de una necesidad tienen comprometida la cantidad pedida
- **THEN** la necesidad no acepta nuevas ofertas

### Requirement: Nivel de prioridad
El sistema SHALL calcular la prioridad (alta, media o baja) de cada necesidad con cuatro criterios de 0 a 3 puntos:
tipo de necesidad, personas afectadas, vulnerabilidad y días de espera. Alta desde 8 puntos, media desde 5.

| Criterio | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| Tipo | visibilidad | equipos, asesoría | transporte, bodega, reparación, mano de obra | techo, agua, alimento, carpas, salud |
| Personas | 0 | 1–3 | 4–9 | 10 o más |
| Vulnerabilidad (niños, adultos mayores, discapacidad, enfermos) | ninguna | — | 1 tipo | 2 o más tipos |
| Días de espera | — | 0 | 1–2 | 3 o más |

#### Scenario: Necesidad vital con población vulnerable
- **WHEN** una necesidad de techo afecta a 18 personas, incluye niños y adultos mayores y lleva 3 días
- **THEN** obtiene 12 puntos y prioridad alta

#### Scenario: Necesidad no vital reciente
- **WHEN** una necesidad de equipos afecta a 2 personas sin vulnerables y se registró hoy
- **THEN** su prioridad es baja

#### Scenario: La prioridad crece con la espera
- **WHEN** pasan días sin que la necesidad sea atendida
- **THEN** su puntaje de espera aumenta hasta 3

### Requirement: Filtros
El sistema SHALL permitir filtrar por capa (todo, necesidades, recursos, viviendas), municipio, estado, prioridad
y texto de municipio o barrio.

#### Scenario: Filtrar por municipio
- **WHEN** el usuario elige "Quimbaya"
- **THEN** la lista y el mapa solo muestran elementos de Quimbaya

#### Scenario: Sin resultados
- **WHEN** ningún elemento cumple los filtros
- **THEN** se muestra el mensaje "No hay resultados con estos filtros"

### Requirement: Dónde hace más falta
El sistema SHALL ofrecer la vista "Dónde hace más falta", que oculta las necesidades atendidas y ordena primero
las que no tienen ayuda, luego por nivel de prioridad, puntaje y días de espera.

#### Scenario: Orden de la vista
- **WHEN** el usuario activa "Dónde hace más falta"
- **THEN** la primera tarjeta es una necesidad sin ayuda de prioridad alta
- **AND** no aparece ninguna necesidad atendida

### Requirement: Aviso de zona rezagada
El sistema SHALL mostrar sobre el mapa un aviso con el municipio que tiene más necesidades sin ayuda.

#### Scenario: Quimbaya se queda atrás
- **WHEN** Quimbaya tiene más necesidades sin ayuda que cualquier otro municipio
- **THEN** el aviso dice "Quimbaya tiene N necesidades sin ayuda"
- **AND** al pulsar "Ver dónde hace más falta" se filtra Quimbaya con esa vista activa

### Requirement: Lista y mapa sincronizados
El sistema SHALL resaltar en el mapa el elemento seleccionado en la lista y centrar el mapa en él.

#### Scenario: Seleccionar una tarjeta
- **WHEN** el usuario pasa el cursor o pulsa "Ver en el mapa" en una tarjeta
- **THEN** el mapa vuela a ese elemento y su marcador se muestra resaltado

#### Scenario: Celular
- **WHEN** el ancho es menor a 1024 px
- **THEN** un botón flotante alterna entre "Ver mapa" y "Ver lista"
