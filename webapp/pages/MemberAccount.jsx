import { useEffect, useState } from 'react'
import { useNavigate } from '../lib/router'
import { Loader2 } from 'lucide-react'
import { api } from '../api'
import { useLang } from '../i18n'
import MemberShell, { fieldCls } from './MemberShell'

const money = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const METHODS = { cash: ['Cash', '现金'], zelle: ['Zelle', 'Zelle'], card: ['Card', '刷卡'], member_card: ['Member card', '会员卡'], unsettled: ['Unsettled', '未结算'], other: ['Other', '其他'] }
const GIFTS = { photofacial: ['Photofacial', '光子嫩肤'], thermage: ['Thermage', '热拉提'] }

// What a member sees after signing in: the member card balance, their visits and what is booked, and their own details.
export default function MemberAccount() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [me, setMe] = useState(null)
  const [hist, setHist] = useState(null)
  const [edit, setEdit] = useState(false)
  const [draft, setDraft] = useState({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const T = (pair) => t({ en: pair[0], zh: pair[1] })
  const date = (iso) => new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

  useEffect(() => {
    let off = false
    Promise.all([api('/portal/me'), api('/portal/history')])
      .then(([m, h]) => { if (!off) { setMe(m); setHist(h) } })
      .catch(() => navigate('/login', { replace: true }))
    return () => { off = true }
  }, [navigate])

  const logout = async () => { try { await api('/portal/logout', { method: 'POST' }) } catch { /* the session is gone either way */ } navigate('/login', { replace: true }) }
  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      setMe({ ...me, ...(await api('/portal/me', { method: 'PUT', body: draft })) })
      setEdit(false)
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  if (!me || !hist) return <div className="grid min-h-screen place-items-center text-muted"><Loader2 className="animate-spin" /></div>
  const gift = (g) => (GIFTS[g.id] ? T(GIFTS[g.id]) : String(g.id).replace(/^svc:/, ''))

  return (
    <MemberShell wide title={t({ en: `Hi, ${me.name}`, zh: `您好，${me.name}` })}>
      <section className="rounded-3xl bg-plum-deep p-6 text-ivory" aria-label={t({ en: 'Member card balance', zh: '会员卡余额' })}>
        <p className="text-xs uppercase tracking-widest text-ivory/70">{t({ en: 'Member card balance', zh: '会员卡余额' })}</p>
        <p className="mt-2 font-display text-4xl">{money(me.balance)}</p>
        {me.gifts.length > 0 && <p className="mt-3 text-sm text-ivory/80">{t({ en: 'Free sessions left: ', zh: '赠送项目剩余：' })}{me.gifts.map((g) => `${gift(g)} ×${g.count}`).join(' · ')}</p>}
      </section>

      {hist.upcoming.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-xl">{t({ en: 'Upcoming', zh: '即将到来的预约' })}</h2>
          <ul className="mt-3 divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-white">
            {hist.upcoming.map((a) => <li key={a.id} className="flex justify-between gap-3 px-4 py-3 text-sm"><span>{a.service}</span><span className="shrink-0 text-muted">{date(a.start)} {new Date(a.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span></li>)}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-display text-xl">{t({ en: 'History', zh: '消费与到店记录' })}</h2>
        {hist.visits.length === 0 ? <p className="mt-3 text-sm text-muted">{t({ en: 'No visits yet.', zh: '还没有记录。' })}</p> : (
          <ul className="mt-3 divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-white">
            {hist.visits.map((v) => (
              <li key={v.id} className="flex items-start justify-between gap-3 px-4 py-3 text-sm">
                <span className="min-w-0"><span className="block truncate font-medium">{v.service || '—'}</span><span className="text-xs text-muted">{date(v.date)} · {T(METHODS[v.method] || METHODS.other)}</span></span>
                <span className="shrink-0 text-right">{v.topUp > 0 && <span className="block text-emerald-700">+{money(v.topUp)}</span>}{v.amount > 0 ? money(v.amount) : v.unsettled ? <span className="text-amber-700">{T(METHODS.unsettled)}</span> : null}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between"><h2 className="font-display text-xl">{t({ en: 'My details', zh: '我的资料' })}</h2>{!edit && <button className="text-sm text-gold hover:underline" onClick={() => { setDraft({ name: me.name, email: me.email, wechatId: me.wechatId, instagramId: me.instagramId }); setEdit(true) }}>{t({ en: 'Edit', zh: '修改' })}</button>}</div>
        {edit ? (
          <form onSubmit={save} className="mt-3 space-y-3">
            {[['name', ['Name', '姓名']], ['wechatId', ['WeChat Name', '微信名']], ['instagramId', ['Instagram ID', 'IG ID']]].map(([k, l]) => (
              <label key={k} className="block"><span className="mb-1 block text-sm font-medium">{T(l)}</span><input className={fieldCls} type={k === 'email' ? 'email' : 'text'} value={draft[k] || ''} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} required={k === 'name'} /></label>
            ))}
            {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
            <div className="flex gap-2"><button className="btn-primary" disabled={busy}>{t({ en: 'Save', zh: '保存' })}</button><button type="button" className="btn-ghost" onClick={() => setEdit(false)}>{t({ en: 'Cancel', zh: '取消' })}</button></div>
          </form>
        ) : (
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
            {[['Phone', '电话', me.phone], ['Email', '信箱', me.email], ['WeChat Name', '微信名', me.wechatId], ['Instagram ID', 'IG ID', me.instagramId]].map(([en, zh, v]) => <div key={en} className="contents"><dt className="text-muted">{t({ en, zh })}</dt><dd>{v || '—'}</dd></div>)}
          </dl>
        )}
      </section>
      <button onClick={logout} className="btn-ghost mt-10 w-full">{t({ en: 'Sign out', zh: '登出' })}</button>
    </MemberShell>
  )
}
