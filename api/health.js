/**
 * Vercel Serverless Function: GET /api/health
 */

module.exports = async function handler(req, res) {
  res.status(200).json({
    ok: true,
    service: 'arx-tessera-backend',
    domain: 'najialess.io',
    timestamp: new Date().toISOString(),
    emailProviderConfigured: Boolean(
      process.env.RESEND_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_USER)
    )
  });
};

