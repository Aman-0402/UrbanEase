import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, MapPin, Star, X, CheckCircle, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react'
import { getMyBookings, cancelBooking, submitReview, getBookingReview } from '../api/bookings'
import { getPaymentStatus } from '../api/payments'
import RazorpayButton from '../components/RazorpayButton'
import Navbar from '../components/layout/Navbar'
import useAuthStore from '../store/authStore'

const STATUS_META = {
  pending:     { label:'Pending',     color:'#f59e0b', bg:'#fefce8', border:'#fde68a' },
  confirmed:   { label:'Confirmed',   color:'#3b82f6', bg:'#eff6ff', border:'#bfdbfe' },
  in_progress: { label:'In Progress', color:'#8b5cf6', bg:'#f5f3ff', border:'#ddd6fe' },
  completed:   { label:'Completed',   color:'#059669', bg:'#ecfdf5', border:'#a7f3d0' },
  cancelled:   { label:'Cancelled',   color:'#dc2626', bg:'#fef2f2', border:'#fecaca' },
}

const TABS = [
  { key:'', label:'All' },
  { key:'pending', label:'Pending' },
  { key:'confirmed', label:'Confirmed' },
  { key:'in_progress', label:'In Progress' },
  { key:'completed', label:'Completed' },
  { key:'cancelled', label:'Cancelled' },
]

