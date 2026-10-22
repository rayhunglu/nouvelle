import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Lock } from 'lucide-react'
import { api } from '../api'
import AuthShell from './AuthShell'

// Opened from the emailed link (/reset-password?token=...): choose the password for a new account or after "forgot password".
export default function ResetPassword() {
  // The token is in the part after "#" (it never goes to the server); read it once, then hide it from the address bar.
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('token') || '')
  useEffect(() => { if (window.location.hash) window.history.replaceState(null, '', window.location.pathname) }, [])
  const [password, setPassword] = useState('')
  const [again, setAgain] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (password !== again) return setError('两次输入的密码不一致')
    setBusy(true)
    setError('')
    try {
      await api('/auth/reset', { method: 'POST', body: { token, password } })
      setDone(true)
    } catch (err) {
      setError(err.status === 429 ? '尝试次数过多，请稍后再试' : err.message || '设置失败')
    } finally {
      setBusy(false)
    }
  }

  const field = 'w-full rounded-2xl border border-ink/10 bg-white py-3.5 pl-11 pr-4 outline-none transition focus:border-gold'

  if (!token) {
    return (
      <AuthShell title="链接无效" sub="这个链接缺少必要的信息，请回到邮件里重新点击，或重新申请。">
        <Link to="/forgot-password" className="btn-primary w-full">重新申请</Link>
      </AuthShell>
    )
  }
  if (done) {
    return (
      <AuthShell title="密码已设置" sub="现在可以用新密码登录了。">
        <Link to="/staff-login" className="btn-primary w-full">去登录</Link>
      </AuthShell>
    )
  }
  return (
    <AuthShell title="设置密码" sub="至少 8 位。设置后这个链接就失效了。">
      <form onSubmit={submit} className="space-y-4">
        <label className="relative block">
          <span className="sr-only">新密码</span>
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input className={field} type="password" placeholder="新密码" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={8} autoFocus required />
        </label>
        <label className="relative block">
          <span className="sr-only">再输入一次</span>
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input className={field} type="password" placeholder="再输入一次" value={again} onChange={(e) => setAgain(e.target.value)} autoComplete="new-password" minLength={8} required />
        </label>
        {error && <p role="alert" className="rounded-xl bg-rose/40 px-4 py-2.5 text-sm text-ink">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" />} 保存密码</button>
      </form>
      {error.includes('过期') && <p className="mt-4 text-sm"><Link to="/forgot-password" className="text-gold underline">重新申请链接</Link></p>}
    </AuthShell>
  )
}
