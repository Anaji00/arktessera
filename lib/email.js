/**
 * Arx Tessera (najialess.io) - Email Routing & Consultation Handler
 * Supports Resend HTTP API (recommended for Vercel serverless) & Nodemailer SMTP fallback
 */

let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  // Nodemailer is dynamically loaded if SMTP is configured
}

const INTEREST_LABELS = {
  crm_rebuild: 'Reverse-Engineer / Clone CRM',
  custom_portal: 'Custom Portal / Operations Hub',
  eliminate_manual: 'Stop Manual Copy-Pasting',
  custom_business_work: 'Custom Business Development',
  practical_ai: 'Practical AI / Document Reader',
  cancel_subscriptions: 'Cut Software Subscription Bills'
};

/**
 * Sanitize strings for safe HTML embedding
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validate incoming consultation payload
 */
function validateConsultationPayload(body) {
  const errors = [];
  const fullName = (body.fullName || '').trim();
  const workEmail = (body.workEmail || '').trim();
  const companyName = (body.companyName || '').trim();
  const phone = (body.phone || '').trim();
  const projectScope = (body.projectScope || '').trim();
  const honeypot = (body.security_honeypot || '').trim(); // Bot trap only (avoid autofill conflict)

  if (honeypot) {
    console.warn('[SPAM BOT TRAP TRIGGERED]: honeypot field was filled.');
    return { isSpam: true, errors: [] };
  }

  if (!fullName || fullName.length < 2) {
    errors.push('Full name is required.');
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!workEmail || !emailRegex.test(workEmail)) {
    errors.push('A valid work email is required.');
  }
  if (!companyName || companyName.length < 2) {
    errors.push('Company name is required.');
  }
  if (!projectScope || projectScope.length < 5) {
    errors.push('Please describe your operational headache or project scope.');
  }

  let interests = [];
  if (Array.isArray(body.interests)) {
    interests = body.interests.map(i => INTEREST_LABELS[i] || String(i));
  } else if (typeof body.interest === 'string') {
    interests = [INTEREST_LABELS[body.interest] || body.interest];
  } else if (Array.isArray(body.interest)) {
    interests = body.interest.map(i => INTEREST_LABELS[i] || String(i));
  }

  return {
    isSpam: false,
    errors,
    data: {
      fullName,
      workEmail,
      companyName,
      phone: phone || 'Not provided',
      interests: interests.length > 0 ? interests : ['General Inquiry'],
      projectScope,
      roiSnapshot: body.roiSnapshot || null,
      submittedAt: new Date().toISOString()
    }
  };
}

/**
 * Build rich HTML + plain-text email for Arx Tessera partner routing
 */
