import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users, Calendar, BarChart2, ShieldCheck, LogOut,
  Search, CheckCircle, XCircle, TrendingUp, IndianRupee,
  RefreshCw, UserCheck, AlertCircle, Wrench, Plus, Pencil, Trash2, Lightbulb,
} from 'lucide-react'
import Logo from '../components/layout/Logo'
import useAuthStore from '../store/authStore'
import {
  getStats, getAdminUsers, toggleUserActive, getAdminBookings, getAdminProviders, toggleVerified, getAdminKYCList, reviewKYC,
  getAdminCategories, createCategory, updateCategory, deleteCategory,
  getAdminServices, createService, updateService, deleteService,
  getAdminSuggestions, reviewSuggestion,
} from '../api/admin'

const SECTIONS = [
  { key: 'overview',  icon: BarChart2,   label: 'Overview' },
  { key: 'users',     icon: Users,       label: 'Users' },
  { key: 'bookings',  icon: Calendar,    label: 'Bookings' },
  { key: 'providers', icon: ShieldCheck, label: 'Providers' },
  { key: 'kyc',       icon: UserCheck,   label: 'KYC Review' },
  { key: 'services',  icon: Wrench,      label: 'Services' },
]

const STATUS_COLOR = {
  pending:     '#f59e0b',
  confirmed:   '#3b82f6',
  in_progress: '#8b5cf6',
  completed:   '#059669',
  cancelled:   '#dc2626',
}

function Badge({ label, color, bg }) {
  return (
    <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: bg || color + '18', color }}>
      {label}
    </span>
  )
}

function StatCard({ icon: Icon, label, value, sub, color, bg, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ width: '44px', height: '44px', background: bg, borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <Icon size={20} color={color} />
        </div>
        <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>{value}</div>
        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{label}</div>
        {sub && <div style={{ fontSize: '12px', color: color, fontWeight: '600', marginTop: '6px' }}>{sub}</div>}
      </div>
    </motion.div>
  )
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div style={{ position: 'relative', width: '280px' }}>
      <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '10px 12px 10px 34px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '13px', outline: 'none', color: '#0f172a', boxSizing: 'border-box', transition: 'border 0.2s' }}
        onFocus={e => e.target.style.borderColor = '#7c3aed'}
        onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
    </div>
  )
}

