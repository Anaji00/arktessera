/**
 * Vercel Serverless Function: POST /api/inbound-email
 * Receives inbound email webhooks (from Cloudflare Email Workers, Resend Inbound, or SendGrid Inbound Parse)
 * and forwards/routes structured notifications to the partner inbox.
 */

const { routeConsultationEmail } = require('../lib/email');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed. Use POST.' });
  }

  // Optional shared secret verification for inbound email webhooks
  const webhookSecret = process.env.INBOUND_WEBHOOK_SECRET;
  if (webhookSecret) {
    const providedSecret = req.headers['x-webhook-secret'] || req.query.secret;
    if (providedSecret !== webhookSecret) {
      return res.status(401).json({ ok: false, error: 'Unauthorized webhook signature.' });
    }
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const data = payload.data || payload;

    const fromEmail = data.from || data.sender || 'inbound@najialess.io';
    const subject = data.subject || 'Inbound Email via najialess.io';
    const textBody = data.text || data.html || JSON.stringify(data, null, 2);

    const dispatchResult = await routeConsultationEmail({
      fullName: `Inbound Email (${fromEmail})`,
      workEmail: typeof fromEmail === 'string' && fromEmail.includes('@') ? fromEmail : 'alessionaji1@gmail.com',
      companyName: subject,
      phone: 'Inbound Webhook',
      interests: ['Inbound Email Routing'],
      projectScope: String(textBody).slice(0, 4000),
      submittedAt: new Date().toISOString()
    });

    return res.status(200).json({
      ok: true,
      message: 'Inbound email routed.',
      dispatch: dispatchResult
    });
  } catch (err) {
    console.error('[API /api/inbound-email Error]:', err);
    return res.status(500).json({ ok: false, error: 'Failed to process inbound email.' });
  }
};

