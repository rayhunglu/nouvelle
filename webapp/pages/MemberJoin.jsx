import { useState } from 'react'
import { Link, useNavigate } from '../lib/router'
import { Loader2 } from 'lucide-react'
import { api } from '../api'
import { openPicker } from '../lib/util'
import { useLang } from '../i18n'
import Questionnaire, { HEARD_FROM, emptyQuestionnaire } from '../crm/Questionnaire'
import MemberShell, { fieldCls, portalError } from './MemberShell'
import CodeStep from './CodeStep'
import SmsConsent from '../components/SmsConsent'

// 信息填写 (the customer fills it in themselves, the same details and health questionnaires as "客户自己填写资料问卷" in the CRM). Sending it
// confirms the email with a mailed code and then creates the customer's record, so staff see the answers in 客户 and the member can sign in.
export default function MemberJoin() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [f, setF] = useState({ legalName: '', dob: '', phone: '', email: '', emergencyName: '', emergencyPhone: '', heardFrom: '', wechatId: '', instagramId: '', agree: false, smsConsent: false, questionnaire: emptyQuestionnaire() })
  const [step, setStep] = useState('form')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const confirm = (e) => { e.preventDefault(); setError(''); setStep('confirm'); window.scrollTo(0, 0) } // the form is complete (the browser checked the required boxes): ask for the text-message consent
  const send = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api('/portal/join', { method: 'POST', body: f })
      setStep('code')
    } catch (err) {
      if (err.status === 400) setStep('form') // something in the form needs fixing
      setError(err.status === 400 ? err.message : portalError(err, t))
    } finally {
      setBusy(false)
    }
  }
  const Label = ({ children, required, optional }) => (
    <span className="mb-1.5 block text-sm font-medium">{children}{required && <span className="text-rose-700"> *</span>}{optional && <span className="ml-1 font-normal text-muted">{t({ en: '(optional)', zh: '（选填）' })}</span>}</span>
  )

  return (
    <MemberShell wide back="/login" title={t({ en: 'Information Form', zh: '信息填写' })} sub={t({ en: 'Please fill in your details and the questionnaires. We will email a code to confirm your address.', zh: '请填写您的资料和问卷，我们会发送验证码到您的邮箱确认。' })}>
      {step === 'code' ? (
        <CodeStep email={f.email} onDone={() => navigate('/account', { replace: true })} onBack={() => setStep('form')} />
      ) : step === 'confirm' ? (
        <form onSubmit={send} className="space-y-5 text-center">
          <p className="font-display text-2xl">{t({ en: 'Become a member now — be the first to know our offers and surprises.', zh: '立即成为会员，优惠惊喜抢先知。' })}</p>
          <label className="mx-auto flex max-w-sm cursor-pointer items-start gap-2 text-left text-sm text-muted">
            <input type="checkbox" className="mt-1" checked={f.agree} onChange={(e) => setF({ ...f, agree: e.target.checked })} required />
            <span>{t({ en: 'I agree to receive a verification email to register as a member.', zh: '我同意接收验证码邮件注册会员。' })}</span>
          </label>
          {error && <p role="alert" className="rounded-xl bg-rose/40 px-4 py-2.5 text-sm text-ink">{error}</p>}
          <button className="btn-primary w-full" disabled={busy || !f.agree}>{busy && <Loader2 size={16} className="animate-spin" />} {t({ en: 'Email me a code', zh: '发送验证码' })}</button>
          <p className="text-sm"><button type="button" onClick={() => setStep('form')} className="text-muted hover:text-ink">{t({ en: 'Back to edit', zh: '返回修改' })}</button></p>
        </form>
      ) : (
        <form onSubmit={confirm} className="space-y-4">
          <label className="block"><Label required>Full Legal Name｜法定姓名</Label><input className={fieldCls} value={f.legalName} onChange={set('legalName')} autoComplete="name" required maxLength={120} autoFocus /></label>
          <label className="block"><Label required>Date of Birth｜出生日期</Label><input className={fieldCls} type="date" onClick={openPicker} onFocus={openPicker} max={new Date().toISOString().slice(0, 10)} value={f.dob} onChange={set('dob')} autoComplete="bday" required /></label>
          <label className="block"><Label required>Phone Number｜联系电话</Label><input className={fieldCls} type="tel" inputMode="tel" autoComplete="tel" placeholder="(206) 555-0123" value={f.phone} onChange={set('phone')} required /></label>
          <label className="block"><Label required>Email Address｜邮箱</Label><input className={fieldCls} type="email" autoComplete="email" value={f.email} onChange={set('email')} required maxLength={160} /></label>
          <label className="block"><Label required>Emergency Contact Name｜紧急联系人姓名</Label><input className={fieldCls} value={f.emergencyName} onChange={set('emergencyName')} autoComplete="off" required maxLength={120} /></label>
          <label className="block"><Label required>Emergency Contact Phone｜紧急联系人电话</Label><input className={fieldCls} type="tel" inputMode="tel" value={f.emergencyPhone} onChange={set('emergencyPhone')} autoComplete="off" required /></label>
          <label className="block"><Label optional>How Did You Hear About Us?｜获知本店的渠道</Label><select className={fieldCls} value={f.heardFrom} onChange={set('heardFrom')}><option value="">—</option>{HEARD_FROM.map((o) => <option key={o} value={o}>{o}</option>)}</select></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><Label optional>WeChat Name｜微信名</Label><input className={fieldCls} value={f.wechatId} onChange={set('wechatId')} autoComplete="off" maxLength={60} /></label>
            <label className="block"><Label optional>Instagram ID｜IG ID</Label><input className={fieldCls} value={f.instagramId} onChange={set('instagramId')} autoComplete="off" placeholder="@" maxLength={60} /></label>
          </div>
          <SmsConsent checked={f.smsConsent} onChange={(smsConsent) => setF((cur) => ({ ...cur, smsConsent }))} />
          <Questionnaire value={f.questionnaire} onChange={(questionnaire) => setF((cur) => ({ ...cur, questionnaire }))} />
          {error && <p role="alert" className="rounded-xl bg-rose/40 px-4 py-2.5 text-sm text-ink">{error}</p>}
          <button className="btn-primary w-full">{t({ en: 'Confirm & submit', zh: '确认提交' })}</button>
          <p className="text-center text-sm text-muted">{t({ en: 'Already filled in?', zh: '已经填写过？' })} <Link to="/login" className="text-gold hover:underline">{t({ en: 'Sign in', zh: '登录' })}</Link></p>
        </form>
      )}
    </MemberShell>
  )
}
