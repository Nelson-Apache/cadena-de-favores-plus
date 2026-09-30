# Tareas: add-persistencia-local

## 1. Dominio · backend-dev
- [x] 1.1 Tipos `Profile` (id, nombre, tipo doc CC/NIT, rol usuario/coordinador, verificado simulado) y `Session`
- [x] 1.2 `canViewContact(request, viewerId)` y `roundCoordinates(loc)` (con pruebas)
- [x] 1.3 Validación de aceptación de tratamiento de datos antes de crear un perfil (con pruebas)

## 2. Datos · backend-dev
- [x] 2.1 `storage.ts`: interfaz `KeyValueStore` con implementaciones localStorage y memoria
- [x] 2.2 `localStorageRepository.ts` que implementa `Repository`, sembrado desde `mockData.ts`, clave versionada
- [x] 2.3 `resetDemoData()` para restablecer el estado inicial
- [x] 2.4 `session.ts`: perfiles de demostración, iniciar/cerrar sesión, rol actual
- [x] 2.5 Activar `localStorageRepository` en `data/index.ts`

## 3. UI · frontend-dev
- [x] 3.1 Pantalla "Ingresar" con selección de perfil de demostración y opción de crear perfil (mismo estilo de formularios)
- [x] 3.2 Aviso de tratamiento de datos (Ley 1581) con casilla obligatoria
- [x] 3.3 Menú de usuario en la barra superior (escritorio y celular) con rol y "Cerrar sesión"
- [x] 3.4 Botón "Restablecer datos de demostración" (visible para coordinador) con confirmación en pantalla, sin `confirm()`
- [x] 3.5 Aviso cuando el navegador no permite guardar datos

## 4. Verificación · test-engineer
- [x] Pruebas de los escenarios del delta de spec (una prueba por `#### Scenario:` con lógica)
- [x] Revisión responsive 360 / 390 / 768 / 1024 / 1440 px y accesibilidad básica
- [x] 4.1 Suite de contrato compartida: `mockRepository` y `localStorageRepository` (con almacén en memoria)
- [x] 4.2 Recargar la página conserva lo registrado; "Restablecer" vuelve a los datos iniciales
