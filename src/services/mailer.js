const nodemailer = require('nodemailer');

// Gmail SMTP. Needs a Google "App Password" (not the normal Gmail password):
//   GMAIL_USER          the Gmail address that sends the mail (GMAIL_EMAIL also works)
//   GMAIL_APP_PASSWORD  16-character app password (spaces are ignored)
//   MAIL_TO             where notifications go (GMAIL_TO also works); comma-separate for several,
//                       e.g. a@x.com,b@y.com (default: the sending address)
const user = () => process.env.GMAIL_USER || process.env.GMAIL_EMAIL;
const pass = () => (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

// Recipients: MAIL_TO or GMAIL_TO, comma-separated; falls back to the sending address.
const recipients = () => {
  const list = (process.env.MAIL_TO || process.env.GMAIL_TO || '').split(',').map((x) => x.trim()).filter(Boolean);
  return list.length ? list : [user()];
};

const enabled = () => Boolean(user() && pass());

let transporter;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: user(), pass: pass() },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }
  return transporter;
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Sends a notification for a website contact-form submission. Never throws: the message is
// already saved in the datastore, so a mail failure is only logged.
async function sendContactNotification(rec) {
  if (!enabled()) {
    console.warn('Mail not configured (GMAIL_USER / GMAIL_APP_PASSWORD); skipping email notification');
    return false;
  }
  const rows = [
    ['姓名 Name', rec.name],
    ['电话 Phone', rec.phone],
    ['邮箱 Email', rec.email],
    ['咨询项目 Interest', rec.interest],
    ['预约套餐 Package', rec.package],
    ['到访类型 Visit', rec.visitType],
    ['价格 Price', rec.price],
    ['预约日期 Date', rec.date],
    ['预约时间 Time', rec.time],
    ['留言 Message', rec.message],
  ].filter(([, v]) => v);
  const html = `<table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">${rows
    .map(([k, v]) => `<tr><td style="color:#888;white-space:nowrap;vertical-align:top">${esc(k)}</td><td>${esc(v).replace(/\n/g, '<br>')}</td></tr>`)
    .join('')}</table>`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');
  try {
    await getTransporter().sendMail({
      from: `"Nouvelle 网站留言" <${user()}>`,
      to: recipients(),
      replyTo: rec.email || undefined,
      subject: `新留言：${rec.name}${rec.interest ? ` - ${rec.interest}` : ''}`,
      text,
      html,
    });
    return true;
  } catch (err) {
    console.error('Failed to send contact email:', err.message);
    return false;
  }
}

module.exports = { enabled, sendContactNotification };
