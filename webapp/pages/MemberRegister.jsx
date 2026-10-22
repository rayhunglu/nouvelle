import { useState } from 'react'
import { Link, useNavigate } from '../lib/router'
import { Loader2 } from 'lucide-react'
import { api } from '../api'
import { useLang } from '../i18n'
import MemberShell, { fieldCls, portalError } from './MemberShell'
import CodeStep from './CodeStep'

// Join as a member: name, phone and email; WeChat name and Instagram are optional. The email is confirmed with a one-time code.
export default function MemberRegister() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [f, setF] = useState({ name: '', phone: '', email: '', wechatId: '', instagramId: '', agree: false })
  const [step, setStep] = useState('form')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const send = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api('/portal/register', { method: 'POST', body: f })
      setStep('code')
    } catch (err) {
      setError(err.status === 400 ? err.message : portalError(err, t))
    } finally {
      setBusy(false)
    }
  }
  const Label = ({ children, required, optional }) => (
    <span className="mb-1.5 block text-sm font-medium">{children}{required && <span className="text-rose-700"> *</span>}{optional && <span className="ml-1 font-normal text-muted">{t({ en: '(optional)', zh: '（选填）' })}</span>}</span>
  )

  return (
    <MemberShell back="/login" title={t({ en: 'Join as a member', zh: '加入会员' })} sub={t({ en: 'Tell us a little about you. We will email a code to confirm your address.', zh: '请填写基本资料，我们会发送验证码到您的邮箱确认。' })}>
      {step === 'code' ? (
        <CodeStep email={f.email} onDone={() => navigate('/account', { replace: true })} onBack={() => setStep('form')} />
      ) : (
        <form onSubmit={send} className="space-y-4">
          <label className="block"><Label required>{t({ en: 'Name', zh: '姓名' })}</Label><input className={fieldCls} value={f.name} onChange={set('name')} autoComplete="name" required maxLength={120} autoFocus /></label>
          <label className="block"><Label required>{t({ en: 'Phone number', zh: '电话' })}</Label><input className={fieldCls} type="tel" inputMode="tel" autoComplete="tel" placeholder="(206) 555-0123" value={f.phone} onChange={set('phone')} required /></label>
          <label className="block"><Label required>{t({ en: 'Email', zh: '邮箱' })}</Label><input className={fieldCls} type="email" autoComplete="email" value={f.email} onChange={set('email')} required maxLength={160} /></label>
          <label className="block"><Label optional>{t({ en: 'WeChat Name', zh: '微信名' })}</Label><input className={fieldCls} value={f.wechatId} onChange={set('wechatId')} autoComplete="off" maxLength={60} /></label>
          <label className="block"><Label optional>{t({ en: 'Instagram ID', zh: 'IG ID' })}</Label><input className={fieldCls} value={f.instagramId} onChange={set('instagramId')} autoComplete="off" placeholder="@" maxLength={60} /></label>
          <label className="flex cursor-pointer items-start gap-2 text-sm text-muted">
            <input type="checkbox" className="mt-1" checked={f.agree} onChange={(e) => setF({ ...f, agree: e.target.checked })} required />
            <span>{t({ en: 'I agree to receive a verification email to register as a member.', zh: '我同意接收验证码邮件注册会员。' })}</span>
          </label>
          {error && <p role="alert" className="rounded-xl bg-rose/40 px-4 py-2.5 text-sm text-ink">{error}</p>}
          <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" />} {t({ en: 'Email me a code', zh: '发送验证码' })}</button>
          <p className="text-center text-sm text-muted">{t({ en: 'Already have an account?', zh: '已有账号？' })} <Link to="/login" className="text-gold hover:underline">{t({ en: 'Sign in', zh: '登录' })}</Link></p>
        </form>
      )}
    </MemberShell>
  )
}