export default function AdminPanel() {
  const { user, logout }          = useAuthStore()
  const navigate                  = useNavigate()
  const [section, setSection]     = useState('overview')
  const [stats,   setStats]       = useState(null)
  const [users,   setUsers]       = useState([])
  const [bookings,setBookings]    = useState([])
  const [providers,setProviders]  = useState([])
  const [kycList, setKycList]     = useState([])
  const [loading, setLoading]     = useState(false)
  const [search,  setSearch]      = useState('')
  const [toggling,setToggling]    = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter,   setRoleFilter]   = useState('')
  const [kycFilter,    setKycFilter]    = useState('pending_review')
  const [rejectModal,  setRejectModal]  = useState(null)  // kyc id being rejected
  const [rejectReason, setRejectReason] = useState('')

  // Services section state
  const [svcSubTab,       setSvcSubTab]       = useState('categories')
  const [categories,      setCategories]      = useState([])
  const [svcs,            setSvcs]            = useState([])
  const [suggestions,     setSuggestions]     = useState([])
  const [suggFilter,      setSuggFilter]      = useState('pending')
  const [catModal,        setCatModal]        = useState(null)   // {mode:'add'|'edit', data:{}}
  const [svcModal,        setSvcModal]        = useState(null)   // {mode:'add'|'edit', data:{}}
  const [deleteConfirm,   setDeleteConfirm]   = useState(null)   // {type:'category'|'service', id, name}
  const [approveModal,    setApproveModal]    = useState(null)   // suggestion object
  const [approveForm,     setApproveForm]     = useState({ base_price: '', duration_minutes: 60 })
  const [rejectSuggModal, setRejectSuggModal] = useState(null)
  const [rejectSuggReason,setRejectSuggReason]= useState('')
  const [svcFormData,     setSvcFormData]     = useState({ name:'', category:'', description:'', base_price:'', duration_minutes:60, is_active:true })
  const [catFormData,     setCatFormData]     = useState({ name:'', icon:'wrench', description:'', is_active:true, order:0 })

  // Load stats once
  useEffect(() => {
    getStats().then(r => setStats(r.data)).catch(() => {})
  }, [])

  const loadSection = useCallback(() => {
    setLoading(true)
    if (section === 'users') {
      const params = {}
      if (search)     params.search = search
      if (roleFilter) params.role   = roleFilter
      getAdminUsers(params).then(r => setUsers(r.data.results ?? r.data)).finally(() => setLoading(false))
    } else if (section === 'bookings') {
      const params = {}
      if (search)       params.search = search
      if (statusFilter) params.status = statusFilter
      getAdminBookings(params).then(r => setBookings(r.data.results ?? r.data)).finally(() => setLoading(false))
    } else if (section === 'providers') {
      const params = {}
      if (search) params.search = search
      getAdminProviders(params).then(r => setProviders(r.data.results ?? r.data)).finally(() => setLoading(false))
    } else if (section === 'kyc') {
      const params = {}
      if (kycFilter) params.kyc_status = kycFilter
      getAdminKYCList(params).then(r => setKycList(r.data.results ?? r.data)).finally(() => setLoading(false))
    } else if (section === 'services') {
      if (svcSubTab === 'categories') {
        getAdminCategories().then(r => setCategories(r.data.results ?? r.data)).finally(() => setLoading(false))
      } else if (svcSubTab === 'services') {
        getAdminServices().then(r => setSvcs(r.data.results ?? r.data)).finally(() => setLoading(false))
      } else if (svcSubTab === 'suggestions') {
        const params = suggFilter ? { status: suggFilter } : {}
        getAdminSuggestions(params).then(r => setSuggestions(r.data.results ?? r.data)).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [section, search, roleFilter, statusFilter, kycFilter, svcSubTab, suggFilter])

  useEffect(() => { loadSection() }, [loadSection])

  // Pre-load categories when entering services section (needed for service form dropdown)
  useEffect(() => {
    if (section === 'services' && categories.length === 0) {
      getAdminCategories().then(r => setCategories(r.data.results ?? r.data)).catch(() => {})
    }
  }, [section]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleToggleUser(id) {
    setToggling(id)
    try {
      const res = await toggleUserActive(id)
      setUsers(prev => prev.map(u => u.id === id ? res.data : u))
    } finally { setToggling(null) }
  }

  async function handleToggleVerified(id) {
    setToggling(id)
    try {
      const res = await toggleVerified(id)
      setProviders(prev => prev.map(p => p.id === id ? res.data : p))
    } finally { setToggling(null) }
  }

  async function handleKYCApprove(id) {
    setToggling(id)
    try {
      const res = await reviewKYC(id, { action: 'approve' })
      setKycList(prev => prev.map(k => k.id === id ? res.data : k))
    } finally { setToggling(null) }
  }

  async function handleKYCReject() {
    if (!rejectModal) return
    setToggling(rejectModal)
    try {
      const res = await reviewKYC(rejectModal, { action: 'reject', rejection_reason: rejectReason })
      setKycList(prev => prev.map(k => k.id === rejectModal ? res.data : k))
      setRejectModal(null)
      setRejectReason('')
    } finally { setToggling(null) }
  }

  // ── Service section handlers ──────────────────────────────────────────────
  async function handleSaveCat(e) {
    e.preventDefault()
    setToggling('cat-save')
    try {
      if (catModal.mode === 'add') {
        const res = await createCategory(catFormData)
        setCategories(prev => [...prev, res.data])
      } else {
        const res = await updateCategory(catModal.data.id, catFormData)
        setCategories(prev => prev.map(c => c.id === catModal.data.id ? res.data : c))
      }
      setCatModal(null)
    } catch (err) {
      alert(err.response?.data?.name?.[0] || err.response?.data?.detail || 'Failed to save category.')
    } finally { setToggling(null) }
  }

  async function handleSaveSvc(e) {
    e.preventDefault()
    setToggling('svc-save')
    try {
      if (svcModal.mode === 'add') {
        const res = await createService(svcFormData)
        setSvcs(prev => [...prev, res.data])
      } else {
        const res = await updateService(svcModal.data.id, svcFormData)
        setSvcs(prev => prev.map(s => s.id === svcModal.data.id ? res.data : s))
      }
      setSvcModal(null)
    } catch (err) {
      alert(err.response?.data?.name?.[0] || err.response?.data?.detail || 'Failed to save service.')
    } finally { setToggling(null) }
  }

  async function handleDelete() {
    if (!deleteConfirm) return
    setToggling('delete')
    try {
      if (deleteConfirm.type === 'category') {
        await deleteCategory(deleteConfirm.id)
        setCategories(prev => prev.filter(c => c.id !== deleteConfirm.id))
      } else {
        await deleteService(deleteConfirm.id)
        setSvcs(prev => prev.filter(s => s.id !== deleteConfirm.id))
      }
      setDeleteConfirm(null)
    } catch (err) {
      alert(err.response?.data?.detail || 'Cannot delete — it may be in use.')
    } finally { setToggling(null) }
  }

  async function handleApproveSuggestion(e) {
    e.preventDefault()
    setToggling('sugg-approve')
    try {
      const res = await reviewSuggestion(approveModal.id, {
        action: 'approve',
        base_price: approveForm.base_price,
        duration_minutes: approveForm.duration_minutes,
      })
      setSuggestions(prev => prev.map(s => s.id === approveModal.id ? res.data : s))
      setApproveModal(null)
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to approve suggestion.')
    } finally { setToggling(null) }
  }

  async function handleRejectSuggestion() {
    setToggling('sugg-reject')
    try {
      const res = await reviewSuggestion(rejectSuggModal.id, {
        action: 'reject',
        rejection_reason: rejectSuggReason,
      })
      setSuggestions(prev => prev.map(s => s.id === rejectSuggModal.id ? res.data : s))
      setRejectSuggModal(null)
      setRejectSuggReason('')
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to reject suggestion.')
    } finally { setToggling(null) }
  }

  const thStyle = { padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textAlign: 'left', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.5px' }
  const tdStyle = { padding: '14px 16px', fontSize: '13px', color: '#374151', borderTop: '1px solid #f8fafc' }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      {/* Sidebar */}
      <div style={{ width: '240px', background: 'linear-gradient(180deg,#0f172a 0%,#1e293b 100%)', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'block', marginBottom: '20px' }}>
            <Logo height={32}/>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#7c3aed,#4338ca)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '14px' }}>
              {(user?.full_name || 'A').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: '700', fontSize: '13px' }}>{user?.full_name || 'Admin'}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>Administrator</div>
            </div>
          </div>
        </div>

        <nav style={{ padding: '12px', flex: 1 }}>
          {SECTIONS.map(s => {
            const active = section === s.key
            return (
              <button key={s.key} onClick={() => setSection(s.key)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '11px', padding: '11px 13px', borderRadius: '11px', border: 'none', cursor: 'pointer', marginBottom: '3px', transition: 'all 0.2s', background: active ? 'rgba(124,58,237,0.25)' : 'transparent', color: active ? '#a78bfa' : 'rgba(255,255,255,0.45)', fontSize: '13px', fontWeight: active ? '700' : '500' }}>
                <s.icon size={16} />
                {s.label}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => { logout(); navigate('/') }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 13px', borderRadius: '11px', border: 'none', cursor: 'pointer', background: 'transparent', color: 'rgba(255,255,255,0.35)', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#f87171' }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '36px 40px', maxWidth: '1100px' }}>

          {/* ── OVERVIEW ── */}
          {section === 'overview' && (
            <>
              <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', marginBottom: '6px' }}>Platform Overview</h1>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '28px' }}>Live snapshot of the UrbanEase marketplace</p>

              {stats ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '28px' }}>
                    <StatCard icon={Users}        label="Total Users"      value={stats.users}     sub={`${stats.customers} customers · ${stats.providers} providers`} color="#3b82f6" bg="#eff6ff" delay={0} />
                    <StatCard icon={Calendar}     label="Total Bookings"   value={stats.bookings}  sub={`${stats.pending} pending`} color="#8b5cf6" bg="#f5f3ff" delay={0.07} />
                    <StatCard icon={CheckCircle}  label="Completed Jobs"   value={stats.completed} color="#059669" bg="#ecfdf5" delay={0.14} />
                    <StatCard icon={IndianRupee}  label="Total Revenue"    value={`₹${parseFloat(stats.revenue).toLocaleString('en-IN')}`} color="#f59e0b" bg="#fffbeb" delay={0.21} />
                  </div>

                  {/* Daily bookings bar */}
                  {stats.daily_bookings?.length > 0 && (
                    <div style={{ background: 'white', borderRadius: '20px', padding: '28px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '20px' }}>Bookings — Last 7 Days</h3>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '120px' }}>
                        {(() => {
                          const max = Math.max(...stats.daily_bookings.map(d => d.count), 1)
                          return stats.daily_bookings.map(d => (
                            <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                              <span style={{ fontSize: '11px', fontWeight: '700', color: '#7c3aed' }}>{d.count}</span>
                              <div style={{ width: '100%', background: 'linear-gradient(180deg,#7c3aed,#4338ca)', borderRadius: '6px 6px 0 0', height: `${Math.max((d.count / max) * 90, 8)}%` }} />
                              <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                                {new Date(d.day).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                          ))
                        })()}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '14px' }}>Loading stats…</div>
              )}
            </>
          )}

          {/* ── USERS ── */}
          {section === 'users' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Users</h1>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>{users.length} result{users.length !== 1 ? 's' : ''}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                    style={{ padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: '11px', fontSize: '13px', color: '#374151', background: 'white', cursor: 'pointer', outline: 'none' }}>
                    <option value="">All roles</option>
                    <option value="customer">Customer</option>
                    <option value="provider">Provider</option>
                  </select>
                  <SearchBar value={search} onChange={setSearch} placeholder="Search users…" />
                </div>
              </div>

              <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f8fafc' }}>
                    <tr>
                      {['Name / Phone', 'Email', 'Role', 'Joined', 'Status', 'Action'].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8' }}>Loading…</td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8' }}>No users found</td></tr>
                    ) : users.map(u => (
                      <tr key={u.id}>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: '700', color: '#0f172a' }}>{u.full_name || '—'}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{u.phone}</div>
                        </td>
                        <td style={tdStyle}>{u.email || <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                        <td style={tdStyle}>
                          <Badge label={u.role} color={u.role === 'provider' ? '#7c3aed' : '#3b82f6'} />
                          {u.is_staff && <Badge label="Admin" color="#dc2626" />}
                        </td>
                        <td style={tdStyle}>{new Date(u.date_joined).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td style={tdStyle}>
                          <Badge label={u.is_active ? 'Active' : 'Blocked'} color={u.is_active ? '#059669' : '#dc2626'} />
                        </td>
                        <td style={tdStyle}>
                          <button onClick={() => handleToggleUser(u.id)} disabled={toggling === u.id || u.is_staff}
                            style={{ padding: '7px 14px', borderRadius: '9px', border: 'none', fontSize: '12px', fontWeight: '700', cursor: (toggling === u.id || u.is_staff) ? 'not-allowed' : 'pointer', background: u.is_active ? '#fef2f2' : '#ecfdf5', color: u.is_active ? '#dc2626' : '#059669', opacity: u.is_staff ? 0.4 : 1, transition: 'all 0.2s' }}>
                            {toggling === u.id ? '…' : u.is_active ? 'Block' : 'Unblock'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── BOOKINGS ── */}
          {section === 'bookings' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Bookings</h1>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>{bookings.length} result{bookings.length !== 1 ? 's' : ''}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    style={{ padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: '11px', fontSize: '13px', color: '#374151', background: 'white', cursor: 'pointer', outline: 'none' }}>
                    <option value="">All statuses</option>
                    {['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(s => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                  <SearchBar value={search} onChange={setSearch} placeholder="Search bookings…" />
                </div>
              </div>

              <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f8fafc' }}>
                    <tr>
                      {['#', 'Service', 'Customer', 'Provider', 'Date', 'Price', 'Status'].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8' }}>Loading…</td></tr>
                    ) : bookings.length === 0 ? (
                      <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8' }}>No bookings found</td></tr>
                    ) : bookings.map(b => (
                      <tr key={b.id}>
                        <td style={{ ...tdStyle, color: '#94a3b8', fontWeight: '600' }}>#{b.id}</td>
                        <td style={tdStyle}><span style={{ fontWeight: '700', color: '#0f172a' }}>{b.service_name}</span></td>
                        <td style={tdStyle}>{b.customer_name || '—'}</td>
                        <td style={tdStyle}>{b.provider_name || '—'}</td>
                        <td style={tdStyle}>{new Date(b.scheduled_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                        <td style={tdStyle}>₹{parseFloat(b.total_price).toLocaleString('en-IN')}</td>
                        <td style={tdStyle}>
                          <Badge label={b.status.replace('_', ' ')} color={STATUS_COLOR[b.status] || '#64748b'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── KYC REVIEW ── */}
          {section === 'kyc' && (
            <>
              {/* Reject reason modal */}
              {rejectModal && (
                <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' }}
                  onClick={e => { if (e.target === e.currentTarget) { setRejectModal(null); setRejectReason('') } }}>
                  <div style={{ background:'white', borderRadius:'20px', padding:'32px', width:'480px', maxWidth:'90vw' }}>
                    <h3 style={{ fontSize:'16px', fontWeight:'800', color:'#0f172a', marginBottom:'8px' }}>Reject KYC</h3>
                    <p style={{ fontSize:'13px', color:'#64748b', marginBottom:'16px' }}>Provide a reason so the provider knows what to fix and re-submit.</p>
                    <textarea rows={4} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                      placeholder="e.g. ID image is blurry, selfie does not clearly show the document…"
                      style={{ width:'100%', padding:'12px', border:'2px solid #e5e7eb', borderRadius:'12px', fontSize:'13px', resize:'vertical', outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
                      onFocus={e => e.target.style.borderColor='#dc2626'}
                      onBlur={e => e.target.style.borderColor='#e5e7eb'}/>
                    <div style={{ display:'flex', gap:'10px', marginTop:'16px', justifyContent:'flex-end' }}>
                      <button onClick={() => { setRejectModal(null); setRejectReason('') }}
                        style={{ padding:'10px 20px', borderRadius:'10px', border:'2px solid #e5e7eb', background:'white', color:'#64748b', fontWeight:'700', fontSize:'13px', cursor:'pointer' }}>
                        Cancel
                      </button>
                      <button onClick={handleKYCReject} disabled={!rejectReason.trim() || toggling === rejectModal}
                        style={{ padding:'10px 20px', borderRadius:'10px', border:'none', background:'#dc2626', color:'white', fontWeight:'700', fontSize:'13px', cursor:'pointer', opacity: (!rejectReason.trim() || toggling === rejectModal) ? 0.5 : 1 }}>
                        {toggling === rejectModal ? 'Rejecting…' : 'Confirm Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: 0 }}>KYC Review</h1>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>{kycList.length} submission{kycList.length !== 1 ? 's' : ''}</p>
                </div>
                <select value={kycFilter} onChange={e => setKycFilter(e.target.value)}
                  style={{ padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: '11px', fontSize: '13px', color: '#374151', background: 'white', cursor: 'pointer', outline: 'none' }}>
                  <option value="pending_review">Pending Review</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                  <option value="">All</option>
                </select>
              </div>

              {loading ? (
                <div style={{ color:'#94a3b8', fontSize:'14px', padding:'40px 0', textAlign:'center' }}>Loading…</div>
              ) : kycList.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 0', color:'#94a3b8' }}>
                  <UserCheck size={40} style={{ marginBottom:'12px', opacity:0.3 }}/>
                  <p style={{ margin:0 }}>No KYC submissions in this category</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                  {kycList.map(kyc => {
                    const isPending  = kyc.kyc_status === 'pending_review'
                    const isVerified = kyc.kyc_status === 'verified'
                    const isRejected = kyc.kyc_status === 'rejected'
                    return (
                      <motion.div key={kyc.id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                        style={{ background:'white', borderRadius:'20px', border:`1px solid ${isPending ? '#fde68a' : isVerified ? '#a7f3d0' : '#fecaca'}`, boxShadow:'0 2px 8px rgba(0,0,0,0.04)', overflow:'hidden' }}>
                        <div style={{ height:'3px', background: isPending ? '#f59e0b' : isVerified ? '#059669' : '#dc2626' }}/>
                        <div style={{ padding:'24px 28px' }}>
                          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'16px', marginBottom:'20px' }}>
                            <div>
                              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
                                <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'800', fontSize:'14px' }}>
                                  {(kyc.provider_name || '?').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div style={{ fontSize:'15px', fontWeight:'800', color:'#0f172a' }}>{kyc.provider_name || '—'}</div>
                                  <div style={{ fontSize:'12px', color:'#94a3b8' }}>{kyc.provider_phone}</div>
                                </div>
                              </div>
                            </div>
                            <Badge
                              label={isPending ? 'Pending Review' : isVerified ? 'Verified' : 'Rejected'}
                              color={isPending ? '#d97706' : isVerified ? '#059669' : '#dc2626'}
                            />
                          </div>

                          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'20px' }}>
                            <div style={{ background:'#f8fafc', borderRadius:'10px', padding:'12px' }}>
                              <div style={{ fontSize:'11px', color:'#94a3b8', marginBottom:'4px', fontWeight:'700', textTransform:'uppercase' }}>ID Type</div>
                              <div style={{ fontSize:'13px', fontWeight:'700', color:'#0f172a' }}>{kyc.govt_id_type_display || '—'}</div>
                            </div>
                            <div style={{ background:'#f8fafc', borderRadius:'10px', padding:'12px' }}>
                              <div style={{ fontSize:'11px', color:'#94a3b8', marginBottom:'4px', fontWeight:'700', textTransform:'uppercase' }}>ID Number</div>
                              <div style={{ fontSize:'13px', fontWeight:'700', color:'#0f172a', letterSpacing:'0.5px' }}>{kyc.govt_id_number || '—'}</div>
                            </div>
                            <div style={{ background:'#f8fafc', borderRadius:'10px', padding:'12px' }}>
                              <div style={{ fontSize:'11px', color:'#94a3b8', marginBottom:'4px', fontWeight:'700', textTransform:'uppercase' }}>Submitted</div>
                              <div style={{ fontSize:'13px', fontWeight:'700', color:'#0f172a' }}>
                                {kyc.submitted_at ? new Date(kyc.submitted_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—'}
                              </div>
                            </div>
                          </div>

                          {/* Document images */}
                          <div style={{ display:'flex', gap:'12px', marginBottom:'20px', flexWrap:'wrap' }}>
                            {[['ID Front', kyc.id_front], ['Selfie w/ ID', kyc.selfie], kyc.id_back && ['ID Back', kyc.id_back]].filter(Boolean).map(([lbl, src]) => (
                              src ? (
                                <div key={lbl} style={{ flex:'0 0 180px' }}>
                                  <p style={{ fontSize:'11px', fontWeight:'700', color:'#94a3b8', marginBottom:'6px', textTransform:'uppercase' }}>{lbl}</p>
                                  <a href={src} target="_blank" rel="noopener noreferrer">
                                    <img src={src} alt={lbl} style={{ width:'180px', height:'120px', objectFit:'cover', borderRadius:'10px', border:'1px solid #f1f5f9', cursor:'pointer', transition:'opacity 0.15s' }}
                                      onMouseOver={e => e.target.style.opacity='0.85'}
                                      onMouseOut={e => e.target.style.opacity='1'}/>
                                  </a>
                                </div>
                              ) : null
                            ))}
                          </div>

                          {/* Rejection reason display */}
                          {isRejected && kyc.rejection_reason && (
                            <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'10px', padding:'12px 16px', marginBottom:'16px', fontSize:'13px', color:'#dc2626' }}>
                              <strong>Rejection reason:</strong> {kyc.rejection_reason}
                            </div>
                          )}

                          {/* Actions */}
                          {isPending && (
                            <div style={{ display:'flex', gap:'10px' }}>
                              <button onClick={() => handleKYCApprove(kyc.id)} disabled={toggling === kyc.id}
                                style={{ display:'flex', alignItems:'center', gap:'7px', padding:'10px 20px', background:'#ecfdf5', color:'#059669', border:'1.5px solid #a7f3d0', borderRadius:'10px', fontWeight:'700', fontSize:'13px', cursor: toggling === kyc.id ? 'wait' : 'pointer', transition:'all 0.2s' }}>
                                <CheckCircle size={14}/> {toggling === kyc.id ? 'Processing…' : 'Approve & Verify'}
                              </button>
                              <button onClick={() => { setRejectModal(kyc.id); setRejectReason('') }} disabled={toggling === kyc.id}
                                style={{ display:'flex', alignItems:'center', gap:'7px', padding:'10px 20px', background:'#fef2f2', color:'#dc2626', border:'1.5px solid #fecaca', borderRadius:'10px', fontWeight:'700', fontSize:'13px', cursor: toggling === kyc.id ? 'wait' : 'pointer', transition:'all 0.2s' }}>
                                <XCircle size={14}/> Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {/* ── PROVIDERS ── */}
          {section === 'providers' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Providers</h1>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>{providers.length} result{providers.length !== 1 ? 's' : ''}</p>
                </div>
                <SearchBar value={search} onChange={setSearch} placeholder="Search providers…" />
              </div>

              <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f8fafc' }}>
                    <tr>
                      {['Provider', 'City', 'Rating', 'Jobs', 'Rate', 'Available', 'Verified', 'Action'].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={8} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8' }}>Loading…</td></tr>
                    ) : providers.length === 0 ? (
                      <tr><td colSpan={8} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8' }}>No providers found</td></tr>
                    ) : providers.map(p => (
                      <tr key={p.id}>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg,#7c3aed,#4338ca)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '13px', flexShrink: 0 }}>
                              {(p.full_name || '?').charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: '700', color: '#0f172a' }}>{p.full_name || '—'}</span>
                          </div>
                        </td>
                        <td style={tdStyle}>{p.city || '—'}</td>
                        <td style={tdStyle}><span style={{ fontWeight: '700', color: '#f59e0b' }}>{parseFloat(p.avg_rating).toFixed(1)} ★</span></td>
                        <td style={tdStyle}>{p.total_jobs}</td>
                        <td style={tdStyle}>₹{parseFloat(p.hourly_rate).toLocaleString('en-IN')}/hr</td>
                        <td style={tdStyle}>
                          <Badge label={p.is_available ? 'Yes' : 'No'} color={p.is_available ? '#059669' : '#94a3b8'} />
                        </td>
                        <td style={tdStyle}>
                          <Badge label={p.is_verified ? 'Verified' : 'Pending'} color={p.is_verified ? '#059669' : '#f59e0b'} />
                        </td>
                        <td style={tdStyle}>
                          <button onClick={() => handleToggleVerified(p.id)} disabled={toggling === p.id}
                            style={{ padding: '7px 14px', borderRadius: '9px', border: 'none', fontSize: '12px', fontWeight: '700', cursor: toggling === p.id ? 'wait' : 'pointer', background: p.is_verified ? '#fef2f2' : '#ecfdf5', color: p.is_verified ? '#dc2626' : '#059669', transition: 'all 0.2s' }}>
                            {toggling === p.id ? '…' : p.is_verified ? 'Revoke' : 'Verify'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── SERVICES ── */}
          {section === 'services' && (
            <>
              {/* Category modal */}
              {catModal && (
                <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' }}
                  onClick={e => { if (e.target === e.currentTarget) setCatModal(null) }}>
                  <div style={{ background:'white', borderRadius:'20px', padding:'32px', width:'440px', maxWidth:'90vw' }}>
                    <h3 style={{ fontSize:'16px', fontWeight:'800', color:'#0f172a', marginBottom:'20px' }}>
                      {catModal.mode === 'add' ? 'New Category' : 'Edit Category'}
                    </h3>
                    <form onSubmit={handleSaveCat} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                      {[
                        { label:'Name', key:'name', type:'text', required:true },
                        { label:'Icon slug', key:'icon', type:'text' },
                        { label:'Description', key:'description', type:'text' },
                        { label:'Order', key:'order', type:'number' },
                      ].map(({ label, key, type, required }) => (
                        <div key={key}>
                          <label style={{ fontSize:'12px', fontWeight:'700', color:'#64748b', display:'block', marginBottom:'5px', textTransform:'uppercase' }}>{label}</label>
                          <input type={type} required={required} value={catFormData[key]}
                            onChange={e => setCatFormData(p => ({ ...p, [key]: type === 'number' ? +e.target.value : e.target.value }))}
                            style={{ width:'100%', padding:'10px 12px', border:'2px solid #e5e7eb', borderRadius:'10px', fontSize:'13px', outline:'none', boxSizing:'border-box' }}
                            onFocus={e => e.target.style.borderColor='#7c3aed'}
                            onBlur={e => e.target.style.borderColor='#e5e7eb'}/>
                        </div>
                      ))}
                      <label style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', fontWeight:'600', color:'#374151', cursor:'pointer' }}>
                        <input type="checkbox" checked={catFormData.is_active} onChange={e => setCatFormData(p => ({ ...p, is_active: e.target.checked }))}/>
                        Active
                      </label>
                      <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', marginTop:'4px' }}>
                        <button type="button" onClick={() => setCatModal(null)} style={{ padding:'10px 20px', borderRadius:'10px', border:'2px solid #e5e7eb', background:'white', color:'#64748b', fontWeight:'700', fontSize:'13px', cursor:'pointer' }}>Cancel</button>
                        <button type="submit" disabled={toggling === 'cat-save'} style={{ padding:'10px 20px', borderRadius:'10px', border:'none', background:'#7c3aed', color:'white', fontWeight:'700', fontSize:'13px', cursor:'pointer' }}>
                          {toggling === 'cat-save' ? 'Saving…' : 'Save'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Service modal */}
              {svcModal && (
                <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' }}
                  onClick={e => { if (e.target === e.currentTarget) setSvcModal(null) }}>
                  <div style={{ background:'white', borderRadius:'20px', padding:'32px', width:'480px', maxWidth:'90vw', maxHeight:'90vh', overflowY:'auto' }}>
                    <h3 style={{ fontSize:'16px', fontWeight:'800', color:'#0f172a', marginBottom:'20px' }}>
                      {svcModal.mode === 'add' ? 'New Service' : 'Edit Service'}
                    </h3>
                    <form onSubmit={handleSaveSvc} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                      <div>
                        <label style={{ fontSize:'12px', fontWeight:'700', color:'#64748b', display:'block', marginBottom:'5px', textTransform:'uppercase' }}>Name *</label>
                        <input required value={svcFormData.name} onChange={e => setSvcFormData(p => ({ ...p, name: e.target.value }))}
                          style={{ width:'100%', padding:'10px 12px', border:'2px solid #e5e7eb', borderRadius:'10px', fontSize:'13px', outline:'none', boxSizing:'border-box' }}
                          onFocus={e => e.target.style.borderColor='#7c3aed'} onBlur={e => e.target.style.borderColor='#e5e7eb'}/>
                      </div>
                      <div>
                        <label style={{ fontSize:'12px', fontWeight:'700', color:'#64748b', display:'block', marginBottom:'5px', textTransform:'uppercase' }}>Category *</label>
                        <select required value={svcFormData.category} onChange={e => setSvcFormData(p => ({ ...p, category: e.target.value }))}
                          style={{ width:'100%', padding:'10px 12px', border:'2px solid #e5e7eb', borderRadius:'10px', fontSize:'13px', outline:'none', boxSizing:'border-box', background:'white' }}>
                          <option value="">Select category…</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize:'12px', fontWeight:'700', color:'#64748b', display:'block', marginBottom:'5px', textTransform:'uppercase' }}>Description *</label>
                        <textarea required rows={3} value={svcFormData.description} onChange={e => setSvcFormData(p => ({ ...p, description: e.target.value }))}
                          style={{ width:'100%', padding:'10px 12px', border:'2px solid #e5e7eb', borderRadius:'10px', fontSize:'13px', outline:'none', boxSizing:'border-box', resize:'vertical', fontFamily:'inherit' }}
                          onFocus={e => e.target.style.borderColor='#7c3aed'} onBlur={e => e.target.style.borderColor='#e5e7eb'}/>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                        <div>
                          <label style={{ fontSize:'12px', fontWeight:'700', color:'#64748b', display:'block', marginBottom:'5px', textTransform:'uppercase' }}>Base Price (₹) *</label>
                          <input type="number" min="0" step="0.01" required value={svcFormData.base_price} onChange={e => setSvcFormData(p => ({ ...p, base_price: e.target.value }))}
                            style={{ width:'100%', padding:'10px 12px', border:'2px solid #e5e7eb', borderRadius:'10px', fontSize:'13px', outline:'none', boxSizing:'border-box' }}
                            onFocus={e => e.target.style.borderColor='#7c3aed'} onBlur={e => e.target.style.borderColor='#e5e7eb'}/>
                        </div>
                        <div>
                          <label style={{ fontSize:'12px', fontWeight:'700', color:'#64748b', display:'block', marginBottom:'5px', textTransform:'uppercase' }}>Duration (min)</label>
                          <input type="number" min="1" value={svcFormData.duration_minutes} onChange={e => setSvcFormData(p => ({ ...p, duration_minutes: +e.target.value }))}
                            style={{ width:'100%', padding:'10px 12px', border:'2px solid #e5e7eb', borderRadius:'10px', fontSize:'13px', outline:'none', boxSizing:'border-box' }}
                            onFocus={e => e.target.style.borderColor='#7c3aed'} onBlur={e => e.target.style.borderColor='#e5e7eb'}/>
                        </div>
                      </div>
                      <label style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', fontWeight:'600', color:'#374151', cursor:'pointer' }}>
                        <input type="checkbox" checked={svcFormData.is_active} onChange={e => setSvcFormData(p => ({ ...p, is_active: e.target.checked }))}/>
                        Active
                      </label>
                      <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', marginTop:'4px' }}>
                        <button type="button" onClick={() => setSvcModal(null)} style={{ padding:'10px 20px', borderRadius:'10px', border:'2px solid #e5e7eb', background:'white', color:'#64748b', fontWeight:'700', fontSize:'13px', cursor:'pointer' }}>Cancel</button>
                        <button type="submit" disabled={toggling === 'svc-save'} style={{ padding:'10px 20px', borderRadius:'10px', border:'none', background:'#7c3aed', color:'white', fontWeight:'700', fontSize:'13px', cursor:'pointer' }}>
                          {toggling === 'svc-save' ? 'Saving…' : 'Save'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Delete confirm modal */}
              {deleteConfirm && (
                <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' }}
                  onClick={e => { if (e.target === e.currentTarget) setDeleteConfirm(null) }}>
                  <div style={{ background:'white', borderRadius:'20px', padding:'32px', width:'400px', maxWidth:'90vw' }}>
                    <h3 style={{ fontSize:'16px', fontWeight:'800', color:'#0f172a', marginBottom:'8px' }}>Confirm Delete</h3>
                    <p style={{ fontSize:'13px', color:'#64748b', marginBottom:'20px' }}>
                      Delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.
                    </p>
                    <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
                      <button onClick={() => setDeleteConfirm(null)} style={{ padding:'10px 20px', borderRadius:'10px', border:'2px solid #e5e7eb', background:'white', color:'#64748b', fontWeight:'700', fontSize:'13px', cursor:'pointer' }}>Cancel</button>
                      <button onClick={handleDelete} disabled={toggling === 'delete'} style={{ padding:'10px 20px', borderRadius:'10px', border:'none', background:'#dc2626', color:'white', fontWeight:'700', fontSize:'13px', cursor:'pointer' }}>
                        {toggling === 'delete' ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Approve suggestion modal */}
              {approveModal && (
                <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' }}
                  onClick={e => { if (e.target === e.currentTarget) setApproveModal(null) }}>
                  <div style={{ background:'white', borderRadius:'20px', padding:'32px', width:'440px', maxWidth:'90vw' }}>
                    <h3 style={{ fontSize:'16px', fontWeight:'800', color:'#0f172a', marginBottom:'6px' }}>Approve Suggestion</h3>
                    <p style={{ fontSize:'13px', color:'#64748b', marginBottom:'16px' }}>
                      Adding <strong>{approveModal.service_name}</strong> under <strong>{approveModal.category_name}</strong>. Set pricing:
                    </p>
                    <form onSubmit={handleApproveSuggestion} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                        <div>
                          <label style={{ fontSize:'12px', fontWeight:'700', color:'#64748b', display:'block', marginBottom:'5px', textTransform:'uppercase' }}>Base Price (₹) *</label>
                          <input type="number" min="0" step="0.01" required value={approveForm.base_price}
                            onChange={e => setApproveForm(p => ({ ...p, base_price: e.target.value }))}
                            style={{ width:'100%', padding:'10px 12px', border:'2px solid #e5e7eb', borderRadius:'10px', fontSize:'13px', outline:'none', boxSizing:'border-box' }}
                            onFocus={e => e.target.style.borderColor='#059669'} onBlur={e => e.target.style.borderColor='#e5e7eb'}/>
                        </div>
                        <div>
                          <label style={{ fontSize:'12px', fontWeight:'700', color:'#64748b', display:'block', marginBottom:'5px', textTransform:'uppercase' }}>Duration (min)</label>
                          <input type="number" min="1" value={approveForm.duration_minutes}
                            onChange={e => setApproveForm(p => ({ ...p, duration_minutes: +e.target.value }))}
                            style={{ width:'100%', padding:'10px 12px', border:'2px solid #e5e7eb', borderRadius:'10px', fontSize:'13px', outline:'none', boxSizing:'border-box' }}
                            onFocus={e => e.target.style.borderColor='#059669'} onBlur={e => e.target.style.borderColor='#e5e7eb'}/>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
                        <button type="button" onClick={() => setApproveModal(null)} style={{ padding:'10px 20px', borderRadius:'10px', border:'2px solid #e5e7eb', background:'white', color:'#64748b', fontWeight:'700', fontSize:'13px', cursor:'pointer' }}>Cancel</button>
                        <button type="submit" disabled={toggling === 'sugg-approve'} style={{ padding:'10px 20px', borderRadius:'10px', border:'none', background:'#059669', color:'white', fontWeight:'700', fontSize:'13px', cursor:'pointer' }}>
                          {toggling === 'sugg-approve' ? 'Approving…' : 'Approve & Add'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Reject suggestion modal */}
              {rejectSuggModal && (
                <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' }}
                  onClick={e => { if (e.target === e.currentTarget) { setRejectSuggModal(null); setRejectSuggReason('') } }}>
                  <div style={{ background:'white', borderRadius:'20px', padding:'32px', width:'440px', maxWidth:'90vw' }}>
                    <h3 style={{ fontSize:'16px', fontWeight:'800', color:'#0f172a', marginBottom:'8px' }}>Reject Suggestion</h3>
                    <p style={{ fontSize:'13px', color:'#64748b', marginBottom:'16px' }}>Optionally explain why this suggestion was declined.</p>
                    <textarea rows={3} value={rejectSuggReason} onChange={e => setRejectSuggReason(e.target.value)}
                      placeholder="Not suitable at this time…"
                      style={{ width:'100%', padding:'12px', border:'2px solid #e5e7eb', borderRadius:'12px', fontSize:'13px', resize:'vertical', outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
                      onFocus={e => e.target.style.borderColor='#dc2626'} onBlur={e => e.target.style.borderColor='#e5e7eb'}/>
                    <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', marginTop:'14px' }}>
                      <button onClick={() => { setRejectSuggModal(null); setRejectSuggReason('') }} style={{ padding:'10px 20px', borderRadius:'10px', border:'2px solid #e5e7eb', background:'white', color:'#64748b', fontWeight:'700', fontSize:'13px', cursor:'pointer' }}>Cancel</button>
                      <button onClick={handleRejectSuggestion} disabled={toggling === 'sugg-reject'} style={{ padding:'10px 20px', borderRadius:'10px', border:'none', background:'#dc2626', color:'white', fontWeight:'700', fontSize:'13px', cursor:'pointer' }}>
                        {toggling === 'sugg-reject' ? 'Rejecting…' : 'Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab nav */}
              <div style={{ marginBottom:'24px' }}>
                <h1 style={{ fontSize:'22px', fontWeight:'900', color:'#0f172a', marginBottom:'16px' }}>Services</h1>
                <div style={{ display:'flex', gap:'8px' }}>
                  {[
                    { key:'categories',  label:'Categories' },
                    { key:'services',    label:'Services' },
                    { key:'suggestions', label:'Suggestions' },
                  ].map(t => (
                    <button key={t.key} onClick={() => setSvcSubTab(t.key)}
                      style={{ padding:'9px 20px', borderRadius:'10px', border:'none', fontSize:'13px', fontWeight:'700', cursor:'pointer', transition:'all 0.2s',
                        background: svcSubTab === t.key ? '#7c3aed' : '#f1f5f9',
                        color:      svcSubTab === t.key ? 'white'   : '#64748b' }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── CATEGORIES sub-tab ── */}
              {svcSubTab === 'categories' && (
                <>
                  <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'16px' }}>
                    <button onClick={() => { setCatFormData({ name:'', icon:'wrench', description:'', is_active:true, order:0 }); setCatModal({ mode:'add', data:{} }) }}
                      style={{ display:'flex', alignItems:'center', gap:'7px', padding:'10px 18px', background:'#7c3aed', color:'white', border:'none', borderRadius:'11px', fontSize:'13px', fontWeight:'700', cursor:'pointer' }}>
                      <Plus size={14}/> Add Category
                    </button>
                  </div>
                  <div style={{ background:'white', borderRadius:'20px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', overflow:'hidden' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse' }}>
                      <thead style={{ background:'#f8fafc' }}>
                        <tr>{['Name', 'Icon', 'Services', 'Order', 'Active', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr><td colSpan={6} style={{ ...tdStyle, textAlign:'center', color:'#94a3b8' }}>Loading…</td></tr>
                        ) : categories.length === 0 ? (
                          <tr><td colSpan={6} style={{ ...tdStyle, textAlign:'center', color:'#94a3b8' }}>No categories yet</td></tr>
                        ) : categories.map(c => (
                          <tr key={c.id}>
                            <td style={tdStyle}><span style={{ fontWeight:'700', color:'#0f172a' }}>{c.name}</span></td>
                            <td style={tdStyle}><span style={{ fontFamily:'monospace', fontSize:'12px', color:'#7c3aed' }}>{c.icon}</span></td>
                            <td style={tdStyle}>{c.service_count}</td>
                            <td style={tdStyle}>{c.order}</td>
                            <td style={tdStyle}><Badge label={c.is_active ? 'Yes' : 'No'} color={c.is_active ? '#059669' : '#94a3b8'}/></td>
                            <td style={tdStyle}>
                              <div style={{ display:'flex', gap:'6px' }}>
                                <button onClick={() => { setCatFormData({ name:c.name, icon:c.icon, description:c.description, is_active:c.is_active, order:c.order }); setCatModal({ mode:'edit', data:c }) }}
                                  style={{ padding:'6px 12px', borderRadius:'8px', border:'none', background:'#f5f3ff', color:'#7c3aed', fontSize:'12px', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px' }}>
                                  <Pencil size={11}/> Edit
                                </button>
                                <button onClick={() => setDeleteConfirm({ type:'category', id:c.id, name:c.name })}
                                  style={{ padding:'6px 12px', borderRadius:'8px', border:'none', background:'#fef2f2', color:'#dc2626', fontSize:'12px', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px' }}>
                                  <Trash2 size={11}/> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* ── SERVICES sub-tab ── */}
              {svcSubTab === 'services' && (
                <>
                  <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'16px' }}>
                    <button onClick={() => {
                      setSvcFormData({ name:'', category: categories[0]?.id || '', description:'', base_price:'', duration_minutes:60, is_active:true })
                      setSvcModal({ mode:'add', data:{} })
                    }}
                      style={{ display:'flex', alignItems:'center', gap:'7px', padding:'10px 18px', background:'#7c3aed', color:'white', border:'none', borderRadius:'11px', fontSize:'13px', fontWeight:'700', cursor:'pointer' }}>
                      <Plus size={14}/> Add Service
                    </button>
                  </div>
                  <div style={{ background:'white', borderRadius:'20px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', overflow:'hidden' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse' }}>
                      <thead style={{ background:'#f8fafc' }}>
                        <tr>{['Service', 'Category', 'Price', 'Duration', 'Active', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr><td colSpan={6} style={{ ...tdStyle, textAlign:'center', color:'#94a3b8' }}>Loading…</td></tr>
                        ) : svcs.length === 0 ? (
                          <tr><td colSpan={6} style={{ ...tdStyle, textAlign:'center', color:'#94a3b8' }}>No services yet</td></tr>
                        ) : svcs.map(s => (
                          <tr key={s.id}>
                            <td style={tdStyle}><span style={{ fontWeight:'700', color:'#0f172a' }}>{s.name}</span></td>
                            <td style={tdStyle}>{s.category_name}</td>
                            <td style={tdStyle}>₹{parseFloat(s.base_price).toLocaleString('en-IN')}</td>
                            <td style={tdStyle}>{s.duration_display}</td>
                            <td style={tdStyle}><Badge label={s.is_active ? 'Yes' : 'No'} color={s.is_active ? '#059669' : '#94a3b8'}/></td>
                            <td style={tdStyle}>
                              <div style={{ display:'flex', gap:'6px' }}>
                                <button onClick={() => { setSvcFormData({ name:s.name, category:s.category, description:s.description, base_price:s.base_price, duration_minutes:s.duration_minutes, is_active:s.is_active }); setSvcModal({ mode:'edit', data:s }) }}
                                  style={{ padding:'6px 12px', borderRadius:'8px', border:'none', background:'#f5f3ff', color:'#7c3aed', fontSize:'12px', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px' }}>
                                  <Pencil size={11}/> Edit
                                </button>
                                <button onClick={() => setDeleteConfirm({ type:'service', id:s.id, name:s.name })}
                                  style={{ padding:'6px 12px', borderRadius:'8px', border:'none', background:'#fef2f2', color:'#dc2626', fontSize:'12px', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px' }}>
                                  <Trash2 size={11}/> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* ── SUGGESTIONS sub-tab ── */}
              {svcSubTab === 'suggestions' && (
                <>
                  <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'16px', gap:'10px' }}>
                    <select value={suggFilter} onChange={e => setSuggFilter(e.target.value)}
                      style={{ padding:'10px 14px', border:'2px solid #e5e7eb', borderRadius:'11px', fontSize:'13px', color:'#374151', background:'white', cursor:'pointer', outline:'none' }}>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="">All</option>
                    </select>
                  </div>

                  {loading ? (
                    <div style={{ color:'#94a3b8', textAlign:'center', padding:'40px 0' }}>Loading…</div>
                  ) : suggestions.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'60px 0', color:'#94a3b8' }}>
                      <Lightbulb size={40} style={{ marginBottom:'12px', opacity:0.3 }}/>
                      <p style={{ margin:0 }}>No suggestions in this category</p>
                    </div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                      {suggestions.map(s => {
                        const isPending  = s.status === 'pending'
                        const isApproved = s.status === 'approved'
                        return (
                          <div key={s.id} style={{ background:'white', borderRadius:'16px', border:`1px solid ${isPending ? '#fde68a' : isApproved ? '#a7f3d0' : '#fecaca'}`, boxShadow:'0 2px 8px rgba(0,0,0,0.04)', overflow:'hidden' }}>
                            <div style={{ height:'3px', background: isPending ? '#f59e0b' : isApproved ? '#059669' : '#dc2626' }}/>
                            <div style={{ padding:'20px 24px' }}>
                              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'12px', marginBottom:'12px' }}>
                                <div>
                                  <div style={{ fontSize:'16px', fontWeight:'800', color:'#0f172a', marginBottom:'2px' }}>{s.service_name}</div>
                                  <div style={{ fontSize:'12px', color:'#7c3aed', fontWeight:'700' }}>Category: {s.category_name}</div>
                                </div>
                                <Badge
                                  label={s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                                  color={isPending ? '#d97706' : isApproved ? '#059669' : '#dc2626'}
                                />
                              </div>
                              {s.description && <p style={{ fontSize:'13px', color:'#64748b', margin:'0 0 12px' }}>{s.description}</p>}
                              <div style={{ fontSize:'12px', color:'#94a3b8', marginBottom: isPending ? '14px' : '0' }}>
                                By <strong style={{ color:'#374151' }}>{s.suggested_by_name || 'Unknown'}</strong> ({s.suggested_by_role}) · {new Date(s.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                              </div>
                              {s.rejection_reason && (
                                <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'8px', padding:'10px 14px', fontSize:'12px', color:'#dc2626', marginBottom:'8px' }}>
                                  Rejected: {s.rejection_reason}
                                </div>
                              )}
                              {s.approved_service_name && (
                                <div style={{ background:'#ecfdf5', border:'1px solid #a7f3d0', borderRadius:'8px', padding:'10px 14px', fontSize:'12px', color:'#059669' }}>
                                  Added as service: {s.approved_service_name}
                                </div>
                              )}
                              {isPending && (
                                <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
                                  <button onClick={() => { setApproveForm({ base_price:'', duration_minutes:60 }); setApproveModal(s) }}
                                    style={{ display:'flex', alignItems:'center', gap:'6px', padding:'9px 18px', background:'#ecfdf5', color:'#059669', border:'1.5px solid #a7f3d0', borderRadius:'9px', fontWeight:'700', fontSize:'13px', cursor:'pointer' }}>
                                    <CheckCircle size={13}/> Approve
                                  </button>
                                  <button onClick={() => { setRejectSuggModal(s); setRejectSuggReason('') }}
                                    style={{ display:'flex', alignItems:'center', gap:'6px', padding:'9px 18px', background:'#fef2f2', color:'#dc2626', border:'1.5px solid #fecaca', borderRadius:'9px', fontWeight:'700', fontSize:'13px', cursor:'pointer' }}>
                                    <XCircle size={13}/> Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}
