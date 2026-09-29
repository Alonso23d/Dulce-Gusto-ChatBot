import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'

import PublicLayout from './layouts/PublicLayout'

import HomePage from './pages/public/HomePage'
import CatalogPage from './pages/public/CatalogPage'
import ProductPage from './pages/public/ProductPage'
import CartPage from './pages/public/CartPage'
import CheckoutPage from './pages/public/CheckoutPage'
import TrackingPage from './pages/public/TrackingPage'
import AboutPage from './pages/public/AboutPage'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

function CustomerGuard({ children }) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  if (!user) return <Navigate to={`/login?redirect=${location.pathname}`} replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="catalogo" element={<CatalogPage />} />
          <Route path="producto/:slug" element={<ProductPage />} />
          <Route path="carrito" element={<CartPage />} />
          <Route path="checkout" element={<CustomerGuard><CheckoutPage /></CustomerGuard>} />
          <Route path="seguimiento/:orderNumber" element={<TrackingPage />} />
          <Route path="nosotros" element={<AboutPage />} />
        </Route>

        <Route path="login" element={<LoginPage />} />
        <Route path="registro" element={<RegisterPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
