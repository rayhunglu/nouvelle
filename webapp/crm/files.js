import { api } from '../api'

// Customer documents (kept per appointment record, stored in Google Drive by the server). Shared by the check-in dialog.
export const FILE_MAX = 4 * 1024 * 1024 // the server refuses bigger bodies (Vercel caps requests at about 4.5MB)

export const listCustomerFiles = (customerId) => api(`/crm/customers/${customerId}/files`)

// A phone photo is often 5-10MB: draw it smaller (longest side 2000px) and save it as JPEG so it fits.
async function shrinkImage(file) {
  let bitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error('这张照片无法处理，请换成 JPG 或 PNG 格式')
  }
  const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  for (const q of [0.85, 0.7, 0.55]) {
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', q))
    if (blob && blob.size <= FILE_MAX) return blob
  }
  throw new Error('照片太大，无法压缩到 4MB 以内')
}

// Uploads one file under a name label (the server names it 客户名_label.ext). Big images are shrunk first.
export async function uploadCustomerFile({ customerId, appointmentId, label, file }) {
  let body = file
  let ext = file.name.split('.').pop().toLowerCase()
  if (file.type.startsWith('image/') && (file.size > 1.5 * 1024 * 1024 || ext === 'heic' || ext === 'webp')) {
    body = await shrinkImage(file)
    ext = 'jpg'
  }
  if (body.size > FILE_MAX) throw new Error('文件太大（最大 4MB）')
  const res = await fetch(`/api/crm/customers/${customerId}/files?appointmentId=${encodeURIComponent(appointmentId)}&label=${encodeURIComponent(label)}&ext=${encodeURIComponent(ext)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body, credentials: 'same-origin',
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error || res.statusText)
  return data
}
