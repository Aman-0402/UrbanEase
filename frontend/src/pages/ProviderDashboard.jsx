import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LogOut, Star, Briefcase, IndianRupee, Calendar, Clock, MapPin,
  CheckCircle, ChevronRight, TrendingUp, Bell, Settings, User,
  PlayCircle, XCircle, AlertCircle, ToggleLeft, ToggleRight, Edit3,
  Search, X, ShieldCheck, Upload, FileText, Camera, Clock3,
  ArrowUp, ArrowDown, Minus, Lightbulb,
} from 'lucide-react'
import Logo from '../components/layout/Logo'
import useAuthStore from '../store/authStore'
import {
  getMyProfile, updateMyProfile,
  getProviderBookings, updateBookingStatus,
  getMyKYC, submitKYC, getMyEarnings,
} from '../api/provider'
import { respondNegotiation } from '../api/bookings'
import { getServices, suggestService } from '../api/services'

const STATUS_META = {
  pending:     { label:'Pending',     color:'#f59e0b', bg:'#fefce8', border:'#fde68a' },
  confirmed:   { label:'Confirmed',   color:'#3b82f6', bg:'#eff6ff', border:'#bfdbfe' },
  in_progress: { label:'In Progress', color:'#8b5cf6', bg:'#f5f3ff', border:'#ddd6fe' },
  completed:   { label:'Completed',   color:'#059669', bg:'#ecfdf5', border:'#a7f3d0' },
  cancelled:   { label:'Cancelled',   color:'#dc2626', bg:'#fef2f2', border:'#fecaca' },
}

const NEXT_ACTIONS = {
  pending:     [{ status:'confirmed',   label:'Confirm',   icon:CheckCircle, color:'#3b82f6', bg:'#eff6ff' },
                { status:'cancelled',   label:'Decline',   icon:XCircle,     color:'#dc2626', bg:'#fef2f2' }],
  confirmed:   [{ status:'in_progress', label:'Start Job', icon:PlayCircle,  color:'#8b5cf6', bg:'#f5f3ff' },
                { status:'cancelled',   label:'Cancel',    icon:XCircle,     color:'#dc2626', bg:'#fef2f2' }],
  in_progress: [{ status:'completed',   label:'Complete',  icon:CheckCircle, color:'#059669', bg:'#ecfdf5' }],
  completed:   [],
  cancelled:   [],
}

const TABS = [
  { key:'',            label:'All' },
  { key:'pending',     label:'Pending' },
  { key:'confirmed',   label:'Confirmed' },
  { key:'in_progress', label:'In Progress' },
  { key:'completed',   label:'Completed' },
]

