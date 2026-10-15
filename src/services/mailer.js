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

// Email-to-SMS: carriers turn an email sent to <number>@<gateway> into a text message.
//   SMS_TO       comma-separated: a full address (1234567890@tmomail.net) or just the digits
//   SMS_GATEWAY  gateway used for entries that are only digits (default: tmomail.net, T-Mobile)
const smsRecipients = () => (process.env.SMS_TO || '')
  .split(',').map((x) => x.trim()).filter(Boolean)
  .map((x) => (x.includes('@') ? x : x.replace(/\D/g, '') + '@' + (process.env.SMS_GATEWAY || 'tmomail.net')));

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
    ['微信 WeChat', rec.wechat],
    ['服务类别 Category', rec.category],
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
  let sent = false;
  try {
    await getTransporter().sendMail({
      from: `"Nouvelle 网站留言" <${user()}>`,
      to: recipients(),
      replyTo: rec.email || undefined,
      subject: `新留言：${rec.name}${rec.interest ? ` - ${rec.interest}` : ''}`,
      text,
      html,
    });
    sent = true;
  } catch (err) {
    console.error('Failed to send contact email:', err.message);
  }
  await sendSmsNotification(rec);
  return sent;
}

// Plain ASCII text kept within one 160-character SMS: carrier gateways drop Chinese characters and
// often fail on multi-part messages. The booking line is built from the structured fields, and the
// visitor's own message is sent with non-ASCII characters removed (the email has the full text).
async function sendSmsNotification(rec) {
  const to = smsRecipients();
  if (!to.length) return false;
  const ascii = (v) => String(v || '').replace(/[^\x20-\x7E]/g, ' ').replace(/\s+/g, ' ').trim();
  const visit = { first: 'first visit', member: 'member', 'non-member': 'non-member' }[rec.visitType] || '';
  const booking = [rec.date, rec.time, rec.price, visit].filter(Boolean).join(' ');
  const lines = [
    'New msg: ' + ascii(rec.name) + ' ' + ascii(rec.phone) + (rec.wechat ? ' WeChat:' + ascii(rec.wechat) : ''),
    ascii(rec.interestEn || rec.categoryEn || ''),
    booking,
  ].filter(Boolean);
  const room = 150 - lines.join('\n').length - 6; // "\nMsg: " + the "+" tail
  const msg = ascii(rec.message.replace(/^[^\n]*\u3010[^\n]*\n?/, '')); // drop the Chinese booking summary line
  if (msg && room > 8) lines.push('Msg: ' + msg.slice(0, room) + (msg.length > room ? '+' : ''));
  const text = lines.join('\n').slice(0, 155);
  try {
    const info = await getTransporter().sendMail({ from: user(), to, subject: 'Nouvelle', text });
    console.log('SMS gateway accepted:', JSON.stringify(info.accepted), '|', text.replace(/\n/g, ' / '));
    return true;
  } catch (err) {
    console.error('Failed to send SMS notification:', err.message);
    return false;
  }
}

// Job applications go out as their own email, with the resume attached. CAREERS_MAIL_TO picks the
// recipients (comma-separated); without it they go to the normal MAIL_TO list.
const careersRecipients = () => {
  const list = (process.env.CAREERS_MAIL_TO || '').split(',').map((x) => x.trim()).filter(Boolean);
  return list.length ? list : recipients();
};

async function sendCareerApplication(rec, resume) {
  if (!enabled()) {
    console.warn('Mail not configured (GMAIL_USER / GMAIL_APP_PASSWORD); skipping application email');
    return false;
  }
  const rows = [['姓名 Name', rec.name], ['电话 Phone', rec.phone], ['邮箱 Email', rec.email], ['简历 Resume', resume ? resume.filename : '未附简历 (none attached)']].filter(([, v]) => v);
  const html = `<table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">${rows
    .map(([k, v]) => `<tr><td style="color:#888;white-space:nowrap">${esc(k)}</td><td>${esc(v)}</td></tr>`)
    .join('')}</table>`;
  try {
    await getTransporter().sendMail({
      from: `"Nouvelle 招聘申请" <${user()}>`,
      to: careersRecipients(),
      replyTo: rec.email || undefined,
      subject: `招聘申请：${rec.name}`,
      text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
      html,
      attachments: resume ? [{ filename: resume.filename, content: resume.content }] : [],
    });
    return true;
  } catch (err) {
    console.error('Failed to send application email:', err.message);
    return false;
  }
}

// ---- new-booking notice to the staff member it belongs to ----
// Email goes through the same Gmail account; the text message uses the carrier's email-to-SMS gateway (plain ASCII, one SMS).
const GATEWAYS = { tmobile: 'tmomail.net', att: 'txt.att.net', verizon: 'vtext.com' };
const ROOM_EN = { room1: 'Skincare room', room2: 'Med-spa room', room3: 'Lash room', room4: 'Scalp room' };
const ROOM_ZH = { room1: '美容单人房', room2: '医美双人房', room3: '美睫单人房', room4: '头疗双人房' };
const clinicTime = (iso, locale, opts) => new Intl.DateTimeFormat(locale, { timeZone: 'America/Los_Angeles', ...opts }).format(new Date(iso));

