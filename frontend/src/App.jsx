import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProviderDashboard from './pages/ProviderDashboard'
import Services from './pages/Services'
import Providers from './pages/Providers'
import BookingFlow from './pages/BookingFlow'
import MyBookings from './pages/MyBookings'
import useAuthStore from './store/authStore'

const NotFound = () => (
  <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#1e1b4b,#4c1d95)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui,sans-serif' }}>
    <div style={{ textAlign:'center', color:'white' }}>
      <div style={{ fontSize:'96px', fontWeight:'900', color:'rgba(255,255,255,0.15)', lineHeight:1 }}>404</div>
      <h1 style={{ fontSize:'22px', fontWeight:'700', marginBottom:'8px' }}>Page not found</h1>
      <p style={{ color:'rgba(255,255,255,0.5)', marginBottom:'28px' }}>The page you're looking for doesn't exist.</p>
      <a href="/" style={{ padding:'12px 28px', background:'#7c3aed', color:'white', borderRadius:'12px', fontWeight:'700', textDecoration:'none' }}>Go home</a>
    </div>
  </div>
)

function GuestRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return children
  return <Navigate to={user?.role === 'provider' ? '/provider' : '/dashboard'} replace />
}

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function ProviderRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user && user.role !== 'provider') return <Navigate to="/dashboard" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<><Navbar /><Landing /></>} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug/providers" element={<Providers />} />

        {/* Auth */}
        <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* Protected — customer */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/bookings"  element={<PrivateRoute><MyBookings /></PrivateRoute>} />
        <Route path="/book/:providerId" element={<PrivateRoute><BookingFlow /></PrivateRoute>} />

        {/* Protected — provider */}
        <Route path="/provider" element={<ProviderRoute><ProviderDashboard /></ProviderRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
