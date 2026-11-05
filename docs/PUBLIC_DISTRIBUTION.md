# Distribución y compatibilidad

Meta Lead Sync se instala desde el Marketplace de Twenty. El paquete público está disponible en [npm](https://www.npmjs.com/package/twenty-meta-lead-sync).

## Para los usuarios

Abre **Configuración → Aplicaciones**, desactiva **Vetted only** y busca **Meta Lead Sync**. Cada workspace configura sus propios tokens, páginas, formularios y mapeos.

Actualmente se ha probado con **Twenty 2.50.x**. La aplicación utiliza permisos de Meta Lead Ads para consultar envíos y crear o vincular registros de Personas en Twenty.

Consulta [Instalación](INSTALACION.md) para configurar la aplicación.

## Para desarrolladores

El código fuente está disponible en [GitHub](https://github.com/mikiguillamon/twenty-meta-lead-sync) bajo licencia MIT. La publicación utiliza GitHub Releases y npm Trusted Publishing, con el CLI de Twenty.

Los identificadores universales de la aplicación deben conservarse entre versiones para mantener la compatibilidad con las instalaciones existentes. Las nuevas versiones deben superar los tests y la compilación. Antes de ampliar el rango `engines.twenty`, hay que probar la aplicación en cada versión compatible.

Para el procedimiento de publicación y gestión de `latest` y `beta` por OIDC consulta la [guía de versiones](PUBLIC_RELEASE_RUNBOOK.md).

## Privacidad

Las credenciales se almacenan como variables secretas del workspace. La aplicación mantiene en Twenty los datos importados y el estado de las sincronizaciones. Los administradores deben definir los permisos de acceso y las reglas de conservación y supresión de datos de su organización.

Meta Lead Sync no modifica las suscripciones a webhooks de Meta.
