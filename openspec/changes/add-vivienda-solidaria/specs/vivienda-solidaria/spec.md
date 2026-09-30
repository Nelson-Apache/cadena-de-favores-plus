# vivienda-solidaria (delta)

## ADDED Requirements

### Requirement: Ofrecer una vivienda
El sistema SHALL permitir ofrecer una casa o habitación indicando tipo de oferta (gratis, arriendo solidario o
arriendo normal), precio mensual si aplica, capacidad (personas; si acepta niños, adultos mayores o mascotas),
tiempo disponible (1 semana, 1 mes, 3 meses o más), inspección de habitabilidad (sí, no, en trámite),
municipio, barrio y teléfono.

#### Scenario: Oferta de arriendo solidario
- **WHEN** alguien ofrece una habitación en Calarcá, barrio Las Américas, por $450.000 al mes para 4 personas por 3 meses
- **THEN** la vivienda aparece en el mapa con ícono de casa lila

#### Scenario: Oferta gratis
- **WHEN** el tipo es "Gratis"
- **THEN** no se pide precio y la vivienda lleva el sello "Alojamiento solidario"

### Requirement: Precio de referencia y sello
El sistema SHALL calcular un precio de referencia como el promedio de los arriendos normales del barrio
(mínimo 3; si no, del municipio) y asignar el sello "Arriendo solidario" a quien cobre por debajo.

#### Scenario: Precio por debajo de la referencia
- **WHEN** la referencia de Las Américas es $620.000 y la oferta es $450.000
- **THEN** el formulario muestra "27 % por debajo" y la vivienda recibe el sello "Arriendo solidario"

#### Scenario: Precio igual o superior
- **WHEN** el precio es igual o mayor a la referencia
- **THEN** la vivienda se publica sin sello

#### Scenario: Sin datos suficientes
- **WHEN** ni el barrio ni el municipio tienen 3 arriendos registrados
- **THEN** el formulario indica que aún no hay precio de referencia

### Requirement: Buscar vivienda
El sistema SHALL permitir a una familia filtrar viviendas por municipio, tipo de oferta y condiciones.

#### Scenario: Familia con adulto mayor en Quimbaya
- **WHEN** filtra "Gratis o arriendo solidario", municipio Quimbaya y "acepta adultos mayores"
- **THEN** solo ve viviendas que cumplen las tres condiciones

### Requirement: Contacto con consentimiento mutuo
El sistema MUST mostrar públicamente solo municipio, barrio y zona aproximada, y SHALL revelar dirección exacta y
teléfono únicamente cuando la familia solicita y el oferente acepta.

#### Scenario: Solicitud aceptada
- **WHEN** una familia solicita una vivienda y el oferente acepta
- **THEN** ambas partes ven la dirección exacta y el teléfono de la otra

#### Scenario: Solicitud pendiente o rechazada
- **WHEN** la solicitud no ha sido aceptada
- **THEN** ninguna de las partes ve la dirección exacta ni el teléfono
