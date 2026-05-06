import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import NotificationBell from './NotificationBell'

const NAV_LINKS = [
  { label: 'Services',     to: '/services' },
  { label: 'How it works', href: '/#how-it-works' },
]

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const linkColor  = scrolled ? '#374151' : 'rgba(255,255,255,0.85)'
  const logoColor  = scrolled ? '#7c3aed' : 'white'
  const dashRoute  = user?.is_staff ? '/admin-panel' : user?.role === 'provider' ? '/provider' : '/dashboard'

  return (
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
              {/* Notification bell */}
              <NotificationBell scrolled={scrolled}/>

              {/* Dashboard link */}
              <Link to={dashRoute}
                style={{ fontSize: '14px', fontWeight: '600', color: linkColor, textDecoration: 'none', padding: '8px 14px', borderRadius: '10px', transition: 'all 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; e.currentTarget.style.color = '#7c3aed' }}
                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = linkColor }}>
                Dashboard
              </Link>

              {/* Avatar + logout */}
              <button onClick={() => { logout(); navigate('/') }}
                style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#4338ca)', border: 'none', cursor: 'pointer', color: 'white', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(124,58,237,0.35)', transition: 'transform 0.2s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                title="Logout">
                {(user?.full_name || user?.phone || '?').charAt(0).toUpperCase()}
              </button>
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
  )
}
