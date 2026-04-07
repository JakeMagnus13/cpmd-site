/**
 * Cloudflare Pages Function — POST /api/subscribe
 *
 * Receives { name, email } from the popup form and forwards to MailerLite.
 * MailerLite's automation then sends the welcome email + PDF guide.
 *
 * Environment variables required (set in Cloudflare Pages dashboard):
 *   MAILERLITE_API_KEY  — from https://dashboard.mailerlite.com/integrations/api
 *   MAILERLITE_GROUP_ID — the group/list subscribers should be added to
 */

interface Env {
  MAILERLITE_API_KEY: string;
  MAILERLITE_GROUP_ID: string;
}

interface SubscribePayload {
  name: string;
  email: string;
}

const jsonResponse = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // Basic env check
  if (!env.MAILERLITE_API_KEY || !env.MAILERLITE_GROUP_ID) {
    console.error('MailerLite environment variables are not set');
    return jsonResponse({ error: 'Server configuration error' }, 500);
  }

  // Parse and validate payload
  let payload: SubscribePayload;
  try {
    payload = (await request.json()) as SubscribePayload;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const name = (payload.name || '').trim();
  const email = (payload.email || '').trim().toLowerCase();

  if (!name || !email) {
    return jsonResponse({ error: 'Name and email are required' }, 400);
  }

  // Very basic email shape check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ error: 'Please enter a valid email address' }, 400);
  }

  // Forward to MailerLite
  try {
    const mlRes = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.MAILERLITE_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        fields: {
          name,
        },
        groups: [env.MAILERLITE_GROUP_ID],
        status: 'active',
      }),
    });

    if (!mlRes.ok) {
      const errBody = await mlRes.text();
      console.error('MailerLite error:', mlRes.status, errBody);
      return jsonResponse(
        { error: 'Unable to add subscriber. Please try again later.' },
        502
      );
    }

    return jsonResponse({ success: true });
  } catch (err) {
    console.error('MailerLite fetch failed:', err);
    return jsonResponse({ error: 'Network error. Please try again.' }, 500);
  }
};
