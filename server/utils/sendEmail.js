const nodemailer = require('nodemailer');
const dns = require('dns').promises;

let cachedTransporter = null;

function getEnv(name, fallback) {
  return process.env[name] || fallback;
}

async function createTransport() {
  if (cachedTransporter) return cachedTransporter;

  const host = getEnv('EMAIL_HOST');
  const port = Number(getEnv('EMAIL_PORT', '465')); // default 465
  const secureEnv = getEnv('EMAIL_SECURE');
  const secure = secureEnv === 'true' ? true : (port === 465);
  const user = getEnv('EMAIL_USER');
  const pass = getEnv('EMAIL_PASS');

  if (!host || !user || !pass) {
    throw new Error('Missing SMTP config in environment (EMAIL_HOST, EMAIL_USER, EMAIL_PASS).');
  }

  // Try to resolve hostname (helps debug DNS -> IP)
  try {
    const ips = await dns.lookup(host, { all: true });
    console.log(`[sendEmail] Resolved ${host} -> ${ips.map(i=>i.address).join(', ')}`);
  } catch (err) {
    console.warn('[sendEmail] DNS lookup failed for host:', host, err && err.message ? err.message : err);
  }

  console.log(`[sendEmail] Creating transporter to ${host}:${port} secure=${secure}`);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    },
    // Helpful for debugging; can be turned off in production
    logger: getEnv('EMAIL_DEBUG') === 'true',
    debug: getEnv('EMAIL_DEBUG') === 'true',
    pool: false,
    connectionTimeout: Number(getEnv('EMAIL_CONN_TIMEOUT', 30000)), // 30s default
    greetingTimeout: Number(getEnv('EMAIL_GREET_TIMEOUT', 30000)),
    socketTimeout: Number(getEnv('EMAIL_SOCKET_TIMEOUT', 30000)),
    requireTLS: port === 587 || getEnv('EMAIL_REQUIRE_TLS') === 'true',
    tls: {
      // If you need to accept self-signed certs (not recommended), set EMAIL_TLS_REJECT_UNAUTHORIZED=false
      rejectUnauthorized: getEnv('EMAIL_TLS_REJECT_UNAUTHORIZED') !== 'false'
    }
  });

  transporter.on('error', (err) => {
    console.error('[sendEmail transporter error]', err && err.message ? err.message : err);
  });

  // verify but don't crash on failure
  try {
    await transporter.verify();
    console.log('[sendEmail] SMTP transporter verified');
  } catch (verifyErr) {
    console.warn('[sendEmail] SMTP verify failed (will attempt sends anyway):', verifyErr && verifyErr.message ? verifyErr.message : verifyErr);
  }

  cachedTransporter = transporter;
  return cachedTransporter;
}

async function sendMail({ to, subject, html, text }) {
  const transporter = await createTransport();

  const fromName = getEnv('EMAIL_FROM_NAME', 'VisionVault');
  const fromAddress = getEnv('EMAIL_FROM_ADDRESS', process.env.EMAIL_USER);

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to,
      subject,
      text: text || undefined,
      html
    });
    console.log('[sendEmail] sendMail success:', info && (info.messageId || info.accepted));
    return info;
  } catch (err) {
    console.error('[sendEmail] sendMail error:', err && err.message ? err.message : err);
    throw err;
  }
}

module.exports = sendMail;

// ✔ Signup → Email Verification
// ✔ Resend verification
// ✔ Forgot password
// ✔ Reset password