function ReviewModal({ bookingId, onClose, onDone }) {
  const [rating,  setRating]  = useState(0)
  const [hover,   setHover]   = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function submit() {
    if (!rating) { setError('Please select a rating.'); return }
    setLoading(true)
    try {
      await submitReview(bookingId, { rating, comment })
      onDone()
    } catch (err) {
      setError(err.response?.data?.detail || Object.values(err.response?.data || {}).flat().join(' ') || 'Failed to submit review.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px' }}>
      <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
        style={{ background:'white', borderRadius:'24px', padding:'36px', maxWidth:'440px', width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
          <h3 style={{ fontSize:'18px', fontWeight:'800', color:'#0f172a', margin:0 }}>Leave a Review</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', padding:'4px' }}>
            <X size={20}/>
          </button>
        </div>

        <p style={{ fontSize:'13px', color:'#64748b', marginBottom:'20px' }}>How was your experience?</p>

        {/* Star picker */}
        <div style={{ display:'flex', gap:'8px', justifyContent:'center', marginBottom:'24px' }}>
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={()=>setRating(n)} onMouseEnter={()=>setHover(n)} onMouseLeave={()=>setHover(0)}
              style={{ background:'none', border:'none', cursor:'pointer', padding:'4px', transition:'transform 0.1s', transform: n <= (hover || rating) ? 'scale(1.2)' : 'scale(1)' }}>
              <Star size={32} fill={n <= (hover || rating) ? '#f59e0b' : 'none'} color={n <= (hover || rating) ? '#f59e0b' : '#d1d5db'} strokeWidth={1.5}/>
            </button>
          ))}
        </div>

        <textarea rows={4} placeholder="Tell us about your experience (optional)…" value={comment} onChange={e=>setComment(e.target.value)}
          style={{ width:'100%', padding:'13px 16px', border:'2px solid #e5e7eb', borderRadius:'12px', fontSize:'14px', resize:'vertical', fontFamily:'inherit', outline:'none', boxSizing:'border-box', transition:'border 0.2s' }}
          onFocus={e=>e.target.style.borderColor='#7c3aed'}
          onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>

        {error && (
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginTop:'12px', padding:'10px 14px', background:'#fef2f2', borderRadius:'10px', color:'#dc2626', fontSize:'13px' }}>
            <AlertCircle size={14}/> {error}
          </div>
        )}

        <div style={{ display:'flex', gap:'12px', marginTop:'20px' }}>
          <button onClick={onClose} style={{ flex:1, padding:'13px', border:'2px solid #e5e7eb', borderRadius:'12px', fontWeight:'700', fontSize:'14px', color:'#374151', background:'white', cursor:'pointer' }}>
            Cancel
          </button>
          <button onClick={submit} disabled={loading}
            style={{ flex:1, padding:'13px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', color:'white', border:'none', borderRadius:'12px', fontWeight:'700', fontSize:'14px', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.75 : 1 }}>
            {loading ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function MyBookings() {
  const { user }                  = useAuthStore()
  const [bookings, setBookings]   = useState([])
  const [loading,  setLoading]    = useState(true)
  const [activeTab, setActiveTab] = useState('')
  const [reviewModal, setReviewModal] = useState(null) // bookingId
  const [reviewed,   setReviewed]   = useState(new Set())
  const [paid,       setPaid]       = useState(new Set())
  const [cancelling, setCancelling] = useState(null)
  const [payingId,   setPayingId]   = useState(null)

  function fetchBookings(status = '') {
    setLoading(true)
    const params = status ? { status } : {}
    getMyBookings(params)
      .then(r => {
        const items = r.data.results ?? r.data
        setBookings(items)
        // pre-check which completed ones already have reviews
        items.filter(b => b.status === 'completed').forEach(b => {
          getBookingReview(b.id).then(() => setReviewed(prev => new Set([...prev, b.id]))).catch(()=>{})
        })
        // pre-check payment status for pending/confirmed bookings
        items.filter(b => ['pending','confirmed'].includes(b.status)).forEach(b => {
          getPaymentStatus(b.id).then(r => { if (r.data.paid) setPaid(prev => new Set([...prev, b.id])) }).catch(()=>{})
        })
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchBookings(activeTab) }, [activeTab])

  async function handleCancel(bookingId) {
    if (!window.confirm('Cancel this booking?')) return
    setCancelling(bookingId)
    try {
      await cancelBooking(bookingId)
      fetchBookings(activeTab)
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not cancel booking.')
    } finally {
      setCancelling(null)
    }
  }

  const statusMeta = (s) => STATUS_META[s] || STATUS_META.pending

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:'system-ui,-apple-system,sans-serif' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#7c3aed 0%,#4338ca 100%)', padding:'40px 40px 36px' }}>
        <div style={{ maxWidth:'900px', margin:'0 auto' }}>
          <h1 style={{ fontSize:'clamp(22px,3vw,32px)', fontWeight:'900', color:'white', marginBottom:'6px', letterSpacing:'-0.4px' }}>My Bookings</h1>
          <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'15px' }}>Track and manage your service bookings</p>
        </div>
      </div>

      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'32px 40px' }}>

        {/* Tabs */}
        <div style={{ display:'flex', gap:'6px', background:'white', borderRadius:'14px', padding:'6px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', marginBottom:'28px', overflowX:'auto' }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{ padding:'9px 18px', borderRadius:'10px', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:'700', whiteSpace:'nowrap', transition:'all 0.2s',
                background: activeTab === tab.key ? 'linear-gradient(135deg,#7c3aed,#4338ca)' : 'transparent',
                color: activeTab === tab.key ? 'white' : '#64748b',
                boxShadow: activeTab === tab.key ? '0 2px 8px rgba(124,58,237,0.3)' : 'none',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Booking list */}
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {[...Array(3)].map((_,i) => <div key={i} style={{ background:'white', borderRadius:'20px', height:'140px', opacity:0.5 }}/>)}
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ width:'72px', height:'72px', background:'#faf5ff', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
              <Calendar size={32} color="#7c3aed"/>
            </div>
            <h3 style={{ fontSize:'20px', fontWeight:'800', color:'#0f172a', marginBottom:'8px' }}>No bookings yet</h3>
            <p style={{ color:'#64748b', marginBottom:'28px' }}>You haven't made any bookings in this category.</p>
            <Link to="/services" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'13px 28px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', color:'white', fontWeight:'700', fontSize:'14px', borderRadius:'14px', textDecoration:'none' }}>
              Browse Services <ArrowRight size={16}/>
            </Link>
          </div>
        ) : (
          <AnimatePresence>
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              {bookings.map((b, i) => {
                const meta = statusMeta(b.status)
                const canCancel  = ['pending','confirmed'].includes(b.status)
                const canReview  = b.status === 'completed' && !reviewed.has(b.id)
                return (
                  <motion.div key={b.id} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.3, delay:i*0.05}}>
                    <div style={{ background:'white', borderRadius:'20px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', overflow:'hidden' }}>
                      {/* Top colour strip */}
                      <div style={{ height:'4px', background:`linear-gradient(90deg,${meta.color},${meta.color}88)` }}/>

                      <div style={{ padding:'24px 28px' }}>
                        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'12px', flexWrap:'wrap', marginBottom:'16px' }}>
                          <div>
                            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
                              <h3 style={{ fontSize:'16px', fontWeight:'800', color:'#0f172a', margin:0 }}>{b.service_name || `Booking #${b.id}`}</h3>
                              <span style={{ fontSize:'11px', fontWeight:'700', padding:'3px 10px', borderRadius:'20px', background:meta.bg, color:meta.color, border:`1px solid ${meta.border}` }}>
                                {meta.label}
                              </span>
                            </div>
                            <p style={{ fontSize:'13px', color:'#64748b', margin:0 }}>Provider: <strong style={{ color:'#374151' }}>{b.provider_name || '—'}</strong></p>
                          </div>
                          <div style={{ textAlign:'right' }}>
                            <div style={{ fontSize:'18px', fontWeight:'900', color:'#0f172a' }}>₹{parseFloat(b.total_price || 0).toLocaleString('en-IN')}</div>
                            <div style={{ fontSize:'11px', color:'#94a3b8' }}>Booking #{b.id}</div>
                          </div>
                        </div>

                        <div style={{ display:'flex', gap:'20px', flexWrap:'wrap', marginBottom:'20px' }}>
                          <span style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', color:'#64748b' }}>
                            <Calendar size={13}/> {new Date(b.scheduled_date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                          </span>
                          <span style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', color:'#64748b' }}>
                            <Clock size={13}/> {b.scheduled_time?.slice(0,5) || '—'}
                          </span>
                          <span style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', color:'#64748b' }}>
                            <MapPin size={13}/> {b.city || '—'}
                          </span>
                        </div>

                        {/* Actions */}
                        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center' }}>
                          <Link to={`/bookings/${b.id}`}
                            style={{ display:'flex', alignItems:'center', gap:'6px', padding:'9px 18px', background:'#f5f3ff', color:'#7c3aed', border:'1.5px solid #ddd6fe', borderRadius:'10px', fontWeight:'700', fontSize:'13px', textDecoration:'none', transition:'all 0.2s' }}
                            onMouseOver={e=>e.currentTarget.style.background='#ede9fe'}
                            onMouseOut={e=>e.currentTarget.style.background='#f5f3ff'}>
                            <ArrowRight size={13}/> View Details
                          </Link>
                          {/* Pay Now — for unpaid pending/confirmed bookings */}
                          {canCancel && !paid.has(b.id) && payingId !== b.id && (
                            <button onClick={() => setPayingId(b.id)}
                              style={{ display:'flex', alignItems:'center', gap:'6px', padding:'9px 18px', background:'#ecfdf5', color:'#059669', border:'1.5px solid #a7f3d0', borderRadius:'10px', fontWeight:'700', fontSize:'13px', cursor:'pointer', transition:'all 0.2s' }}
                              onMouseOver={e => e.currentTarget.style.background='#d1fae5'}
                              onMouseOut={e => e.currentTarget.style.background='#ecfdf5'}>
                              💳 Pay Now
                            </button>
                          )}
                          {paid.has(b.id) && (
                            <span style={{ display:'flex', alignItems:'center', gap:'6px', padding:'9px 18px', background:'#ecfdf5', color:'#059669', borderRadius:'10px', fontWeight:'700', fontSize:'13px' }}>
                              ✓ Paid
                            </span>
                          )}
                          {canReview && (
                            <button onClick={() => setReviewModal(b.id)}
                              style={{ display:'flex', alignItems:'center', gap:'6px', padding:'9px 18px', background:'#fffbeb', color:'#d97706', border:'1.5px solid #fde68a', borderRadius:'10px', fontWeight:'700', fontSize:'13px', cursor:'pointer', transition:'all 0.2s' }}
                              onMouseOver={e=>{e.currentTarget.style.background='#fef3c7'}}
                              onMouseOut={e=>{e.currentTarget.style.background='#fffbeb'}}>
                              <Star size={13}/> Leave Review
                            </button>
                          )}
                          {reviewed.has(b.id) && (
                            <span style={{ display:'flex', alignItems:'center', gap:'6px', padding:'9px 18px', background:'#ecfdf5', color:'#059669', borderRadius:'10px', fontWeight:'700', fontSize:'13px' }}>
                              <CheckCircle size={13}/> Reviewed
                            </span>
                          )}
                          {canCancel && (
                            <button onClick={() => handleCancel(b.id)} disabled={cancelling === b.id}
                              style={{ display:'flex', alignItems:'center', gap:'6px', padding:'9px 18px', background:'#fef2f2', color:'#dc2626', border:'1.5px solid #fecaca', borderRadius:'10px', fontWeight:'700', fontSize:'13px', cursor: cancelling === b.id ? 'wait' : 'pointer', transition:'all 0.2s' }}
                              onMouseOver={e=>{e.currentTarget.style.background='#fee2e2'}}
                              onMouseOut={e=>{e.currentTarget.style.background='#fef2f2'}}>
                              <X size={13}/> {cancelling === b.id ? 'Cancelling…' : 'Cancel'}
                            </button>
                          )}
                          {b.status === 'completed' && b.provider_id && (
                            <Link
                              to={`/book/${b.provider_id}?service=${b.service_id}`}
                              state={{ rebook: true, prefill: { address: b.address, city: b.city, pincode: b.pincode } }}
                              style={{ display:'flex', alignItems:'center', gap:'6px', padding:'9px 18px', background:'#faf5ff', color:'#7c3aed', border:'1.5px solid #ddd6fe', borderRadius:'10px', fontWeight:'700', fontSize:'13px', textDecoration:'none', transition:'all 0.2s' }}
                              onMouseOver={e=>e.currentTarget.style.background='#ede9fe'}
                              onMouseOut={e=>e.currentTarget.style.background='#faf5ff'}>
                              <RefreshCw size={13}/> Book Again
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Inline Razorpay panel */}
                      {payingId === b.id && (
                        <div style={{ padding:'16px 28px 20px', borderTop:'1px solid #f1f5f9', background:'#fafffe' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                            <span style={{ fontSize:'13px', fontWeight:'700', color:'#374151' }}>Complete Payment — ₹{parseFloat(b.total_price || 0).toLocaleString('en-IN')}</span>
                            <button onClick={() => setPayingId(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:'13px', fontWeight:'600' }}>✕ Close</button>
                          </div>
                          <RazorpayButton
                            bookingId={b.id}
                            amount={`₹${parseFloat(b.total_price || 0).toLocaleString('en-IN')}`}
                            onSuccess={() => {
                              setPaid(prev => new Set([...prev, b.id]))
                              setPayingId(null)
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </AnimatePresence>
        )}
      </div>

      {reviewModal && (
        <ReviewModal
          bookingId={reviewModal}
          onClose={() => setReviewModal(null)}
          onDone={() => {
            setReviewed(prev => new Set([...prev, reviewModal]))
            setReviewModal(null)
          }}
        />
      )}
    </div>
  )
}