// profile: { email, phone, carrier, notifyEmail, notifySms }. Returns what happened for each channel:
// 'sent' | 'dry-run' | 'skipped: why' | 'failed: why'. Never throws.
async function sendStaffBooking(profile, appt, customerName, kind = 'new') {
  const res = { email: 'skipped: 未开启', sms: 'skipped: 未开启' };
  const dry = process.env.NOTIFY_DRY_RUN === '1';
  const start = appt.start;
  const end = new Date(new Date(start).getTime() + (appt.durationMin || 60) * 60000).toISOString();
  const when = `${clinicTime(start, 'zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })} ${clinicTime(start, 'en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}–${clinicTime(end, 'en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
  const title = kind === 'test' ? '测试提醒' : '新预约';
  if (profile.notifyEmail !== false && profile.email) {
    if (!enabled()) res.email = 'skipped: 服务器还没配置 Gmail';
    else if (dry) res.email = 'dry-run';
    else {
      const rows = [['时间', when], ['客户', customerName || '—'], ['项目', appt.service], ['房间', ROOM_ZH[appt.room] || '未指定'], ['时长', `${appt.durationMin || 60} 分钟`], ['备注', appt.notes]].filter(([, v]) => v);
      try {
        await getTransporter().sendMail({
          from: `"Nouvelle 预约提醒" <${user()}>`,
          to: profile.email,
          subject: `${title}：${clinicTime(start, 'zh-CN', { month: 'numeric', day: 'numeric' })} ${clinicTime(start, 'en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} ${customerName || ''} ${appt.service}`.trim(),
          text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
          html: `<p style="font-family:sans-serif">${esc(kind === 'test' ? '这是一条测试提醒。' : '你有一个新预约：')}</p><table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">${rows.map(([k, v]) => `<tr><td style="color:#888;white-space:nowrap">${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table>`,
        });
        res.email = 'sent';
      } catch (err) {
        res.email = `failed: ${err.message}`;
        console.error('Failed to email staff booking notice:', err.message);
      }
    }
  }
  if (profile.notifySms !== false && profile.phone) {
    const digits = String(profile.phone).replace(/\D/g, '').replace(/^1(\d{10})$/, '$1');
    if (!enabled()) res.sms = 'skipped: 服务器还没配置 Gmail';
    else if (digits.length !== 10) res.sms = 'skipped: 手机号需要是 10 位美国号码';
    else if (dry) res.sms = 'dry-run';
    else {
      const ascii = (v) => String(v || '').replace(/[^\x20-\x7E]/g, ' ').replace(/\s+/g, ' ').trim();
      const day = clinicTime(start, 'en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const hm = clinicTime(start, 'en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
      const text = `${kind === 'test' ? 'Nouvelle test' : 'New booking'}: ${day} ${hm} (${appt.durationMin || 60}min) ${ROOM_EN[appt.room] || ''} ${ascii(customerName)}`.replace(/\s+/g, ' ').trim().slice(0, 155);
      try {
        await getTransporter().sendMail({ from: user(), to: `${digits}@${GATEWAYS[profile.carrier] || process.env.SMS_GATEWAY || 'tmomail.net'}`, subject: 'Nouvelle', text });
        res.sms = 'sent';
      } catch (err) {
        res.sms = `failed: ${err.message}`;
        console.error('Failed to text staff booking notice:', err.message);
      }
    }
  }
  return res;
}

// Mail with a link to set (new account) or reset (forgotten) a staff password. Never throws.
// Returns 'sent' | 'dry-run' | 'skipped: why' | 'failed: why'. With NOTIFY_DRY_RUN=1 the link is only logged.
async function sendPasswordLink({ to, name, link, kind = 'reset' }) {
  if (!link) return 'skipped: 服务器没有设置 APP_URL（网站网址）';
  const isNew = kind === 'new';
  const title = isNew ? '设置你的登录密码' : '重设登录密码';
  const lead = isNew ? '店长为你创建了 Nouvelle CRM 的登录账号，请点下面的链接设置密码：' : '我们收到了重设密码的请求。点下面的链接设置新密码：';
  const expiry = isNew ? '链接 24 小时内有效。' : '链接 1 小时内有效。';
  if (process.env.NOTIFY_DRY_RUN === '1') {
    console.log(`[mail dry-run] ${kind} password link for ${to}: ${link}`);
    return 'dry-run';
  }
  if (!enabled()) return 'skipped: 服务器还没配置 Gmail';
  try {
    await getTransporter().sendMail({
      from: `"Nouvelle CRM" <${user()}>`,
      to,
      subject: `Nouvelle CRM：${title}`,
      text: `${name ? `${name}，你好\n\n` : ''}${lead}\n${link}\n\n${expiry}如果这不是你本人的操作，请忽略这封邮件。`,
      html: `<div style="font-family:sans-serif;font-size:14px;line-height:1.6"><p>${name ? `${esc(name)}，你好` : '你好'}</p><p>${esc(lead)}</p><p><a href="${esc(link)}" style="display:inline-block;padding:10px 22px;border-radius:999px;background:#8a6d3b;color:#fff;text-decoration:none">${esc(title)}</a></p><p style="color:#888">${esc(expiry)}如果按钮打不开，请复制这个链接到浏览器：<br>${esc(link)}</p><p style="color:#888">如果这不是你本人的操作，请忽略这封邮件。</p></div>`,
    });
    return 'sent';
  } catch (err) {
    console.error('Failed to email password link:', err.message);
    return `failed: ${err.message}`;
  }
}

module.exports = { enabled, sendPasswordLink, sendContactNotification, sendCareerApplication, sendStaffBooking };
