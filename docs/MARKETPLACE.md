# Marketplace y distribución

Meta Lead Sync se distribuye como aplicación comunitaria para Twenty a través del paquete npm público [`twenty-meta-lead-sync`](https://www.npmjs.com/package/twenty-meta-lead-sync).

El Marketplace de Twenty consulta el catálogo de npm. La descripción pública extendida puede provenir del README incluido en la versión del paquete publicada, por lo que editar GitHub sin publicar una nueva versión no actualiza esa ficha. Utiliza enlaces absolutos en el README. Si una instalación no muestra Meta Lead Sync, su administrador puede sincronizar el catálogo y desactivar el filtro **Vetted only**. La inclusión como aplicación comunitaria no implica una revisión o certificación por parte de Twenty.

## Compatibilidad

La aplicación declara compatibilidad con **Twenty 2.50.x** (`>=2.50.0 <2.51.0`). Antes de utilizarla con una versión posterior, hay que verificar sus componentes y las API que utiliza.

## Instalación en un workspace

Cada workspace instala Meta Lead Sync desde **Configuración → Aplicaciones** y configura sus propias credenciales, páginas, formularios y mapeos. El propietario de la aplicación en una instancia no tiene acceso automático a los datos de los demás workspaces.

Consulta la [guía de instalación](INSTALACION.md) para conectar Meta y configurar la sincronización.

## Publicar una nueva versión

El repositorio utiliza GitHub Actions y npm Trusted Publishing. Al publicar una GitHub Release, el workflow comprueba el número de versión, ejecuta los tests y compila el paquete con el CLI de Twenty.

Las versiones estables utilizan el canal npm `latest`; las versiones preliminares se publican en `beta`. El workflow `publish.yml` también admite una ejecución manual `workflow_dispatch` para mover una etiqueta a una versión ya publicada, mediante npm OIDC y el permiso **Allow npm dist-tag**. No necesita un token npm permanente. Una versión ya publicada en npm no puede sustituirse por otro paquete con el mismo número.

Para preparar una nueva versión:

1. Actualiza `package.json`, las notas de cambios y la documentación que corresponda.
2. Mantén los identificadores `universalIdentifier` existentes: las instalaciones dependen de ellos.
3. Comprueba las versiones de Twenty compatibles mediante pruebas reales.
4. Ejecuta `corepack yarn check` y revisa los resultados de GitHub Actions.
5. Crea una GitHub Release con una etiqueta que coincida con la versión del paquete.
6. Comprueba la publicación, la procedencia firmada y el canal npm correspondiente.

El workflow de publicación está en [`.github/workflows/publish.yml`](../.github/workflows/publish.yml). Para detalles de mantenimiento, consulta la [guía de versiones](PUBLIC_RELEASE_RUNBOOK.md).

## Propiedad de la aplicación

El registro de una aplicación se administra por instancia de Twenty. Quien tenga derecho a reclamarla puede utilizar **Configuración → Desarrolladores → Aplicaciones → Claim an application** y verificar su identidad mediante GitHub.

En instalaciones autohospedadas, el administrador debe configurar la aplicación OAuth de GitHub para permitir esta operación. La reclamación del registro es independiente de la instalación en un workspace.

La [documentación oficial de Twenty](https://docs.twenty.com/developers/extend/apps/operations/publishing) explica ambos procedimientos.
