import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'

// Pages (to be built incrementally)
const Home = () => <div className="p-8 text-2xl font-bold">UrbanEase — Home</div>
const Login = () => <div className="p-8 text-2xl font-bold">Login Page</div>
const Register = () => <div className="p-8 text-2xl font-bold">Register Page</div>
const NotFound = () => <div className="p-8 text-2xl font-bold">404 — Page Not Found</div>

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
