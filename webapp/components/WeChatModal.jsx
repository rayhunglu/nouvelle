import { X } from 'lucide-react'
import { useLang } from '../i18n'
import { business } from '../data/site'

export default function WeChatModal({ onClose }) {
  const { t } = useLang()
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="relative w-full max-w-sm rounded-[2rem] bg-ivory p-8 text-center" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full hover:bg-sand" aria-label={t({ en: 'Close', zh: '关闭' })}><X size={18} /></button>
        <p className="eyebrow mb-4">{t({ en: 'Contact us on WeChat', zh: '微信联系' })}</p>
        <img src="/images/wechat-qr.jpg" alt={t({ en: 'WeChat QR code', zh: '微信二维码' })} className="mx-auto h-56 w-56 rounded-xl bg-white p-2" />
        <p className="mt-5 leading-relaxed">
          {t({ en: 'Scan the QR code to add us on WeChat', zh: '微信二维码添加好友' })}
          <span className="block">{t({ en: 'or search for the WeChat ID:', zh: '或者微信搜索ID：' })}</span>
          <span className="mt-1 block font-display text-xl text-gold">{business.wechatId}</span>
        </p>
      </div>
    </div>
  )
}
