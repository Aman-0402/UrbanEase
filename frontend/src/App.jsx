import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Landing from './pages/Landing'

// Placeholder pages (built incrementally)
const Login = () => <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-gray-700">Login Page — Coming Soon</div>
const Register = () => <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-gray-700">Register Page — Coming Soon</div>
const NotFound = () => <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-gray-700">404 — Page Not Found</div>

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
