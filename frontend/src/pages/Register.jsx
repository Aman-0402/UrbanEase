import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, ArrowRight, Zap, CheckCircle } from 'lucide-react'
import { registerUser, loginUser, getMe } from '../api/auth'
import useAuthStore from '../store/authStore'

const passwordRules = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'One uppercase letter',  test: (v) => /[A-Z]/.test(v) },
  { label: 'One number',            test: (v) => /\d/.test(v) },
]

const s = {
  page:       { display:'flex', minHeight:'100vh', fontFamily:'system-ui,-apple-system,sans-serif' },
  left:       { width:'42%', background:'linear-gradient(145deg,#7c3aed 0%,#6d28d9 55%,#4338ca 100%)', padding:'60px 56px', display:'flex', flexDirection:'column', justifyContent:'space-between', position:'relative', overflow:'hidden', flexShrink:0 },
  blob1:      { position:'absolute', top:'-80px', left:'-80px', width:'300px', height:'300px', background:'rgba(255,255,255,0.06)', borderRadius:'50%' },
  blob2:      { position:'absolute', bottom:'-60px', right:'-60px', width:'260px', height:'260px', background:'rgba(255,255,255,0.06)', borderRadius:'50%' },
  logo:       { display:'flex', alignItems:'center', gap:'12px', position:'relative', zIndex:1 },
  logoBox:    { width:'44px', height:'44px', background:'rgba(255,255,255,0.2)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)' },
  logoText:   { color:'white', fontSize:'22px', fontWeight:'800', letterSpacing:'-0.5px' },
  middle:     { position:'relative', zIndex:1 },
  h2:         { color:'white', fontSize:'38px', fontWeight:'900', lineHeight:'1.2', marginBottom:'14px', letterSpacing:'-0.8px' },
  accent:     { color:'#c4b5fd' },
  sub:        { color:'#ddd6fe', fontSize:'15px', lineHeight:'1.7', marginBottom:'32px', maxWidth:'320px' },
  checkRow:   { display:'flex', alignItems:'center', gap:'12px', marginBottom:'14px' },
  checkText:  { color:'#ede9fe', fontSize:'14px', fontWeight:'500' },
  stats:      { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', paddingTop:'28px', borderTop:'1px solid rgba(255,255,255,0.2)', position:'relative', zIndex:1 },
  statVal:    { color:'white', fontSize:'26px', fontWeight:'900', textAlign:'center' },
  statLbl:    { color:'#c4b5fd', fontSize:'12px', textAlign:'center', marginTop:'2px' },
  right:      { flex:1, background:'#ffffff', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 32px', overflowY:'auto' },
  form:       { width:'100%', maxWidth:'480px' },
  heading:    { fontSize:'28px', fontWeight:'900', color:'#111827', marginBottom:'6px', letterSpacing:'-0.4px' },
  subheading: { color:'#6b7280', fontSize:'15px', marginBottom:'28px' },
  roleWrap:   { display:'flex', gap:'0', marginBottom:'28px', background:'#f3f4f6', borderRadius:'14px', padding:'5px' },
  roleBtn:    (active) => ({
    flex:1, padding:'12px 16px', borderRadius:'10px', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:'600',
    transition:'all 0.2s',
    background: active ? '#ffffff' : 'transparent',
    color: active ? '#7c3aed' : '#6b7280',
    boxShadow: active ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
  }),
  error:      { display:'flex', alignItems:'center', gap:'10px', background:'#fef2f2', border:'1px solid #fecaca', color:'#b91c1c', borderRadius:'12px', padding:'13px 16px', marginBottom:'20px', fontSize:'13px' },
  formGrid:   { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'16px' },
  field:      { marginBottom:'16px' },
  label:      { display:'block', fontSize:'13px', fontWeight:'600', color:'#374151', marginBottom:'7px' },
  labelOpt:   { color:'#9ca3af', fontWeight:'400' },
  input:      (err) => ({
    width:'100%', padding:'13px 16px', borderRadius:'11px', fontSize:'14px', outline:'none', boxSizing:'border-box', transition:'all 0.2s',
    border: err ? '2px solid #f87171' : '2px solid #e5e7eb',
    background: err ? '#fef2f2' : '#f9fafb', color:'#111827',
  }),
  inputPr:    (err) => ({ ...({width:'100%', padding:'13px 48px 13px 16px', borderRadius:'11px', fontSize:'14px', outline:'none', boxSizing:'border-box', transition:'all 0.2s', border: err ? '2px solid #f87171' : '2px solid #e5e7eb', background: err ? '#fef2f2' : '#f9fafb', color:'#111827'}) }),
  errMsg:     { color:'#ef4444', fontSize:'12px', marginTop:'5px', display:'flex', alignItems:'center', gap:'4px' },
  eyeBtn:     { position:'absolute', right:'13px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9ca3af', padding:'4px', display:'flex' },
  pwRules:    { display:'flex', gap:'16px', flexWrap:'wrap', marginTop:'8px' },
  pwRule:     (ok) => ({ display:'flex', alignItems:'center', gap:'4px', fontSize:'12px', color: ok ? '#7c3aed' : '#9ca3af' }),
  bar:        (ok) => ({ height:'3px', flex:1, borderRadius:'4px', background: ok ? '#7c3aed' : '#e5e7eb', transition:'background 0.3s' }),
  termsRow:   { display:'flex', alignItems:'flex-start', gap:'10px', marginBottom:'20px' },
  termsText:  { color:'#6b7280', fontSize:'13px', lineHeight:'1.5' },
  termsLink:  { color:'#7c3aed', fontWeight:'600', textDecoration:'none' },
  submit:     { width:'100%', padding:'14px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', color:'white', fontWeight:'700', fontSize:'15px', border:'none', borderRadius:'12px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', boxShadow:'0 4px 18px rgba(124,58,237,0.3)', transition:'all 0.2s' },
  bottom:     { textAlign:'center', color:'#6b7280', fontSize:'14px', marginTop:'24px' },
  link:       { color:'#7c3aed', fontWeight:'700', textDecoration:'none' },
  spinner:    { width:'17px', height:'17px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' },
}

export default function Register() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [showPw, setShowPw]         = useState(false)
  const [showCpw, setShowCpw]       = useState(false)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading]       = useState(false)
  const [role, setRole]             = useState('customer')

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password', '')

  const focusStyle  = { borderColor:'#7c3aed', background:'#fff' }
  const blurStyle   = (err) => ({ borderColor: err ? '#f87171' : '#e5e7eb', background: err ? '#fef2f2' : '#f9fafb' })

  const onSubmit = async (data) => {
    setServerError('')
    setLoading(true)
    try {
      await registerUser({ ...data, role })
      const { data: tokens } = await loginUser(data.phone, data.password)
      const { data: user }   = await getMe(tokens.access)
      login(tokens, user)
      navigate('/')
    } catch (err) {
      const e = err.response?.data
      if (e) {
        const key = Object.keys(e)[0]
        setServerError(key + ': ' + e[key][0])
      } else {
        setServerError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const pwStrength = passwordRules.filter(r => r.test(password)).length

  return (
    <div style={s.page}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box;margin:0;padding:0} @media(max-width:900px){.reg-left{display:none!important}}`}</style>

      {/* ── Left panel ── */}
      <div style={s.left} className="reg-left">
        <div style={s.blob1} /><div style={s.blob2} />

        <motion.div style={s.logo} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{duration:0.5}}>
          <div style={s.logoBox}><Zap size={22} color="white" /></div>
          <span style={s.logoText}>UrbanEase</span>
        </motion.div>

        <motion.div style={s.middle} initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.1}}>
          <h2 style={s.h2}>Join thousands of<br /><span style={s.accent}>happy customers</span></h2>
          <p style={s.sub}>Create a free account and book your first home service in under 2 minutes.</p>
          {['Free to sign up — no credit card','Instant booking confirmation','Background-verified professionals','30-day satisfaction guarantee'].map(item => (
            <div key={item} style={s.checkRow}>
              <CheckCircle size={17} color="#86efac" style={{flexShrink:0}} />
              <span style={s.checkText}>{item}</span>
            </div>
          ))}
        </motion.div>

        <motion.div style={s.stats} initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.6,delay:0.25}}>
          {[['50K+','Customers'],['8K+','Providers'],['98%','Satisfaction']].map(([val,lbl]) => (
            <div key={lbl}>
              <div style={s.statVal}>{val}</div>
              <div style={s.statLbl}>{lbl}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Right form panel ── */}
      <div style={s.right}>
        <motion.div style={s.form} initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} transition={{duration:0.55}}>

          <h1 style={s.heading}>Create your account</h1>
          <p style={s.subheading}>Get started — it's completely free</p>

          {/* Role toggle */}
          <div style={s.roleWrap}>
            <button type="button" style={s.roleBtn(role==='customer')} onClick={()=>setRole('customer')}>
              🏠&nbsp; I need services
            </button>
            <button type="button" style={s.roleBtn(role==='provider')} onClick={()=>setRole('provider')}>
              🔧&nbsp; I offer services
            </button>
          </div>

          {/* Server error */}
          {serverError && (
            <motion.div style={s.error} initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}>
              <AlertCircle size={16} color="#ef4444" style={{flexShrink:0}} />{serverError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* Name + Phone */}
            <div style={s.formGrid}>
              <div>
                <label style={s.label}>Full Name</label>
                <input type="text" placeholder="Aman Singh"
                  {...register('full_name',{required:'Required'})}
                  style={s.input(errors.full_name)}
                  onFocus={e=>Object.assign(e.target.style,focusStyle)}
                  onBlur={e=>Object.assign(e.target.style,blurStyle(errors.full_name))} />
                {errors.full_name && <p style={s.errMsg}><AlertCircle size={11}/>{errors.full_name.message}</p>}
              </div>
              <div>
                <label style={s.label}>Phone Number</label>
                <input type="tel" placeholder="9876543210"
                  {...register('phone',{required:'Required',pattern:{value:/^[6-9]\d{9}$/,message:'Invalid number'}})}
                  style={s.input(errors.phone)}
                  onFocus={e=>Object.assign(e.target.style,focusStyle)}
                  onBlur={e=>Object.assign(e.target.style,blurStyle(errors.phone))} />
                {errors.phone && <p style={s.errMsg}><AlertCircle size={11}/>{errors.phone.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div style={s.field}>
              <label style={s.label}>Email <span style={s.labelOpt}>(optional)</span></label>
              <input type="email" placeholder="you@example.com"
                {...register('email',{pattern:{value:/^[^\s@]+@[^\s@]+\.[^\s@]+$/,message:'Invalid email'}})}
                style={s.input(errors.email)}
                onFocus={e=>Object.assign(e.target.style,focusStyle)}
                onBlur={e=>Object.assign(e.target.style,blurStyle(errors.email))} />
              {errors.email && <p style={s.errMsg}><AlertCircle size={11}/>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <div style={{position:'relative'}}>
                <input type={showPw?'text':'password'} placeholder="Create a strong password"
                  {...register('password',{required:'Required',minLength:{value:8,message:'Min 8 characters'}})}
                  style={s.inputPr(errors.password)}
                  onFocus={e=>Object.assign(e.target.style,focusStyle)}
                  onBlur={e=>Object.assign(e.target.style,blurStyle(errors.password))} />
                <button type="button" style={s.eyeBtn} onClick={()=>setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={17}/> : <Eye size={17}/>}
                </button>
              </div>
              {/* Strength bar */}
              {password && (
                <>
                  <div style={{display:'flex',gap:'6px',marginTop:'8px'}}>
                    {passwordRules.map((_,i)=><div key={i} style={s.bar(i<pwStrength)} />)}
                  </div>
                  <div style={s.pwRules}>
                    {passwordRules.map(({label,test})=>(
                      <span key={label} style={s.pwRule(test(password))}>
                        <CheckCircle size={11}/>{label}
                      </span>
                    ))}
                  </div>
                </>
              )}
              {errors.password && <p style={s.errMsg}><AlertCircle size={11}/>{errors.password.message}</p>}
            </div>

            {/* Confirm password */}
            <div style={s.field}>
              <label style={s.label}>Confirm Password</label>
              <div style={{position:'relative'}}>
                <input type={showCpw?'text':'password'} placeholder="Repeat your password"
                  {...register('confirm_password',{required:'Required',validate:v=>v===password||'Passwords do not match'})}
                  style={s.inputPr(errors.confirm_password)}
                  onFocus={e=>Object.assign(e.target.style,focusStyle)}
                  onBlur={e=>Object.assign(e.target.style,blurStyle(errors.confirm_password))} />
                <button type="button" style={s.eyeBtn} onClick={()=>setShowCpw(!showCpw)}>
                  {showCpw ? <EyeOff size={17}/> : <Eye size={17}/>}
                </button>
              </div>
              {errors.confirm_password && <p style={s.errMsg}><AlertCircle size={11}/>{errors.confirm_password.message}</p>}
            </div>

            {/* Terms */}
            <div style={s.termsRow}>
              <input type="checkbox" id="terms"
                {...register('terms',{required:true})}
                style={{marginTop:'2px',width:'16px',height:'16px',accentColor:'#7c3aed',flexShrink:0,cursor:'pointer'}} />
              <label htmlFor="terms" style={s.termsText}>
                I agree to the <a href="#" style={s.termsLink}>Terms of Service</a> and <a href="#" style={s.termsLink}>Privacy Policy</a>
              </label>
            </div>

            {/* Submit */}
            <motion.button type="submit" disabled={loading}
              whileHover={{scale:loading?1:1.01}} whileTap={{scale:loading?1:0.99}}
              style={{...s.submit, opacity:loading?0.7:1, cursor:loading?'not-allowed':'pointer'}}>
              {loading
                ? <><span style={s.spinner}/>Creating account...</>
                : <>Create account <ArrowRight size={17}/></>}
            </motion.button>
          </form>

          <p style={s.bottom}>
            Already have an account? <Link to="/login" style={s.link}>Log in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
