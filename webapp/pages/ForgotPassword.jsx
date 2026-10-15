import { useState } from 'react'
import { Loader2, Mail } from 'lucide-react'
import { api } from '../api'
import AuthShell from './AuthShell'

// Asks for a password link by login name or email. The answer is always the same, whether or not the account exists.
export default function ForgotPassword() {
  const [who, setWho] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api('/auth/forgot', { method: 'POST', body: { username: who } })
      setSent(true)
    } catch (err) {
      setError(err.status === 429 ? '尝试次数过多，请稍后再试' : '发送失败，请稍后再试')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell title="忘记密码" sub="输入登录名或邮箱，我们会寄一封重设密码的邮件。">
      {sent ? (
        <p role="status" className="rounded-xl bg-sand px-4 py-3 text-sm">如果这个账号存在并且设置了邮箱，重设密码的链接已经寄出（1 小时内有效）。请查收邮件，也看一下垃圾邮件箱。</p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <label className="relative block">
            <span className="sr-only">登录名或邮箱</span>
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input className="w-full rounded-2xl border border-ink/10 bg-white py-3.5 pl-11 pr-4 outline-none transition focus:border-gold" placeholder="登录名或邮箱" value={who} onChange={(e) => setWho(e.target.value)} autoComplete="username" autoFocus required />
          </label>
          {error && <p role="alert" className="rounded-xl bg-rose/40 px-4 py-2.5 text-sm text-ink">{error}</p>}
          <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" />} 发送重设链接</button>
        </form>
      )}
    </AuthShell>
  )
}
