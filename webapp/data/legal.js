import { business } from './site'

// Names and contact details used in the Privacy Policy and the Terms. `brand` and `legalName` are what the business registered with Twilio for
// text messaging (A2P Brand registration name, Legal business name): the review compares them with these pages, so keep them exactly the same.
export const legal = {
  brand: 'Nouvelle antiaging',
  legalName: 'Shine aesthtic school LLC',
  display: business.name, // the name customers see on the website and in messages
  email: 'nouvelleantiaging@gmail.com',
  phone: business.phone,
  address: '2020 124th Ave NE, Suite C201, Bellevue, WA 98005',
  updated: { en: 'October 24, 2026', zh: '2026 年 10 月 24 日' },
}

const who = `${legal.brand} (doing business as ${legal.display}), operated by ${legal.legalName}`
const whoZh = `${legal.brand}（营业名称：${legal.display}，运营主体：${legal.legalName}）`

// Each section: h = heading, p = paragraphs, li = bullet list (optional). Every text is { en, zh }.
export const privacy = {
  title: { en: 'Privacy Policy', zh: '隐私政策' },
  intro: {
    en: `This Privacy Policy explains what information ${who} collects, how it is used, and the choices you have. It applies to our website, member accounts, appointment booking and text messages.`,
    zh: `本隐私政策说明 ${whoZh} 收集哪些信息、如何使用，以及您的选择。适用于我们的网站、会员账户、预约和短信。`,
  },
  sections: [
    {
      h: { en: 'Who we are', zh: '我们是谁' },
      p: [{
        en: `${who}, ${legal.address}. Questions about this policy: ${legal.email} or ${legal.phone}.`,
        zh: `${whoZh}，${legal.address}。关于本政策的问题请联系：${legal.email} 或 ${legal.phone}。`,
      }],
    },
    {
      h: { en: 'Information we collect', zh: '我们收集的信息' },
      li: [
        { en: 'Contact details: name, phone number, email, and WeChat or Instagram name if you give them.', zh: '联系方式：姓名、电话、邮箱，以及您提供的微信名或 Instagram 名。' },
        { en: 'Details for your care: date of birth, emergency contact, health questionnaire answers, signed consent forms, and photos taken as part of your treatment record.', zh: '护理所需资料：出生日期、紧急联系人、健康问卷答案、签署的同意书，以及作为护理记录拍摄的照片。' },
        { en: 'Visit and payment records: appointments, services, payments, and member card balance.', zh: '到店与付款记录：预约、服务项目、付款和会员卡余额。' },
        { en: 'Your text-message choices: whether you agreed to receive text messages, when, and whether you later opted out.', zh: '您的短信选择：是否同意接收短信、同意时间，以及之后是否退订。' },
        { en: 'Messages you send us through the website, and the technical information a sign-in session needs (a cookie).', zh: '您通过网站发给我们的留言，以及登录所需的技术信息（Cookie）。' },
      ],
    },
    {
      h: { en: 'How we use it', zh: '我们如何使用' },
      li: [
        { en: 'To book, confirm and manage your appointments and to provide your treatments safely.', zh: '预约、确认和管理您的预约，并安全地提供护理。' },
        { en: 'To process payments and keep your member card balance and visit history.', zh: '处理付款，并保存会员卡余额和到店记录。' },
        { en: 'To send you appointment-related text messages and emails, such as confirmations and sign-in codes.', zh: '向您发送与预约相关的短信和邮件，例如确认通知和登录验证码。' },
        { en: 'To answer your questions, keep our records, and meet legal requirements.', zh: '回复您的咨询、保存记录，并满足法律要求。' },
      ],
    },
    {
      h: { en: 'Text messages', zh: '短信' },
      p: [
        { en: 'We send text messages only to clients who have agreed to receive them, and only about their own appointments. You can opt out at any time by replying STOP to any message, or by turning text messages off in your member account.', zh: '我们只向同意接收短信的客人发送短信，且只与其本人预约有关。您可以随时回复 STOP 退订，或在会员账户中关闭短信。' },
        { en: 'Message frequency varies. Message and data rates may apply.', zh: 'Message frequency varies. Message and data rates may apply.（短信频率不定，可能产生短信和流量费用。）' },
        { en: 'We do not sell or share your SMS opt-in data or personal information with third parties for marketing purposes.', zh: 'We do not sell or share your SMS opt-in data or personal information with third parties for marketing purposes.（我们不会为营销目的向第三方出售或分享您的短信同意数据或个人信息。）' },
      ],
    },
    {
      h: { en: 'Who we share it with', zh: '我们与谁共享' },
      p: [
        { en: 'We do not sell your personal information. We share it only with service providers that work for us, such as those that host our website and database, deliver email and text messages, and store calendars and files, and only as needed for those services. We may also disclose information when the law requires it.', zh: '我们不会出售您的个人信息。我们只会在必要范围内与为我们提供服务的供应商共享，例如网站与数据库托管、邮件与短信发送、日历与文件存储的供应商。法律要求时，我们也可能披露信息。' },
      ],
    },
    {
      h: { en: 'How long we keep it, and security', zh: '保存期限与安全' },
      p: [
        { en: 'We keep your information for as long as we need it to care for you, keep our records and meet legal requirements. We use reasonable safeguards to protect it, but no method of storage or transmission is completely secure.', zh: '我们在为您提供护理、保存记录和满足法律要求所需的期间内保存您的信息。我们采取合理措施保护信息，但任何存储或传输方式都无法做到绝对安全。' },
      ],
    },
    {
      h: { en: 'Your choices', zh: '您的选择' },
      p: [
        { en: `You can ask us to see, correct or delete your information, or turn text messages on or off, by signing in to your member account or contacting us at ${legal.email} or ${legal.phone}. Some records we must keep by law.`, zh: `您可以登录会员账户，或通过 ${legal.email}、${legal.phone} 联系我们，查看、更正或删除您的信息，或开启、关闭短信。部分记录依法必须保留。` },
      ],
    },
    {
      h: { en: 'Children', zh: '未成年人' },
      p: [{ en: 'Our services and website are not directed to anyone under 18.', zh: '我们的服务和网站不面向 18 岁以下人士。' }],
    },
    {
      h: { en: 'Changes to this policy', zh: '政策更新' },
      p: [{ en: 'We may update this policy. The date at the top shows when it last changed.', zh: '我们可能会更新本政策，页面顶部的日期为最近更新日期。' }],
    },
  ],
}

