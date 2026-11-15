---
name: astro-hubspot-newsletter
description: Integra formularios de newsletter con UX propia en Astro y la Forms API de HubSpot; úsala para implementar, migrar, depurar o verificar suscripciones, consentimiento, Turnstile y workflows.
---

# Astro + HubSpot Newsletter

Implementa la captura de suscriptores desde Astro hacia un formulario de HubSpot manteniendo la interfaz propia del sitio. No confundas una respuesta HTTP aceptada con una suscripción que ya llegó al CRM o activó su workflow.

## Procedimiento

1. **Reconocer el proyecto.** Revisa versión y modo de salida de Astro, proveedor y runtime de despliegue, rutas de formularios existentes, política de consentimiento, Turnstile y convenciones del código. Usa el backend que ya tenga el proyecto; en Cloudflare Pages suele corresponder una Pages Function en `functions/`.
2. **Identificar el formulario en HubSpot.** Confirma portal ID, form GUID, nombres internos de campos, campos obligatorios, estado del formulario/workflow, texto de consentimiento y el ID del tipo de suscripción. No reutilices identificadores de otro portal ni los adivines. Lee la referencia `references/hubspot-forms.md` y consulta la documentación oficial vigente antes de depender del esquema del payload.
3. **Diseñar la ruta de envío.** Mantén el formulario visual en Astro y envía a una ruta propia del sitio. Valida método, origen, tamaño del body, email, consentimiento y honeypot en servidor. Usa una función/endpoint compatible con el despliegue. La API pública de envío no necesita una private app token; nunca expongas secretos de Turnstile ni credenciales privadas en el navegador.
4. **Proteger y enviar.** Si el sitio usa Turnstile, valida el token en servidor contra Siteverify antes de llamar a HubSpot. Comprueba `success`, `hostname` y `action` esperados. Envía solo los campos necesarios al endpoint de Forms API y registra errores sin guardar emails, tokens, secretos o payloads completos en logs.
5. **Tratar correctamente el consentimiento.** No marques suscripción por defecto. Pide una acción afirmativa cuando corresponda, conserva el texto visible asociado y envía el formato de consentimiento compatible con la configuración y el tipo de suscripción de esa cuenta. Un envío técnico no sustituye el consentimiento ni garantiza por sí mismo la entrega de comunicaciones.
6. **Entregar estados honestos.** La interfaz debe diferenciar envío, éxito y error, permitir corregir/reintentar de forma segura y no afirmar que se activó la suscripción basándose únicamente en `response.ok`. HubSpot puede aceptar el POST y luego clasificar el envío como spam o cuarentena por dominio no registrado.
7. **Verificar en capas.** Ejecuta las comprobaciones indicadas abajo. Antes de cualquier prueba en producción, confirma el email destino y advierte que el envío puede crear/actualizar el contacto y disparar automatizaciones o correos. No repitas automáticamente una prueba real: podría duplicar envíos o reactivar workflows.

## Comprobaciones

- `astro check` (o el comando de verificación definido por el proyecto) y build de producción.
- Pruebas negativas del endpoint: origen no permitido, JSON inválido, email inválido, consentimiento ausente, honeypot activado, token Turnstile ausente/inválido/expirado y variables requeridas ausentes. Ninguno debe llegar a HubSpot.
- Prueba positiva con mocks en desarrollo: validar el payload y que los fallos/errores del API se representen correctamente sin enviar datos reales.
- Entorno de preview: usar credenciales/keys de prueba compatibles y su hostname registrado; no debilitar la validación de producción para facilitar localhost.
- Antes de producción: confirmar hostname en Turnstile y que el dominio del sitio figure en la lista de dominios de seguimiento externos de HubSpot. La allowlist puede evitar la clasificación `Unregistered Site Domain`.
- Una prueba de producción solo con autorización explícita para el email y el destino. En HubSpot comprobar el envío normal y la pestaña de spam; luego comprobar el contacto, su estado de consentimiento/suscripción y la inscripción/ejecución del workflow. Confirmar la recepción del mensaje únicamente si esa es parte del criterio de prueba.
- Si HubSpot puso un envío legítimo en spam, corrige primero la causa. Liberarlo puede crear/actualizar el contacto y disparar automatizaciones; requiere autorización para esa acción. Evita borrar el registro o reenviar como método de diagnóstico.

## Límites de API y administración

- La Forms API pública sirve para **enviar** datos al formulario identificado por portal y GUID. No uses una private app token en el navegador.
- La gestión de dominios permitidos y la liberación de envíos en cuarentena son acciones administrativas; no asumas que las permite el endpoint público de Forms. Verifica APIs públicas actuales. Si no existe una operación pública documentada/autorizada, usa la UI de HubSpot con aprobación o explica el bloqueo. No automatices endpoints internos de la aplicación.
- No cambies workflows, lista de dominios, estados de consentimiento ni suscripciones sin autorización explícita. No conviertas una prueba técnica en consentimiento comercial para terceros.
- Mantén newsletter separada de otros formularios (p. ej., contacto) aunque compartan endpoint; cada flujo puede tener destino, consentimiento, seguridad y tratamiento distintos.

## Referencias

- Para payload, contexto, consentimiento, errores y cuarentena, consulta [HubSpot Forms API y verificación](references/hubspot-forms.md).
- Revisa siempre la documentación vigente de Astro, el proveedor de despliegue y Turnstile cuando cambie su runtime/API.
