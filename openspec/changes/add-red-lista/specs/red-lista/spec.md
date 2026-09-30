# red-lista (delta)

## ADDED Requirements

### Requirement: Registrar un recurso
El sistema SHALL permitir que una empresa o persona verificada registre un recurso indicando tipo (bodega,
transporte, planta eléctrica, equipos, horas profesionales, mano de obra o visibilidad), descripción, capacidad
cuando aplique, municipio y barrio, disponibilidad y contacto.

#### Scenario: Registrar un camión
- **WHEN** un empresario registra "Camión 3,5 t con conductor" en Armenia
- **THEN** el recurso aparece en el mapa como cuadrado azul "Disponible"
- **AND** el contacto no es público

#### Scenario: Capacidad obligatoria
- **WHEN** el tipo es bodega o transporte y no se indica capacidad
- **THEN** el formulario pide la capacidad antes de continuar

### Requirement: Reconfirmación semestral
El sistema SHALL pedir a quien registró un recurso que confirme su disponibilidad cada 6 meses y MUST ocultar del
mapa los recursos no confirmados después de ese plazo.

#### Scenario: Recurso por vencer
- **WHEN** se cumplen 6 meses desde la última confirmación
- **THEN** el dueño recibe un aviso para confirmar, pausar o retirar el recurso

#### Scenario: Recurso vencido
- **WHEN** el dueño no confirma
- **THEN** el recurso deja de mostrarse en el mapa hasta que lo confirme

### Requirement: Buscar recursos cercanos
El sistema SHALL permitir filtrar recursos por tipo y municipio y ordenarlos por cercanía a una necesidad.

#### Scenario: Comerciante busca bodega
- **WHEN** un comerciante de Quimbaya filtra por "Bodega"
- **THEN** ve las bodegas disponibles ordenadas por distancia
