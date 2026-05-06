import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Zap } from 'lucide-react'
import useAuthStore from '../../store/authStore'

const navLinks = [
  { label:'Services',     href:'#services' },
  { label:'How it works', href:'#how-it-works' },
  { label:'Providers',    href:'#providers' },
  { label:'Pricing',      href:'#pricing' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { isAuthenticated, logout } = useAuthStore()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navStyle = {
    position:'fixed', top:0, left:0, right:0, zIndex:50,
    transition:'all 0.3s',
    background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
    backdropFilter: scrolled ? 'blur(12px)' : 'none',
    boxShadow: scrolled ? '0 1px 24px rgba(0,0,0,0.08)' : 'none',
    fontFamily:'system-ui,-apple-system,sans-serif',
  }

  const linkColor = scrolled ? '#374151' : 'rgba(255,255,255,0.8)'
  const logoColor = scrolled ? '#7c3aed' : 'white'

  return (
    <motion.nav initial={{ y:-70, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ duration:0.6 }} style={navStyle}>
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 40px', display:'flex', alignItems:'center', justifyContent:'space-between', height:'68px' }}>

        {/* Logo */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none' }}>
          <div style={{ width:'36px', height:'36px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(124,58,237,0.35)' }}>
            <Zap size={18} color="white"/>
          </div>
          <span style={{ fontSize:'19px', fontWeight:'900', color:logoColor, letterSpacing:'-0.5px', transition:'color 0.3s' }}>UrbanEase</span>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display:'flex', alignItems:'center', gap:'36px' }}>
          {navLinks.map(({ label, href }) => (
            <a key={label} href={href} style={{ fontSize:'14px', fontWeight:'500', color:linkColor, textDecoration:'none', transition:'color 0.2s', position:'relative' }}
              onMouseOver={e=>e.currentTarget.style.color='#7c3aed'}
              onMouseOut={e=>e.currentTarget.style.color=linkColor}>
              {label}
            </a>
          ))}
        </div>

        {/* Auth buttons */}
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" style={{ fontSize:'14px', fontWeight:'600', color:linkColor, textDecoration:'none', padding:'8px 14px', transition:'color 0.2s' }}>Dashboard</Link>
              <button onClick={logout}
                style={{ fontSize:'14px', fontWeight:'600', padding:'9px 20px', borderRadius:'10px', border:`1.5px solid ${scrolled?'#e5e7eb':'rgba(255,255,255,0.3)'}`, background:'transparent', color:linkColor, cursor:'pointer', transition:'all 0.2s' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"
                style={{ fontSize:'14px', fontWeight:'600', color:linkColor, textDecoration:'none', padding:'9px 18px', transition:'color 0.2s' }}
                onMouseOver={e=>e.currentTarget.style.color='#7c3aed'}
                onMouseOut={e=>e.currentTarget.style.color=linkColor}>
                Log in
              </Link>
              <Link to="/register"
                style={{ fontSize:'14px', fontWeight:'700', padding:'10px 22px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', color:'white', borderRadius:'12px', textDecoration:'none', boxShadow:'0 4px 14px rgba(124,58,237,0.35)', transition:'all 0.2s' }}
                onMouseOver={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 6px 20px rgba(124,58,237,0.45)'}}
                onMouseOut={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 4px 14px rgba(124,58,237,0.35)'}}>
                Sign up free
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
