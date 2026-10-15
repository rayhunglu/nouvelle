import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

// Plain centred card for the password pages (the sign-in page has its own two-column layout).
export default function AuthShell({ title, sub, children }) {
  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <Link to="/login" className="mb-10 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
          <ArrowLeft size={16} /> 返回登录
        </Link>
        <p className="font-display text-3xl">Nouvelle</p>
        <h1 className="mt-6 font-display text-2xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  )
}
