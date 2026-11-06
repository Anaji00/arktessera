/**
 * Arx Tessera - Email Configuration Verification Utility
 * Run with: npm run test:email  OR  node scripts/test-email.js
 */

// Resilient .env loader (uses dotenv if present, or native file read)
try {
  require('dotenv').config();
} catch (e) {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

const { routeConsultationEmail } = require('../lib/email');

async function testEmailConfiguration() {
  console.log('\n============================================================');
  console.log(' ARX TESSERA — EMAIL DISPATCH CONFIGURATION CHECK');
  console.log('============================================================');

  const recipient = process.env.CONTACT_RECIPIENT_EMAIL || 'alessionaji1@gmail.com';
  const sender = process.env.EMAIL_FROM || 'Arx Tessera Dispatch <onboarding@resend.dev>';

  console.log(`Configured Destination : ${recipient}`);
  console.log(`Configured Sender      : ${sender}`);

  // Provider detection
  if (process.env.RESEND_API_KEY) {
    const maskedKey = process.env.RESEND_API_KEY.slice(0, 6) + '...' + process.env.RESEND_API_KEY.slice(-4);
    console.log(`Active Provider        : Resend HTTP API (Key: ${maskedKey})`);
  } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log(`Active Provider        : SMTP (${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587}, User: ${process.env.SMTP_USER})`);
  } else {
    console.log('Active Provider        : Local Development Simulator (No external keys set in .env)');
    console.log('Notice                 : Submissions will log to terminal and return ok:true.');
  }

  console.log('------------------------------------------------------------');
  console.log('Attempting sample consultation routing...\n');

  const sampleLead = {
    fullName: 'Jordan Vance (Test Lead)',
    workEmail: 'jordan@vancehaulage.com',
    companyName: 'Vance Heavy Haulage',
    phone: '(713) 555-0194',
    interests: ['Reverse-Engineer / Clone CRM', 'Cut Software Subscription Bills'],
    projectScope: 'Currently paying $4,200/mo for 24 Salesforce seats. Need a lean dispatch pipeline that we own 100% on private cloud.',
    roiSnapshot: {
      totalAnnualWaste: '$50,400 / yr',
      recapturedSavings: '$38,400 / yr'
    },
    submittedAt: new Date().toISOString()
  };

  try {
    const result = await routeConsultationEmail(sampleLead);
    console.log('------------------------------------------------------------');
    console.log('SUCCESS: Email routed successfully!');
    console.log(`Provider Used : ${result.provider}`);
    console.log(`Message/Tx ID : ${result.id}`);
    console.log(`Delivered To  : ${result.routedTo}`);
    console.log('============================================================\n');

    if (result.provider === 'local-console-log') {
      console.log('Next step: To send REAL emails to your Gmail inbox, add your');
      console.log('RESEND_API_KEY (recommended) or Gmail SMTP credentials into .env');
    } else {
      console.log(`Please check your inbox at: ${result.routedTo}`);
    }
  } catch (error) {
    console.error('------------------------------------------------------------');
    console.error('ERROR: Email dispatch failed.');
    console.error(`Message: ${error.message}`);
    console.error('============================================================\n');
    console.error('Troubleshooting tips:');
    if (process.env.RESEND_API_KEY) {
      console.error('- Check if your RESEND_API_KEY is valid at https://resend.com/api-keys');
      console.error('- If using free onboarding@resend.dev, the "to" email must match your Resend account email.');
      console.error('- If using a custom domain (e.g. contact@najialess.io), ensure domain is verified in Resend.');
    } else if (process.env.SMTP_HOST) {
      console.error('- For Gmail, you must use a 16-character Google App Password (not your personal login password).');
      console.error('- Ensure 2-Step Verification is turned on in your Google Account.');
    }
    process.exit(1);
  }
}

testEmailConfiguration();
