# Checklist de aceptación en el servidor Twenty real

> 17 pruebas simuladas locales pasadas (ver [QA_RESULTADOS.md](QA_RESULTADOS.md)), pero los puntos siguientes se deben probar en un workspace real antes del uso general.


- [ ] Se compila `yarn build` con Twenty SDK 2.50.0 y el proyecto pasa `yarn typecheck` y `yarn test`.
- [ ] Una instalación privada no toca la app AppUnite existente ni modifica webhook de Meta.
- [ ] El formulario y sus preguntas aparecen para una página con System User Token.
- [ ] La autenticación de otra página con Page Access Token también funciona.
- [ ] Dos páginas distintas del mismo workspace funcionan simultáneamente.
- [ ] Dos formularios en una página tienen mapeos diferentes.
- [ ] Un custom field TEXT, NUMERIC, BOOLEAN, DATE, SELECT de Persona recibe el valor esperado.
- [ ] El mapeo de SELECT admite sustituciones según opciones existentes del campo.
- [ ] Los leads se importan ahora, y se importan de forma automática en intervalo 1/5 minutos.
- [ ] No se crea Persona duplicada si se repite un Leadgen ID.
- [ ] Un error de Graph API 429/500 se reintenta y no se adelanta el cursor.
- [ ] Un error de escritura en Twenty queda marcado en el ledger y no adelanta el cursor.
- [ ] Funciona paginación Meta: 100+ leads, varias páginas en la API.
- [ ] Un lead sin email/teléfono queda en `NEEDS_REVIEW`.
- [ ] No expone secretos en respuestas HTTP, tablas, KV ni logs.
- [ ] Los miembros sin permiso de APPS no pueden llamar a los endpoints protegidos.
- [ ] Los workspaces instalados no ven la configuración ni los datos de los otros.
- [ ] Probado con 10+ workspaces y cumplimiento de límites de API.
- [ ] Revisión RGPD: supresión, plazo de retención, finalidades, consentimientos y permisos.
- [ ] La instalación/desinstalación/upgrade no deja tablas o indices huérfanos.

Un ítem sin marcar impide afirmar que la aplicación está lista para marketplace público.
