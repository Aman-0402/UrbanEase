import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Calendar, Clock, MapPin, IndianRupee, CheckCircle,
  AlertCircle, Star, CreditCard, XCircle, User, Briefcase,
} from 'lucide-react'
import { getBookingDetail, cancelBooking, submitReview, getBookingReview } from '../api/bookings'
import { getPaymentStatus } from '../api/payments'
import Navbar from '../components/layout/Navbar'
import MockPaymentButton from '../components/RazorpayButton'

const STATUS_COLOR = {
  pending:     { bg:'#fef3c7', color:'#92400e', dot:'#f59e0b' },
  confirmed:   { bg:'#dbeafe', color:'#1e40af', dot:'#3b82f6' },
  in_progress: { bg:'#ede9fe', color:'#5b21b6', dot:'#7c3aed' },
  completed:   { bg:'#d1fae5', color:'#065f46', dot:'#10b981' },
  cancelled:   { bg:'#fee2e2', color:'#991b1b', dot:'#ef4444' },
}

const STATUS_LABEL = {
  pending:'Pending', confirmed:'Confirmed', in_progress:'In Progress',
  completed:'Completed', cancelled:'Cancelled',
}

function timeAgo(dt) {
  const s = (Date.now() - new Date(dt)) / 1000
  if (s < 60)   return 'just now'
  if (s < 3600)  return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display:'flex', gap:'4px' }}>
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={28} style={{ cursor:'pointer', transition:'transform 0.1s' }}
          fill={(hover||value) >= n ? '#f59e0b' : 'none'}
          color={(hover||value) >= n ? '#f59e0b' : '#d1d5db'}
          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          strokeWidth={1.5}/>
      ))}
    </div>
  )
}