function buildNotificationEmail(data) {
  const safeName = escapeHtml(data.fullName);
  const safeEmail = escapeHtml(data.workEmail);
  const safeCompany = escapeHtml(data.companyName);
  const safePhone = escapeHtml(data.phone);
  const safeScope = escapeHtml(data.projectScope).replace(/\n/g, '<br>');
  const interestBadges = data.interests
    .map(item => `<span style="display:inline-block;background:#13241b;color:#22c55e;border:1px solid #22c55e;padding:4px 10px;border-radius:4px;font-size:12px;margin:2px 4px 2px 0;font-family:monospace;">${escapeHtml(item)}</span>`)
    .join('');

  let roiHtml = '';
  if (data.roiSnapshot && data.roiSnapshot.totalAnnualWaste) {
    roiHtml = `
      <div style="margin-top:20px;padding:16px;background:#0d1512;border-left:3px solid #22c55e;border-radius:6px;">
        <div style="font-size:11px;font-family:monospace;color:#22c55e;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Calculator Snapshot at Submission</div>
        <div style="font-size:13px;color:#e5e7eb;">
          <strong>Estimated Annual Waste:</strong> ${escapeHtml(data.roiSnapshot.totalAnnualWaste)} &bull;
          <strong>Projected Savings:</strong> ${escapeHtml(data.roiSnapshot.recapturedSavings || 'N/A')}
        </div>
      </div>
    `;
  }

  const html = `
    <div style="font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,sans-serif;background:#0c0f0e;color:#e5e7eb;padding:32px;border-radius:12px;max-width:640px;margin:0 auto;border:1px solid rgba(34,197,94,0.35);">
      <div style="border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <span style="font-size:18px;font-weight:800;color:#ffffff;letter-spacing:0.04em;">ARX TESSERA</span>
          <span style="display:block;font-size:11px;color:#22c55e;font-family:monospace;">INBOUND CONSULTATION DISPATCH // najialess.io</span>
        </div>
      </div>

      <h2 style="color:#ffffff;font-size:20px;margin:0 0 16px;">New Consultation Request: ${safeCompany}</h2>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px;">
        <tr>
          <td style="padding:8px 0;color:#9ca3af;width:140px;">Contact Name:</td>
          <td style="padding:8px 0;color:#ffffff;font-weight:600;">${safeName}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#9ca3af;">Work Email:</td>
          <td style="padding:8px 0;"><a href="mailto:${safeEmail}" style="color:#22c55e;text-decoration:none;font-weight:600;">${safeEmail}</a></td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#9ca3af;">Company:</td>
          <td style="padding:8px 0;color:#ffffff;">${safeCompany}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#9ca3af;">Phone:</td>
          <td style="padding:8px 0;color:#ffffff;">${safePhone}</td>
        </tr>
      </table>

      <div style="margin-bottom:20px;">
        <div style="font-size:12px;color:#9ca3af;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em;">Selected Priorities:</div>
        <div>${interestBadges}</div>
      </div>

      <div style="background:#131916;border:1px solid rgba(255,255,255,0.12);padding:18px;border-radius:8px;">
        <div style="font-size:12px;color:#9ca3af;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em;">Operational Headache / Scope:</div>
        <div style="font-size:14px;color:#ffffff;line-height:1.6;">${safeScope}</div>
      </div>

      ${roiHtml}

      <div style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);font-size:11px;color:#6b7280;display:flex;justify-content:space-between;">
        <span>Submitted: ${escapeHtml(data.submittedAt)}</span>
        <span>Reply directly to this email to respond to ${safeName}.</span>
      </div>
    </div>
  `;

  const text = [
    `ARX TESSERA - NEW CONSULTATION REQUEST (${data.companyName})`,
    `------------------------------------------------------------`,
    `Name: ${data.fullName}`,
    `Email: ${data.workEmail}`,
    `Company: ${data.companyName}`,
    `Phone: ${data.phone}`,
    `Priorities: ${data.interests.join(', ')}`,
    ``,
    `Operational Headache / Project Scope:`,
    data.projectScope,
    ``,
    `Submitted At: ${data.submittedAt}`
  ].join('\n');

  return {
    subject: `[Arx Tessera Lead] ${data.companyName} — ${data.fullName}`,
    html,
    text
  };
}

/**
 * Build rich HTML + plain-text confirmation email sent to the client / prospect
 */