function StatCard({ icon: Icon, label, value, color, bg, delay }) {
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay }}>
      <div style={{ background:'white', borderRadius:'20px', padding:'24px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
          <div style={{ width:'44px', height:'44px', background:bg, borderRadius:'13px', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon size={20} color={color}/>
          </div>
        </div>
        <div style={{ fontSize:'26px', fontWeight:'900', color:'#0f172a', letterSpacing:'-0.5px', marginBottom:'4px' }}>{value}</div>
        <div style={{ fontSize:'13px', color:'#94a3b8', fontWeight:'500' }}>{label}</div>
      </div>
    </motion.div>
  )
}

export default function ProviderDashboard() {
  const { user, logout }            = useAuthStore()
  const navigate                    = useNavigate()
  const name                        = user?.full_name || user?.phone || 'Provider'

  const [profile,   setProfile]     = useState(null)
  const [bookings,  setBookings]    = useState([])
  const [loading,   setLoading]     = useState(true)
  const [activeTab, setActiveTab]   = useState('')
  const [updating,         setUpdating]         = useState(null)
  const [negotiatingId,    setNegotiatingId]    = useState(null)
  const [togglingAvail,    setTogglingAvail]    = useState(false)
  const [activeSection, setActiveSection] = useState('bookings')
  const [earningsData,    setEarningsData]    = useState(null)
  const [earningsLoading, setEarningsLoading] = useState(false)
  const [earningsError,   setEarningsError]   = useState('')
  const [suggestOpen,  setSuggestOpen]  = useState(false)
  const [suggestForm,  setSuggestForm]  = useState({ service_name:'', category_name:'', description:'' })
  const [suggestSaving,setSuggestSaving]= useState(false)
  const [suggestDone,  setSuggestDone]  = useState(false)

  const fetchAll = useCallback(() => {
    setLoading(true)
    const params = activeTab ? { status: activeTab } : {}
    Promise.all([
      getMyProfile(),
      getProviderBookings(params),
    ]).then(([pRes, bRes]) => {
      setProfile(pRes.data)
      setBookings(bRes.data.results ?? bRes.data)
    }).finally(() => setLoading(false))
  }, [activeTab])

  useEffect(() => { fetchAll() }, [fetchAll])

  function fetchEarnings() {
    setEarningsLoading(true)
    setEarningsError('')
    getMyEarnings()
      .then(r => setEarningsData(r.data))
      .catch(err => {
        const detail = err.response?.data?.detail || err.message || 'Failed to load earnings.'
        setEarningsError(detail)
      })
      .finally(() => setEarningsLoading(false))
  }

  useEffect(() => {
    if (activeSection !== 'earnings') return
    fetchEarnings()
  }, [activeSection])

  async function handleStatusUpdate(bookingId, newStatus) {
    setUpdating(bookingId + newStatus)
    try {
      await updateBookingStatus(bookingId, { status: newStatus })
      fetchAll()
    } catch (err) {
      alert(err.response?.data?.detail || 'Action failed.')
    } finally {
      setUpdating(null)
    }
  }

  async function handleNegotiationResponse(bookingId, action) {
    setNegotiatingId(bookingId + action)
    try {
      await respondNegotiation(bookingId, { action })
      fetchAll()
    } catch (err) {
      alert(err.response?.data?.detail || 'Action failed.')
    } finally {
      setNegotiatingId(null)
    }
  }

  async function toggleAvailability() {
    if (!profile) return
    setTogglingAvail(true)
    try {
      const res = await updateMyProfile({ is_available: !profile.is_available })
      setProfile(res.data)
    } finally {
      setTogglingAvail(false)
    }
  }

  const stats = profile ? [
    { icon:Briefcase,    label:'Jobs Completed',  value: profile.total_jobs,                         color:'#3b82f6', bg:'#eff6ff' },
    { icon:Star,         label:'Avg Rating',       value: parseFloat(profile.avg_rating || 0).toFixed(1) + ' ★', color:'#f59e0b', bg:'#fffbeb' },
    { icon:TrendingUp,   label:'Total Reviews',    value: profile.total_reviews,                      color:'#059669', bg:'#ecfdf5' },
    { icon:IndianRupee,  label:'Hourly Rate',      value: '₹' + parseFloat(profile.hourly_rate || 0).toLocaleString('en-IN'), color:'#8b5cf6', bg:'#f5f3ff' },
  ] : []

  const pendingCount = bookings.filter(b => b.status === 'pending').length

  async function handleSuggest(e) {
    e.preventDefault()
    setSuggestSaving(true)
    try {
      await suggestService(suggestForm)
      setSuggestDone(true)
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit suggestion.')
    } finally {
      setSuggestSaving(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:'system-ui,-apple-system,sans-serif' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Suggest a Service modal */}
      {suggestOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px' }}
          onClick={e => { if (e.target === e.currentTarget) { setSuggestOpen(false); setSuggestDone(false); setSuggestForm({ service_name:'', category_name:'', description:'' }) } }}>
          <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
            style={{ background:'white', borderRadius:'24px', padding:'36px', maxWidth:'440px', width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <h3 style={{ fontSize:'18px', fontWeight:'800', color:'#0f172a', margin:0 }}>Suggest a Service</h3>
              <button onClick={() => { setSuggestOpen(false); setSuggestDone(false); setSuggestForm({ service_name:'', category_name:'', description:'' }) }}
                style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', padding:'4px' }}>
                <X size={20}/>
              </button>
            </div>
            {suggestDone ? (
              <div style={{ textAlign:'center', padding:'20px 0' }}>
                <CheckCircle size={48} color="#059669" style={{ marginBottom:'12px' }}/>
                <p style={{ fontSize:'15px', fontWeight:'700', color:'#0f172a', marginBottom:'6px' }}>Suggestion Submitted!</p>
                <p style={{ fontSize:'13px', color:'#64748b' }}>Our team will review it and add it to the service list if approved.</p>
                <button onClick={() => { setSuggestOpen(false); setSuggestDone(false); setSuggestForm({ service_name:'', category_name:'', description:'' }) }}
                  style={{ marginTop:'20px', padding:'11px 28px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', color:'white', border:'none', borderRadius:'12px', fontWeight:'700', fontSize:'14px', cursor:'pointer' }}>
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSuggest} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                <div>
                  <label style={{ fontSize:'12px', fontWeight:'700', color:'#64748b', display:'block', marginBottom:'5px', textTransform:'uppercase' }}>Service Name *</label>
                  <input required value={suggestForm.service_name} onChange={e => setSuggestForm(p => ({ ...p, service_name: e.target.value }))} placeholder="e.g. Sofa Deep Cleaning"
                    style={{ width:'100%', padding:'11px 14px', border:'2px solid #e5e7eb', borderRadius:'12px', fontSize:'14px', outline:'none', boxSizing:'border-box' }}
                    onFocus={e => e.target.style.borderColor='#7c3aed'} onBlur={e => e.target.style.borderColor='#e5e7eb'}/>
                </div>
                <div>
                  <label style={{ fontSize:'12px', fontWeight:'700', color:'#64748b', display:'block', marginBottom:'5px', textTransform:'uppercase' }}>Category *</label>
                  <input required value={suggestForm.category_name} onChange={e => setSuggestForm(p => ({ ...p, category_name: e.target.value }))} placeholder="e.g. Cleaning"
                    style={{ width:'100%', padding:'11px 14px', border:'2px solid #e5e7eb', borderRadius:'12px', fontSize:'14px', outline:'none', boxSizing:'border-box' }}
                    onFocus={e => e.target.style.borderColor='#7c3aed'} onBlur={e => e.target.style.borderColor='#e5e7eb'}/>
                </div>
                <div>
                  <label style={{ fontSize:'12px', fontWeight:'700', color:'#64748b', display:'block', marginBottom:'5px', textTransform:'uppercase' }}>Description</label>
                  <textarea rows={3} value={suggestForm.description} onChange={e => setSuggestForm(p => ({ ...p, description: e.target.value }))} placeholder="Briefly describe what this service involves…"
                    style={{ width:'100%', padding:'11px 14px', border:'2px solid #e5e7eb', borderRadius:'12px', fontSize:'14px', outline:'none', boxSizing:'border-box', resize:'vertical', fontFamily:'inherit' }}
                    onFocus={e => e.target.style.borderColor='#7c3aed'} onBlur={e => e.target.style.borderColor='#e5e7eb'}/>
                </div>
                <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
                  <button type="button" onClick={() => setSuggestOpen(false)} style={{ flex:1, padding:'12px', border:'2px solid #e5e7eb', borderRadius:'12px', fontWeight:'700', fontSize:'14px', color:'#374151', background:'white', cursor:'pointer' }}>Cancel</button>
                  <button type="submit" disabled={suggestSaving} style={{ flex:1, padding:'12px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', color:'white', border:'none', borderRadius:'12px', fontWeight:'700', fontSize:'14px', cursor: suggestSaving ? 'wait' : 'pointer', opacity: suggestSaving ? 0.75 : 1 }}>
                    {suggestSaving ? 'Submitting…' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* Sidebar + main layout */}
      <div style={{ display:'flex', minHeight:'100vh' }}>

        {/* Sidebar */}
        <div style={{ width:'260px', background:'linear-gradient(180deg,#1e1b4b 0%,#312e81 100%)', display:'flex', flexDirection:'column', flexShrink:0, position:'sticky', top:0, height:'100vh', overflowY:'auto' }}>
          {/* Logo */}
          <div style={{ padding:'28px 24px 20px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
            <Link to="/" style={{ textDecoration:'none' }}>
              <Logo height={34}/>
            </Link>
            <div style={{ marginTop:'16px', display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ width:'38px', height:'38px', borderRadius:'12px', background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'800', fontSize:'15px', flexShrink:0 }}>
                {name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ color:'white', fontWeight:'700', fontSize:'14px', lineHeight:1.2 }}>{name}</div>
                <div style={{ color:'rgba(255,255,255,0.45)', fontSize:'11px' }}>Service Provider</div>
              </div>
            </div>
          </div>

          {/* Availability toggle */}
          <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
            <button onClick={toggleAvailability} disabled={togglingAvail}
              style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderRadius:'12px', border:'none', cursor:'pointer', background: profile?.is_available ? 'rgba(5,150,105,0.2)' : 'rgba(255,255,255,0.07)', transition:'all 0.2s' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background: profile?.is_available ? '#34d399' : '#94a3b8', flexShrink:0, boxShadow: profile?.is_available ? '0 0 6px #34d399' : 'none' }}/>
                <span style={{ fontSize:'13px', fontWeight:'700', color: profile?.is_available ? '#34d399' : 'rgba(255,255,255,0.5)' }}>
                  {profile?.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              {profile?.is_available
                ? <ToggleRight size={22} color="#34d399"/>
                : <ToggleLeft  size={22} color="rgba(255,255,255,0.3)"/>
              }
            </button>
          </div>

          {/* Nav */}
          <nav style={{ padding:'16px 16px', flex:1 }}>
            {[
              { key:'bookings', icon:Calendar,    label:'Bookings',  badge: pendingCount || null },
              { key:'profile',  icon:User,        label:'My Profile' },
              { key:'kyc',      icon:ShieldCheck, label:'KYC & Verification' },
              { key:'earnings', icon:TrendingUp,  label:'Earnings' },
            ].map(item => {
              const active = activeSection === item.key
              const btnStyle = { width:'100%', display:'flex', alignItems:'center', gap:'12px', padding:'12px 14px', borderRadius:'12px', border:'none', cursor:'pointer', marginBottom:'4px', transition:'all 0.2s', background: active ? 'rgba(255,255,255,0.12)' : 'transparent', color: active ? 'white' : 'rgba(255,255,255,0.5)', textDecoration:'none' }
              const inner = (
                <>
                  <item.icon size={17}/>
                  <span style={{ fontSize:'14px', fontWeight: active ? '700' : '500', flex:1, textAlign:'left' }}>{item.label}</span>
                  {item.badge && (
                    <span style={{ background:'#ef4444', color:'white', fontSize:'10px', fontWeight:'800', borderRadius:'10px', padding:'2px 7px', minWidth:'18px', textAlign:'center' }}>{item.badge}</span>
                  )}
                </>
              )
              return item.link
                ? <Link key={item.key} to={item.link} style={btnStyle}>{inner}</Link>
                : <button key={item.key} onClick={() => setActiveSection(item.key)} style={btnStyle}>{inner}</button>
            })}
          </nav>

          {/* Logout */}
          <div style={{ padding:'16px 20px', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
            <button onClick={() => { logout(); navigate('/') }}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:'10px', padding:'12px 14px', borderRadius:'12px', border:'none', cursor:'pointer', background:'transparent', color:'rgba(255,255,255,0.4)', fontSize:'14px', fontWeight:'600', transition:'all 0.2s' }}
              onMouseOver={e=>{ e.currentTarget.style.background='rgba(239,68,68,0.15)'; e.currentTarget.style.color='#f87171' }}
              onMouseOut={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.4)' }}>
              <LogOut size={16}/> Logout
            </button>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex:1, overflowY:'auto' }}>
          <div style={{ padding:'36px 40px', maxWidth:'900px' }}>

            {/* Header */}
            <div style={{ marginBottom:'32px' }}>
              <h1 style={{ fontSize:'24px', fontWeight:'900', color:'#0f172a', letterSpacing:'-0.4px', marginBottom:'4px' }}>
                {activeSection === 'bookings' ? 'Booking Management'
                  : activeSection === 'kyc' ? 'KYC & Verification'
                  : activeSection === 'earnings' ? 'Earnings'
                  : 'My Profile'}
              </h1>
              <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
                <p style={{ color:'#64748b', fontSize:'14px', margin:0 }}>
                  {activeSection === 'bookings' ? 'Review and update your assigned jobs'
                    : activeSection === 'kyc' ? 'Submit your identity documents to get verified on the platform'
                    : activeSection === 'earnings' ? 'Your completed-job revenue summary'
                    : 'Manage your provider profile and settings'}
                </p>
                {activeSection === 'earnings' && (
                  <button onClick={fetchEarnings} disabled={earningsLoading}
                    style={{ display:'flex', alignItems:'center', gap:'5px', padding:'6px 14px', background:'#f5f3ff', border:'1.5px solid #ddd6fe', borderRadius:'10px', color:'#7c3aed', fontWeight:'700', fontSize:'12px', cursor: earningsLoading ? 'wait' : 'pointer', flexShrink:0 }}>
                    <TrendingUp size={12} style={{ animation: earningsLoading ? 'spin 0.8s linear infinite' : 'none' }}/>
                    Refresh
                  </button>
                )}
                {activeSection === 'bookings' && (
                  <button onClick={() => { setSuggestOpen(true); setSuggestDone(false) }}
                    style={{ display:'flex', alignItems:'center', gap:'5px', padding:'6px 14px', background:'#f5f3ff', border:'1.5px solid #ddd6fe', borderRadius:'10px', color:'#7c3aed', fontWeight:'700', fontSize:'12px', cursor:'pointer', flexShrink:0 }}>
                    <Lightbulb size={12}/> Suggest a Service
                  </button>
                )}
              </div>
            </div>

            {/* ── BOOKINGS SECTION ── */}
            {activeSection === 'bookings' && (
              <>
                {/* Stats */}
                {profile && (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'32px' }}>
                    {stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.07}/>)}
                  </div>
                )}

                {/* Tabs */}
                <div style={{ display:'flex', gap:'6px', background:'white', borderRadius:'14px', padding:'6px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', marginBottom:'24px', overflowX:'auto' }}>
                  {TABS.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                      style={{ padding:'9px 18px', borderRadius:'10px', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:'700', whiteSpace:'nowrap', transition:'all 0.2s',
                        background: activeTab === tab.key ? 'linear-gradient(135deg,#7c3aed,#4338ca)' : 'transparent',
                        color:      activeTab === tab.key ? 'white' : '#64748b',
                        boxShadow:  activeTab === tab.key ? '0 2px 8px rgba(124,58,237,0.3)' : 'none',
                      }}>
                      {tab.label}
                      {tab.key === 'pending' && pendingCount > 0 && (
                        <span style={{ marginLeft:'6px', background: activeTab === 'pending' ? 'rgba(255,255,255,0.3)' : '#ef4444', color:'white', fontSize:'10px', fontWeight:'800', borderRadius:'8px', padding:'1px 6px' }}>{pendingCount}</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Booking cards */}
                {loading ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                    {[...Array(3)].map((_,i) => <div key={i} style={{ background:'white', borderRadius:'20px', height:'160px', opacity:0.5 }}/>)}
                  </div>
                ) : bookings.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'72px 0' }}>
                    <div style={{ width:'64px', height:'64px', background:'#faf5ff', borderRadius:'18px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                      <Calendar size={28} color="#7c3aed"/>
                    </div>
                    <h3 style={{ fontSize:'18px', fontWeight:'800', color:'#0f172a', marginBottom:'8px' }}>No bookings here</h3>
                    <p style={{ color:'#64748b' }}>Bookings in this category will appear here.</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                      {bookings.map((b, i) => {
                        const meta    = STATUS_META[b.status] || STATUS_META.pending
                        const actions = NEXT_ACTIONS[b.status] || []
                        return (
                          <motion.div key={b.id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3, delay:i*0.05 }}>
                            <div style={{ background:'white', borderRadius:'20px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', overflow:'hidden' }}>
                              <div style={{ height:'4px', background:`linear-gradient(90deg,${meta.color},${meta.color}66)` }}/>
                              <div style={{ padding:'24px 28px' }}>
                                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'12px', flexWrap:'wrap', marginBottom:'14px' }}>
                                  <div>
                                    <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap', marginBottom:'4px' }}>
                                      <h3 style={{ fontSize:'16px', fontWeight:'800', color:'#0f172a', margin:0 }}>
                                        {b.service_name || `Booking #${b.id}`}
                                      </h3>
                                      <span style={{ fontSize:'11px', fontWeight:'700', padding:'3px 10px', borderRadius:'20px', background:meta.bg, color:meta.color, border:`1px solid ${meta.border}` }}>
                                        {meta.label}
                                      </span>
                                    </div>
                                    <p style={{ fontSize:'13px', color:'#64748b', margin:0 }}>
                                      Customer: <strong style={{ color:'#374151' }}>{b.customer_name || '—'}</strong>
                                    </p>
                                  </div>
                                  <div style={{ textAlign:'right' }}>
                                    <div style={{ fontSize:'18px', fontWeight:'900', color:'#0f172a' }}>₹{parseFloat(b.total_price || 0).toLocaleString('en-IN')}</div>
                                    <div style={{ fontSize:'11px', color:'#94a3b8' }}>Booking #{b.id}</div>
                                  </div>
                                </div>

                                <div style={{ display:'flex', gap:'20px', flexWrap:'wrap', marginBottom:'18px' }}>
                                  <span style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', color:'#64748b' }}>
                                    <Calendar size={13}/>
                                    {new Date(b.scheduled_date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                                  </span>
                                  <span style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', color:'#64748b' }}>
                                    <Clock size={13}/> {b.scheduled_time || '—'}
                                  </span>
                                  <span style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', color:'#64748b' }}>
                                    <MapPin size={13}/> {b.city || '—'}
                                  </span>
                                </div>

                                {/* ── Negotiation card ── */}
                                {b.negotiation_status === 'customer_proposed' && (
                                  <div style={{ background:'#fffbeb', border:'2px solid #fde68a', borderRadius:'14px', padding:'16px', marginBottom:'14px' }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
                                      <span style={{ fontSize:'16px' }}>💬</span>
                                      <span style={{ fontSize:'13px', fontWeight:'800', color:'#92400e' }}>Price Negotiation Request</span>
                                    </div>
                                    <div style={{ display:'flex', alignItems:'baseline', gap:'8px', marginBottom:'6px' }}>
                                      <span style={{ fontSize:'12px', color:'#78350f' }}>Customer proposes:</span>
                                      <span style={{ fontSize:'20px', fontWeight:'900', color:'#92400e' }}>₹{parseFloat(b.proposed_price).toLocaleString('en-IN')}</span>
                                      <span style={{ fontSize:'12px', color:'#a16207' }}>
                                        (listed ₹{parseFloat(b.total_price).toLocaleString('en-IN')})
                                      </span>
                                    </div>
                                    {b.negotiation_note && (
                                      <p style={{ fontSize:'12px', color:'#78350f', background:'#fef3c7', padding:'8px 12px', borderRadius:'8px', margin:'0 0 12px', fontStyle:'italic' }}>
                                        "{b.negotiation_note}"
                                      </p>
                                    )}
                                    <div style={{ display:'flex', gap:'10px' }}>
                                      <button
                                        onClick={() => handleNegotiationResponse(b.id, 'accept')}
                                        disabled={!!negotiatingId}
                                        style={{ display:'flex', alignItems:'center', gap:'6px', padding:'9px 18px', background:'#ecfdf5', color:'#059669', border:'1.5px solid #6ee7b7', borderRadius:'10px', fontWeight:'800', fontSize:'13px', cursor: negotiatingId ? 'wait' : 'pointer', transition:'all 0.2s' }}>
                                        <CheckCircle size={13}/> {negotiatingId === b.id+'accept' ? 'Accepting…' : `Accept ₹${parseFloat(b.proposed_price).toLocaleString('en-IN')}`}
                                      </button>
                                      <button
                                        onClick={() => handleNegotiationResponse(b.id, 'decline')}
                                        disabled={!!negotiatingId}
                                        style={{ display:'flex', alignItems:'center', gap:'6px', padding:'9px 18px', background:'#fef2f2', color:'#dc2626', border:'1.5px solid #fca5a5', borderRadius:'10px', fontWeight:'800', fontSize:'13px', cursor: negotiatingId ? 'wait' : 'pointer', transition:'all 0.2s' }}>
                                        <XCircle size={13}/> {negotiatingId === b.id+'decline' ? 'Declining…' : 'Decline'}
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Negotiation result badge */}
                                {(b.negotiation_status === 'accepted' || b.negotiation_status === 'declined') && (
                                  <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'6px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700', marginBottom:'12px',
                                    background: b.negotiation_status === 'accepted' ? '#ecfdf5' : '#fef2f2',
                                    color:      b.negotiation_status === 'accepted' ? '#059669'  : '#dc2626',
                                    border:     `1px solid ${b.negotiation_status === 'accepted' ? '#a7f3d0' : '#fecaca'}`,
                                  }}>
                                    {b.negotiation_status === 'accepted'
                                      ? `✓ Price negotiated — ₹${parseFloat(b.proposed_price).toLocaleString('en-IN')}`
                                      : '✗ Price negotiation declined'}
                                  </div>
                                )}

                                {/* Action buttons */}
                                {actions.length > 0 && (
                                  <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                                    {actions.map(action => {
                                      const busy = updating === b.id + action.status
                                      return (
                                        <button key={action.status}
                                          onClick={() => handleStatusUpdate(b.id, action.status)}
                                          disabled={!!updating}
                                          style={{ display:'flex', alignItems:'center', gap:'7px', padding:'9px 18px', background:action.bg, color:action.color, border:`1.5px solid ${action.color}33`, borderRadius:'10px', fontWeight:'700', fontSize:'13px', cursor: updating ? 'wait' : 'pointer', opacity: busy ? 0.7 : 1, transition:'all 0.2s' }}
                                          onMouseOver={e=>{ if(!updating) e.currentTarget.style.opacity='0.85' }}
                                          onMouseOut={e=>{ if(!updating) e.currentTarget.style.opacity='1' }}>
                                          <action.icon size={13}/>
                                          {busy ? 'Updating…' : action.label}
                                        </button>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </AnimatePresence>
                )}
              </>
            )}

            {/* ── PROFILE SECTION ── */}
            {activeSection === 'profile' && profile && (
              <ProfileEditor profile={profile} onSaved={setProfile}/>
            )}

            {/* ── KYC SECTION ── */}
            {activeSection === 'kyc' && (
              <KYCSection/>
            )}

            {/* ── EARNINGS SECTION ── */}
            {activeSection === 'earnings' && (
              <EarningsSection data={earningsData} loading={earningsLoading} error={earningsError} onRetry={fetchEarnings}/>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── KYC section ── */
const ID_TYPES = [
  { value:'aadhaar',         label:'Aadhaar Card' },
  { value:'pan',             label:'PAN Card' },
  { value:'driving_license', label:'Driving License' },
  { value:'passport',        label:'Passport' },
]

const KYC_STATUS_META = {
  not_submitted:  { label:'Not Submitted',  color:'#64748b', bg:'#f8fafc', border:'#e2e8f0', icon:'📋' },
  pending_review: { label:'Under Review',   color:'#d97706', bg:'#fffbeb', border:'#fde68a', icon:'⏳' },
  verified:       { label:'Verified',       color:'#059669', bg:'#ecfdf5', border:'#a7f3d0', icon:'✅' },
  rejected:       { label:'Rejected',       color:'#dc2626', bg:'#fef2f2', border:'#fecaca', icon:'❌' },
}

function FileUploadField({ label, name, value, onChange, required, hint }) {
  const [preview, setPreview] = useState(null)
  const fileRef = useRef()

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    onChange(name, file)
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const hasExisting = value && typeof value === 'string'

  return (
    <div>
      <label style={{ display:'block', fontSize:'13px', fontWeight:'700', color:'#374151', marginBottom:'8px' }}>
        {label} {required && <span style={{ color:'#ef4444' }}>*</span>}
      </label>
      {hint && <p style={{ fontSize:'12px', color:'#94a3b8', marginBottom:'8px', marginTop:'-4px' }}>{hint}</p>}
      <div
        onClick={() => fileRef.current.click()}
        style={{ border:'2px dashed #d1d5db', borderRadius:'14px', padding:'20px', textAlign:'center', cursor:'pointer', background:'#f8fafc', transition:'all 0.2s', position:'relative', overflow:'hidden' }}
        onMouseOver={e => e.currentTarget.style.borderColor = '#7c3aed'}
        onMouseOut={e => e.currentTarget.style.borderColor = '#d1d5db'}>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display:'none' }}/>
        {preview ? (
          <img src={preview} alt="preview" style={{ maxHeight:'120px', maxWidth:'100%', borderRadius:'8px', objectFit:'cover' }}/>
        ) : hasExisting ? (
          <div>
            <img src={value} alt="current" style={{ maxHeight:'80px', maxWidth:'100%', borderRadius:'8px', objectFit:'cover', marginBottom:'8px' }}/>
            <p style={{ fontSize:'12px', color:'#64748b', margin:0 }}>Click to replace</p>
          </div>
        ) : (
          <div>
            <Upload size={28} color="#94a3b8" style={{ marginBottom:'8px' }}/>
            <p style={{ fontSize:'13px', color:'#64748b', margin:0 }}>Click to upload image</p>
            <p style={{ fontSize:'11px', color:'#94a3b8', margin:'4px 0 0' }}>JPG, PNG, max 5 MB</p>
          </div>
        )}
      </div>
    </div>
  )
}

function KYCSection() {
  const [kyc,      setKyc]      = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState('')
  const [form,     setForm]     = useState({ govt_id_type:'', govt_id_number:'' })
  const [files,    setFiles]    = useState({ id_front: null, id_back: null, selfie: null })
  const [focused,  setFocused]  = useState('')

  useEffect(() => {
    getMyKYC()
      .then(r => {
        setKyc(r.data)
        setForm({ govt_id_type: r.data.govt_id_type || '', govt_id_number: r.data.govt_id_number || '' })
      })
      .finally(() => setLoading(false))
  }, [])

  function handleFileChange(name, file) {
    setFiles(f => ({ ...f, [name]: file }))
    setSaved(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.govt_id_type) return setError('Please select an ID type.')
    if (!form.govt_id_number.trim()) return setError('Please enter your ID number.')
    if (!files.id_front && !kyc?.id_front) return setError('Please upload the front of your ID.')
    if (!files.selfie && !kyc?.selfie) return setError('Please upload a selfie with your ID.')

    setSaving(true)
    setError('')
    const fd = new FormData()
    fd.append('govt_id_type',   form.govt_id_type)
    fd.append('govt_id_number', form.govt_id_number)
    if (files.id_front) fd.append('id_front', files.id_front)
    if (files.id_back)  fd.append('id_back',  files.id_back)
    if (files.selfie)   fd.append('selfie',   files.selfie)

    try {
      const res = await submitKYC(fd)
      setKyc(res.data)
      setSaved(true)
    } catch (err) {
      setError(Object.values(err.response?.data || {}).flat().join(' ') || 'Submission failed.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}>
      <div style={{ width:'32px', height:'32px', border:'3px solid #e5e7eb', borderTopColor:'#7c3aed', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const status = kyc?.kyc_status || 'not_submitted'
  const meta   = KYC_STATUS_META[status] || KYC_STATUS_META.not_submitted
  const canEdit = status === 'not_submitted' || status === 'rejected'

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>

      {/* Status Banner */}
      <div style={{ background:meta.bg, border:`1.5px solid ${meta.border}`, borderRadius:'20px', padding:'24px 28px', display:'flex', alignItems:'center', gap:'16px' }}>
        <span style={{ fontSize:'32px' }}>{meta.icon}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'16px', fontWeight:'800', color:meta.color }}>{meta.label}</div>
          {status === 'not_submitted' && (
            <p style={{ margin:'4px 0 0', fontSize:'13px', color:'#64748b' }}>
              Complete KYC to get a verified badge on your profile and earn customer trust.
            </p>
          )}
          {status === 'pending_review' && (
            <p style={{ margin:'4px 0 0', fontSize:'13px', color:'#92400e' }}>
              Your documents are being reviewed. This usually takes 1–2 business days.
            </p>
          )}
          {status === 'verified' && (
            <p style={{ margin:'4px 0 0', fontSize:'13px', color:'#065f46' }}>
              Your identity is verified. A ✓ Verified badge is shown on your public profile.
            </p>
          )}
          {status === 'rejected' && (
            <div>
              <p style={{ margin:'4px 0 0', fontSize:'13px', color:'#991b1b' }}>
                Your documents were rejected. Please re-submit with clearer images.
              </p>
              {kyc?.rejection_reason && (
                <p style={{ margin:'8px 0 0', fontSize:'13px', fontWeight:'700', color:'#dc2626', background:'#fee2e2', padding:'8px 12px', borderRadius:'8px', display:'inline-block' }}>
                  Reason: {kyc.rejection_reason}
                </p>
              )}
            </div>
          )}
        </div>
        {status === 'verified' && (
          <ShieldCheck size={36} color="#059669"/>
        )}
      </div>

      {/* What is KYC info card */}
      {status === 'not_submitted' && (
        <div style={{ background:'white', borderRadius:'20px', padding:'24px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize:'14px', fontWeight:'800', color:'#0f172a', marginBottom:'16px' }}>Why verify?</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            {[
              { icon:'🔒', title:'Build Trust',      desc:'Verified badge on your profile reassures customers' },
              { icon:'📈', title:'More Bookings',    desc:'Customers prefer verified providers — you get priority listing' },
              { icon:'💰', title:'Higher Payouts',   desc:'Verified providers unlock higher earning limits' },
              { icon:'🛡️', title:'Platform Safety',  desc:'Keeps the marketplace safe for everyone' },
            ].map(item => (
              <div key={item.title} style={{ display:'flex', gap:'12px', padding:'14px', background:'#f8fafc', borderRadius:'12px' }}>
                <span style={{ fontSize:'20px' }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize:'13px', fontWeight:'700', color:'#0f172a' }}>{item.title}</div>
                  <div style={{ fontSize:'11px', color:'#64748b', marginTop:'2px' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submission form — shown for not_submitted and rejected */}
      {canEdit && (
        <form onSubmit={handleSubmit}>
          <div style={{ background:'white', borderRadius:'24px', padding:'32px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', display:'flex', flexDirection:'column', gap:'24px' }}>
            <h2 style={{ fontSize:'16px', fontWeight:'800', color:'#0f172a', margin:0 }}>Identity Documents</h2>

            {/* ID Type */}
            <div>
              <label style={{ display:'block', fontSize:'13px', fontWeight:'700', color:'#374151', marginBottom:'8px' }}>
                Government ID Type <span style={{ color:'#ef4444' }}>*</span>
              </label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'10px' }}>
                {ID_TYPES.map(t => (
                  <div key={t.value}
                    onClick={() => { setForm(f => ({...f, govt_id_type: t.value})); setSaved(false) }}
                    style={{ padding:'13px 16px', borderRadius:'12px', border:`2px solid ${form.govt_id_type === t.value ? '#7c3aed' : '#e5e7eb'}`, background: form.govt_id_type === t.value ? '#faf5ff' : 'white', cursor:'pointer', fontSize:'14px', fontWeight: form.govt_id_type === t.value ? '700' : '500', color: form.govt_id_type === t.value ? '#6d28d9' : '#374151', transition:'all 0.15s' }}>
                    {t.label}
                  </div>
                ))}
              </div>
            </div>

            {/* ID Number */}
            <div>
              <label style={{ display:'block', fontSize:'13px', fontWeight:'700', color:'#374151', marginBottom:'8px' }}>
                ID Number <span style={{ color:'#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={form.govt_id_number}
                onChange={e => { setForm(f => ({...f, govt_id_number: e.target.value})); setSaved(false) }}
                placeholder={form.govt_id_type === 'aadhaar' ? '1234 5678 9012' : form.govt_id_type === 'pan' ? 'ABCDE1234F' : 'Enter ID number'}
                onFocus={() => setFocused('id_number')}
                onBlur={() => setFocused('')}
                style={{ width:'100%', padding:'13px 16px', border:`2px solid ${focused === 'id_number' ? '#7c3aed' : '#e5e7eb'}`, borderRadius:'12px', fontSize:'14px', color:'#0f172a', outline:'none', background:'white', transition:'border 0.2s', boxSizing:'border-box', fontFamily:'inherit', letterSpacing:'0.5px' }}
              />
            </div>

            {/* File uploads */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
              <FileUploadField
                label="ID — Front" name="id_front" required
                value={kyc?.id_front} onChange={handleFileChange}
                hint="Clear photo of the front of your ID"
              />
              <FileUploadField
                label="ID — Back (optional)" name="id_back"
                value={kyc?.id_back} onChange={handleFileChange}
                hint="Back of ID if applicable"
              />
            </div>
            <FileUploadField
              label="Selfie holding your ID" name="selfie" required
              value={kyc?.selfie} onChange={handleFileChange}
              hint="Hold your ID next to your face — must be clearly readable"
            />

            {error && (
              <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'12px 16px', background:'#fef2f2', borderRadius:'12px', border:'1px solid #fecaca', color:'#dc2626', fontSize:'13px' }}>
                <AlertCircle size={14}/> {error}
              </div>
            )}

            <button type="submit" disabled={saving}
              style={{ padding:'15px', background: saved ? 'linear-gradient(135deg,#059669,#047857)' : 'linear-gradient(135deg,#7c3aed,#4338ca)', color:'white', border:'none', borderRadius:'14px', fontWeight:'800', fontSize:'14px', cursor: saving ? 'wait' : 'pointer', boxShadow:'0 4px 16px rgba(124,58,237,0.3)', transition:'all 0.3s', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
              <ShieldCheck size={16}/>
              {saving ? 'Submitting…' : saved ? '✓ Submitted for Review!' : 'Submit for Verification'}
            </button>
          </div>
        </form>
      )}

      {/* Read-only view for pending/verified */}
      {!canEdit && kyc && (
        <div style={{ background:'white', borderRadius:'24px', padding:'32px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize:'16px', fontWeight:'800', color:'#0f172a', marginBottom:'20px' }}>Submitted Documents</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            <Row label="ID Type"   value={ID_TYPES.find(t => t.value === kyc.govt_id_type)?.label || '—'}/>
            <Row label="ID Number" value={kyc.govt_id_number || '—'}/>
            {kyc.submitted_at && (
              <Row label="Submitted" value={new Date(kyc.submitted_at).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}/>
            )}
          </div>
          {kyc.id_front && (
            <div style={{ marginTop:'20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              {[['ID Front', kyc.id_front], ['Selfie', kyc.selfie], kyc.id_back && ['ID Back', kyc.id_back]].filter(Boolean).map(([lbl, src]) => (
                <div key={lbl}>
                  <p style={{ fontSize:'12px', fontWeight:'700', color:'#94a3b8', marginBottom:'6px', textTransform:'uppercase' }}>{lbl}</p>
                  <img src={src} alt={lbl} style={{ width:'100%', borderRadius:'12px', objectFit:'cover', maxHeight:'160px', border:'1px solid #f1f5f9' }}/>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Earnings section ── */
function EarningsSection({ data, loading, error, onRetry }) {
  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}>
      <div style={{ width:'32px', height:'32px', border:'3px solid #e5e7eb', borderTopColor:'#7c3aed', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (error) return (
    <div style={{ textAlign:'center', padding:'60px 0' }}>
      <div style={{ fontSize:'40px', marginBottom:'16px' }}>⚠️</div>
      <p style={{ color:'#dc2626', fontWeight:'700', marginBottom:'12px' }}>{error}</p>
      <button onClick={onRetry}
        style={{ padding:'10px 24px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', color:'white', border:'none', borderRadius:'12px', fontWeight:'700', fontSize:'13px', cursor:'pointer' }}>
        Try Again
      </button>
    </div>
  )

  const { total_earned = 0, this_month = 0, last_month = 0, total_jobs = 0, monthly = [], recent = [] } = data || {}
  const maxAmount = Math.max(...monthly.map(m => m.amount), 1)
  const monthDiff = this_month - last_month
  const monthPct  = last_month > 0 ? Math.round((monthDiff / last_month) * 100) : null

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
        {[
          { label:'Total Earned', value: total_earned,  sub: `${total_jobs} completed jobs`, color:'#7c3aed', bg:'#f5f3ff' },
          { label:'This Month',   value: this_month,    pct: monthPct, color:'#059669', bg:'#ecfdf5' },
          { label:'Last Month',   value: last_month,    sub: 'Previous month total', color:'#0ea5e9', bg:'#f0f9ff' },
        ].map(({ label, value, sub, pct, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3, delay:i*0.07 }}
            style={{ background:'white', borderRadius:'20px', padding:'24px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ width:'40px', height:'40px', background:bg, borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'14px' }}>
              <IndianRupee size={18} color={color}/>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'3px', fontSize:'24px', fontWeight:'900', color:'#0f172a', marginBottom:'4px' }}>
              <IndianRupee size={16} strokeWidth={2.5}/>
              {parseFloat(value).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize:'13px', color:'#94a3b8', fontWeight:'500', marginBottom:'6px' }}>{label}</div>
            <div style={{ fontSize:'12px', color:'#64748b' }}>
              {pct !== undefined && pct !== null ? <EarningsTrend pct={pct}/> : sub}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Monthly bar chart */}
      {monthly.length > 0 && (
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
          style={{ background:'white', borderRadius:'20px', padding:'28px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize:'14px', fontWeight:'800', color:'#0f172a', marginBottom:'24px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Monthly Breakdown</h3>
          <div style={{ display:'flex', gap:'10px', alignItems:'flex-end', height:'160px' }}>
            {[...monthly].reverse().map((m, i) => {
              const pct = (m.amount / maxAmount) * 100
              return (
                <div key={m.month} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', height:'100%', justifyContent:'flex-end' }}>
                  <div style={{ fontSize:'10px', fontWeight:'700', color:'#7c3aed' }}>
                    ₹{m.amount >= 1000 ? (m.amount / 1000).toFixed(1) + 'k' : m.amount}
                  </div>
                  <motion.div
                    initial={{ height:0 }} animate={{ height:`${pct}%` }}
                    transition={{ duration:0.6, delay: i * 0.08 }}
                    style={{ width:'100%', background:'linear-gradient(180deg,#7c3aed,#4338ca)', borderRadius:'8px 8px 0 0', minHeight:'4px' }}/>
                  <div style={{ fontSize:'10px', color:'#94a3b8', textAlign:'center', whiteSpace:'nowrap' }}>{m.month}</div>
                  <div style={{ fontSize:'10px', color:'#64748b' }}>{m.jobs} job{m.jobs !== 1 ? 's' : ''}</div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Recent completed jobs */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4, delay:0.1 }}
        style={{ background:'white', borderRadius:'20px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', overflow:'hidden' }}>
        <div style={{ padding:'24px 28px 0' }}>
          <h3 style={{ fontSize:'14px', fontWeight:'800', color:'#0f172a', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'18px' }}>Recent Completed Jobs</h3>
        </div>
        {!recent.length ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'#94a3b8' }}>
            <Briefcase size={36} style={{ marginBottom:'12px', opacity:0.4 }}/>
            <p style={{ margin:0, fontSize:'14px' }}>No completed jobs yet</p>
          </div>
        ) : (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 130px 110px 90px', gap:'12px', padding:'10px 28px', background:'#f8fafc', fontSize:'11px', fontWeight:'700', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.5px', borderTop:'1px solid #f1f5f9' }}>
              <span>Service</span><span>Customer</span><span>Date</span><span style={{ textAlign:'right' }}>Amount</span>
            </div>
            {recent.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.25, delay:i*0.04 }}
                style={{ display:'grid', gridTemplateColumns:'1fr 130px 110px 90px', gap:'12px', padding:'14px 28px', borderTop:'1px solid #f8fafc', alignItems:'center', transition:'background 0.15s' }}
                onMouseOver={e => e.currentTarget.style.background='#fafafa'}
                onMouseOut={e => e.currentTarget.style.background='white'}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <div style={{ width:'34px', height:'34px', borderRadius:'10px', background:'#f5f3ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px', flexShrink:0 }}>
                    {b.service_icon || '🔧'}
                  </div>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:'700', color:'#0f172a' }}>{b.service_name}</div>
                    <div style={{ fontSize:'11px', color:'#94a3b8' }}>#{b.id}</div>
                  </div>
                </div>
                <span style={{ fontSize:'13px', color:'#374151', fontWeight:'600' }}>{b.customer_name}</span>
                <span style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'12px', color:'#64748b' }}>
                  <Calendar size={11}/>
                  {new Date(b.scheduled_date).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                </span>
                <span style={{ display:'flex', alignItems:'center', gap:'2px', fontSize:'14px', fontWeight:'900', color:'#059669', justifyContent:'flex-end' }}>
                  <IndianRupee size={11} strokeWidth={2.5}/>
                  {parseFloat(b.total_price || 0).toLocaleString('en-IN')}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

    </div>
  )
}

function EarningsTrend({ pct }) {
  if (pct === 0) return <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', color:'#64748b' }}><Minus size={11}/> Same as last month</span>
  const up = pct > 0
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', fontWeight:'700', color: up ? '#059669' : '#dc2626' }}>
      {up ? <ArrowUp size={11}/> : <ArrowDown size={11}/>}
      {Math.abs(pct)}% vs last month
    </span>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #f8fafc' }}>
      <span style={{ fontSize:'13px', color:'#64748b' }}>{label}</span>
      <span style={{ fontSize:'14px', fontWeight:'700', color:'#0f172a' }}>{value}</span>
    </div>
  )
}

/* ── Profile editor sub-component ── */
function ProfileEditor({ profile, onSaved }) {
  const [form, setForm] = useState({
    bio:              profile.bio              || '',
    experience_years: profile.experience_years || 0,
    hourly_rate:      profile.hourly_rate      || '',
    city:             profile.city             || '',
  })
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')
  const [focused, setFocused] = useState('')

  // Service management — each entry is { id, price }
  const [allServices,      setAllServices]      = useState([])
  const [selectedServices, setSelectedServices] = useState(
    (profile.services || []).map(s => ({ id: s.id, price: s.custom_price ?? s.base_price ?? '' }))
  )
  const [serviceSearch, setServiceSearch] = useState('')

  useEffect(() => {
    getServices().then(r => setAllServices(r.data.results ?? r.data))
  }, [])

  const filteredServices = allServices.filter(s =>
    s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    s.category_name?.toLowerCase().includes(serviceSearch.toLowerCase())
  )

  function toggleService(svc) {
    const isSelected = selectedServices.some(s => s.id === svc.id)
    if (isSelected) {
      setSelectedServices(prev => prev.filter(s => s.id !== svc.id))
    } else {
      setSelectedServices(prev => [...prev, { id: svc.id, price: svc.base_price ?? '' }])
    }
    setSaved(false)
  }

  function updateServicePrice(id, price) {
    setSelectedServices(prev => prev.map(s => s.id === id ? { ...s, price } : s))
    setSaved(false)
  }

  function handle(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setSaved(false)
    setError('')
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const servicesPayload = selectedServices.map(s => ({
        id: s.id,
        custom_price: s.price !== '' && s.price !== null ? s.price : null,
      }))
      const res = await updateMyProfile({ ...form, services: servicesPayload })
      onSaved(res.data)
      setSaved(true)
    } catch (err) {
      setError(Object.values(err.response?.data || {}).flat().join(' ') || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const inp = (field) => ({
    name: field, value: form[field], onChange: handle,
    onFocus: () => setFocused(field), onBlur: () => setFocused(''),
    style: {
      width:'100%', padding:'13px 16px', border:`2px solid ${focused===field ? '#7c3aed' : '#e5e7eb'}`,
      borderRadius:'12px', fontSize:'14px', color:'#0f172a', outline:'none',
      background:'white', transition:'border 0.2s', boxSizing:'border-box', fontFamily:'inherit',
    },
  })

  // Group services by category
  const grouped = filteredServices.reduce((acc, s) => {
    const cat = s.category_name || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {})

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>

      {/* ── Basic info form ── */}
      <form onSubmit={save}>
        <div style={{ background:'white', borderRadius:'24px', padding:'32px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', display:'flex', flexDirection:'column', gap:'20px' }}>
          <h2 style={{ fontSize:'16px', fontWeight:'800', color:'#0f172a', margin:0 }}>Basic Info</h2>

          <div>
            <label style={{ display:'block', fontSize:'13px', fontWeight:'700', color:'#374151', marginBottom:'8px' }}>Bio</label>
            <textarea rows={4} {...inp('bio')} placeholder="Tell customers about yourself and your expertise…"/>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
            <div>
              <label style={{ display:'block', fontSize:'13px', fontWeight:'700', color:'#374151', marginBottom:'8px' }}>Experience (years)</label>
              <input type="number" min={0} max={50} {...inp('experience_years')}/>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'13px', fontWeight:'700', color:'#374151', marginBottom:'8px' }}>Hourly Rate (₹)</label>
              <input type="number" min={0} step="0.01" {...inp('hourly_rate')}/>
            </div>
          </div>

          <div>
            <label style={{ display:'block', fontSize:'13px', fontWeight:'700', color:'#374151', marginBottom:'8px' }}>City</label>
            <input type="text" {...inp('city')} placeholder="Mumbai, Delhi, Bangalore…"/>
          </div>

          {error && (
            <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'12px 16px', background:'#fef2f2', borderRadius:'12px', border:'1px solid #fecaca', color:'#dc2626', fontSize:'13px' }}>
              <AlertCircle size={14}/> {error}
            </div>
          )}

          <button type="submit" disabled={saving}
            style={{ padding:'14px', background: saved ? 'linear-gradient(135deg,#059669,#047857)' : 'linear-gradient(135deg,#7c3aed,#4338ca)', color:'white', border:'none', borderRadius:'14px', fontWeight:'800', fontSize:'14px', cursor: saving ? 'wait' : 'pointer', boxShadow:'0 4px 16px rgba(124,58,237,0.3)', opacity: saving ? 0.75 : 1, transition:'all 0.3s' }}>
            {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* ── Services I offer ── */}
      <div style={{ background:'white', borderRadius:'24px', padding:'32px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'6px' }}>
          <h2 style={{ fontSize:'16px', fontWeight:'800', color:'#0f172a', margin:0 }}>Services I Offer</h2>
          <span style={{ fontSize:'12px', fontWeight:'700', padding:'4px 10px', borderRadius:'20px', background:'#f5f3ff', color:'#7c3aed' }}>
            {selectedServices.length} selected
          </span>
        </div>
        <p style={{ fontSize:'13px', color:'#64748b', marginBottom:'20px' }}>
          Select every service you can perform. Customers filter providers by service, so keeping this up-to-date gets you more bookings.
        </p>

        {/* Search */}
        <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', border:'2px solid #e5e7eb', borderRadius:'12px', marginBottom:'20px', transition:'border 0.2s' }}
          onFocusCapture={e=>e.currentTarget.style.borderColor='#7c3aed'}
          onBlurCapture={e=>e.currentTarget.style.borderColor='#e5e7eb'}>
          <Search size={15} color="#94a3b8" style={{ flexShrink:0 }}/>
          <input value={serviceSearch} onChange={e=>setServiceSearch(e.target.value)}
            placeholder="Search services…"
            style={{ border:'none', outline:'none', fontSize:'14px', color:'#0f172a', background:'transparent', flex:1 }}/>
          {serviceSearch && (
            <button onClick={()=>setServiceSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', display:'flex', padding:'2px' }}>
              <X size={14}/>
            </button>
          )}
        </div>

        {/* Selected chips row */}
        {selectedServices.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'20px', padding:'16px', background:'#f5f3ff', borderRadius:'14px', border:'1px solid #ddd6fe' }}>
            {selectedServices.map(({ id, price }) => {
              const svc = allServices.find(s => s.id === id)
              if (!svc) return null
              return (
                <span key={id} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'5px 12px', background:'white', border:'1.5px solid #ddd6fe', borderRadius:'100px', fontSize:'12px', fontWeight:'700', color:'#7c3aed' }}>
                  {svc.name} · ₹{price || svc.base_price}
                  <button onClick={() => toggleService(svc)} style={{ background:'none', border:'none', cursor:'pointer', color:'#a78bfa', display:'flex', padding:'0', lineHeight:1 }}>
                    <X size={12}/>
                  </button>
                </span>
              )
            })}
          </div>
        )}

        {/* Service list grouped by category */}
        {Object.keys(grouped).length === 0 ? (
          <p style={{ textAlign:'center', color:'#94a3b8', fontSize:'13px', padding:'20px 0' }}>No services match your search.</p>
        ) : (
          Object.entries(grouped).map(([cat, services]) => (
            <div key={cat} style={{ marginBottom:'20px' }}>
              <p style={{ fontSize:'11px', fontWeight:'800', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'10px' }}>{cat}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {services.map(svc => {
                  const entry   = selectedServices.find(s => s.id === svc.id)
                  const selected = !!entry
                  return (
                    <motion.div key={svc.id} whileTap={{ scale:0.98 }}
                      style={{ borderRadius:'14px', border:`2px solid ${selected ? '#7c3aed' : '#f1f5f9'}`, background: selected ? '#faf5ff' : 'white', overflow:'hidden', transition:'all 0.15s' }}>
                      {/* Top row — click to toggle */}
                      <div onClick={() => toggleService(svc)}
                        style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 16px', cursor:'pointer', userSelect:'none' }}>
                        <div style={{ width:'20px', height:'20px', borderRadius:'6px', border:`2px solid ${selected ? '#7c3aed' : '#d1d5db'}`, background: selected ? '#7c3aed' : 'white', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' }}>
                          {selected && <CheckCircle size={13} color="white" strokeWidth={3}/>}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:'14px', fontWeight: selected ? '700' : '600', color: selected ? '#6d28d9' : '#0f172a' }}>{svc.name}</div>
                          <div style={{ fontSize:'11px', color:'#94a3b8', marginTop:'2px' }}>
                            Platform base ₹{parseFloat(svc.base_price).toLocaleString('en-IN')} · {svc.duration_display}
                          </div>
                        </div>
                        {selected && (
                          <span style={{ fontSize:'11px', fontWeight:'700', color:'#7c3aed', background:'#ede9fe', padding:'3px 8px', borderRadius:'20px', whiteSpace:'nowrap' }}>Added ✓</span>
                        )}
                      </div>

                      {/* Price input — visible only when selected */}
                      {selected && (
                        <div onClick={e => e.stopPropagation()}
                          style={{ padding:'0 16px 14px', display:'flex', alignItems:'center', gap:'10px' }}>
                          <span style={{ fontSize:'12px', fontWeight:'700', color:'#374151', whiteSpace:'nowrap' }}>Your price (₹)</span>
                          <div style={{ display:'flex', alignItems:'center', gap:'0', border:'2px solid #ddd6fe', borderRadius:'10px', overflow:'hidden', background:'white', flex:1, maxWidth:'180px' }}>
                            <span style={{ padding:'8px 10px', fontSize:'13px', color:'#7c3aed', fontWeight:'700', background:'#f5f3ff', borderRight:'2px solid #ddd6fe' }}>₹</span>
                            <input
                              type="number" min="0" step="1"
                              value={entry.price}
                              placeholder={svc.base_price}
                              onChange={e => updateServicePrice(svc.id, e.target.value)}
                              style={{ flex:1, border:'none', outline:'none', padding:'8px 10px', fontSize:'13px', color:'#0f172a', fontWeight:'700', background:'transparent' }}
                            />
                          </div>
                          <span style={{ fontSize:'11px', color:'#94a3b8' }}>leave blank for base price</span>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))
        )}

        {/* Note about missing services */}
        <div style={{ marginTop:'16px', padding:'14px 16px', background:'#f8fafc', borderRadius:'12px', border:'1px solid #e5e7eb' }}>
          <p style={{ fontSize:'12px', color:'#64748b', margin:0, lineHeight:1.6 }}>
            💡 <strong>Don't see your service?</strong> Services are managed by the platform admin. Contact support to have a new service category added.
          </p>
        </div>

        <button onClick={save} disabled={saving}
          style={{ marginTop:'20px', width:'100%', padding:'14px', background: saved ? 'linear-gradient(135deg,#059669,#047857)' : 'linear-gradient(135deg,#7c3aed,#4338ca)', color:'white', border:'none', borderRadius:'14px', fontWeight:'800', fontSize:'14px', cursor: saving ? 'wait' : 'pointer', boxShadow:'0 4px 16px rgba(124,58,237,0.3)', transition:'all 0.3s' }}>
          {saving ? 'Saving…' : saved ? '✓ Services Saved!' : `Save Services (${selectedServices.length} service${selectedServices.length !== 1 ? 's' : ''})`}
        </button>
      </div>

      {/* Stats card */}
      <div style={{ background:'white', borderRadius:'24px', padding:'28px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize:'14px', fontWeight:'800', color:'#0f172a', marginBottom:'20px' }}>Your Stats</h3>
        {[
          { label:'Avg Rating',     value: parseFloat(profile.avg_rating || 0).toFixed(1) + ' ★', color:'#f59e0b' },
          { label:'Total Reviews',  value: profile.total_reviews,    color:'#3b82f6' },
          { label:'Jobs Done',      value: profile.total_jobs,       color:'#059669' },
          { label:'Hourly Rate',    value: '₹' + parseFloat(profile.hourly_rate || 0).toLocaleString('en-IN'), color:'#8b5cf6' },
        ].map(s => (
          <div key={s.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #f8fafc' }}>
            <span style={{ fontSize:'13px', color:'#64748b' }}>{s.label}</span>
            <span style={{ fontSize:'15px', fontWeight:'800', color:s.color }}>{s.value}</span>
          </div>
        ))}
        <div style={{ marginTop:'16px', padding:'12px 16px', background: profile.is_available ? '#ecfdf5' : '#f8fafc', borderRadius:'12px', display:'flex', alignItems:'center', gap:'8px' }}>
          <div style={{ width:'8px', height:'8px', borderRadius:'50%', background: profile.is_available ? '#34d399' : '#94a3b8', boxShadow: profile.is_available ? '0 0 6px #34d399' : 'none' }}/>
          <span style={{ fontSize:'13px', fontWeight:'700', color: profile.is_available ? '#059669' : '#64748b' }}>
            {profile.is_available ? 'Currently Available' : 'Currently Unavailable'}
          </span>
        </div>
      </div>
    </div>
  )
}
