import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Phone, Lock, User, Mail, Zap, AlertCircle, CheckCircle } from 'lucide-react'
import { registerUser, loginUser, getMe } from '../api/auth'
import useAuthStore from '../store/authStore'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: 'easeOut' },
  }),
}

const roles = [
  { value: 'customer', label: 'Customer', desc: 'I need services', emoji: '🏠' },
  { value: 'provider', label: 'Provider', desc: 'I offer services', emoji: '🔧' },
]

const passwordRules = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'One number', test: (v) => /\d/.test(v) },
]

export default function Register() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState('customer')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { role: 'customer' } })

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
      const errors = err.response?.data
      if (errors) {
        const firstKey = Object.keys(errors)[0]
        setServerError(`${firstKey}: ${errors[firstKey][0]}`)
      } else {
        setServerError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-950 flex items-center justify-center px-4 py-20">

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">

          {/* Logo */}
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex justify-center mb-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <Zap size={20} className="text-white" />
              </div>
              <span className="text-2xl font-bold text-white">UrbanEase</span>
            </Link>
          </motion.div>

          {/* Heading */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-white/50 text-sm">Join 50,000+ users on UrbanEase</p>
          </motion.div>

          {/* Role selector */}
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3 mb-6">
            {roles.map(({ value, label, desc, emoji }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedRole(value)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                  selectedRole === value
                    ? 'bg-violet-600/30 border-violet-400/60 shadow-lg shadow-violet-500/20'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="text-2xl mb-1">{emoji}</div>
                <div className="text-white font-semibold text-sm">{label}</div>
                <div className="text-white/40 text-xs">{desc}</div>
              </button>
            ))}
          </motion.div>

          {/* Server error */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-300 rounded-xl px-4 py-3 mb-5 text-sm"
            >
              <AlertCircle size={16} className="shrink-0" />
              {serverError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

            {/* Full Name */}
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
              <label className="block text-white/70 text-sm font-medium mb-2">Full Name</label>
              <div className="relative">
                <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Aman Singh"
                  {...register('full_name', { required: 'Full name is required' })}
                  className={`w-full bg-white/10 border ${errors.full_name ? 'border-red-400/60' : 'border-white/20'} text-white placeholder-white/30 rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-violet-400 focus:bg-white/15 transition-all duration-200`}
                />
              </div>
              {errors.full_name && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.full_name.message}
                </p>
              )}
            </motion.div>

            {/* Phone */}
            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
              <label className="block text-white/70 text-sm font-medium mb-2">Phone Number</label>
              <div className="relative">
                <Phone size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="tel"
                  placeholder="9999999999"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit phone number' },
                  })}
                  className={`w-full bg-white/10 border ${errors.phone ? 'border-red-400/60' : 'border-white/20'} text-white placeholder-white/30 rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-violet-400 focus:bg-white/15 transition-all duration-200`}
                />
              </div>
              {errors.phone && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.phone.message}
                </p>
              )}
            </motion.div>

            {/* Email (optional) */}
            <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
              <label className="block text-white/70 text-sm font-medium mb-2">
                Email <span className="text-white/30 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register('email', {
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
                  })}
                  className={`w-full bg-white/10 border ${errors.email ? 'border-red-400/60' : 'border-white/20'} text-white placeholder-white/30 rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-violet-400 focus:bg-white/15 transition-all duration-200`}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.email.message}
                </p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
              <label className="block text-white/70 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  })}
                  className={`w-full bg-white/10 border ${errors.password ? 'border-red-400/60' : 'border-white/20'} text-white placeholder-white/30 rounded-xl pl-11 pr-12 py-3.5 text-sm outline-none focus:border-violet-400 focus:bg-white/15 transition-all duration-200`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {/* Password strength indicators */}
              {password && (
                <div className="mt-2 space-y-1">
                  {passwordRules.map(({ label, test }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <CheckCircle
                        size={12}
                        className={test(password) ? 'text-green-400' : 'text-white/20'}
                      />
                      <span className={`text-xs ${test(password) ? 'text-green-400' : 'text-white/30'}`}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Confirm Password */}
            <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible">
              <label className="block text-white/70 text-sm font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  {...register('confirm_password', {
                    required: 'Please confirm your password',
                    validate: (v) => v === password || 'Passwords do not match',
                  })}
                  className={`w-full bg-white/10 border ${errors.confirm_password ? 'border-red-400/60' : 'border-white/20'} text-white placeholder-white/30 rounded-xl pl-11 pr-12 py-3.5 text-sm outline-none focus:border-violet-400 focus:bg-white/15 transition-all duration-200`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                >
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.confirm_password.message}
                </p>
              )}
            </motion.div>

            {/* Terms */}
            <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible" className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                {...register('terms', { required: 'You must accept the terms' })}
                className="mt-0.5 accent-violet-500"
              />
              <label htmlFor="terms" className="text-white/50 text-xs leading-relaxed">
                I agree to the{' '}
                <a href="#" className="text-violet-400 hover:underline">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="text-violet-400 hover:underline">Privacy Policy</a>
              </label>
            </motion.div>
            {errors.terms && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <AlertCircle size={12} /> {errors.terms.message}
              </p>
            )}

            {/* Submit */}
            <motion.div custom={9} variants={fadeUp} initial="hidden" animate="visible">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : 'Create account'}
              </motion.button>
            </motion.div>
          </form>

          {/* Login link */}
          <motion.p custom={10} variants={fadeUp} initial="hidden" animate="visible" className="text-center text-white/50 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 font-semibold hover:text-violet-300 transition-colors">
              Log in
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