function buildConfirmationEmail(data) {
  const safeName = escapeHtml(data.fullName);
  const safeCompany = escapeHtml(data.companyName);
  const safeScope = escapeHtml(data.projectScope).replace(/\n/g, '<br>');
  const interestBadges = data.interests
    .map(item => `<span style="display:inline-block;background:#13241b;color:#22c55e;border:1px solid #22c55e;padding:3px 8px;border-radius:4px;font-size:12px;margin:2px 4px 2px 0;font-family:monospace;">${escapeHtml(item)}</span>`)
    .join('');

  let roiHtml = '';
  if (data.roiSnapshot && data.roiSnapshot.totalAnnualWaste) {
    roiHtml = `
      <div style="margin-top:16px;padding:12px 14px;background:#0d1512;border-left:3px solid #22c55e;border-radius:4px;">
        <div style="font-size:11px;font-family:monospace;color:#22c55e;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">Audit Snapshot Attached</div>
        <div style="font-size:13px;color:#e5e7eb;">
          <strong>Annual Waste Estimate:</strong> ${escapeHtml(data.roiSnapshot.totalAnnualWaste)} &bull;
          <strong>Projected Savings:</strong> ${escapeHtml(data.roiSnapshot.recapturedSavings || 'N/A')}
        </div>
      </div>
    `;
  }

  const html = `
    <div style="font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,sans-serif;background:#0c0f0e;color:#e5e7eb;padding:32px;border-radius:12px;max-width:620px;margin:0 auto;border:1px solid rgba(34,197,94,0.35);">
      <div style="border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:16px;margin-bottom:20px;">
        <span style="font-size:18px;font-weight:800;color:#ffffff;letter-spacing:0.04em;">ARX TESSERA</span>
        <span style="display:block;font-size:11px;color:#22c55e;font-family:monospace;">CONSULTATION CONFIRMATION // HOUSTON, TX</span>
      </div>

      <h2 style="color:#ffffff;font-size:20px;margin:0 0 14px;">Got your note, ${safeName}.</h2>

      <p style="font-size:14px;line-height:1.65;color:#d1d5db;margin-bottom:16px;">
        Thank you for reaching out regarding <strong>${safeCompany}</strong>. Your inquiry is on my desk, and I will personally review your operational details and reply within <strong>4 business hours</strong> to schedule our 30-minute shop audit.
      </p>

      <div style="background:#131916;border:1px solid rgba(255,255,255,0.1);padding:18px;border-radius:8px;margin-bottom:18px;">
        <div style="font-size:11px;font-family:monospace;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Summary of Your Submission:</div>
        <div style="font-size:13px;color:#ffffff;margin-bottom:10px;"><strong>Priorities:</strong> ${interestBadges}</div>
        <div style="font-size:13px;color:#d1d5db;line-height:1.5;"><strong>Your #1 Headache:</strong><br><span style="color:#ffffff;">${safeScope}</span></div>
        ${roiHtml}
      </div>

      <div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.25);border-radius:6px;padding:12px 14px;margin-bottom:20px;">
        <div style="font-size:12px;color:#22c55e;font-weight:700;margin-bottom:3px;">OUR ZERO-DISRUPTION COMMITMENT</div>
        <div style="font-size:12px;color:#d1d5db;line-height:1.5;">
          Every system we build runs in parallel alongside your old tools. Your team loses 0 hours of work, and you only cut your subscription after verifying every customer record.
        </div>
      </div>

      <p style="font-size:13px;line-height:1.6;color:#9ca3af;margin-bottom:20px;">
        If you have vendor invoices, sample spreadsheets, or export files you would like me to review ahead of our call, you can reply directly to this email.
      </p>

      <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;font-size:13px;color:#9ca3af;">
        <div style="color:#ffffff;font-weight:700;">Alessio Naji-Sepasgozar</div>
        <div>Principal Architect &amp; Founder &bull; Arx Tessera</div>
        <div style="font-family:monospace;font-size:12px;color:#22c55e;margin-top:2px;">Houston, TX &bull; najialess.io &bull; alessionaji1@gmail.com</div>
      </div>
    </div>
  `;

  const text = [
    `Hi ${data.fullName},`,
    ``,
    `Thank you for reaching out to Arx Tessera regarding ${data.companyName}.`,
    `Your consultation note is on my desk. I will personally review your operational details and reply within 4 business hours to lock in a time for our 30-minute shop audit.`,
    ``,
    `Summary of Your Submission:`,
    `- Company: ${data.companyName}`,
    `- Priorities: ${data.interests.join(', ')}`,
    `- Operational Headache: ${data.projectScope}`,
    ``,
    `Our Zero-Disruption Commitment:`,
    `We build your new system on the side while your old one keeps running. 0 hours of downtime, and you only cancel your old subscriptions after verifying everything.`,
    ``,
    `If you have vendor invoices or spreadsheets you want me to review ahead of our call, simply reply directly to this email.`,
    ``,
    `Best regards,`,
    `Alessio Naji-Sepasgozar`,
    `Principal Architect & Founder | Arx Tessera`,
    `Houston, TX • najialess.io • alessionaji1@gmail.com`
  ].join('\n');

  return {
    subject: `Consultation Confirmed: Arx Tessera Shop Audit (${data.companyName})`,
    html,
    text
  };
}

/**
 * Route email via Resend API, SMTP (Nodemailer), or Development Console
 */
