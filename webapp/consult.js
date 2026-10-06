// The service a visitor wants to ask about travels from a service page to the
// Contact form in a cookie, so the form can still be changed freely afterwards.
const NAME = 'consult_service'
const ONE_DAY = 60 * 60 * 24

export function setConsultService(key) {
  try {
    document.cookie = `${NAME}=${encodeURIComponent(key)}; path=/; max-age=${ONE_DAY}; SameSite=Lax`
  } catch { /* cookies unavailable */ }
}

export function getConsultService() {
  try {
    const hit = document.cookie.split('; ').find((c) => c.startsWith(`${NAME}=`))
    return hit ? decodeURIComponent(hit.slice(NAME.length + 1)) : ''
  } catch {
    return ''
  }
}

export function clearConsultService() {
  try {
    document.cookie = `${NAME}=; path=/; max-age=0; SameSite=Lax`
  } catch { /* cookies unavailable */ }
}
