import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { api } from '../api'
import { useLang } from '../i18n'
import { fieldCls, portalError } from './MemberShell'

// Second step of both sign-in and sign-up: the 6-digit code that was emailed to `email`.
export default function CodeStep({ email, onDone, onBack }) {
  const { t } = useLang()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api('/portal/login/verify', { method: 'POST', body: { code } })
      onDone()
    } catch (err) {
      setError(portalError(err, t))
      setBusy(false)
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted">{t({ en: `We emailed a 6-digit code to ${email}. It is good for 10 minutes — check your spam folder if you do not see it.`, zh: `验证码已发送到 ${email}，10 分钟内有效。没收到请查看垃圾邮件。` })}</p>
      <input className={`${fieldCls} text-center text-2xl tracking-[0.4em]`} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        inputMode="numeric" autoComplete="one-time-code" placeholder="••••••" autoFocus required aria-label={t({ en: 'Verification code', zh: '验证码' })} />
      {error && <p role="alert" className="rounded-xl bg-rose/40 px-4 py-2.5 text-sm text-ink">{error}</p>}
      <button className="btn-primary w-full" disabled={busy || code.length < 4}>
        {busy && <Loader2 size={16} className="animate-spin" />} {t({ en: 'Verify & sign in', zh: '验证并登录' })}
      </button>
      <p className="text-center text-sm"><button type="button" onClick={onBack} className="text-muted hover:text-ink">{t({ en: 'Use a different email / resend', zh: '换一个邮箱 / 重新发送' })}</button></p>
    </form>
  )
}
