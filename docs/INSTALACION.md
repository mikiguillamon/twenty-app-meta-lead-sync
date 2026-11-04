# Guía de instalación y configuración

Meta Lead Sync importa los contactos de Facebook e Instagram Lead Ads a Personas de Twenty. Puedes utilizar varias páginas de Meta y varios formularios en cada workspace.

La aplicación se ha probado con **Twenty 2.50.x**. Necesitas permisos para instalar aplicaciones en el workspace y acceso a los formularios de Meta que quieras sincronizar.

## Instalar desde el Marketplace

1. Abre **Configuración → Aplicaciones** en Twenty.
2. Desactiva el filtro **Vetted only** para mostrar también las aplicaciones de la comunidad.
3. Busca **Meta Lead Sync** y pulsa **Instalar**.
4. Abre los ajustes de la aplicación.

Si no aparece, pide al administrador de tu instancia que sincronice el catálogo del Marketplace. Las versiones posteriores a Twenty 2.50.x no se han verificado todavía.

## Conectar Meta

En **Conexiones** puedes introducir un token de usuario del sistema de Meta (System User Token) o tokens de acceso específicos de cada página (Page Access Tokens).

El token debe tener acceso a las páginas y a los formularios de Lead Ads que vayas a utilizar. Los permisos dependen de cómo tengas configurada la cuenta empresarial y la aplicación de Meta. Si la validación falla, revisa primero los permisos y el acceso a la página.

Guarda las credenciales desde la interfaz. Twenty las almacena como variables secretas del workspace; evita compartirlas en incidencias o capturas.

## Elegir páginas y formularios

1. Utiliza **Descubrir páginas** para consultar las páginas disponibles con tus credenciales.
2. En **Páginas**, activa las que quieras sincronizar y guarda la selección.
3. Actualiza los formularios de cada página.
4. En **Formularios**, activa los formularios que vayas a importar.

Puedes conectar varias páginas y elegir sus formularios por separado. La configuración no se comparte con otros workspaces.

## Configurar el mapeo

En **Mapeo**, selecciona un formulario y relaciona cada pregunta de Meta con el campo adecuado de Personas en Twenty.

Por ejemplo, puedes asociar el email y el teléfono a los campos estándar. Para las preguntas propias de un formulario, puedes utilizar campos personalizados compatibles, siempre que estén creados en Twenty.

Revisa el tipo de cada campo antes de guardar. Los campos de selección deben utilizar opciones que existan en el CRM.

## Probar una importación

Abre **Sincronización**, elige uno de los formularios y ejecuta una importación manual. Comprueba el historial y revisa las Personas que se hayan creado o vinculado.

Si vuelves a importar el mismo lead, la aplicación utiliza su identificador de Meta para evitar duplicados. Si falta información esencial o se produce un error, revisa el estado de la sincronización antes de reintentarlo.

Cuando la prueba sea satisfactoria, activa la sincronización automática. Puedes elegir un intervalo de **1 a 60 minutos**; el valor habitual es **5 minutos**.

La importación de histórico puede consultar hasta **90 días**, según los datos disponibles y los límites de Meta. Utilízala de forma deliberada, especialmente en formularios con muchos envíos.

## Problemas habituales

**No aparecen páginas o formularios.** Comprueba que el token tenga acceso a la página y permisos de Lead Ads. Algunos endpoints de Meta requieren un Page Access Token.

**No se crea una Persona.** Comprueba el mapeo, los campos obligatorios y el historial de sincronización. Los registros sin datos suficientes pueden quedar pendientes de revisión.

**Meta limita las peticiones.** La aplicación aplica pausas y reintentos para respetar los límites de su API. Revisa el estado mostrado en Sincronización antes de forzar una nueva consulta.

**Se han importado datos incorrectos.** Detén la sincronización del formulario, revisa el mapeo y corrige los registros afectados en Twenty antes de volver a importar.

Para informar de un error, abre una [incidencia en GitHub](https://github.com/mikiguillamon/twenty-meta-lead-sync/issues) sin incluir tokens ni datos personales.

## Privacidad

Los contactos importados contienen datos personales. Antes de utilizar la aplicación, comprueba los permisos de acceso del workspace, la base legal para tratar esos datos y tus procedimientos de conservación y eliminación.

La aplicación consulta Meta periódicamente. No modifica las suscripciones a webhooks que puedas tener configuradas en otras herramientas.
