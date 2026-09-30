# cuentas-y-privacidad Specification

## Purpose
Conservar en el navegador lo que se registra, permitir ingresar con perfiles simulados (usuario y coordinador) y proteger
los datos personales: ubicación aproximada en público y contacto exacto solo con consentimiento de ambas partes.
Proyecto 100 % local, sin servidor (ADR-003).

## Requirements

### Requirement: Datos guardados en el equipo
El sistema SHALL guardar en el navegador todo lo que se registre (necesidades, recursos, viviendas, compromisos y
solicitudes), de modo que se conserve al recargar la página, sin requerir servidor ni conexión a una base de datos.

#### Scenario: Recargar la página
- **WHEN** un usuario registra una necesidad y recarga la página
- **THEN** la necesidad sigue apareciendo en el mapa

#### Scenario: Primera vez
- **WHEN** la plataforma se abre por primera vez en un navegador
- **THEN** se cargan los datos de demostración del Quindío

#### Scenario: Navegador sin almacenamiento
- **WHEN** el navegador no permite guardar datos
- **THEN** la plataforma funciona en memoria y muestra "Los datos no se guardarán al cerrar el navegador"

### Requirement: Restablecer datos de demostración
El sistema SHALL permitir a un coordinador restablecer los datos al estado inicial de demostración.

#### Scenario: Antes de una prueba con usuarios
- **WHEN** el coordinador confirma "Restablecer datos de demostración"
- **THEN** se borran los registros creados y se cargan de nuevo los datos iniciales

### Requirement: Inicio de sesión simulado
El sistema SHALL permitir ingresar eligiendo un perfil de demostración (familia damnificada, comerciante afectado,
empresa que ayuda o coordinador) o creando un perfil con nombre y cédula o NIT, sin contraseñas ni verificación externa.

#### Scenario: Ingresar como comerciante
- **WHEN** el usuario elige el perfil "Comerciante afectado"
- **THEN** la barra superior muestra su nombre y rol
- **AND** sus registros quedan asociados a ese perfil

#### Scenario: Publicar sin sesión
- **WHEN** alguien sin sesión intenta publicar un recurso, una vivienda o una necesidad
- **THEN** el sistema le pide ingresar primero

### Requirement: Tratamiento de datos (Ley 1581 de 2012)
El sistema SHALL pedir autorización expresa para el tratamiento de datos personales al crear un perfil e informar la finalidad.

#### Scenario: Crear perfil
- **WHEN** el usuario crea un perfil sin marcar la autorización
- **THEN** el sistema no crea el perfil e indica que la autorización es obligatoria

### Requirement: Ubicación aproximada pública
El sistema MUST mostrar en vistas públicas solo municipio, barrio y coordenadas redondeadas a unos 100 m.

#### Scenario: Consulta pública
- **WHEN** cualquier persona consulta necesidades, recursos o viviendas
- **THEN** no ve direcciones exactas, teléfonos ni correos

### Requirement: Consentimiento para compartir contacto
El sistema SHALL mostrar dirección exacta y teléfono solo a las dos partes de una solicitud aceptada.

#### Scenario: Aceptación mutua
- **WHEN** una solicitud queda aceptada por ambas partes
- **THEN** cada parte ve el contacto de la otra y ningún otro perfil lo ve

### Requirement: Roles
El sistema SHALL distinguir los roles `usuario` y `coordinador`, y MUST restringir el panel de coordinación y el
restablecimiento de datos al rol coordinador.

#### Scenario: Usuario sin rol coordinador
- **WHEN** un perfil con rol usuario abre `/coordinacion`
- **THEN** ve un mensaje de acceso restringido