async function routeConsultationEmail(data) {
  const recipientEmail = process.env.CONTACT_RECIPIENT_EMAIL || 'alessionaji1@gmail.com';
  const emailContent = buildNotificationEmail(data);
  const confirmContent = buildConfirmationEmail(data);

  const hasSmtp = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  const hasResend = Boolean(process.env.RESEND_API_KEY);

  // 1. SMTP Provider (Google Workspace / Gmail App Password)
  // Prefers SMTP when configured so that client confirmations can be sent to ANY email without Resend sandbox restrictions
  if (hasSmtp && (process.env.EMAIL_PROVIDER === 'smtp' || !process.env.EMAIL_FROM || process.env.EMAIL_FROM.includes('resend.dev') || !hasResend)) {
    if (!nodemailer) {
      try {
        nodemailer = require('nodemailer');
      } catch (e) {
        throw new Error('Nodemailer is not installed. Please run `npm install` to enable SMTP routing.');
      }
    }

    const smtpSender = process.env.SMTP_FROM || `Arx Tessera Dispatch <${process.env.SMTP_USER}>`;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const info = await transporter.sendMail({
      from: smtpSender,
      to: recipientEmail,
      replyTo: data.workEmail,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html
    });

    console.log(`[SMTP] Founder notification delivered to ${recipientEmail} (ID: ${info.messageId})`);

    let clientConfirmationResult = null;
    try {
      const confirmInfo = await transporter.sendMail({
        from: smtpSender,
        to: data.workEmail,
        replyTo: recipientEmail,
        subject: confirmContent.subject,
        text: confirmContent.text,
        html: confirmContent.html
      });
      clientConfirmationResult = confirmInfo.messageId;
      console.log(`[SMTP] Client confirmation delivered to ${data.workEmail} (ID: ${confirmInfo.messageId})`);
    } catch (cErr) {
      console.warn('[SMTP Notice] Client confirmation attempt failed:', cErr.message);
    }

    return {
      provider: 'smtp',
      id: info.messageId,
      routedTo: recipientEmail,
      confirmationSentTo: clientConfirmationResult ? data.workEmail : null
    };
  }

  // 2. Primary Cloud Provider: Resend HTTP API (Optimal for Vercel Serverless with verified custom domain)
  if (hasResend) {
    const senderEmail = process.env.EMAIL_FROM || 'Arx Tessera Dispatch <onboarding@resend.dev>';
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: senderEmail,
        to: [recipientEmail],
        reply_to: data.workEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Resend API error (${response.status}): ${errText}`);
    }

    const result = await response.json();

    // Client Confirmation Dispatch
    let clientConfirmationResult = null;
    try {
      const confirmRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: senderEmail,
          to: [data.workEmail],
          reply_to: recipientEmail,
          subject: confirmContent.subject,
          html: confirmContent.html,
          text: confirmContent.text
        })
      });

      if (confirmRes.ok) {
        clientConfirmationResult = await confirmRes.json();
        console.log(`[Resend] Confirmation email delivered to ${data.workEmail} (ID: ${clientConfirmationResult.id})`);
      } else {
        const confirmErr = await confirmRes.text();
        console.warn(`[Resend Notice] Client confirmation to ${data.workEmail} bypassed: ${confirmErr}`);
      }
    } catch (cErr) {
      console.warn('[Resend Notice] Client confirmation attempt failed:', cErr.message);
    }

    return {
      provider: 'resend',
      id: result.id,
      routedTo: recipientEmail,
      confirmationSentTo: clientConfirmationResult ? data.workEmail : null
    };
  }

  // 2. Secondary Provider: Standard SMTP via Nodemailer (Google Workspace, Postmark, AWS SES, Mailpit)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    if (!nodemailer) {
      throw new Error('Nodemailer is not installed. Please run `npm install` to enable SMTP routing.');
    }
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const info = await transporter.sendMail({
      from: senderEmail,
      to: recipientEmail,
      replyTo: data.workEmail,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html
    });

    try {
      const confirmContent = buildConfirmationEmail(data);
      await transporter.sendMail({
        from: senderEmail,
        to: data.workEmail,
        replyTo: recipientEmail,
        subject: confirmContent.subject,
        text: confirmContent.text,
        html: confirmContent.html
      });
    } catch (cErr) {
      console.warn('[SMTP Notice] Client confirmation attempt failed:', cErr.message);
    }

    return { provider: 'smtp', id: info.messageId, routedTo: recipientEmail };
  }

  // 3. Fallback: Structured Log Dispatch (for local dev / unconfigured keys)
  console.log('\n============================================================');
  console.log('[EMAIL ROUTING FALLBACK - NO RESEND_API_KEY OR SMTP SET]');
  console.log(`To:       ${recipientEmail}`);
  console.log(`Reply-To: ${data.workEmail}`);
  console.log(`Subject:  ${emailContent.subject}`);
  console.log('------------------------------------------------------------');
  console.log(emailContent.text);
  console.log('============================================================\n');

  return {
    provider: 'local-console-log',
    id: `local-${Date.now()}`,
    routedTo: recipientEmail
  };
}

module.exports = {
  validateConsultationPayload,
  routeConsultationEmail
};
