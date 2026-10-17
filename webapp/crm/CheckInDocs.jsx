import { useEffect, useState } from 'react'
import { Camera, Check, FileText } from 'lucide-react'
import { Modal } from './ui'
import { fmtDateTime } from './format'
import { listCustomerFiles, uploadCustomerFile } from './files'

// Opens right after a booking is checked in (mode 'checkin': the signed consent form and the before photos: front / left / right)
// or put in service (mode 'service': the after photos). Each one is uploaded as soon as it is chosen and saved as 客户名_<name>.ext
// on this appointment record.
const photo = (set, side) => ({ label: `${set}${side}`, title: `${set} ${side}`, accept: 'image/*', icon: Camera })
const MODES = {
  checkin: { title: '签到资料', slots: [{ label: '同意书', title: '同意书', accept: '.pdf,.doc,.docx,image/*', icon: FileText }, photo('Before', '正面'), photo('Before', '左面'), photo('Before', '右面')] },
  service: { title: 'After 照片', slots: [photo('After', '正面'), photo('After', '左面'), photo('After', '右面')] },
}

// The dialog only opens when nothing of its kind is on the record yet (no consent / before photo at check in, no after photo in
// service). Once something was uploaded the booking is not asked again, even if some photos were skipped.
export async function docsMissing(appt, customerName, mode) {
  try {
    const mine = (await listCustomerFiles(appt.customerId)).filter((f) => f.appointmentId === appt.id)
    return !MODES[mode].slots.some(({ label }) => mine.some((f) => f.name.startsWith(`${customerName || ''}_${label}.`)))
  } catch {
    return true // cannot tell: ask
  }
}

export default function CheckInDocs({ appt, customer, mode = 'checkin', onClose }) {
  const SLOTS = MODES[mode].slots
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState('')
  const [errors, setErrors] = useState({})
  const [picked, setPicked] = useState({}) // label -> { file, url }: chosen (or just taken with the camera) but not uploaded yet
  const prefix = `${customer?.name || ''}_`

  useEffect(() => { listCustomerFiles(appt.customerId).then((all) => setFiles(all.filter((f) => f.appointmentId === appt.id))).catch(() => {}) }, [appt.id, appt.customerId])
  useEffect(() => () => Object.values(picked).forEach((p) => p.url && URL.revokeObjectURL(p.url)), []) // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (slot, file) => {
    if (!file) return
    setErrors((e) => ({ ...e, [slot.label]: '' }))
    setPicked((cur) => {
      if (cur[slot.label]?.url) URL.revokeObjectURL(cur[slot.label].url)
      return { ...cur, [slot.label]: { file, url: file.type.startsWith('image/') ? URL.createObjectURL(file) : '' } }
    })
  }
  const discard = (slot) => setPicked((cur) => {
    if (cur[slot.label]?.url) URL.revokeObjectURL(cur[slot.label].url)
    const { [slot.label]: _gone, ...rest } = cur
    return rest
  })

  // Only the 上传 button sends the picture, after it has been looked at.
  const upload = async (slot) => {
    const p = picked[slot.label]
    if (!p) return
    setBusy(slot.label)
    setErrors((e) => ({ ...e, [slot.label]: '' }))
    try {
      const row = await uploadCustomerFile({ customerId: appt.customerId, appointmentId: appt.id, label: slot.label, file: p.file })
      setFiles((list) => [...list, row])
      discard(slot)
    } catch (err) {
      setErrors((e) => ({ ...e, [slot.label]: err.message }))
    }
    setBusy('')
  }

  return (
    <Modal inset title={MODES[mode].title} onClose={onClose} loading={!!busy} loadingText="上传中…">
      <p className="mb-4 text-sm text-muted">{customer?.name} · {appt.service} · {fmtDateTime(appt.start)}</p>
      <ul className="space-y-3">
        {SLOTS.map((slot) => {
          const done = files.filter((f) => f.name.startsWith(`${prefix}${slot.label}.`))
          const p = picked[slot.label]
          const Icon = slot.icon
          const isPhoto = slot.icon === Camera
          return (
            <li key={slot.label} className="rounded-xl border border-ink/10 bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${done.length ? 'bg-emerald-100 text-emerald-700' : 'bg-sand text-muted'}`}>{done.length ? <Check size={16} /> : <Icon size={16} />}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{slot.title}</p>
                  <p className="truncate text-xs text-muted">{p ? '确认后点「上传」' : done.length ? `已上传 ${done.length} 个` : '未上传'}</p>
                </div>
                {/* A photo slot has two entrances: 拍照 opens the back camera, 上传 opens the photo library. The consent form is one file chooser (a file or a photo). */}
                {!p && (isPhoto ? (
                  <div className="flex shrink-0 gap-1.5">
                    <label className="btn-ghost !px-3 !py-1.5 cursor-pointer text-sm">拍照
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files[0]; e.target.value = ''; choose(slot, f) }} />
                    </label>
                    <label className="btn-ghost !px-3 !py-1.5 cursor-pointer text-sm">上传
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files[0]; e.target.value = ''; choose(slot, f) }} />
                    </label>
                  </div>
                ) : (
                  <label className="btn-ghost !px-3 !py-1.5 cursor-pointer text-sm">
                    {done.length ? '再传一个' : '上传'}
                    <input type="file" accept={slot.accept} className="hidden" onChange={(e) => { const f = e.target.files[0]; e.target.value = ''; choose(slot, f) }} />
                  </label>
                ))}
              </div>
              {p && (
                <div className="mt-3 flex items-center gap-3">
                  {p.url ? <img src={p.url} alt={slot.title} className="h-20 w-20 shrink-0 rounded-lg object-cover" /> : <span className="grid h-20 w-20 shrink-0 place-items-center rounded-lg bg-sand px-1 text-center text-[0.65rem] text-muted"><FileText size={18} /></span>}
                  <p className="min-w-0 flex-1 truncate text-xs text-muted">{p.file.name}</p>
                  {isPhoto && (
                    <label className="cursor-pointer text-xs text-gold hover:underline">重拍
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files[0]; e.target.value = ''; choose(slot, f) }} />
                    </label>
                  )}
                  <label className="cursor-pointer text-xs text-gold hover:underline">重选
                    <input type="file" accept={slot.accept} className="hidden" onChange={(e) => { const f = e.target.files[0]; e.target.value = ''; choose(slot, f) }} />
                  </label>
                  <button type="button" onClick={() => discard(slot)} className="text-xs text-muted hover:underline">取消</button>
                  <button type="button" onClick={() => upload(slot)} className="btn-primary !px-4 !py-1.5 text-sm">上传</button>
                </div>
              )}
              {errors[slot.label] && <p role="alert" className="mt-2 text-xs text-rose-700">{errors[slot.label]}</p>}
            </li>
          )
        })}
      </ul>
      <p className="mt-4 text-xs text-muted">可以先跳过，之后在「客户」里这条预约记录下面补传。</p>
      <div className="mt-4 flex justify-end">
        <button type="button" onClick={onClose} className="btn-primary !py-2.5">完成</button>
      </div>
    </Modal>
  )
}
