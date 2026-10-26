# Instalación paso a paso: beta privada en Twenty 2.50

**Objetivo:** probar exclusivamente en el workspace Just For Fun `https://jff.leads.justforfun.es`. No modificar el webhook de Meta ni la aplicación de Frappe.

## 0. Antes de empezar

- Comprueba en Twenty que el workspace y el servidor están operativos y que tienes un usuario administrador.
- Crea una copia de seguridad del PostgreSQL de Twenty en Coolify. No es necesario restaurar ni editar el `docker-compose`.
- Conserva AppUnite instalada por ahora para comparar; la nueva app tiene **otro identificador universal** y un ledger técnico no navegable llamado `Meta Sync Submission`.
- No pegues tu System User Token en GitHub ni en capturas/logs.
- Usa **un formulario de pruebas o una página con muy pocos leads** para el primer ensayo: importar puede crear Personas reales en tu workspace.

## 1. Crear repositorio en GitHub

1. Descarga el ZIP proporcionado y **descomprímelo** en tu Mac.
2. En GitHub, crea un repositorio **privado** llamado, por ejemplo, `twenty-app-meta-lead-sync`.
3. Abre Terminal en la carpeta descomprimida y ejecuta (cambia la URL del repositorio si utilizas otro nombre):

```bash
git init
git branch -M main
git add .
git commit -m "Initial native Meta Lead Sync Twenty app"
git remote add origin git@github.com:mikiguillamon/twenty-app-meta-lead-sync.git
git push -u origin main
```

No subas el ZIP dentro del mismo repositorio ni uses `git add` en una carpeta con tokens. Las credenciales nunca van en archivos de proyecto.

## 2. Preparar el entorno local

Node.js **24.5 o superior** y **Yarn 4**. En Mac con `nvm`:

```bash
nvm install 24
nvm use 24
node -v
corepack enable
corepack yarn --version
```

Si no tienes `corepack`, instálalo siguiendo las instrucciones actuales de Node y Yarn para tu sistema.

Instalar dependencias y hacer controles (estos pasos **aún no han pasado en el entorno de creación**, por falta de red a npm):

```bash
yarn install
yarn typecheck
yarn test
yarn build
```

**Comprueba además que GitHub Actions se complete en verde antes de instalar en Twenty.** Cuando `yarn install` termine, añade `yarn.lock` al siguiente commit para que las instalaciones sean reproducibles. Si `yarn` informa de que falta alguna versión del SDK, comprueba primero el registro de npm; **no cambies versiones a ciegas** y comparte el error. Los dos SDK (`twenty-sdk` y `twenty-client-sdk`) están fijados a `2.50.0`.

## 3. Conectar el CLI con el workspace

```bash
yarn twenty remote:add --url https://jff.leads.justforfun.es --as jff
```

Sigue el método de autenticación que muestre el CLI. Si solicita una API key, créala en el **workspace Just For Fun → Ajustes → Desarrolladores → API** y guárdala solo en la configuración local privada de Twenty CLI. Nunca la añadas al repositorio.

**Consejo:** si el CLI da un error de origen o redirección por tu configuración multi-workspace, prueba con el dominio principal `https://leads.justforfun.es` siguiendo exactamente el mensaje del CLI, sin modificar las variables de Coolify. La autenticación debe seguir correspondiendo al workspace `jff`.

## 4. Compilar y publicar solo en tu servidor

```bash
yarn build
yarn twenty app:publish --private --remote jff
```

El primer comando genera `.twenty/output/` (no se sube a GitHub). El segundo publica una aplicación **privada** en el registro de tu servidor Twenty, no en npm. Si el CLI solicita confirmar la instalación en el workspace, comprueba que el destino sea **Just For Fun**.

En Twenty entra en **Ajustes → Desarrolladores → Apps → My apps** (la traducción puede variar). Localiza `Meta Lead Sync`, instálala si todavía no figura en las aplicaciones del workspace y confirma los permisos. Luego abre **Ajustes → Aplicaciones → Meta Lead Sync**.

Si el comando devuelve un error de compilación o instalación, **detente ahí** y pasa la salida (sin tokens) para corregirlo. No hagas reinicios de Coolify ni edites PostgreSQL por tu cuenta.

## 5. Configurar la app en el workspace

1. **Conexiones:** introduce tu System User Token de Meta y pulsa **Validar y guardar**. Debe aparecer `Configurado`.
2. Pulsa **Descubrir mis páginas**. Esto usa `/me/accounts` y consigue tokens de página en cada petición, sin que tengas que renovarlos manualmente.
3. **Páginas:** activa la(s) página(s) deseada(s) y pulsa **Guardar páginas activas**.
4. En cada página pulsa **Buscar formularios de esta página**.
5. **Formularios:** activa los formularios deseados y guarda.
6. **Mapeo:** elige un formulario; asigna `full_name` → Nombre completo, `email` → Email, `phone_number` → Teléfono y cada pregunta personalizada al campo personalizado correspondiente. Guarda.
7. **Sincronización:** elige 5 minutos, guarda y pulsa **Sincronizar ahora**. Consulta el panel de Historial; el ledger no se muestra en la navegación de usuarios.
8. Para un histórico más amplio, pulsa **Importar histórico** (hasta 90 días, sujeto a las restricciones de Meta).

**Importante:** no pulses `Connect` en AppUnite; esta app no toca la URL ni suscripciones de Meta.

## 6. Comprobación mínima

- El formulario aparece con un nombre real, preguntas y un Form ID numérico.
- Al pulsar `Sincronizar ahora` aparece un evento de inicio y después de finalización.
- Si el formulario tiene leads, el historial muestra un envío `PROCESSED` o `NEEDS_REVIEW` y los administradores técnicos pueden comprobar el ledger interno por API/BD con autorización adecuada. No aparece como tabla navegable por los usuarios.
- Si hay email o teléfono, la Persona queda creada o vinculada.
- Pulsa otra vez `Sincronizar ahora`: no deben aparecer Personas duplicadas por ese mismo lead.
- Verifica que otro workspace no pueda acceder a los formularios ni credenciales del workspace JFF.

Si falla, empieza por **Historial** y comparte el mensaje textual, sin tokens y sin respuestas personales.

## 7. Actualizar una beta

1. Cambia el código y aumenta **`version`** de `package.json`, p. ej. `0.1.0` → `0.1.1`.
2. `yarn typecheck && yarn test && yarn build`.
3. `yarn twenty app:publish --private --remote jff`.
4. Comprueba la actualización en Twenty y repite la prueba con un formulario controlado.

El servidor de Twenty no permite reemplazar un tarball manteniendo el mismo número de versión.

## 8. Publicar en marketplace (DESPUÉS de validar)

Ver [MARKETPLACE.md](MARKETPLACE.md). No lo publiques en npm ni lo preinstales a clientes hasta superar las pruebas reales, especialmente manejo de errores de Meta, autorización, seguridad y privacidad.
