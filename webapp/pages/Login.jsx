import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Lock, User } from 'lucide-react'
import { useAuth } from '../auth'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const next = location.state?.from || '/crm'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={next} replace />

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(username, password)
      navigate(next, { replace: true })
    } catch (err) {
      setError(
        err.status === 401 ? '账号或密码错误'
          : err.status === 429 ? '尝试次数过多，请稍后再试'
          : '无法连接登录服务，请确认服务器已重启到最新版本',
      )
    } finally {
      setBusy(false)
    }
  }

  const field = 'w-full rounded-2xl border border-ink/10 bg-white py-3.5 pl-11 pr-4 outline-none transition focus:border-gold'

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <img src="/images/hero-main.png" alt="" className="absolute inset-0 h-full w-full object-cover object-[30%_center] opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-12 text-ivory">
          <p className="eyebrow !text-gold-light">Nouvelle CRM</p>
          <h2 className="mt-4 max-w-sm font-display text-4xl font-light leading-tight">客户、预约与账目，集中管理。</h2>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-16">
        <Link to="/" className="mb-12 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
          <ArrowLeft size={16} /> 返回网站
        </Link>
        <div className="mx-auto w-full max-w-sm">
          <p className="font-display text-3xl">Nouvelle</p>
          <h1 className="mt-6 font-display text-2xl">登录</h1>
          <p className="mt-1 text-sm text-muted">员工后台，仅限授权人员使用。</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="relative block">
              <span className="sr-only">账号</span>
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input className={field} placeholder="账号" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus required />
            </label>
            <label className="relative block">
              <span className="sr-only">密码</span>
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input className={field} type="password" placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
            </label>
            {error && <p role="alert" className="rounded-xl bg-rose/40 px-4 py-2.5 text-sm text-ink">{error}</p>}
            <button className="btn-primary w-full" disabled={busy}>
              {busy && <Loader2 size={16} className="animate-spin" />} 登录
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
