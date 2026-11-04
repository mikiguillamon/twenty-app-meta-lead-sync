# Publicar versiones de Meta Lead Sync

Las versiones se publican desde GitHub Releases. El workflow [`publish.yml`](../.github/workflows/publish.yml) prepara los archivos de Twenty y utiliza npm Trusted Publishing para firmar su procedencia.

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

Sustituye `vVERSION` por la etiqueta de la próxima versión, por ejemplo `v0.2.1`.

## Crear la release

Publica una GitHub Release a partir de un commit de `main` que haya pasado las pruebas. El nombre de la etiqueta debe coincidir con `package.json`.

- Para una versión estable, publica la release normalmente.
- Para una versión preliminar, marca **Set as a pre-release** y utiliza un número de versión con sufijo (por ejemplo, `-beta.1`).

El workflow valida la etiqueta y la relación con `main`. Ejecuta comprobaciones de TypeScript, tests y compilación, y después publica el paquete con la herramienta de Twenty. Las versiones estables van al canal npm `latest` y las preliminares a `beta`.

## Comprobar la publicación

```bash
gh run list --workflow publish.yml --limit 5
npm view twenty-meta-lead-sync dist-tags --json
npm view twenty-meta-lead-sync versions --json
```

Comprueba también que el paquete muestra la versión correcta y su procedencia en npm. Los cambios pueden tardar en reflejarse en los registros y en el catálogo de Twenty.

No vuelvas a publicar una versión ya existente para corregir los metadatos. Prepara un número de versión nuevo si cambias los archivos incluidos en el paquete.

## Instalaciones existentes

Una publicación en npm no reinstala automáticamente la aplicación en los workspaces. Tras sincronizar el catálogo, cada instancia de Twenty gestiona la disponibilidad y actualización de la versión publicada.

Antes de cambiar la compatibilidad con una versión nueva de Twenty, prueba la instalación, los permisos, los formularios, la importación y la deduplicación. Verifica también que los datos del workspace permanecen aislados.
