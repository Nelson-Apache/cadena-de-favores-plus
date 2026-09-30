# Diseño técnico: add-persistencia-local

## Almacenamiento
- Una sola clave versionada: `cdf-plus:v1` con `{ version, needs, resources, housing, commitments, housingRequests,
  reports, profiles, privateContacts, privateAddresses }`.
- Primera carga (o clave inexistente / versión distinta): se siembra desde `mockData.ts`.
- Cada escritura guarda el objeto completo (volumen pequeño, suficiente para demos).
- Si `localStorage` no está disponible (modo privado o bloqueado), se usa un almacén en memoria con la misma interfaz
  y se muestra un aviso: "Los datos no se guardarán al cerrar el navegador".

```
data/
├── repository.ts            # puerto (sin cambios de contrato para lo existente)
├── storage.ts               # KeyValueStore: localStorage | memoria (inyectable, para pruebas)
├── localStorageRepository.ts# implementa Repository sobre KeyValueStore
├── session.ts               # sesión simulada: perfil actual, rol, iniciar/cerrar
└── index.ts                 # repositorio activo = localStorageRepository
```

## SOLID
- **D:** `localStorageRepository` recibe un `KeyValueStore` → en pruebas se inyecta uno en memoria.
- **L:** `mockRepository` y `localStorageRepository` pasan la misma suite de contrato.
- **S:** la sesión (`session.ts`) está separada del acceso a datos.

## Privacidad (simulada, pero con el modelo correcto)
- Los tipos públicos siguen usando `ApproxLocation`.
- `privateContacts` y `privateAddresses` solo se devuelven por `getContactFor(requestId, viewerId)` si la solicitud
  está `aceptada` y el que consulta es una de las dos partes.
- Coordenadas públicas redondeadas a 3 decimales al guardar.

## Prioridad diaria (RF5)
Se recalcula al leer (`computePriority` con la fecha actual), por lo que siempre está al día sin procesos programados.
