# plataforma-web Specification

## Purpose
Estructura común de la aplicación web de Cadena de Favores+: navegación, identidad visual, página de inicio,
adaptación a celular y rendimiento con conexión débil.

## Requirements

### Requirement: Navegación principal
El sistema SHALL mostrar en todas las pantallas una barra superior con el logo, los enlaces Mapa, Red lista,
Vivienda solidaria y Coordinación, y las acciones "Pedir ayuda" y "Ofrecer ayuda".

#### Scenario: Acceso a las funciones desde cualquier pantalla
- **WHEN** el usuario está en cualquier ruta de la plataforma
- **THEN** ve la barra superior con los cuatro enlaces y las dos acciones
- **AND** el enlace de la sección actual aparece resaltado

#### Scenario: Menú en celular
- **WHEN** el ancho de pantalla es menor a 1024 px
- **THEN** los enlaces se agrupan en un menú desplegable con botón de abrir y cerrar
- **AND** las acciones "Pedir ayuda" y "Ofrecer ayuda" siguen visibles dentro del menú

#### Scenario: "Ofrecer ayuda" lleva a donde hace más falta
- **WHEN** el usuario pulsa "Ofrecer ayuda"
- **THEN** abre el mapa con el filtro "Dónde hace más falta" activo

### Requirement: Página de inicio
El sistema SHALL presentar en `/` la propuesta de valor, métricas de la red, la línea de tiempo
Antes · Durante · Después, las tres funciones (Red lista, Vivienda solidaria, Mapa de prioridades),
los tres perfiles de participación y los elementos de confianza.

#### Scenario: Métricas calculadas desde los datos
- **WHEN** se carga la página de inicio
- **THEN** muestra la cantidad de recursos disponibles de la Red lista, de viviendas solidarias,
  de necesidades sin ayuda y de municipios conectados, calculadas desde el repositorio de datos

#### Scenario: Llamados a la acción por perfil
- **WHEN** el usuario elige "Comerciante afectado", "Familia damnificada" o "Empresa o persona que ayuda"
- **THEN** es llevado a pedir ayuda con su perfil preseleccionado o al mapa en la vista "Dónde hace más falta"

### Requirement: Identidad visual propia
El sistema SHALL usar el design system de `docs/design/design-system.md` (petróleo, tinta, crema, lila para
viviendas, azul pizarra para recursos y semáforo de estado), diferenciándose visualmente de cadenadefavores.co.

#### Scenario: Colores semánticos exclusivos
- **WHEN** se muestra un elemento de estado, vivienda o recurso
- **THEN** usa el color reservado para esa entidad y además un texto o forma que lo identifique

### Requirement: Estilos compilados sin CDN
El sistema SHALL compilar Tailwind CSS en el build y MUST NOT depender de `cdn.tailwindcss.com` en tiempo de ejecución.

#### Scenario: Red que bloquea el CDN de Tailwind
- **WHEN** el usuario abre la plataforma desde una red colombiana que bloquea `tailwindcss.com`
- **THEN** la interfaz se muestra con todos sus estilos

### Requirement: Adaptable a celular y conexión débil
El sistema SHALL ser utilizable desde 360 px de ancho y cargar la página de inicio en conexión 3G lenta.

#### Scenario: Pantalla pequeña
- **WHEN** el ancho es 360 px
- **THEN** no aparece desplazamiento horizontal y todos los botones tienen un área táctil de al menos 40 px

### Requirement: Rutas de funciones pendientes
El sistema SHALL mostrar, para cada ruta cuya funcionalidad aún no está implementada, una pantalla que indique
el change de OpenSpec que la implementa y su diseño de referencia.

#### Scenario: Ruta especificada pero no implementada
- **WHEN** el usuario abre `/red-lista/registrar` antes de aplicar `add-red-lista`
- **THEN** ve el nombre de la función, el change `add-red-lista` y enlaces para volver al mapa o al inicio

#### Scenario: Ruta inexistente
- **WHEN** el usuario abre una ruta que no existe
- **THEN** ve una página 404 con enlace al inicio