export const terms = {
  title: { en: 'Terms & Conditions', zh: '服务条款' },
  intro: {
    en: `These Terms apply to the website, member accounts, appointments and text messages of ${who}. By using them you agree to these Terms.`,
    zh: `本条款适用于 ${whoZh} 的网站、会员账户、预约和短信。使用即表示您同意本条款。`,
  },
  sections: [
    {
      h: { en: 'Appointments and treatments', zh: '预约与护理' },
      li: [
        { en: 'Appointments depend on availability. All treatments begin with a consultation, and results vary from person to person.', zh: '预约视可用时间而定。所有护理均需先行咨询，效果因人而异。' },
        { en: 'Information on the website is general and is not medical advice. Please give us accurate health information.', zh: '网站上的信息仅供一般参考，不构成医疗建议。请向我们提供准确的健康信息。' },
      ],
    },
    {
      h: { en: 'Member accounts', zh: '会员账户' },
      p: [{ en: 'You sign in with your email and a one-time code. Keep your email account secure; you are responsible for activity on your account. We may suspend accounts that are misused.', zh: '您使用邮箱和一次性验证码登录。请保管好您的邮箱，账户下的操作由您负责。我们可暂停被滥用的账户。' }],
    },
    {
      h: { en: 'SMS Terms', zh: '短信条款（SMS Terms）' },
      li: [
        { en: `Program: ${legal.brand} (${legal.display}) sends appointment-related text messages to clients: confirmations of appointments they booked, and updates if an appointment is changed or cancelled. We do not send marketing text messages.`, zh: `项目：${legal.brand}（${legal.display}）向客人发送与预约相关的短信：已预约项目的确认，以及预约变更或取消的通知。我们不发送营销短信。` },
        { en: 'Consent: you agree to receive these messages by ticking the text-message box on our sign-up forms or by turning text messages on in your member account. Consent is not a condition of joining or of buying any service.', zh: '同意：您在注册表单勾选短信选项，或在会员账户中开启短信，即表示同意接收这些短信。是否同意不影响加入会员或购买任何服务。' },
        { en: 'Message frequency varies with your appointments.', zh: '短信频率视您的预约而定。' },
        { en: 'Message and data rates may apply.', zh: 'Message and data rates may apply.（可能产生短信和流量费用。）' },
        { en: 'Opt out: reply STOP to any message at any time, or turn text messages off in your member account. You will get one confirmation and no further messages. Reply START to receive messages again.', zh: '退订：随时回复 STOP，或在会员账户中关闭短信。您会收到一条确认，之后不会再收到短信。回复 START 可重新接收。' },
        { en: `Help: reply HELP, or contact us at ${legal.email} or ${legal.phone}.`, zh: `帮助：回复 HELP，或联系 ${legal.email}、${legal.phone}。` },
        { en: 'Mobile carriers are not liable for delayed or undelivered messages.', zh: '移动运营商不对延迟或未送达的短信负责。' },
        { en: 'How we handle your information is described in our Privacy Policy.', zh: '我们如何处理您的信息，请见隐私政策。' },
      ],
    },
    {
      h: { en: 'Using the website', zh: '使用网站' },
      p: [{ en: 'Please do not misuse the website or try to access accounts or data that are not yours. The content on the website belongs to us or our partners.', zh: '请勿滥用网站，或试图访问不属于您的账户或数据。网站内容属于我们或我们的合作方。' }],
    },
    {
      h: { en: 'Liability, law and changes', zh: '责任、适用法律与更新' },
      p: [
        { en: 'To the extent the law allows, we are not liable for indirect or incidental losses from using the website. These Terms are governed by the laws of the State of Washington. We may update these Terms; the date at the top shows the latest version.', zh: '在法律允许的范围内，我们不对使用网站产生的间接或附带损失负责。本条款适用华盛顿州法律。我们可能更新本条款，页面顶部的日期为最新版本日期。' },
      ],
    },
    {
      h: { en: 'Contact', zh: '联系我们' },
      p: [{ en: `${who}, ${legal.address}. ${legal.email} · ${legal.phone}.`, zh: `${whoZh}，${legal.address}。${legal.email} · ${legal.phone}。` }],
    },
  ],
}
