interface Env {
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  RESEND_TO_EMAIL?: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_TEST_MODE?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
}

type FormType = 'contact' | 'newsletter';

interface Submission {
  type: FormType;
  token: string;
  website?: string;
  fields: Record<string, string>;
}

const inbox = 'hola@juanmaldonado.digital';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedTypes = new Set<FormType>(['contact', 'newsletter']);

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] || character);
}

function isSubmission(value: unknown): value is Submission {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<Submission>;
  if (!allowedTypes.has(data.type as FormType) || typeof data.token !== 'string' || data.token.length > 2048) return false;
  if (!data.fields || typeof data.fields !== 'object') return false;
  return Object.entries(data.fields).every(([name, field]) =>
    typeof name === 'string' && name.length <= 60 && typeof field === 'string' && field.length <= 4000,
  );
}

async function verifyTurnstile(
  token: string,
  secret: string,
  hostname: string,
  action: string,
  remoteIp?: string | null,
  testMode = false,
) {
  const form = new URLSearchParams({ secret, response: token });
  if (remoteIp) form.set('remoteip', remoteIp);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: form,
  });
  if (!response.ok) return false;

  const result = await response.json() as { success?: boolean; hostname?: string; action?: string };
  return result.success === true && result.hostname === hostname && (result.action === action || (testMode && result.action === 'test'));
}

async function sendEmail(apiKey: string, message: Record<string, unknown>) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + apiKey, 'content-type': 'application/json' },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('Resend rejected form submission', response.status, detail.slice(0, 300));
    throw new Error('email_delivery_failed');
  }
}

export async function onRequestPost({ request, env }: PagesContext) {
  const origin = request.headers.get('origin');
  const requestUrl = new URL(request.url);
  if (!origin || origin !== requestUrl.origin) return json({ success: false, message: 'Origen no permitido.' }, 403);

  const length = Number(request.headers.get('content-length') || 0);
  if (length > 16000) return json({ success: false, message: 'El formulario excede el tamaño permitido.' }, 413);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ success: false, message: 'No se pudo procesar el formulario.' }, 400);
  }
  if (!isSubmission(payload)) return json({ success: false, message: 'Revisa los datos e inténtalo otra vez.' }, 400);
  if (payload.website) return json({ success: true });

  const email = payload.fields.email?.trim() || '';
  if (!emailPattern.test(email)) return json({ success: false, message: 'Ingresa un correo válido.' }, 400);
  if (payload.fields.consent !== 'yes') return json({ success: false, message: 'Debes aceptar el uso de tus datos para continuar.' }, 400);
  if (payload.type === 'contact') {
    const name = payload.fields.name?.trim() || '';
    const message = payload.fields.message?.trim() || '';
    if (name.length < 2 || message.length < 10) return json({ success: false, message: 'Completa nombre y mensaje para continuar.' }, 400);
  }

  if (!env.TURNSTILE_SECRET_KEY) {
    console.error('TURNSTILE_SECRET_KEY is not configured');
    return json({ success: false, message: 'La verificación no está disponible. Intenta nuevamente más tarde.' }, 503);
  }
  if (!env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return json({ success: false, message: 'El envío no está disponible en este momento.' }, 503);
  }

  const expectedAction = payload.type === 'newsletter' ? 'newsletter_signup' : 'contact_request';
  const verified = await verifyTurnstile(
    payload.token,
    env.TURNSTILE_SECRET_KEY,
    requestUrl.hostname,
    expectedAction,
    request.headers.get('CF-Connecting-IP'),
    env.TURNSTILE_TEST_MODE === 'true',
  ).catch(() => false);
  if (!verified) return json({ success: false, message: 'La verificación expiró o no fue válida. Complétala nuevamente.' }, 400);

  const from = env.RESEND_FROM_EMAIL || 'Juan Maldonado <' + inbox + '>';
  const recipient = env.RESEND_TO_EMAIL || inbox;
  const isNewsletter = payload.type === 'newsletter';
  const name = payload.fields.name?.trim() || '';
  const subject = isNewsletter ? 'Nueva suscripción a la newsletter' : 'Nueva consulta web: ' + name;
  const fields: Array<[string, string]> = isNewsletter
    ? [['Correo electrónico', email]]
    : [
        ['Nombre', name],
        ['Correo electrónico', email],
        ['Empresa', payload.fields.company?.trim() || 'No indicado'],
        ['Mensaje', payload.fields.message.trim()],
      ];
  const rows = fields.map(([label, value]) =>
    '<tr><th align="left" style="padding:12px;border-bottom:1px solid #1e1e1e;color:#929292;font-size:12px">' +
    escapeHtml(label) +
    '</th><td style="padding:12px;border-bottom:1px solid #1e1e1e;color:#eaeaea;font-size:14px;white-space:pre-wrap">' +
    escapeHtml(value) +
    '</td></tr>',
  ).join('');
  const html = [
    '<!doctype html><html lang="es"><body style="margin:0;background:#090909;padding:24px;font-family:Arial,sans-serif;color:#eaeaea">',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;border:1px solid #1e1e1e;border-radius:16px;background:#131313">',
    '<tr><td style="padding:28px"><p style="margin:0;color:#b6ff28;font-size:11px;letter-spacing:2px;text-transform:uppercase">juanmaldonado.digital</p>',
    '<h1 style="margin:12px 0 20px;font-size:22px;color:#eaeaea">' + escapeHtml(subject) + '</h1>',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">' + rows + '</table>',
    '<p style="margin:22px 0 0;color:#929292;font-size:12px">Origen: ' + escapeHtml(requestUrl.hostname) + ' · ' + new Date().toISOString() + '</p>',
    '</td></tr></table></td></tr></table></body></html>',
  ].join('');

  try {
    await sendEmail(env.RESEND_API_KEY, {
      from,
      to: [recipient],
      reply_to: email,
      subject,
      html,
      text: subject + '\n\n' + fields.map(([label, value]) => label + ': ' + value).join('\n\n'),
    });
  } catch {
    return json({ success: false, message: 'No pudimos enviar el formulario. Inténtalo nuevamente en unos minutos.' }, 502);
  }

  return json({ success: true });
}
