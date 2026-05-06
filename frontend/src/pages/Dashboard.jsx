import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Search, Calendar, Star, Clock, ArrowRight, LogOut } from 'lucide-react'
import useAuthStore from '../store/authStore'

const quickLinks = [
  { icon:Search,   label:'Browse Services',  desc:'Find the service you need',   to:'/services',  color:'#eff6ff', ic:'#3b82f6' },
  { icon:Calendar, label:'My Bookings',       desc:'View your booking history',   to:'/bookings',  color:'#f0fdf4', ic:'#22c55e' },
  { icon:Star,     label:'My Reviews',        desc:'Reviews you have left',       to:'/bookings',  color:'#fefce8', ic:'#eab308' },
  { icon:Clock,    label:'Upcoming',          desc:'Your scheduled services',     to:'/bookings',  color:'#faf5ff', ic:'#a855f7' },
]

export default function Dashboard() {
  const { user, logout } = useAuthStore()

  const name = user?.full_name || user?.phone || 'there'
  const role = user?.role || 'customer'

  if (role === 'provider') return <Navigate to="/provider" replace />

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:'system-ui,-apple-system,sans-serif' }}>

      {/* Top bar */}
      <div style={{ background:'white', borderBottom:'1px solid #f1f5f9', padding:'0 40px', display:'flex', alignItems:'center', justifyContent:'space-between', height:'68px', position:'sticky', top:0, zIndex:40, boxShadow:'0 1px 8px rgba(0,0,0,0.05)' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none' }}>
          <div style={{ width:'34px', height:'34px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', borderRadius:'9px', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Zap size={17} color="white"/>
          </div>
          <span style={{ fontSize:'18px', fontWeight:'900', color:'#7c3aed', letterSpacing:'-0.4px' }}>UrbanEase</span>
        </Link>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <div style={{ width:'36px', height:'36px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'13px', fontWeight:'700' }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize:'14px', fontWeight:'600', color:'#374151' }}>{name}</span>
          <button onClick={logout} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 16px', border:'1.5px solid #e5e7eb', borderRadius:'10px', background:'white', color:'#6b7280', fontSize:'13px', fontWeight:'600', cursor:'pointer', transition:'all 0.2s' }}
            onMouseOver={e=>{e.currentTarget.style.borderColor='#f87171';e.currentTarget.style.color='#ef4444'}}
            onMouseOut={e=>{e.currentTarget.style.borderColor='#e5e7eb';e.currentTarget.style.color='#6b7280'}}>
            <LogOut size={14}/> Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'48px 40px' }}>

        {/* Welcome banner */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5}}
          style={{ background:'linear-gradient(135deg,#7c3aed 0%,#4338ca 100%)', borderRadius:'24px', padding:'40px 48px', marginBottom:'40px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'200px', height:'200px', background:'rgba(255,255,255,0.07)', borderRadius:'50%' }}/>
          <div style={{ position:'absolute', bottom:'-30px', right:'120px', width:'140px', height:'140px', background:'rgba(255,255,255,0.05)', borderRadius:'50%' }}/>
          <div style={{ position:'relative', zIndex:1 }}>
            <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'14px', fontWeight:'500', marginBottom:'6px' }}>
              {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}
            </p>
            <h1 style={{ color:'white', fontSize:'28px', fontWeight:'900', marginBottom:'8px', letterSpacing:'-0.5px' }}>
              Welcome back, {name.split(' ')[0]} 👋
            </h1>
            <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'15px', marginBottom:'28px' }}>
              {role === 'provider' ? 'Manage your services and bookings from here.' : 'What service do you need today?'}
            </p>
            <Link to="/services" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'12px 24px', background:'white', color:'#7c3aed', fontWeight:'700', fontSize:'14px', borderRadius:'12px', textDecoration:'none', boxShadow:'0 4px 16px rgba(0,0,0,0.15)', transition:'all 0.2s' }}
              onMouseOver={e=>e.currentTarget.style.transform='translateY(-1px)'}
              onMouseOut={e=>e.currentTarget.style.transform=''}>
              Browse Services <ArrowRight size={16}/>
            </Link>
          </div>
        </motion.div>

        {/* Quick links */}
        <h2 style={{ fontSize:'18px', fontWeight:'800', color:'#0f172a', marginBottom:'20px', letterSpacing:'-0.3px' }}>Quick actions</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'48px' }}>
          {quickLinks.map(({ icon:Icon, label, desc, to, color, ic }, i) => (
            <motion.div key={label} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4,delay:i*0.08}}>
              <Link to={to} style={{ display:'block', background:'white', borderRadius:'18px', padding:'24px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', textDecoration:'none', transition:'all 0.25s' }}
                onMouseOver={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,0.09)'}}
                onMouseOut={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)'}}>
                <div style={{ width:'48px', height:'48px', background:color, borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px' }}>
                  <Icon size={22} color={ic}/>
                </div>
                <div style={{ fontWeight:'700', color:'#0f172a', fontSize:'14px', marginBottom:'4px' }}>{label}</div>
                <div style={{ fontSize:'12px', color:'#94a3b8' }}>{desc}</div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Coming soon placeholder */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.6,delay:0.4}}
          style={{ background:'white', borderRadius:'20px', padding:'48px', border:'1px solid #f1f5f9', textAlign:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ width:'64px', height:'64px', background:'#faf5ff', borderRadius:'18px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
            <Calendar size={28} color="#7c3aed"/>
          </div>
          <h3 style={{ fontSize:'18px', fontWeight:'800', color:'#0f172a', marginBottom:'8px' }}>No bookings yet</h3>
          <p style={{ color:'#64748b', fontSize:'14px', marginBottom:'24px', lineHeight:1.7 }}>
            You haven't booked any services yet.<br/>Browse our services and book your first one today.
          </p>
          <Link to="/services" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'12px 28px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', color:'white', fontWeight:'700', fontSize:'14px', borderRadius:'12px', textDecoration:'none', boxShadow:'0 4px 16px rgba(124,58,237,0.3)' }}>
            Find a Service <ArrowRight size={16}/>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
