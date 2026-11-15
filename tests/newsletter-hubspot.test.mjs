import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { onRequestPost } from '../functions/api/forms.ts';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function request(extraHeaders = {}) {
  return new Request('https://juanmaldonado.digital/api/forms', {
    method: 'POST',
    headers: {
      origin: 'https://juanmaldonado.digital',
      'content-type': 'application/json',
      ...extraHeaders,
    },
    body: JSON.stringify({
      type: 'newsletter',
      token: 'turnstile-test-token',
      fields: { email: 'Newsletter.User@Example.test', consent: 'yes' },
    }),
  });
}

function testEnv(overrides = {}) {
  return {
    TURNSTILE_SECRET_KEY: 'turnstile-test-secret',
    HUBSPOT_ACCESS_TOKEN: 'hubspot-test-token',
    ...overrides,
  };
}

async function submit(env = testEnv(), headers = {}) {
  return onRequestPost({ request: request(headers), env });
}

function verifyTurnstile(url, init) {
  assert.equal(url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
  assert.equal(new URLSearchParams(init.body).get('secret'), 'turnstile-test-secret');
  return jsonResponse({ success: true, hostname: 'juanmaldonado.digital', action: 'newsletter_signup' });
}

test('an already-subscribed contact is not submitted again', async () => {
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push(String(url));
    if (String(url).includes('challenges.cloudflare.com')) return verifyTurnstile(String(url), init);
    if (String(url).endsWith('/crm/v3/objects/contacts/search')) {
      assert.equal(init.headers.authorization, 'Bearer hubspot-test-token');
      return jsonResponse({ total: 1, results: [{ id: 'contact-1' }] });
    }
    if (String(url).includes('/communication-preferences/v3/status/email/')) {
      return jsonResponse({ subscriptionStatuses: [{ id: 1932701360, status: 'SUBSCRIBED' }] });
    }
    throw new Error(`Unexpected request: ${url}`);
  };

  const response = await submit();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true, alreadySubscribed: true, existingContact: true });
  assert.equal(calls.some((url) => url.includes('api.hsforms.com/submissions/')), false);
});

test('an unsubscribed existing contact is submitted with fresh consent', async () => {
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    if (String(url).includes('challenges.cloudflare.com')) return verifyTurnstile(String(url), init);
    if (String(url).endsWith('/crm/v3/objects/contacts/search')) {
      return jsonResponse({ total: 1, results: [{ id: 'contact-1' }] });
    }
    if (String(url).includes('/communication-preferences/v3/status/email/')) {
      return jsonResponse({ subscriptionStatuses: [{ id: '1932701360', status: 'UNSUBSCRIBED' }] });
    }
    if (String(url).includes('api.hsforms.com/submissions/')) return jsonResponse({ inlineMessage: 'ok' });
    throw new Error(`Unexpected request: ${url}`);
  };

  const response = await submit(testEnv(), {
    referer: 'https://juanmaldonado.digital/blog/',
    cookie: 'hubspotutk=test-visitor-id',
    'cf-connecting-ip': '192.0.2.20',
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true, subscribed: true, existingContact: true });

  const submission = calls.find(({ url }) => url.includes('api.hsforms.com/submissions/'));
  assert.ok(submission);
  const body = JSON.parse(submission.init.body);
  assert.equal(body.fields[0].value, 'newsletter.user@example.test');
  assert.equal(body.context.pageUri, 'https://juanmaldonado.digital/blog/');
  assert.equal(body.context.hutk, 'test-visitor-id');
  assert.equal(body.context.ipAddress, '192.0.2.20');
  assert.equal(body.legalConsentOptions.consent.consentToProcess, true);
  assert.equal(body.legalConsentOptions.consent.communications[0].value, true);
  assert.equal(body.legalConsentOptions.consent.communications[0].subscriptionTypeId, 1932701360);
});

test('an unknown HubSpot subscription state fails closed without submitting', async () => {
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push(String(url));
    if (String(url).includes('challenges.cloudflare.com')) return verifyTurnstile(String(url), init);
    if (String(url).endsWith('/crm/v3/objects/contacts/search')) {
      return jsonResponse({ total: 1, results: [{ id: 'contact-1' }] });
    }
    if (String(url).includes('/communication-preferences/v3/status/email/')) {
      return jsonResponse({ subscriptionStatuses: [] });
    }
    throw new Error(`Unexpected request: ${url}`);
  };

  const response = await submit();
  assert.equal(response.status, 502);
  assert.equal((await response.json()).success, false);
  assert.equal(calls.some((url) => url.includes('api.hsforms.com/submissions/')), false);
});

test('a missing HubSpot token reports unavailable and does not call providers', async () => {
  globalThis.fetch = async () => {
    throw new Error('No external call is expected');
  };

  const response = await submit(testEnv({ HUBSPOT_ACCESS_TOKEN: undefined }));
  assert.equal(response.status, 503);
  assert.equal((await response.json()).success, false);
});
