import { Link } from 'react-router-dom'
import { useLang } from '../i18n'
import PageHeader from '../components/PageHeader'

export default function NotFound() {
  const { t } = useLang()
  return (
    <PageHeader eyebrow="404" title={t({ en: 'This page has moved on.', zh: '页面未找到。' })}>
      <Link to="/" className="btn-primary mt-8">{t({ en: 'Back home', zh: '返回首页' })}</Link>
    </PageHeader>
  )
}
