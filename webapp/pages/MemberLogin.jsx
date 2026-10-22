import { useEffect, useState } from 'react'
import { Link, useNavigate } from '../lib/router'
import { Loader2 } from 'lucide-react'
import { api } from '../api'
import { useLang } from '../i18n'
import MemberShell, { fieldCls, portalError } from './MemberShell'
import CodeStep from './CodeStep'

// Member sign-in: the email, then the one-time code that was mailed to it. New here: create an account, or carry on as a guest by filling in the information form.
export default function MemberLogin() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [step, setStep] = useState('email')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { api('/portal/me').then(() => navigate('/account', { replace: true })).catch(() => {}) }, [navigate]) // already signed in

  const send = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api('/portal/login/start', { method: 'POST', body: { email } })
      setStep('code')
    } catch (err) {
      setError(err.status === 400 ? err.message : portalError(err, t))
    } finally {
      setBusy(false)
    }
  }

  return (
    <MemberShell title={t({ en: 'Welcome Back', zh: '欢迎回来' })}>
      {step === 'code' ? (
        <CodeStep email={email} onDone={() => navigate('/account', { replace: true })} onBack={() => setStep('email')} />
      ) : (
        <>
          <form onSubmit={send} className="space-y-4">
            <label className="block"><span className="mb-1.5 block text-sm font-medium">{t({ en: 'Email', zh: '邮箱' })}</span>
              <input className={fieldCls} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus required /></label>
            {error && <p role="alert" className="rounded-xl bg-rose/40 px-4 py-2.5 text-sm text-ink">{error}</p>}
            <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" />} {t({ en: 'Email me a code', zh: '发送验证码' })}</button>
          </form>

          <div className="mt-8 space-y-3 text-center">
            <p className="text-sm text-muted">{t({ en: 'No account yet?', zh: '还没有账号？' })}</p>
            <Link to="/register" className="btn-ghost w-full">{t({ en: 'Join as a member', zh: '加入会员' })}</Link>
            <div className="flex items-center gap-3 py-2 text-xs text-muted"><span className="h-px flex-1 bg-ink/10" />{t({ en: 'or', zh: '或者' })}<span className="h-px flex-1 bg-ink/10" /></div>
            <Link to="/join" className="btn-ghost w-full">{t({ en: 'Continue as a guest', zh: '以访客身份继续' })}</Link>
          </div>
        </>
      )}
    </MemberShell>
  )
}
