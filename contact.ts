/**
 * Cloudflare Pages Function — POST /api/contact
 *
 * Receives contact form submissions and forwards them via email.
 * Uses Resend (https://resend.com) — free tier includes 3000 emails/month.
 *
 * Environment variables required:
 *   RESEND_API_KEY    — from https://resend.com/api-keys
 *   CONTACT_TO_EMAIL  — where to deliver contact form submissions (e.g. hello@cpmd.health)
 *   CONTACT_FROM_EMAIL — verified sender address on Resend
 */

interface Env {
  RESEND_API_KEY: string;
  CONTACT_TO_EMAIL: string;
  CONTACT_FROM_EMAIL: string;
}

interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const jsonResponse = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL || !env.CONTACT_FROM_EMAIL) {
    console.error('Contact form environment variables are not set');
    return jsonResponse({ error: 'Server configuration error' }, 500);
  }

  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const name = (payload.name || '').trim();
  const email = (payload.email || '').trim().toLowerCase();
  const subject = (payload.subject || '').trim();
  const message = (payload.message || '').trim();

  if (!name || !email || !subject || !message) {
    return jsonResponse({ error: 'All fields are required' }, 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ error: 'Please enter a valid email address' }, 400);
  }

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #C28068;">New contact form submission</h2>
      <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
      <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <hr />
      <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `CPMD Contact Form <${env.CONTACT_FROM_EMAIL}>`,
        to: [env.CONTACT_TO_EMAIL],
        reply_to: email,
        subject: `[CPMD] ${subject}`,
        html,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Resend error:', res.status, errBody);
      return jsonResponse({ error: 'Unable to send message. Please email directly.' }, 502);
    }

    return jsonResponse({ success: true });
  } catch (err) {
    console.error('Resend fetch failed:', err);
    return jsonResponse({ error: 'Network error. Please try again.' }, 500);
  }
};
