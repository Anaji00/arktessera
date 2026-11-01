/**
 * Vercel Serverless Function: POST /api/contact
 * Handles consultation audit submissions and routes emails via Resend or SMTP.
 */

const { validateConsultationPayload, routeConsultationEmail } = require('../lib/email');

module.exports = async function handler(req, res) {
  // CORS headers for local/cross-origin flexibility
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed. Use POST.'
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const validation = validateConsultationPayload(body);

    // Silent drop if honeypot bot trap is triggered
    if (validation.isSpam) {
      return res.status(200).json({
        ok: true,
        message: 'Consultation request received.'
      });
    }

    if (validation.errors.length > 0) {
      return res.status(400).json({
        ok: false,
        error: validation.errors.join(' '),
        errors: validation.errors
      });
    }

    const dispatchResult = await routeConsultationEmail(validation.data);

    return res.status(200).json({
      ok: true,
      message: 'Consultation request transmitted. A partner will email you within 4 business hours.',
      dispatch: {
        provider: dispatchResult.provider,
        id: dispatchResult.id
      }
    });
  } catch (err) {
    console.error('[API /api/contact Error]:', err);
    return res.status(500).json({
      ok: false,
      error: 'Unable to route your request right now. Please email contact@najialess.io directly.'
    });
  }
};

