import { useEffect } from 'react'
import { Navigate as RNavigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { Navigate } from './lib/router'
import { LANGS, storedLang } from './i18n'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Treatments from './pages/Treatments'
import Category from './pages/Category'
import Gallery from './pages/Gallery'
import Shop from './pages/Shop'
import ShopHome from './pages/ShopHome'
import Faq from './pages/Faq'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import MemberLogin from './pages/MemberLogin'
import MemberJoin from './pages/MemberJoin'
import MemberRegister from './pages/MemberRegister'
import MemberAccount from './pages/MemberAccount'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import CrmLayout from './crm/Layout'
import Dashboard from './crm/Dashboard'
import Customers from './crm/Customers'
import Appointments from './crm/Appointments'
import Finance from './crm/Finance'
import StaffAccounts, { StaffDetail } from './crm/StaffAccounts'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

function SiteLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

// An address without a language in front ("/about", an old link, a search result) goes to the same page in the visitor's language.
function LegacyRedirect() {
  const { pathname, search, hash } = useLocation()
  return <RNavigate to={`/${storedLang()}${pathname === '/' ? '' : pathname}${search}${hash}`} replace />
}

// The website and the member pages, once under /en and once under /zh.
const publicRoutes = (
  <>
    {/* Members (customers): sign in / join with an email and a mailed code, then their account. Kept apart from the staff area. */}
    <Route path="login" element={<MemberLogin />} />
    <Route path="register" element={<MemberRegister />} />
    <Route path="join" element={<MemberJoin />} />
    <Route path="account" element={<MemberAccount />} />

    <Route element={<SiteLayout />}>
      <Route index element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="treatments" element={<Treatments />} />
      {/* Retired category URLs → where those treatments live now */}
      <Route path="treatments/skin" element={<Navigate to="/treatments/devices" replace />} />
      <Route path="treatments/body" element={<Navigate to="/treatments/devices" replace />} />
      <Route path="treatments/wellness" element={<Navigate to="/treatments/devices" replace />} />
      <Route path="treatments/spa" element={<Navigate to="/treatments/spa-care" replace />} />
      <Route path="treatments/hair" element={<Navigate to="/treatments/injectables" replace />} />
      <Route path="treatments/hormone-stem-cell" element={<Navigate to="/treatments/injectables" replace />} />
      <Route path="treatments/:slug" element={<Category />} />
      <Route path="shop" element={<ShopHome />} />
      <Route path="shop/:brand" element={<Shop />} />
      <Route path="gallery" element={<Gallery />} />
      <Route path="faq" element={<Faq />} />
      <Route path="contact" element={<Contact />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </>
)

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Staff area: own layout, no marketing header/footer, no language switch (Chinese). Not linked from the website; its pages are not indexed. */}
        <Route path="/staff-login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/crm" element={<CrmLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="finance" element={<Finance />} />
          <Route path="staff" element={<StaffAccounts />} />
          <Route path="staff/:name" element={<StaffDetail />} />
        </Route>

        {LANGS.map((l) => <Route key={l} path={`/${l}`}>{publicRoutes}</Route>)}
        <Route path="*" element={<LegacyRedirect />} />
      </Routes>
    </>
  )
}
