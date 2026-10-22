// react-router's Link / NavLink / Navigate / useNavigate for the website and member pages: an internal address like "/about" gets the current
// language in front ("/zh/about"). Everything else from react-router-dom is passed through. The staff area keeps using react-router-dom directly.
import { Link as RLink, NavLink as RNavLink, Navigate as RNavigate, useNavigate as useRNavigate } from 'react-router-dom'
import { useLang } from '../i18n'

const localized = (localize, to) => (typeof to === 'string' ? localize(to) : to && typeof to === 'object' && to.pathname ? { ...to, pathname: localize(to.pathname) } : to)

export function Link({ to, ...rest }) {
  const { localize } = useLang()
  return <RLink to={localized(localize, to)} {...rest} />
}
export function NavLink({ to, ...rest }) {
  const { localize } = useLang()
  return <RNavLink to={localized(localize, to)} {...rest} />
}
export function Navigate({ to, ...rest }) {
  const { localize } = useLang()
  return <RNavigate to={localized(localize, to)} {...rest} />
}
export function useNavigate() {
  const navigate = useRNavigate()
  const { localize } = useLang()
  return (to, options) => (typeof to === 'number' ? navigate(to) : navigate(localized(localize, to), options))
}
export { Outlet, Route, Routes, useLocation, useParams, useSearchParams } from 'react-router-dom'
