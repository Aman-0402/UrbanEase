import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, BookOpen, Star, XCircle, CheckCircle, PlayCircle, AlertCircle } from 'lucide-react'
import { getNotifications, getUnreadCount, markAllRead, markOneRead } from '../../api/notifications'

const TYPE_ICON = {
  booking_created:   { icon: BookOpen,     color: '#3b82f6', bg: '#eff6ff' },
  booking_confirmed: { icon: CheckCircle,  color: '#059669', bg: '#ecfdf5' },
  booking_started:   { icon: PlayCircle,   color: '#8b5cf6', bg: '#f5f3ff' },
  booking_completed: { icon: CheckCircle,  color: '#059669', bg: '#ecfdf5' },
  booking_cancelled: { icon: XCircle,      color: '#dc2626', bg: '#fef2f2' },
  review_received:   { icon: Star,         color: '#f59e0b', bg: '#fffbeb' },
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)   return 'just now'
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function NotificationBell({ scrolled }) {
  const [open,          setOpen]          = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread,        setUnread]        = useState(0)
  const [loading,       setLoading]       = useState(false)
  const dropRef = useRef(null)
  const navigate = useNavigate()

  // Poll unread count every 30s
  const fetchCount = useCallback(() => {
    getUnreadCount().then(r => setUnread(r.data.count)).catch(() => {})
  }, [])

  useEffect(() => {
    fetchCount()
    const id = setInterval(fetchCount, 30000)
    return () => clearInterval(id)
  }, [fetchCount])

  // Load full list when opened
  useEffect(() => {
    if (!open) return
    setLoading(true)
    getNotifications()
      .then(r => setNotifications(r.data.results ?? r.data))
      .finally(() => setLoading(false))
  }, [open])

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleMarkAll() {
    await markAllRead()
    setUnread(0)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  async function handleClick(notif) {
    if (!notif.is_read) {
      await markOneRead(notif.id)
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n))
      setUnread(prev => Math.max(0, prev - 1))
    }
    setOpen(false)
    if (notif.booking) navigate('/bookings')
  }

  const iconColor = scrolled ? '#374151' : 'rgba(255,255,255,0.85)'

  return (
    <div ref={dropRef} style={{ position:'relative' }}>
      {/* Bell button */}
      <button onClick={() => setOpen(o => !o)}
        style={{ position:'relative', width:'40px', height:'40px', borderRadius:'11px', border:'none', background: open ? 'rgba(124,58,237,0.1)' : 'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}
        onMouseOver={e => e.currentTarget.style.background='rgba(124,58,237,0.1)'}
        onMouseOut={e => { if (!open) e.currentTarget.style.background='transparent' }}>
        <Bell size={20} color={iconColor} strokeWidth={1.8}/>
        {unread > 0 && (
          <span style={{ position:'absolute', top:'4px', right:'4px', minWidth:'16px', height:'16px', background:'#ef4444', color:'white', fontSize:'9px', fontWeight:'800', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px', boxShadow:'0 0 0 2px white' }}>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{ position:'absolute', top:'calc(100% + 12px)', right:0, width:'360px', background:'white', borderRadius:'20px', boxShadow:'0 8px 40px rgba(0,0,0,0.15)', border:'1px solid #f1f5f9', overflow:'hidden', zIndex:200 }}>

          {/* Header */}
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #f8fafc', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <h3 style={{ fontSize:'15px', fontWeight:'800', color:'#0f172a', margin:0 }}>
              Notifications {unread > 0 && <span style={{ fontSize:'12px', fontWeight:'700', color:'#7c3aed', marginLeft:'6px' }}>({unread} new)</span>}
            </h3>
            {unread > 0 && (
              <button onClick={handleMarkAll}
                style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'12px', fontWeight:'700', color:'#7c3aed', background:'none', border:'none', cursor:'pointer', padding:'4px 8px', borderRadius:'8px', transition:'background 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background='#f3e8ff'}
                onMouseOut={e => e.currentTarget.style.background='none'}>
                <CheckCheck size={13}/> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight:'400px', overflowY:'auto' }}>
            {loading ? (
              <div style={{ padding:'32px', textAlign:'center', color:'#94a3b8', fontSize:'13px' }}>Loading…</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding:'40px 20px', textAlign:'center' }}>
                <Bell size={32} color="#e2e8f0" style={{ marginBottom:'10px' }}/>
                <p style={{ color:'#94a3b8', fontSize:'13px', margin:0 }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => {
                const meta = TYPE_ICON[notif.notif_type] || { icon: AlertCircle, color: '#64748b', bg: '#f8fafc' }
                const Icon = meta.icon
                return (
                  <button key={notif.id} onClick={() => handleClick(notif)}
                    style={{ width:'100%', display:'flex', alignItems:'flex-start', gap:'12px', padding:'14px 20px', border:'none', background: notif.is_read ? 'transparent' : '#faf5ff', cursor:'pointer', textAlign:'left', borderBottom:'1px solid #f8fafc', transition:'background 0.15s' }}
                    onMouseOver={e => e.currentTarget.style.background='#f8fafc'}
                    onMouseOut={e => e.currentTarget.style.background=notif.is_read ? 'transparent' : '#faf5ff'}>
                    <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:meta.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Icon size={16} color={meta.color}/>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'3px' }}>
                        <span style={{ fontSize:'13px', fontWeight: notif.is_read ? '600' : '800', color:'#0f172a' }}>{notif.title}</span>
                        {!notif.is_read && <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#7c3aed', flexShrink:0 }}/>}
                      </div>
                      <p style={{ fontSize:'12px', color:'#64748b', margin:0, lineHeight:1.5, whiteSpace:'normal' }}>{notif.body}</p>
                      <span style={{ fontSize:'11px', color:'#94a3b8', marginTop:'4px', display:'block' }}>{timeAgo(notif.created_at)}</span>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
