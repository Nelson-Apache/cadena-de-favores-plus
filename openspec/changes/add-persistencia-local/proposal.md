# Change: Persistencia local, inicio de sesión simulado y privacidad

## Why
Es un proyecto universitario que se ejecuta en local y no se va a desplegar por ahora. Hoy los datos viven en memoria
y se pierden al recargar. Para las demostraciones y las pruebas con usuarios (fase de Testeo) se necesita que lo que
se registre se conserve, y que se puedan mostrar los roles (usuario y coordinador) y el consentimiento para compartir
el contacto, sin montar servidores ni bases de datos en la nube.

Reemplaza a `add-supabase-persistence` (retirado). Ver `docs/decisiones/ADR-003-persistencia-local.md`.

## What Changes
- `localStorageRepository`: implementa el puerto `Repository` guardando en el `localStorage` del navegador,
  sembrado con `mockData.ts` la primera vez. Pasa a ser el repositorio activo.
- Botón "Restablecer datos de demostración" para volver al estado inicial antes de cada prueba con usuarios.
- **Inicio de sesión simulado**: elegir un perfil de demostración (familia, comerciante, empresa que ayuda, coordinador).
  Sin contraseñas reales ni verificación externa; la cédula/NIT se registra y se marca como "verificada (simulada)".
- Roles `usuario` y `coordinador` para proteger el panel de coordinación.
- Consentimiento mutuo: dirección exacta y teléfono guardados aparte y visibles solo tras aceptación de ambas partes.
- Aviso de tratamiento de datos (Ley 1581 de 2012) al crear el perfil.

## Impact
- Nueva capacidad: `cuentas-y-privacidad`.
- Código: `app/src/data/localStorageRepository.ts`, `app/src/data/session.ts`, `app/src/data/index.ts`,
  pantallas de perfil/ingreso y menú de usuario.
- Sin cambios en las demás pantallas gracias al puerto `Repository`.
- Se elimina la dependencia `@supabase/supabase-js`.

## Fuera de alcance
- Servidor, base de datos compartida entre equipos y verificación real de identidad.
  Si más adelante se despliega, se agrega otro adaptador del puerto `Repository` (Supabase u otro) en un change nuevo.

## Preguntas abiertas
- ¿Los perfiles de demostración deben ser fijos o se pueden crear nuevos durante la prueba? (propuesta: ambos).