export default function BookingDetail() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const [booking,   setBooking]   = useState(null)
  const [payment,   setPayment]   = useState(null)
  const [review,    setReview]    = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')

  // Cancel state
  const [cancelling,  setCancelling]  = useState(false)
  const [cancelError, setCancelError] = useState('')

  // Review modal state
  const [reviewOpen,   setReviewOpen]   = useState(false)
  const [rating,       setRating]       = useState(5)
  const [comment,      setComment]      = useState('')
  const [reviewSaving, setReviewSaving] = useState(false)
  const [reviewError,  setReviewError]  = useState('')

  // Pay inline
  const [payOpen, setPayOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      getBookingDetail(id),
      getPaymentStatus(id).catch(() => null),
      getBookingReview(id).catch(() => null),
    ]).then(([bRes, pRes, rRes]) => {
      setBooking(bRes.data)
      if (pRes) setPayment(pRes.data)
      if (rRes) setReview(rRes.data)
    }).catch(() => setError('Booking not found.')).finally(() => setLoading(false))
  }, [id])

  async function handleCancel() {
    if (!window.confirm('Cancel this booking?')) return
    setCancelling(true); setCancelError('')
    try {
      const res = await cancelBooking(id)
      setBooking(res.data)
    } catch (e) {
      setCancelError(e.response?.data?.detail || 'Could not cancel booking.')
    } finally { setCancelling(false) }
  }

  async function handleReview(e) {
    e.preventDefault()
    setReviewSaving(true); setReviewError('')
    try {
      const res = await submitReview(id, { rating, comment })
      setReview(res.data)
      setReviewOpen(false)
    } catch (e) {
      setReviewError(e.response?.data?.detail || 'Could not submit review.')
    } finally { setReviewSaving(false) }
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:'system-ui,-apple-system,sans-serif' }}>
      <Navbar/>
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
        <div style={{ width:'40px', height:'40px', border:'4px solid #e5e7eb', borderTopColor:'#7c3aed', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  if (error || !booking) return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:'system-ui,-apple-system,sans-serif' }}>
      <Navbar/>
      <div style={{ maxWidth:'600px', margin:'120px auto', textAlign:'center', padding:'0 24px' }}>
        <AlertCircle size={48} color="#ef4444" style={{ marginBottom:'16px' }}/>
        <h2 style={{ fontSize:'20px', fontWeight:'800', color:'#0f172a', marginBottom:'8px' }}>{error || 'Not found'}</h2>
        <Link to="/bookings" style={{ color:'#7c3aed', fontWeight:'700', textDecoration:'none' }}>← Back to bookings</Link>
      </div>
    </div>
  )

  const st    = STATUS_COLOR[booking.status] || STATUS_COLOR.pending
  const paid  = payment?.paid
  const canPay    = !paid && booking.status !== 'cancelled'
  const canCancel = booking.can_cancel
  const canReview = booking.status === 'completed' && !review

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:'system-ui,-apple-system,sans-serif' }}>
      <Navbar/>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#7c3aed 0%,#4338ca 100%)', padding:'40px 40px 36px' }}>
        <div style={{ maxWidth:'900px', margin:'0 auto' }}>
          <Link to="/bookings" style={{ display:'inline-flex', alignItems:'center', gap:'8px', color:'rgba(255,255,255,0.7)', fontSize:'14px', fontWeight:'600', textDecoration:'none', marginBottom:'20px' }}
            onMouseOver={e=>e.currentTarget.style.color='white'}
            onMouseOut={e=>e.currentTarget.style.color='rgba(255,255,255,0.7)'}>
            <ArrowLeft size={15}/> My Bookings
          </Link>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'16px' }}>
            <div>
              <h1 style={{ fontSize:'clamp(20px,3vw,28px)', fontWeight:'900', color:'white', marginBottom:'6px' }}>
                {booking.service.name}
              </h1>
              <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'14px' }}>Booking #{booking.id}</p>
            </div>
            <span style={{ display:'inline-flex', alignItems:'center', gap:'7px', padding:'8px 16px', borderRadius:'100px', background:st.bg, color:st.color, fontWeight:'800', fontSize:'13px' }}>
              <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:st.dot, flexShrink:0 }}/>
              {STATUS_LABEL[booking.status]}
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'32px 40px', display:'grid', gridTemplateColumns:'1fr 340px', gap:'24px', alignItems:'start' }}>

        {/* Left column */}
        <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

          {/* Service + provider */}
          <Card title="Booking Details">
            <Row icon={<Briefcase size={15} color="#7c3aed"/>} label="Service" value={booking.service.name}/>
            <Row icon={<User size={15} color="#7c3aed"/>}      label="Provider" value={
              <Link to={`/providers/${booking.provider.id}`} style={{ color:'#7c3aed', fontWeight:'700', textDecoration:'none' }}>
                {booking.provider.full_name || 'Provider'}
              </Link>
            }/>
            <Row icon={<Calendar size={15} color="#7c3aed"/>}  label="Date" value={new Date(booking.scheduled_date).toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}/>
            <Row icon={<Clock size={15} color="#7c3aed"/>}     label="Time" value={booking.scheduled_time}/>
            <Row icon={<MapPin size={15} color="#7c3aed"/>}    label="Address" value={`${booking.address}, ${booking.city}${booking.pincode ? ' — ' + booking.pincode : ''}`}/>
            {booking.notes && <Row icon={<AlertCircle size={15} color="#7c3aed"/>} label="Notes" value={booking.notes}/>}
          </Card>

          {/* Payment */}
          <Card title="Payment">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
              <span style={{ fontSize:'14px', color:'#64748b' }}>Total Amount</span>
              <span style={{ display:'flex', alignItems:'center', gap:'2px', fontSize:'22px', fontWeight:'900', color:'#0f172a' }}>
                <IndianRupee size={16} strokeWidth={2.5}/>
                {parseFloat(booking.total_price).toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 14px', borderRadius:'10px', background: paid ? '#ecfdf5' : '#fef9c3', border:`1px solid ${paid ? '#a7f3d0' : '#fde68a'}` }}>
              {paid
                ? <><CheckCircle size={15} color="#059669"/><span style={{ fontSize:'13px', fontWeight:'700', color:'#059669' }}>Paid</span></>
                : <><CreditCard size={15} color="#92400e"/><span style={{ fontSize:'13px', fontWeight:'700', color:'#92400e' }}>Payment pending</span></>
              }
            </div>
            {canPay && (
              <div style={{ marginTop:'12px' }}>
                {!payOpen
                  ? <button onClick={() => setPayOpen(true)}
                      style={{ width:'100%', padding:'12px', background:'linear-gradient(135deg,#059669,#047857)', color:'white', border:'none', borderRadius:'12px', fontWeight:'800', fontSize:'14px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                      <CreditCard size={16}/> Pay Now
                    </button>
                  : <MockPaymentButton bookingId={booking.id} amount={`₹${parseFloat(booking.total_price).toLocaleString('en-IN')}`}
                      onSuccess={() => { setPayment({ paid:true }); setPayOpen(false) }}/>
                }
              </div>
            )}
          </Card>

          {/* Status timeline */}
          {booking.logs?.length > 0 && (
            <Card title="Status Timeline">
              <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
                {booking.logs.map((log, i) => (
                  <div key={log.id} style={{ display:'flex', gap:'14px', position:'relative' }}>
                    {/* connector line */}
                    {i < booking.logs.length - 1 && (
                      <div style={{ position:'absolute', left:'10px', top:'24px', bottom:'-8px', width:'2px', background:'#e5e7eb' }}/>
                    )}
                    <div style={{ width:'22px', height:'22px', borderRadius:'50%', background:STATUS_COLOR[log.to_status]?.dot || '#94a3b8', flexShrink:0, marginTop:'2px', border:'3px solid white', boxShadow:'0 0 0 2px #e5e7eb' }}/>
                    <div style={{ paddingBottom:'20px', flex:1 }}>
                      <div style={{ fontSize:'13px', fontWeight:'700', color:'#0f172a' }}>
                        {log.from_status ? `${STATUS_LABEL[log.from_status]} → ${STATUS_LABEL[log.to_status]}` : STATUS_LABEL[log.to_status]}
                      </div>
                      {log.note && <div style={{ fontSize:'12px', color:'#64748b', marginTop:'2px' }}>{log.note}</div>}
                      <div style={{ fontSize:'11px', color:'#94a3b8', marginTop:'3px' }}>
                        {log.changed_by_name && <span>{log.changed_by_name} · </span>}
                        {timeAgo(log.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Review */}
          {review && (
            <Card title="Your Review">
              <div style={{ display:'flex', gap:'3px', marginBottom:'8px' }}>
                {[1,2,3,4,5].map(n => <Star key={n} size={16} fill={n<=review.rating?'#f59e0b':'none'} color={n<=review.rating?'#f59e0b':'#d1d5db'} strokeWidth={1.5}/>)}
                <span style={{ marginLeft:'8px', fontSize:'13px', fontWeight:'700', color:'#0f172a' }}>{review.rating}/5</span>
              </div>
              {review.comment && <p style={{ fontSize:'14px', color:'#374151', lineHeight:1.6, margin:0 }}>{review.comment}</p>}
            </Card>
          )}

          {/* Cancel error */}
          {cancelError && (
            <div style={{ display:'flex', gap:'8px', padding:'12px 14px', background:'#fef2f2', borderRadius:'12px', border:'1px solid #fecaca' }}>
              <AlertCircle size={15} color="#ef4444" style={{ flexShrink:0, marginTop:'1px' }}/>
              <p style={{ color:'#dc2626', fontSize:'13px', margin:0 }}>{cancelError}</p>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px', position:'sticky', top:'88px' }}>

          {/* Provider card */}
          <Card title="Provider">
            <div style={{ display:'flex', gap:'14px', alignItems:'center' }}>
              <div style={{ width:'52px', height:'52px', borderRadius:'16px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'20px', fontWeight:'800', flexShrink:0 }}>
                {(booking.provider.full_name||'?').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize:'15px', fontWeight:'800', color:'#0f172a' }}>{booking.provider.full_name || 'Provider'}</div>
                <div style={{ display:'flex', gap:'3px', marginTop:'3px' }}>
                  {[1,2,3,4,5].map(n => <Star key={n} size={11} fill={n<=Math.round(booking.provider.avg_rating)?'#f59e0b':'none'} color={n<=Math.round(booking.provider.avg_rating)?'#f59e0b':'#d1d5db'} strokeWidth={1.5}/>)}
                </div>
                {booking.provider.city && <div style={{ fontSize:'12px', color:'#94a3b8', marginTop:'2px' }}>{booking.provider.city}</div>}
              </div>
            </div>
            <Link to={`/providers/${booking.provider.id}`}
              style={{ display:'block', marginTop:'14px', padding:'10px', textAlign:'center', border:'2px solid #e5e7eb', borderRadius:'11px', color:'#374151', fontWeight:'700', fontSize:'13px', textDecoration:'none', transition:'all 0.2s' }}
              onMouseOver={e=>{e.currentTarget.style.borderColor='#7c3aed';e.currentTarget.style.color='#7c3aed'}}
              onMouseOut={e=>{e.currentTarget.style.borderColor='#e5e7eb';e.currentTarget.style.color='#374151'}}>
              View Profile
            </Link>
          </Card>

          {/* Actions */}
          <Card title="Actions">
            {canReview && (
              <button onClick={() => setReviewOpen(true)}
                style={{ width:'100%', padding:'12px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', color:'white', border:'none', borderRadius:'12px', fontWeight:'800', fontSize:'14px', cursor:'pointer', marginBottom:'10px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                <Star size={15}/> Leave a Review
              </button>
            )}
            {canCancel && (
              <button onClick={handleCancel} disabled={cancelling}
                style={{ width:'100%', padding:'11px', background:'white', color:'#dc2626', border:'2px solid #fecaca', borderRadius:'12px', fontWeight:'700', fontSize:'13px', cursor:cancelling?'wait':'pointer', transition:'all 0.2s' }}
                onMouseOver={e=>{if(!cancelling){e.currentTarget.style.background='#fef2f2'}}}
                onMouseOut={e=>e.currentTarget.style.background='white'}>
                <XCircle size={14} style={{ marginRight:'6px', verticalAlign:'middle' }}/>
                {cancelling ? 'Cancelling…' : 'Cancel Booking'}
              </button>
            )}
            {!canReview && !canCancel && (
              <p style={{ fontSize:'13px', color:'#94a3b8', textAlign:'center', margin:0 }}>No actions available</p>
            )}
          </Card>
        </div>
      </div>

      {/* Review Modal */}
      {reviewOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}
          onClick={e=>{ if(e.target===e.currentTarget) setReviewOpen(false) }}>
          <motion.div initial={{scale:0.92,opacity:0}} animate={{scale:1,opacity:1}} transition={{duration:0.18}}
            style={{ background:'white', borderRadius:'20px', width:'100%', maxWidth:'440px', padding:'32px', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize:'20px', fontWeight:'800', color:'#0f172a', marginBottom:'4px' }}>Leave a Review</h2>
            <p style={{ fontSize:'13px', color:'#64748b', marginBottom:'24px' }}>How was your experience with {booking.provider.full_name || 'the provider'}?</p>
            <form onSubmit={handleReview} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}>
                <StarPicker value={rating} onChange={setRating}/>
                <span style={{ fontSize:'13px', color:'#64748b' }}>{['','Terrible','Poor','Okay','Good','Excellent'][rating]}</span>
              </div>
              <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={3} placeholder="Tell others about your experience (optional)…"
                style={{ padding:'12px 14px', border:'2px solid #e5e7eb', borderRadius:'11px', fontSize:'14px', color:'#0f172a', outline:'none', resize:'vertical', fontFamily:'system-ui,-apple-system,sans-serif' }}
                onFocus={e=>e.target.style.borderColor='#7c3aed'} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
              {reviewError && <p style={{ color:'#dc2626', fontSize:'12px', margin:0 }}>{reviewError}</p>}
              <div style={{ display:'flex', gap:'10px' }}>
                <button type="button" onClick={()=>setReviewOpen(false)}
                  style={{ flex:1, padding:'12px', border:'2px solid #e5e7eb', borderRadius:'12px', fontWeight:'700', fontSize:'14px', color:'#374151', background:'white', cursor:'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={reviewSaving}
                  style={{ flex:2, padding:'12px', background:reviewSaving?'#e5e7eb':'linear-gradient(135deg,#7c3aed,#4338ca)', color:reviewSaving?'#9ca3af':'white', border:'none', borderRadius:'12px', fontWeight:'800', fontSize:'14px', cursor:reviewSaving?'wait':'pointer' }}>
                  {reviewSaving ? 'Submitting…' : 'Submit Review'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

/* ── Helpers ── */
function Card({ title, children }) {
  return (
    <div style={{ background:'white', borderRadius:'20px', padding:'24px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
      <h3 style={{ fontSize:'14px', fontWeight:'800', color:'#0f172a', marginBottom:'18px', textTransform:'uppercase', letterSpacing:'0.5px' }}>{title}</h3>
      {children}
    </div>
  )
}

function Row({ icon, label, value }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:'10px', marginBottom:'12px' }}>
      <div style={{ marginTop:'2px', flexShrink:0 }}>{icon}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:'11px', color:'#94a3b8', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:'2px' }}>{label}</div>
        <div style={{ fontSize:'14px', color:'#0f172a', fontWeight:'600', lineHeight:1.4 }}>{value}</div>
      </div>
    </div>
  )
}
