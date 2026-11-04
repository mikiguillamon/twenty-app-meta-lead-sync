# Checklist de aceptación en el servidor Twenty real

> Utiliza esta lista al probar nuevas versiones o configuraciones. Las pruebas automatizadas no sustituyen las comprobaciones contra Meta y Twenty reales.


- [ ] La compilación y las pruebas pasan con el SDK de la versión de Twenty que se quiere admitir.
- [ ] La instalación no cambia los webhooks existentes de Meta.
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
- [ ] Las instalaciones de distintos workspaces mantienen aislados los tokens, las configuraciones y los datos.
- [ ] Probado con 10+ workspaces y cumplimiento de límites de API.
- [ ] Revisión RGPD: supresión, plazo de retención, finalidades, consentimientos y permisos.
- [ ] La instalación/desinstalación/upgrade no deja tablas o indices huérfanos.

Los puntos pendientes indican qué escenarios todavía requieren verificación específica; no implican que la aplicación deje de estar disponible en el Marketplace.
