import { useEffect } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Treatments from './pages/Treatments'
import Category from './pages/Category'
import Gallery from './pages/Gallery'
import Shop from './pages/Shop'
import Faq from './pages/Faq'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import CrmLayout from './crm/Layout'
import Dashboard from './crm/Dashboard'
import Customers from './crm/Customers'
import Appointments from './crm/Appointments'
import Finance from './crm/Finance'

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

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Staff area: own layout, no marketing header/footer */}
        <Route path="/login" element={<Login />} />
        <Route path="/crm" element={<CrmLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="finance" element={<Finance />} />
        </Route>

        {/* Public website */}
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/treatments" element={<Treatments />} />
          <Route path="/treatments/:slug" element={<Category />} />
          <Route path="/shop" element={<Navigate to="/shop/cellcosmet" replace />} />
          <Route path="/shop/:brand" element={<Shop />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
