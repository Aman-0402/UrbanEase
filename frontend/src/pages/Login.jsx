import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, ArrowRight, Star, Shield, Clock } from 'lucide-react'
import Logo from '../components/layout/Logo'
import { loginUser, getMe } from '../api/auth'
import useAuthStore from '../store/authStore'

const perks = [
  { icon: Star,   text: '50,000+ happy customers' },
  { icon: Shield, text: 'Verified professionals only' },
  { icon: Clock,  text: 'Same-day service available' },
]

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ phone, password }) => {
    setServerError('')
    setLoading(true)
    try {
      const { data: tokens } = await loginUser(phone, password)
      const { data: user } = await getMe(tokens.access)
      login(tokens, user)
      navigate('/')
    } catch {
      setServerError('Invalid phone number or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Left branding panel ── */}
      <div style={{
        display: 'none',
        width: '45%',
        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4338ca 100%)',
        padding: '64px',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }} className="lg-panel">
        <style>{`
          @media (min-width: 1024px) { .lg-panel { display: flex !important; } }
        `}</style>

        {/* decorative blobs */}
        <div style={{ position:'absolute', top:'-80px', left:'-80px', width:'320px', height:'320px', background:'rgba(255,255,255,0.06)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', bottom:'-60px', right:'-60px', width:'280px', height:'280px', background:'rgba(255,255,255,0.06)', borderRadius:'50%' }} />

        {/* Logo */}
        <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.6 }}
          style={{ position:'relative', zIndex:1 }}>
          <Logo height={44}/>
        </motion.div>

        {/* Main copy */}
        <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.1 }}
          style={{ position:'relative', zIndex:1 }}>
          <h2 style={{ color:'white', fontSize:'42px', fontWeight:'900', lineHeight:'1.15', marginBottom:'16px', letterSpacing:'-1px' }}>
            Home services,<br />
            <span style={{ color:'#c4b5fd' }}>simplified.</span>
          </h2>
          <p style={{ color:'#ddd6fe', fontSize:'16px', lineHeight:'1.7', marginBottom:'36px', maxWidth:'340px' }}>
            Book trusted professionals for any home service — in minutes, not hours.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {perks.map(({ icon: Icon, text }) => (
              <div key={text} style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                <div style={{ width:'38px', height:'38px', background:'rgba(255,255,255,0.15)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={17} color="white" />
                </div>
                <span style={{ color:'#ede9fe', fontSize:'15px', fontWeight:'500' }}>{text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Testimonial */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.7, delay:0.3 }}
          style={{ background:'rgba(255,255,255,0.12)', borderRadius:'20px', padding:'24px', border:'1px solid rgba(255,255,255,0.2)', position:'relative', zIndex:1, backdropFilter:'blur(8px)' }}>
          <div style={{ display:'flex', gap:'3px', marginBottom:'12px' }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={14} color="#fde68a" fill="#fde68a" />)}
          </div>
          <p style={{ color:'rgba(255,255,255,0.9)', fontSize:'14px', lineHeight:'1.65', marginBottom:'16px' }}>
            "Found a plumber in 10 minutes. Fixed the problem same day. Best app for home services!"
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ width:'38px', height:'38px', background:'#7c3aed', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'12px', fontWeight:'700' }}>MV</div>
            <div>
              <div style={{ color:'white', fontSize:'14px', fontWeight:'600' }}>Mehak Vatyani</div>
              <div style={{ color:'#c4b5fd', fontSize:'12px' }}>Mumbai</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ flex:1, background:'#ffffff', display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 24px' }}>
        <motion.div
          initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.6 }}
          style={{ width:'100%', maxWidth:'420px' }}
        >
          {/* Mobile logo */}
          <div style={{ marginBottom:'40px' }} className="mobile-logo">
            <style>{`@media (min-width: 1024px) { .mobile-logo { display: none !important; } }`}</style>
            <Logo height={36}/>
          </div>

          <div style={{ marginBottom:'36px' }}>
            <h1 style={{ fontSize:'30px', fontWeight:'900', color:'#111827', marginBottom:'8px', letterSpacing:'-0.5px' }}>Welcome back</h1>
            <p style={{ color:'#6b7280', fontSize:'15px' }}>Log in to your account to continue</p>
          </div>

          {/* Error banner */}
          {serverError && (
            <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
              style={{ display:'flex', alignItems:'center', gap:'10px', background:'#fef2f2', border:'1px solid #fecaca', color:'#b91c1c', borderRadius:'12px', padding:'14px 16px', marginBottom:'24px', fontSize:'14px' }}>
              <AlertCircle size={16} color="#ef4444" style={{ flexShrink:0 }} />
              {serverError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

            {/* Phone */}
            <div>
              <label style={{ display:'block', fontSize:'14px', fontWeight:'600', color:'#374151', marginBottom:'8px' }}>Phone Number</label>
              <input
                type="tel"
                placeholder="Enter your 10-digit phone number"
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit number' },
                })}
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: '12px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s',
                  border: errors.phone ? '2px solid #f87171' : '2px solid #e5e7eb',
                  background: errors.phone ? '#fef2f2' : '#f9fafb', color: '#111827',
                }}
                onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = errors.phone ? '#f87171' : '#e5e7eb'; e.target.style.background = errors.phone ? '#fef2f2' : '#f9fafb' }}
              />
              {errors.phone && <p style={{ color:'#ef4444', fontSize:'12px', marginTop:'6px', display:'flex', alignItems:'center', gap:'4px' }}><AlertCircle size={12} />{errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                <label style={{ fontSize:'14px', fontWeight:'600', color:'#374151' }}>Password</label>
                <a href="#" style={{ fontSize:'13px', color:'#7c3aed', fontWeight:'500', textDecoration:'none' }}>Forgot password?</a>
              </div>
              <div style={{ position:'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password', { required: 'Password is required' })}
                  style={{
                    width: '100%', padding: '14px 48px 14px 16px', borderRadius: '12px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s',
                    border: errors.password ? '2px solid #f87171' : '2px solid #e5e7eb',
                    background: errors.password ? '#fef2f2' : '#f9fafb', color: '#111827',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = errors.password ? '#f87171' : '#e5e7eb'; e.target.style.background = errors.password ? '#fef2f2' : '#f9fafb' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9ca3af', padding:'4px' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p style={{ color:'#ef4444', fontSize:'12px', marginTop:'6px', display:'flex', alignItems:'center', gap:'4px' }}><AlertCircle size={12} />{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.99 }}
              style={{
                width:'100%', padding:'15px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', color:'white', fontWeight:'700', fontSize:'15px',
                border:'none', borderRadius:'12px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', boxShadow:'0 4px 20px rgba(124,58,237,0.35)', marginTop:'4px',
              }}>
              {loading
                ? <><span style={{ width:'18px', height:'18px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} /> Logging in...</>
                : <>Log in <ArrowRight size={17} /></>}
            </motion.button>
          </form>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:'12px', margin:'28px 0' }}>
            <div style={{ flex:1, height:'1px', background:'#e5e7eb' }} />
            <span style={{ color:'#9ca3af', fontSize:'12px', fontWeight:'500', whiteSpace:'nowrap' }}>OR CONTINUE WITH</span>
            <div style={{ flex:1, height:'1px', background:'#e5e7eb' }} />
          </div>

          {/* Google */}
          <button style={{
            width:'100%', padding:'13px', border:'2px solid #e5e7eb', borderRadius:'12px', background:'white', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', fontSize:'14px', fontWeight:'600', color:'#374151', transition:'all 0.2s',
          }}
            onMouseOver={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#f9fafb' }}
            onMouseOut={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = 'white' }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            Continue with Google
          </button>

          <p style={{ textAlign:'center', color:'#6b7280', fontSize:'14px', marginTop:'28px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'#7c3aed', fontWeight:'700', textDecoration:'none' }}>Sign up free</Link>
          </p>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
  )
}
