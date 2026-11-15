const portalId = '50945344';
const newsletterFormGuid = '0fef8795-7db3-492d-a366-b38037a3d13c';
const marketingSubscriptionTypeId = 1932701360;
const requestTimeoutMs = 8_000;

export type NewsletterStatus = 'SUBSCRIBED' | 'NOT_SUBSCRIBED' | 'UNSUBSCRIBED';

interface HubSpotContext {
  pageUri: string;
  pageName: string;
  ipAddress?: string;
  hutk?: string;
}

function authorizationHeaders(accessToken: string) {
  return {
    authorization: `Bearer ${accessToken}`,
    accept: 'application/json',
  };
}

export async function hubspotContactExists(email: string, accessToken: string) {
  const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
    method: 'POST',
    headers: {
      ...authorizationHeaders(accessToken),
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
      properties: ['email'],
      limit: 1,
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(requestTimeoutMs),
  });

  if (!response.ok) {
    console.error('HubSpot contact lookup failed', response.status);
    throw new Error('hubspot_contact_lookup_failed');
  }

  const result = await response.json() as { total?: number; results?: unknown[] };
  const total = typeof result.total === 'number' ? result.total : result.results?.length;
  if (typeof total !== 'number' || !Number.isFinite(total)) {
    throw new Error('hubspot_contact_lookup_invalid_response');
  }

  return total > 0;
}

export async function getNewsletterStatus(email: string, accessToken: string): Promise<NewsletterStatus> {
  const response = await fetch(
    `https://api.hubapi.com/communication-preferences/v3/status/email/${encodeURIComponent(email)}`,
    {
      headers: authorizationHeaders(accessToken),
      cache: 'no-store',
      signal: AbortSignal.timeout(requestTimeoutMs),
    },
  );

  if (!response.ok) {
    console.error('HubSpot newsletter status lookup failed', response.status);
    throw new Error('hubspot_subscription_status_lookup_failed');
  }

  const result = await response.json() as {
    subscriptionStatuses?: Array<{ id?: string | number; status?: string }>;
  };
  const status = result.subscriptionStatuses?.find((item) =>
    String(item.id) === String(marketingSubscriptionTypeId),
  )?.status?.toUpperCase();

  if (status !== 'SUBSCRIBED' && status !== 'NOT_SUBSCRIBED' && status !== 'UNSUBSCRIBED') {
    throw new Error('hubspot_newsletter_subscription_status_unknown');
  }

  return status;
}

export async function submitNewsletter(email: string, context: HubSpotContext) {
  const response = await fetch(
    `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${newsletterFormGuid}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        fields: [{ name: 'email', value: email }],
        submittedAt: String(Date.now()),
        context: {
          pageUri: context.pageUri,
          pageName: context.pageName,
          ...(context.ipAddress ? { ipAddress: context.ipAddress } : {}),
          ...(context.hutk ? { hutk: context.hutk } : {}),
        },
        legalConsentOptions: {
          consent: {
            consentToProcess: true,
            text: 'Acepto que mis datos se procesen para gestionar mi suscripción a la newsletter.',
            communications: [{
              value: true,
              subscriptionTypeId: marketingSubscriptionTypeId,
              text: 'Acepto recibir la newsletter de Juan Maldonado por correo electrónico.',
            }],
          },
        },
      }),
      signal: AbortSignal.timeout(requestTimeoutMs),
    },
  );

  if (!response.ok) {
    console.error('HubSpot rejected newsletter submission', response.status);
    throw new Error('hubspot_submission_failed');
  }
}
