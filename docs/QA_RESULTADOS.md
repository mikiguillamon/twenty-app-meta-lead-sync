# Verificación y pruebas

El proyecto incluye tests automáticos para el mapeo de datos, la deduplicación, la paginación y la gestión de errores de sincronización. GitHub Actions ejecuta la comprobación de tipos, los tests y la compilación en las propuestas de cambio.

La aplicación se ha instalado y probado desde el Marketplace en **Twenty 2.50.x**. Esta verificación confirma el funcionamiento básico de la instalación publicada; no representa una auditoría completa de seguridad, privacidad, carga o compatibilidad con otras versiones.

## Cómo ejecutar las pruebas

Con Node.js 24 y Yarn 4:

```bash
corepack yarn install --immutable
corepack yarn typecheck
corepack yarn test
corepack yarn build
```

Para evaluar una nueva versión de Twenty o un cambio en los permisos de Meta, sigue el [checklist de pruebas](QA.md) en un entorno con datos de prueba.

## Áreas que requieren pruebas de integración

- Distintos tipos de token y permisos de páginas de Meta.
- Formularios y campos personalizados con diferentes tipos de datos.
- Importaciones históricas, paginación, reintentos y límites de API.
- Deduplicación tras errores parciales y recuperación de Personas.
- Aislamiento entre workspaces y derechos de acceso.
- Retención y supresión de los datos personales importados.

Puedes consultar los detalles de los cambios publicados en el [changelog](../CHANGELOG.md).
