import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { CalendarDays, ExternalLink, LayoutDashboard, Loader2, LogOut, Users, Wallet } from 'lucide-react'
import { useAuth } from '../auth'
import { CrmProvider } from './data'

const nav = [
  { to: '/crm', label: '总览', icon: LayoutDashboard, end: true },
  { to: '/crm/customers', label: '客户', icon: Users },
  { to: '/crm/appointments', label: '预约', icon: CalendarDays },
  { to: '/crm/finance', label: '账目', icon: Wallet },
]

export default function CrmLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  if (user === undefined) {
    return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin text-gold" /></div>
  }
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />

  return (
    <CrmProvider>
      <div className="min-h-screen bg-[#f6f2ec] lg:flex">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-ink p-5 text-ivory lg:flex">
          <div className="px-3 py-4">
            <p className="font-display text-2xl">Nouvelle</p>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-gold-light">CRM</p>
          </div>
          <nav className="mt-6 flex flex-col gap-1">
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${isActive ? 'bg-ivory/10 text-ivory' : 'text-ivory/60 hover:bg-ivory/5 hover:text-ivory'}`
                }
              >
                <Icon size={18} /> {label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto space-y-1 border-t border-ivory/10 pt-4">
            <NavLink to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ivory/60 hover:text-ivory"><ExternalLink size={18} /> 返回网站</NavLink>
            <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ivory/60 hover:text-ivory">
              <LogOut size={18} /> 退出（{user.username}）
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Mobile top bar */}
          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-ink/10 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
            <p className="font-display text-xl">Nouvelle <span className="text-xs font-semibold tracking-[0.2em] text-gold">CRM</span></p>
            <button onClick={logout} className="grid h-9 w-9 place-items-center rounded-full border border-ink/15" aria-label="退出"><LogOut size={16} /></button>
          </div>

          <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-8 lg:pb-12 lg:pt-10">
            <Outlet />
          </main>

          {/* Mobile bottom tabs */}
          <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-ink/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex flex-col items-center gap-1 py-2.5 text-[0.7rem] ${isActive ? 'text-ink' : 'text-muted'}`}>
                <Icon size={20} /> {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </CrmProvider>
  )
}
