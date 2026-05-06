import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, ArrowRight, Zap, CheckCircle } from 'lucide-react'
import { registerUser, loginUser, getMe } from '../api/auth'
import useAuthStore from '../store/authStore'

const passwordRules = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'One number', test: (v) => /\d/.test(v) },
]

export default function Register() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState('customer')

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password', '')

  const onSubmit = async (data) => {
    setServerError('')
    setLoading(true)
    try {
      await registerUser({ ...data, role: selectedRole })
      const { data: tokens } = await loginUser(data.phone, data.password)
      const { data: user } = await getMe()
      login(tokens, user)
      navigate('/')
    } catch (err) {
      const e = err.response?.data
      if (e) {
        const key = Object.keys(e)[0]
        setServerError(`${key}: ${e[key][0]}`)
      } else {
        setServerError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 relative overflow-hidden flex-col justify-center p-16">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex items-center gap-3 mb-16"
        >
          <div className="w-11 h-11 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <Zap size={22} className="text-white" />
          </div>
          <span className="text-white text-2xl font-bold">UrbanEase</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative z-10"
        >
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Join thousands of<br />
            <span className="text-violet-200">happy customers</span>
          </h2>
          <p className="text-violet-200 text-base leading-relaxed mb-10">
            Create a free account and book your first home service in under 2 minutes.
          </p>
          {[
            'Free to sign up — no credit card',
            'Instant booking confirmation',
            'Background-verified professionals',
            '30-day satisfaction guarantee',
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 mb-4">
              <CheckCircle size={18} className="text-green-300 shrink-0" />
              <span className="text-violet-100 text-sm font-medium">{item}</span>
            </div>
          ))}
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative z-10 grid grid-cols-3 gap-4 mt-12 pt-10 border-t border-white/20"
        >
          {[['50K+', 'Customers'], ['8K+', 'Providers'], ['98%', 'Satisfaction']].map(([val, lbl]) => (
            <div key={lbl} className="text-center">
              <div className="text-2xl font-extrabold text-white">{val}</div>
              <div className="text-violet-300 text-xs mt-1">{lbl}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Right form panel ── */}
      <div className="w-full lg:w-7/12 bg-white flex items-center justify-center px-6 py-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">UrbanEase</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Create your account</h1>
            <p className="text-gray-500">Get started — it's completely free</p>
          </div>

          {/* Role toggle */}
          <div className="flex gap-3 mb-8 p-1.5 bg-gray-100 rounded-2xl">
            {[
              { value: 'customer', label: '🏠  I need services' },
              { value: 'provider', label: '🔧  I offer services' },
            ].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedRole(value)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  selectedRole === value
                    ? 'bg-white text-violet-700 shadow-md shadow-violet-100'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Error */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3.5 mb-6 text-sm"
            >
              <AlertCircle size={17} className="shrink-0 text-red-500" />
              {serverError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            {/* Name + Phone row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Aman Singh"
                  {...register('full_name', { required: 'Required' })}
                  className={`w-full px-4 py-3.5 rounded-xl border-2 text-gray-900 placeholder-gray-400 text-sm outline-none transition-all duration-200
                    ${errors.full_name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-violet-500 focus:bg-white'}`}
                />
                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="9999999999"
                  {...register('phone', {
                    required: 'Required',
                    pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid number' },
                  })}
                  className={`w-full px-4 py-3.5 rounded-xl border-2 text-gray-900 placeholder-gray-400 text-sm outline-none transition-all duration-200
                    ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-violet-500 focus:bg-white'}`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                {...register('email', {
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                })}
                className={`w-full px-4 py-3.5 rounded-xl border-2 text-gray-900 placeholder-gray-400 text-sm outline-none transition-all duration-200
                  ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-violet-500 focus:bg-white'}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Min 8 characters' },
                  })}
                  className={`w-full px-4 py-3.5 pr-12 rounded-xl border-2 text-gray-900 placeholder-gray-400 text-sm outline-none transition-all duration-200
                    ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-violet-500 focus:bg-white'}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Strength meter */}
              {password && (
                <div className="mt-3 flex gap-2">
                  {passwordRules.map(({ test }, i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${test(password) ? 'bg-violet-500' : 'bg-gray-200'}`} />
                  ))}
                </div>
              )}
              {password && (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {passwordRules.map(({ label, test }) => (
                    <span key={label} className={`text-xs flex items-center gap-1 ${test(password) ? 'text-violet-600' : 'text-gray-400'}`}>
                      <CheckCircle size={11} /> {label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat password"
                  {...register('confirm_password', {
                    required: 'Please confirm password',
                    validate: (v) => v === password || 'Passwords do not match',
                  })}
                  className={`w-full px-4 py-3.5 pr-12 rounded-xl border-2 text-gray-900 placeholder-gray-400 text-sm outline-none transition-all duration-200
                    ${errors.confirm_password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-violet-500 focus:bg-white'}`}
                />
              </div>
              {errors.confirm_password && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.confirm_password.message}
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input type="checkbox" id="terms"
                {...register('terms', { required: true })}
                className="mt-0.5 w-4 h-4 accent-violet-600 cursor-pointer"
              />
              <label htmlFor="terms" className="text-gray-500 text-sm cursor-pointer">
                I agree to the{' '}
                <a href="#" className="text-violet-600 font-medium hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-violet-600 font-medium hover:underline">Privacy Policy</a>
              </label>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl text-sm hover:shadow-lg hover:shadow-violet-200 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
              ) : (
                <>Create account <ArrowRight size={17} /></>
              )}
            </motion.button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-600 font-semibold hover:text-violet-700">Log in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
