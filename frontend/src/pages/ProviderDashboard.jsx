import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LogOut, Star, Briefcase, IndianRupee, Calendar, Clock, MapPin,
  CheckCircle, ChevronRight, TrendingUp, Bell, Settings, User,
  PlayCircle, XCircle, AlertCircle, ToggleLeft, ToggleRight, Edit3,
} from 'lucide-react'
import Logo from '../components/layout/Logo'
import useAuthStore from '../store/authStore'
import {
  getMyProfile, updateMyProfile,
  getProviderBookings, updateBookingStatus,
} from '../api/provider'

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
  const [updating,  setUpdating]    = useState(null)
  const [togglingAvail, setTogglingAvail] = useState(false)
  const [activeSection, setActiveSection] = useState('bookings') // bookings | profile

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

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:'system-ui,-apple-system,sans-serif' }}>

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
              { key:'earnings', icon:TrendingUp,  label:'Earnings',  link:'/provider/earnings' },
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
                {activeSection === 'bookings' ? 'Booking Management' : 'My Profile'}
              </h1>
              <p style={{ color:'#64748b', fontSize:'14px' }}>
                {activeSection === 'bookings'
                  ? 'Review and update your assigned jobs'
                  : 'Manage your provider profile and settings'}
              </p>
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
          </div>
        </div>
      </div>
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

  function handle(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setSaved(false)
    setError('')
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await updateMyProfile(form)
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

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:'24px', alignItems:'start' }}>
      <form onSubmit={save}>
        <div style={{ background:'white', borderRadius:'24px', padding:'32px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', display:'flex', flexDirection:'column', gap:'20px' }}>
          <h2 style={{ fontSize:'16px', fontWeight:'800', color:'#0f172a', margin:0 }}>Edit Profile</h2>

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
            style={{ padding:'14px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', color:'white', border:'none', borderRadius:'14px', fontWeight:'800', fontSize:'14px', cursor: saving ? 'wait' : 'pointer', boxShadow:'0 4px 16px rgba(124,58,237,0.3)', opacity: saving ? 0.75 : 1, transition:'all 0.2s' }}>
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Stats card */}
      <div style={{ background:'white', borderRadius:'24px', padding:'28px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', position:'sticky', top:'24px' }}>
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
