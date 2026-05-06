import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, User, LogOut, BookOpen, LayoutDashboard, X, Check, AlertCircle, Camera } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import NotificationBell from './NotificationBell'
import { updateMe } from '../../api/auth'

const NAV_LINKS = [
  { label: 'Services',     to: '/services' },
  { label: 'How it works', href: '/#how-it-works' },
]

/* ── Profile Edit Modal ─────────────────────────────────────────────────── */
function ProfileModal({ user, onClose, onSaved }) {
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [email,    setEmail]    = useState(user?.email    || '')
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await updateMe({ full_name: fullName, email })
      onSaved(res.data)
      setSuccess(true)
      setTimeout(onClose, 900)
    } catch (err) {
      const d = err.response?.data
      setError(
        typeof d === 'string' ? d
        : d?.full_name?.[0] || d?.email?.[0] || d?.detail || 'Update failed.'
      )
    } finally {
      setSaving(false)
    }
  }

  const inp = (focused) => ({
    width: '100%', padding: '12px 14px', border: `2px solid ${focused ? '#7c3aed' : '#e5e7eb'}`,
    borderRadius: '11px', fontSize: '14px', color: '#0f172a', outline: 'none',
    background: 'white', transition: 'border 0.2s', boxSizing: 'border-box',
  })

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div initial={{ scale:0.92, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.92, opacity:0 }} transition={{ duration:0.18 }}
        style={{ background:'white', borderRadius:'20px', width:'100%', maxWidth:'440px', padding:'32px', boxShadow:'0 20px 60px rgba(0,0,0,0.2)', position:'relative' }}>

        {/* Close */}
        <button onClick={onClose} style={{ position:'absolute', top:'16px', right:'16px', background:'#f1f5f9', border:'none', borderRadius:'8px', width:'32px', height:'32px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b' }}>
          <X size={16}/>
        </button>

        {/* Avatar initial */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:'24px' }}>
          <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#4338ca)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'28px', fontWeight:'900', marginBottom:'8px', position:'relative' }}>
            {(fullName || user?.phone || '?').charAt(0).toUpperCase()}
            <div style={{ position:'absolute', bottom:0, right:0, width:'22px', height:'22px', borderRadius:'50%', background:'#7c3aed', border:'2px solid white', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Camera size={10} color="white"/>
            </div>
          </div>
          <p style={{ fontSize:'11px', color:'#94a3b8', margin:0 }}>Profile photo coming soon</p>
        </div>

        <h2 style={{ fontSize:'20px', fontWeight:'800', color:'#0f172a', marginBottom:'4px', textAlign:'center' }}>Edit Profile</h2>
        <p style={{ fontSize:'13px', color:'#64748b', textAlign:'center', marginBottom:'24px' }}>
          Phone: <strong style={{ color:'#374151' }}>{user?.phone}</strong> &nbsp;·&nbsp; Role: <strong style={{ color:'#374151', textTransform:'capitalize' }}>{user?.is_staff ? 'Admin' : user?.role}</strong>
        </p>

        <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div>
            <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'#374151', marginBottom:'6px' }}>Full Name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name"
              style={inp(false)} onFocus={e => e.target.style.borderColor='#7c3aed'} onBlur={e => e.target.style.borderColor='#e5e7eb'}/>
          </div>

          <div>
            <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'#374151', marginBottom:'6px' }}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" type="email"
              style={inp(false)} onFocus={e => e.target.style.borderColor='#7c3aed'} onBlur={e => e.target.style.borderColor='#e5e7eb'}/>
          </div>

          {error && (
            <div style={{ display:'flex', gap:'8px', padding:'10px 13px', background:'#fef2f2', borderRadius:'10px', border:'1px solid #fecaca' }}>
              <AlertCircle size={14} color="#ef4444" style={{ flexShrink:0, marginTop:'1px' }}/>
              <p style={{ color:'#dc2626', fontSize:'12px', margin:0 }}>{error}</p>
            </div>
          )}

          {success && (
            <div style={{ display:'flex', gap:'8px', alignItems:'center', padding:'10px 13px', background:'#ecfdf5', borderRadius:'10px', border:'1px solid #a7f3d0' }}>
              <Check size={14} color="#059669"/>
              <p style={{ color:'#059669', fontSize:'12px', fontWeight:'700', margin:0 }}>Profile updated!</p>
            </div>
          )}

          <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
            <button type="button" onClick={onClose}
              style={{ flex:1, padding:'12px', border:'2px solid #e5e7eb', borderRadius:'12px', fontWeight:'700', fontSize:'14px', color:'#374151', background:'white', cursor:'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving || success}
              style={{ flex:2, padding:'12px', background: saving || success ? '#e5e7eb' : 'linear-gradient(135deg,#7c3aed,#4338ca)', color: saving || success ? '#9ca3af' : 'white', border:'none', borderRadius:'12px', fontWeight:'800', fontSize:'14px', cursor: saving ? 'wait' : 'pointer', transition:'all 0.2s' }}>
              {saving ? 'Saving…' : success ? 'Saved ✓' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

/* ── Navbar ─────────────────────────────────────────────────────────────── */
export default function Navbar() {
  const [scrolled,      setScrolled]      = useState(false)
  const [dropdownOpen,  setDropdownOpen]  = useState(false)
  const [profileOpen,   setProfileOpen]   = useState(false)
  const { isAuthenticated, user, logout, setUser } = useAuthStore()
  const navigate    = useNavigate()
  const dropdownRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const linkColor = scrolled ? '#374151' : 'rgba(255,255,255,0.85)'
  const logoColor = scrolled ? '#7c3aed' : 'white'
  const dashRoute = user?.is_staff ? '/admin-panel' : user?.role === 'provider' ? '/provider' : '/dashboard'

  function handleLogout() {
    setDropdownOpen(false)
    logout()
    navigate('/')
  }

  function openProfile() {
    setDropdownOpen(false)
    setProfileOpen(true)
  }

  return (
    <>
      <motion.nav
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          transition: 'all 0.3s',
          background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          boxShadow: scrolled ? '0 1px 24px rgba(0,0,0,0.08)' : 'none',
          fontFamily: 'system-ui,-apple-system,sans-serif',
        }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg,#7c3aed,#4338ca)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(124,58,237,0.35)' }}>
              <Zap size={18} color="white"/>
            </div>
            <span style={{ fontSize: '19px', fontWeight: '900', color: logoColor, letterSpacing: '-0.5px', transition: 'color 0.3s' }}>UrbanEase</span>
          </Link>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            {NAV_LINKS.map(({ label, to, href }) =>
              to ? (
                <Link key={label} to={to}
                  style={{ fontSize: '14px', fontWeight: '500', color: linkColor, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.color = '#7c3aed'}
                  onMouseOut={e => e.currentTarget.style.color = linkColor}>
                  {label}
                </Link>
              ) : (
                <a key={label} href={href}
                  style={{ fontSize: '14px', fontWeight: '500', color: linkColor, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.color = '#7c3aed'}
                  onMouseOut={e => e.currentTarget.style.color = linkColor}>
                  {label}
                </a>
              )
            )}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isAuthenticated ? (
              <>
                <NotificationBell scrolled={scrolled}/>

                <Link to={dashRoute}
                  style={{ fontSize: '14px', fontWeight: '600', color: linkColor, textDecoration: 'none', padding: '8px 14px', borderRadius: '10px', transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; e.currentTarget.style.color = '#7c3aed' }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = linkColor }}>
                  Dashboard
                </Link>

                {/* Avatar with dropdown */}
                <div ref={dropdownRef} style={{ position: 'relative' }}>
                  <button onClick={() => setDropdownOpen(v => !v)}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#4338ca)', border: dropdownOpen ? '2px solid white' : '2px solid transparent', cursor: 'pointer', color: 'white', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(124,58,237,0.35)', transition: 'all 0.2s', outline: 'none' }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                    {(user?.full_name || user?.phone || '?').charAt(0).toUpperCase()}
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div initial={{ opacity:0, y:-8, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-8, scale:0.96 }} transition={{ duration:0.15 }}
                        style={{ position:'absolute', top:'calc(100% + 10px)', right:0, background:'white', borderRadius:'16px', boxShadow:'0 8px 32px rgba(0,0,0,0.14)', border:'1px solid #f1f5f9', minWidth:'220px', overflow:'hidden', zIndex:200 }}>

                        {/* User info header */}
                        <div style={{ padding:'14px 16px', borderBottom:'1px solid #f1f5f9', background:'#fafafa' }}>
                          <div style={{ fontSize:'13px', fontWeight:'800', color:'#0f172a' }}>{user?.full_name || 'No name set'}</div>
                          <div style={{ fontSize:'11px', color:'#94a3b8', marginTop:'2px' }}>{user?.phone}</div>
                          <div style={{ display:'inline-block', marginTop:'6px', fontSize:'10px', fontWeight:'700', padding:'2px 8px', borderRadius:'20px',
                            background: user?.is_staff ? '#fef3c7' : user?.role === 'provider' ? '#ede9fe' : '#ecfdf5',
                            color: user?.is_staff ? '#92400e' : user?.role === 'provider' ? '#6d28d9' : '#065f46' }}>
                            {user?.is_staff ? 'Admin' : user?.role === 'provider' ? 'Provider' : 'Customer'}
                          </div>
                        </div>

                        {/* Menu items */}
                        <div style={{ padding:'6px' }}>
                          <DropItem icon={<User size={14}/>} label="Edit Profile" onClick={openProfile}/>
                          <DropItem icon={<LayoutDashboard size={14}/>} label="Dashboard" onClick={() => { setDropdownOpen(false); navigate(dashRoute) }}/>
                          {!user?.is_staff && (
                            <DropItem icon={<BookOpen size={14}/>} label="My Bookings" onClick={() => { setDropdownOpen(false); navigate('/bookings') }}/>
                          )}
                          <div style={{ borderTop:'1px solid #f1f5f9', margin:'4px 0' }}/>
                          <DropItem icon={<LogOut size={14}/>} label="Sign out" onClick={handleLogout} danger/>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link to="/login"
                  style={{ fontSize: '14px', fontWeight: '600', color: linkColor, textDecoration: 'none', padding: '9px 18px', transition: 'color 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.color = '#7c3aed'}
                  onMouseOut={e => e.currentTarget.style.color = linkColor}>
                  Log in
                </Link>
                <Link to="/register"
                  style={{ fontSize: '14px', fontWeight: '700', padding: '10px 22px', background: 'linear-gradient(135deg,#7c3aed,#4338ca)', color: 'white', borderRadius: '12px', textDecoration: 'none', boxShadow: '0 4px 14px rgba(124,58,237,0.35)', transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.45)' }}
                  onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(124,58,237,0.35)' }}>
                  Sign up free
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Profile modal */}
      <AnimatePresence>
        {profileOpen && (
          <ProfileModal
            user={user}
            onClose={() => setProfileOpen(false)}
            onSaved={(updated) => { setUser(updated); setProfileOpen(false) }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

/* ── Dropdown item ──────────────────────────────────────────────────────── */
function DropItem({ icon, label, onClick, danger }) {
  const [hover, setHover] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ width:'100%', display:'flex', alignItems:'center', gap:'10px', padding:'9px 10px', borderRadius:'10px', border:'none', cursor:'pointer', textAlign:'left', fontSize:'13px', fontWeight:'600', transition:'all 0.15s',
        background: hover ? (danger ? '#fef2f2' : '#f5f3ff') : 'transparent',
        color: hover ? (danger ? '#dc2626' : '#7c3aed') : (danger ? '#ef4444' : '#374151') }}>
      {icon}
      {label}
    </button>
  )
}
