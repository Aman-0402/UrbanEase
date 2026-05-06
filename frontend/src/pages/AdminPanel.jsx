import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Zap, Users, Calendar, BarChart2, ShieldCheck, LogOut,
  Search, CheckCircle, XCircle, TrendingUp, IndianRupee,
  RefreshCw, UserCheck, AlertCircle,
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import { getStats, getAdminUsers, toggleUserActive, getAdminBookings, getAdminProviders, toggleVerified } from '../api/admin'

const SECTIONS = [
  { key: 'overview',  icon: BarChart2,   label: 'Overview' },
  { key: 'users',     icon: Users,       label: 'Users' },
  { key: 'bookings',  icon: Calendar,    label: 'Bookings' },
  { key: 'providers', icon: ShieldCheck, label: 'Providers' },
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
  const [loading, setLoading]     = useState(false)
  const [search,  setSearch]      = useState('')
  const [toggling,setToggling]    = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter,   setRoleFilter]   = useState('')

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
    } else {
      setLoading(false)
    }
  }, [section, search, roleFilter, statusFilter])

  useEffect(() => { loadSection() }, [loadSection])

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

  const thStyle = { padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textAlign: 'left', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.5px' }
  const tdStyle = { padding: '14px 16px', fontSize: '13px', color: '#374151', borderTop: '1px solid #f8fafc' }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      {/* Sidebar */}
      <div style={{ width: '240px', background: 'linear-gradient(180deg,#0f172a 0%,#1e293b 100%)', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#7c3aed,#4338ca)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={15} color="white" />
            </div>
            <span style={{ fontSize: '16px', fontWeight: '900', color: 'white' }}>UrbanEase</span>
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

        </div>
      </div>
    </div>
  )
}
