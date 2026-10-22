import { Link } from '../lib/router'
import { ArrowLeft } from 'lucide-react'
import { useLang } from '../i18n'
import LangToggle from '../components/LangToggle'

// Centred card for the member pages (sign in, join, account).
export default function MemberShell({ title, sub, back = '/', children, wide = false }) {
  const { t } = useLang()
  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12">
      <div className={`mx-auto w-full ${wide ? 'max-w-lg' : 'max-w-sm'}`}>
        <div className="mb-10 flex items-center justify-between gap-3">
          <Link to={back} className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
            <ArrowLeft size={16} /> {back === '/' ? t({ en: 'Back to website', zh: '返回网站' }) : t({ en: 'Back', zh: '返回' })}
          </Link>
          <LangToggle />
        </div>
        <p className="font-display text-3xl">Nouvelle</p>
        <h1 className="mt-6 font-display text-2xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  )
}

export const fieldCls = 'w-full rounded-2xl border border-ink/10 bg-white px-4 py-3.5 outline-none transition focus:border-gold'

// The error texts of the portal API, shown in the visitor's language.
export function portalError(err, t) {
  if (err.status === 429) return t({ en: 'Too many attempts. Please try again later.', zh: '尝试次数过多，请稍后再试' })
  if (err.status === 401) return t({ en: 'That code did not work. Check it and try again, or start again.', zh: '验证码不正确或已过期，请检查后重试，或重新开始' })
  if (err.status === 503 || err.status === 502) return t({ en: 'We could not send the email right now. Please try again shortly.', zh: '暂时无法发送验证码邮件，请稍后再试' })
  return err.message || t({ en: 'Something went wrong.', zh: '出错了，请重试' })
}
