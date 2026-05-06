import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import useAuthStore from './store/authStore'

const NotFound = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-950 flex items-center justify-center">
    <div className="text-center text-white">
      <div className="text-8xl font-black mb-4 text-white/20">404</div>
      <h1 className="text-2xl font-bold mb-2">Page not found</h1>
      <p className="text-white/50 mb-8">The page you're looking for doesn't exist.</p>
      <a href="/" className="px-6 py-3 bg-violet-600 rounded-xl font-semibold hover:bg-violet-700 transition-colors">
        Go home
      </a>
    </div>
  </div>
)

function GuestRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing has its own full-page layout with Navbar inside */}
        <Route path="/" element={<><Navbar /><Landing /></>} />

        {/* Auth pages — no navbar */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* Protected */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
