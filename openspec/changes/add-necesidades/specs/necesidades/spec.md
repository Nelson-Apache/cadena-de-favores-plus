# necesidades (delta)

## ADDED Requirements

### Requirement: Registrar una necesidad
El sistema SHALL permitir que un usuario afectado registre una necesidad indicando perfil (comerciante o familia),
tipo, uno o más ítems con cantidad, número de personas, personas vulnerables, municipio y barrio.

#### Scenario: Familia pide carpas
- **WHEN** una familia registra "Carpas: 5" para 18 personas con niños en Quimbaya, barrio La Española
- **THEN** la necesidad aparece en el mapa en rojo ("Sin ayuda") con su prioridad calculada
- **AND** la ubicación pública es el barrio, no la dirección exacta

#### Scenario: Datos incompletos
- **WHEN** falta el tipo, la cantidad o el municipio
- **THEN** el formulario indica el campo faltante y no publica la necesidad

#### Scenario: Perfil preseleccionado
- **WHEN** el usuario llega desde "Comerciante afectado" en el inicio
- **THEN** el formulario abre con el perfil comerciante seleccionado

### Requirement: Detalle de una necesidad
El sistema SHALL mostrar en el detalle el estado, la prioridad con el aporte de cada uno de los 4 criterios,
el avance de cada ítem, el historial de compromisos y hasta 3 puntos cercanos sin ayuda con su distancia.

#### Scenario: Explicación de la prioridad
- **WHEN** el usuario abre una necesidad de prioridad alta
- **THEN** ve por qué es alta: tipo, personas, vulnerabilidad y días de espera

### Requirement: Comprometerse con una necesidad
El sistema SHALL permitir que quien ayuda se comprometa con una cantidad de un ítem sin superar lo que falta.

#### Scenario: Compromiso parcial
- **WHEN** alguien se compromete con 2 de 5 carpas
- **THEN** el ítem muestra "2 de 5 carpas" y el estado pasa a "Ayuda en camino"

#### Scenario: Cantidad mayor a lo que falta
- **WHEN** faltan 3 carpas y alguien intenta comprometer 5
- **THEN** el sistema limita el compromiso a 3 e informa que el resto no hace falta

### Requirement: Confirmar la entrega
El sistema SHALL permitir que quien ayuda marque un compromiso como entregado y que quien recibe confirme la entrega.

#### Scenario: Entrega confirmada completa
- **WHEN** el receptor confirma la entrega de todos los ítems
- **THEN** la necesidad pasa a "Atendida" (verde)

### Requirement: Redirigir ayuda de puntos cubiertos
El sistema SHALL, cuando alguien intenta ayudar a una necesidad cerrada, mostrarle los puntos rojos más cercanos.

#### Scenario: Oferta a necesidad cubierta
- **WHEN** una necesidad está comprometida al 100 % y alguien pulsa "Me comprometo"
- **THEN** el sistema indica que ya está cubierta y lista las necesidades sin ayuda más cercanas

### Requirement: Reportar publicación sospechosa
El sistema SHALL permitir a cualquier usuario reportar una necesidad sospechosa con un motivo.

#### Scenario: Reporte
- **WHEN** un usuario reporta una necesidad
- **THEN** el reporte queda registrado para revisión de un coordinador
