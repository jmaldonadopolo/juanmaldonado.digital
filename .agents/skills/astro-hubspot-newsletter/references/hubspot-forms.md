# HubSpot Forms API

Referencia operativa para formularios de newsletter personalizados. La documentación oficial es la autoridad para nombres de campos, esquemas y comportamiento actual; confirma la versión antes de implementar.

## Endpoint público

La API legacy de envíos no autenticados documentada por HubSpot usa:

```text
POST https://api.hsforms.com/submissions/v3/integration/submit/{portalId}/{formGuid}
Content-Type: application/json
```

Portal ID y form GUID identifican el formulario; no son un reemplazo de credenciales de administración. El navegador puede llamar al endpoint público conforme a la documentación/CORS, pero una ruta de servidor suele ser preferible cuando el sitio también valida Turnstile, consentimiento y abuso. Nunca incluir una private app token en el cliente.

## Estructura orientativa

La forma concreta del cuerpo debe seguir la documentación y el formulario actual. Conceptualmente incluye:

```json
{
  "fields": [{ "name": "email", "value": "persona@ejemplo.com" }],
  "context": {
    "pageUri": "https://sitio.example/newsletter",
    "pageName": "Newsletter"
  },
  "legalConsentOptions": {
    "consent": {
      "consentToProcess": true,
      "text": "Texto de consentimiento mostrado al usuario.",
      "communications": [{
        "value": true,
        "subscriptionTypeId": 123456,
        "text": "Texto de suscripción mostrado al usuario."
      }]
    }
  }
}
```

Esto es una guía de campos, no un payload universal. No copies el `subscriptionTypeId`, nombre interno del campo, copy legal o política de consentimiento de otro portal. Inspecciona el formulario y las preferencias de privacidad de HubSpot. Si no se obtiene consentimiento válido, no se debe declarar que el usuario quedó suscrito.

`context` mejora la atribución. `pageUri` debe ser una URL canónica controlada por el propio sitio; no confíes ciegamente en un `Referer` externo. Incluye campos opcionales de contexto/cookies/IP solo si la documentación vigente y la base legal del proyecto lo justifican.

## Respuesta y procesamiento

1. Trata códigos no exitosos, errores de red, límites y respuestas inválidas como fallo del envío; devuelve mensajes de usuario genéricos y conserva detalle técnico mínimo y redactado en servidor.
2. Una respuesta HTTP 2xx demuestra que HubSpot aceptó la solicitud HTTP, pero no demuestra que el registro esté en la bandeja normal, se haya actualizado el contacto, se haya establecido una suscripción, se haya inscrito el workflow o se haya entregado un correo.
3. HubSpot puede separar un envío como spam. Un motivo conocido es `Unregistered Site Domain`: el dominio que origina el formulario no está en los dominios de seguimiento de la cuenta. La interfaz de frontend no necesariamente puede detectar esta cuarentena a partir del 2xx.
4. Tras desplegar, verifica la lista de envíos normales y spam en HubSpot. Para una prueba real, revisa además el registro/contacto, consentimiento/suscripción, workflow y recepción si procede.
5. Registrar el dominio externo en la configuración de seguimiento es una acción administrativa distinta del POST de Forms API. HubSpot recomienda agregar dominios reconocidos por el negocio y no agregar dominios desconocidos.
6. Liberar una submission de spam puede crear o actualizar datos CRM y activar automatizaciones; solo liberar cuando el envío sea legítimo y se tenga autorización. No reenviar primero: podría crear un segundo envío o disparar nuevamente el workflow.

## Turnstile y el backend Astro

El token Turnstile debe verificarse en servidor con Siteverify antes de enviar a HubSpot. Compara la respuesta con el hostname y action esperados y usa un secreto protegido como variable de entorno del runtime. El sitekey es público; el secret no. Mantén las hostnames de producción y preview según la política del proyecto y usa claves de prueba solo en un entorno controlado.

En Cloudflare Pages, la función puede vivir en `functions/api/...` y consumir variables del runtime. En otros despliegues, usa un endpoint/serverless equivalente disponible en ese runtime. No supongas que `astro dev` ejecuta las funciones del proveedor; prueba con el entorno local compatible del proveedor cuando aplique.

## Documentación oficial

- [Submit data to a form (unauthenticated)](https://developers.hubspot.com/docs/api-reference/legacy/marketing/forms/v3-legacy/submit-data-unauthenticated)
- [Manage form spam submissions](https://knowledge.hubspot.com/forms/manage-form-spam-submissions)
- [Cloudflare Turnstile: server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)
- [Astro endpoints](https://docs.astro.build/en/guides/endpoints/)
