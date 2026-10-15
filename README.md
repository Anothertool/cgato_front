# CGato frontend

CRM interno de pacientes y cirugías en React y JavaScript, Chakra UI 3, TanStack React Query, Axios, React Router y Lucide. No contiene datos de demostración ni persistencia clínica en el navegador.

## Desarrollo

Con una versión de Node.js compatible con Vite 8, copia `.env.example` a `.env` y configura `VITE_API_URL` con el origen real del backend. Vite solo expone variables con prefijo `VITE_`; no incluyas secretos. Reinicia el servidor si cambias el entorno.

```sh
npm install
npm run dev
```

## Compilación

```sh
npm run build
npm run preview
```

## Formato de código

Prettier está configurado en `.prettierrc.json` con indentación de cuatro espacios,
ancho objetivo de 100 caracteres, comillas simples y sin punto y coma. El ancho es
una guía de ajuste; las cadenas largas y otros fragmentos indivisibles pueden
superarlo. `.editorconfig` mantiene la misma indentación en editores compatibles.

```sh
npm run format
npm run format:check
```

El primer comando aplica el formato y el segundo comprueba que se respeta sin
modificar archivos. Se excluyen dependencias, compilaciones, el lockfile, los
archivos de entorno y las instrucciones de `AGENTS.md`.

En VS Code, `.vscode/extensions.json` recomienda **Prettier - Code formatter**
(`esbenp.prettier-vscode`). Los ajustes del proyecto activan el formato al guardar,
fijan la indentación y muestran una guía en la columna 100. La extensión utiliza
la configuración de este proyecto y debe estar instalada para formatear en el editor.

Las rutas `/surgeries` y `/patients` comparten navegación lateral y cabecera. `/` redirige a cirugías. En producción configura el servidor web para servir `index.html` en las rutas del frontend, sin interceptar las rutas de la API.

## API y contrato comprobado

Los servicios usan `/api/patients/` y `/api/surgeries/`, con UUID, barra final y métodos GET, POST, PATCH y DELETE. Los listados consumen `{ count, next, previous, results }`. La página se envía al servidor; no se pagina ni filtra una copia local. El tamaño lo decide Django (actualmente 25).

- Pacientes: búsqueda `search` por nombre, apellidos o referencia clínica.
- Cirugías: búsqueda de pacientes paginada y selección explícita para filtrar por `patient_id`. El backend no admite búsqueda textual directa sobre cirugías.
- Hospital: coincidencia exacta mediante `hospital`, conforme al filtro existente; estado con `status` y día con `scheduled_at__gte` / `scheduled_at__lte`. El intervalo usa el día local del dispositivo convertido a UTC.
- El backend ya ordena las cirugías por `scheduled_at` ascendente y UUID. Se conserva ese orden a través de todas las páginas.
- La creación envía exclusivamente `patient_id` o `patient` anidado. La edición envía solo `patient_id`. Referencia clínica vacía, importe vacío y potencia vacía se envían como `null`.
- Cancelar usa PATCH con `status: CANCELLED`. Eliminar una cirugía usa el borrado lógico del backend. Un paciente con cirugías asociadas no se puede eliminar; el error del servidor se muestra sin cerrar el diálogo.
- La verificación de lente requiere recepción; desmarcar recepción desmarca verificación. Los errores de validación se muestran en los campos y en un aviso general, incluidos errores anidados.

## Sesión y limitaciones de integración

El backend adyacente se ha inspeccionado sin modificarlo. Todos los endpoints exigen `SessionAuthentication`, usuario autenticado y permisos de modelo (`view`, `add`, `change`, `delete`). Las cirugías requieren además `patients.view_patient`, y crear un paciente anidado requiere `patients.add_patient`. Sin sesión, Django puede responder 403 en lugar de 401; ambos se presentan como errores de sesión o permisos. No se implementa login ni se generan tokens. Las acciones siguen sujetas a los permisos reales del servidor.

Axios está preparado para enviar cookies de sesión y el encabezado CSRF de Django (`csrftoken` / `X-CSRFToken`). Para utilizarlo se necesita una sesión autorizada obtenida por el mecanismo existente de Django (`/api-auth/login/` o administración). El despliegue recomendado sirve frontend y API bajo el mismo origen, con `VITE_API_URL` apuntando a ese origen o a `/`.

**Bloqueo de integración entre orígenes:** el backend actual permite orígenes CORS pero no tiene activado `CORS_ALLOW_CREDENTIALS` ni configurados los orígenes CSRF de un frontend independiente. Por tanto, una sesión de Django no basta por sí sola para acceder desde Vite en otro puerto. Para desarrollo o despliegue entre orígenes, el responsable del backend debe configurar cookies, CORS con credenciales y CSRF; además la cookie CSRF debe ser accesible para el frontend, o debe acordarse un endpoint de obtención de CSRF. No se han cambiado estos ajustes ni relajado permisos. Alternativamente, un proxy del despliegue puede proporcionar un origen común. La aplicación muestra el error real hasta disponer de ese acceso.

`src/api/client.js` concentra la configuración y los errores; los hooks `useAuthFetch`, `useAuthMutate` y `useAuthDelete` centralizan caché, invalidación y notificaciones. No se registran pacientes en consola ni se guardan en `localStorage`.

## Validación

Ejecuta `npm run build` para comprobar la compilación. No se añaden ni ejecutan tests conforme a `AGENTS.md`. La comprobación de operaciones contra datos reales requiere una sesión y una API accesibles.

En PowerShell, si la política de scripts bloquea `npm`, utiliza `npm.cmd`.
