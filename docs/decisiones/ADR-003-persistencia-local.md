# ADR-003: Persistencia local en lugar de Supabase

- **Estado:** Aceptada · 2026-09-29 (reemplaza la propuesta `add-supabase-persistence`)
- **Contexto:** Es un proyecto universitario que se ejecuta en local para demostraciones y pruebas con usuarios;
  no se va a desplegar por ahora. Una base de datos en la nube agrega cuentas, llaves, costos y dependencia de red
  sin aportar a los objetivos del curso.
- **Decisión:**
  1. Guardar los datos en el `localStorage` del navegador mediante un adaptador del puerto `Repository`
     (`localStorageRepository`), sembrado con los datos de demostración.
  2. Inicio de sesión simulado con perfiles de demostración y roles `usuario` / `coordinador`.
  3. Mantener el modelo de privacidad (ubicación aproximada pública, contacto solo con consentimiento mutuo),
     aunque la verificación de cédula/NIT sea simulada.
  4. Retirar `@supabase/supabase-js` del proyecto.
- **Consecuencias:**
  - La app funciona 100 % en local con `npm run dev`, sin servidores ni credenciales.
  - Los datos son por navegador: no se comparten entre equipos. Para cada prueba con usuarios se usa
    "Restablecer datos de demostración".
  - Si en el futuro se despliega, basta con un nuevo adaptador del puerto `Repository` (Supabase u otro backend)
    en un change nuevo; las pantallas no cambian.
