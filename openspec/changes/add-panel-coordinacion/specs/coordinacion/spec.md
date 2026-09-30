# coordinacion (delta)

## ADDED Requirements

### Requirement: Resumen por municipio
El sistema SHALL mostrar a los coordinadores, por cada municipio, cuántas necesidades están sin ayuda, en camino y atendidas.

#### Scenario: Identificar la zona rezagada
- **WHEN** un coordinador abre `/coordinacion`
- **THEN** ve una barra por municipio con los tres estados y sus números
- **AND** el municipio con más necesidades sin ayuda aparece resaltado como "Se está quedando atrás"

### Requirement: Indicadores generales
El sistema SHALL mostrar el total de necesidades sin ayuda, en camino y atendidas, y el tiempo medio de respuesta.

#### Scenario: KPIs
- **WHEN** se carga el panel
- **THEN** los cuatro indicadores se calculan con los datos actuales

### Requirement: Necesidades prioritarias sin atender
El sistema SHALL listar las necesidades sin ayuda ordenadas por prioridad y días de espera.

#### Scenario: Tabla priorizada
- **WHEN** el coordinador revisa la tabla
- **THEN** la primera fila es la necesidad sin ayuda de mayor prioridad

### Requirement: Acceso restringido
El sistema MUST permitir el panel solo a usuarios con rol coordinador.

#### Scenario: Usuario sin rol
- **WHEN** un usuario sin rol coordinador abre `/coordinacion`
- **THEN** ve un mensaje de acceso restringido
