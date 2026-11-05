# Publicar versiones de Meta Lead Sync

Las versiones se publican desde GitHub Releases. Para mover etiquetas npm de versiones ya publicadas existe un disparador manual en el mismo workflow, autorizado con OIDC y **Allow npm dist-tag**. El workflow [`publish.yml`](../.github/workflows/publish.yml) prepara los archivos de Twenty y utiliza npm Trusted Publishing para firmar su procedencia.

## Preparar el cambio

1. Comprueba que la versión de `package.json` sea nueva y coincida con la etiqueta que vas a publicar.
2. Actualiza el [changelog](../CHANGELOG.md) y las instrucciones de instalación si cambia la experiencia de uso.
3. No modifiques los identificadores de `src/constants/ids.ts` sin una estrategia de migración.
4. Comprueba que el rango `engines.twenty` corresponda a versiones realmente probadas.
5. Ejecuta los controles locales y confirma que GitHub Actions termina correctamente.

```bash
corepack yarn install --immutable
corepack yarn check
node scripts/release-preflight.mjs --public --tag vVERSION
```

Sustituye `vVERSION` por la etiqueta de la próxima versión, por ejemplo `v0.2.2`.

## Crear la release

Publica una GitHub Release a partir de un commit de `main` que haya pasado las pruebas. El nombre de la etiqueta debe coincidir con `package.json`.

- Para una versión estable, publica la release normalmente.
- Para una versión preliminar, marca **Set as a pre-release** y utiliza un número de versión con sufijo (por ejemplo, `-beta.1`).

El workflow valida la etiqueta y la relación con `main`. Ejecuta comprobaciones de TypeScript, tests y compilación, y después publica el paquete con la herramienta de Twenty. Las versiones estables van al canal npm `latest` y las preliminares a `beta`. El job instala npm CLI 11.21 o posterior dentro de la rama 11 para permitir cambios de dist-tags mediante OIDC.

## Comprobar la publicación

```bash
gh run list --workflow publish.yml --limit 5
npm view twenty-meta-lead-sync dist-tags --json
npm view twenty-meta-lead-sync versions --json
```

Comprueba también que el paquete muestra la versión correcta y su procedencia en npm. Los cambios pueden tardar en reflejarse en los registros y en el catálogo de Twenty.

Para corregir únicamente el puntero de un canal, abre **Actions > Publish Twenty app to npm > Run workflow**, selecciona `latest` o `beta` e introduce una versión existente, sin `v`. El job comprueba que la versión existe y exige una versión estable para `latest` y una versión preliminar para `beta`. También puedes ejecutarlo mediante `gh workflow run publish.yml -f dist_tag=latest -f version=VERSION` y comprobarlo con `gh run list --workflow publish.yml --limit 5`. Esto no publica un artefacto nuevo.

No vuelvas a publicar una versión ya existente para corregir los metadatos. Prepara un número de versión nuevo si cambias los archivos incluidos en el paquete.

## Instalaciones existentes

Una publicación en npm no reinstala automáticamente la aplicación en los workspaces. Tras sincronizar el catálogo, cada instancia de Twenty gestiona la disponibilidad y actualización de la versión publicada.

Antes de cambiar la compatibilidad con una versión nueva de Twenty, prueba la instalación, los permisos, los formularios, la importación y la deduplicación. Verifica también que los datos del workspace permanecen aislados.
