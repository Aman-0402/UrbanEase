import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Calendar, Clock, MapPin, IndianRupee, CheckCircle, AlertCircle, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'
import { getProviderById } from '../api/services'
import { createBooking } from '../api/bookings'
import RazorpayButton from '../components/RazorpayButton'
import Navbar from '../components/layout/Navbar'

const inputStyle = (focused) => ({
  width:'100%', padding:'13px 16px', border:`2px solid ${focused ? '#7c3aed' : '#e5e7eb'}`,
  borderRadius:'12px', fontSize:'14px', color:'#0f172a', outline:'none',
  background:'white', transition:'border 0.2s', boxSizing:'border-box',
})

export default function BookingFlow() {
  const { providerId }  = useParams()
  const [searchParams]  = useSearchParams()
  const preSelectId     = searchParams.get('service') ? parseInt(searchParams.get('service')) : null
  const navigate        = useNavigate()
  const location        = useLocation()
  const prefill         = location.state?.prefill || {}
  const isRebook        = !!location.state?.rebook

  const [provider,    setProvider]    = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState('')
  const [booking,     setBooking]     = useState(null)
  const [focusedField,setFocused]     = useState('')

  // Negotiation
  const [negotiating,      setNegotiating]      = useState(false)
  const [proposedPrice,    setProposedPrice]    = useState('')
  const [negotiationNote,  setNegotiationNote]  = useState('')

  // Multi-service selection: [{ id, name, icon, price }]
  const [selectedServices, setSelectedServices] = useState([])

  const [form, setForm] = useState({
    scheduled_date: '',
    scheduled_time: '',
    address:        prefill.address || '',
    city:           prefill.city    || '',
    pincode:        prefill.pincode || '',
    notes:          prefill.notes   || '',
  })

  useEffect(() => {
    getProviderById(providerId).then(res => {
      setProvider(res.data)
      // Pre-select the service passed via URL query param
      if (preSelectId) {
        const svc = res.data.services?.find(s => s.id === preSelectId)
        if (svc) setSelectedServices([{ id: svc.id, name: svc.name, icon: svc.category_icon, price: parseFloat(svc.custom_price ?? svc.base_price) }])
      }
    }).finally(() => setLoading(false))
  }, [providerId])

  // Provider's offered services with effective price
  const providerServices = (provider?.services || []).map(s => ({
    id:            s.id,
    name:          s.name,
    icon:          s.category_icon,
    category:      s.category_name,
    base_price:    parseFloat(s.base_price),
    custom_price:  s.custom_price !== null && s.custom_price !== undefined ? parseFloat(s.custom_price) : null,
    effectivePrice: s.custom_price !== null && s.custom_price !== undefined ? parseFloat(s.custom_price) : parseFloat(s.base_price),
    duration_display: s.duration_display,
  }))

  function toggleService(svc) {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === svc.id)
      if (exists) return prev.filter(s => s.id !== svc.id)
      return [...prev, { id: svc.id, name: svc.name, icon: svc.icon, price: svc.effectivePrice }]
    })
    setError('')
  }

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedServices.length) { setError('Please select at least one service.'); return }
    if (!form.scheduled_date || !form.scheduled_time || !form.address || !form.city) {
      setError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        provider:       parseInt(providerId),
        services:       selectedServices.map(s => s.id),
        scheduled_date: form.scheduled_date,
        scheduled_time: form.scheduled_time,
        address:        form.address,
        city:           form.city,
        pincode:        form.pincode,
        notes:          form.notes,
      }
      if (negotiating && proposedPrice) {
        payload.proposed_price   = proposedPrice
        payload.negotiation_note = negotiationNote
      }
      const res = await createBooking(payload)
      setBooking(res.data)
    } catch (err) {
      const data = err.response?.data
      if (typeof data === 'object') setError(Object.values(data).flat().join(' '))
      else setError('Booking failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc' }}>
      <div style={{ textAlign:'center', color:'#64748b', fontSize:'15px' }}>Loading…</div>
    </div>
  )

  if (booking) return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui,-apple-system,sans-serif', padding:'20px' }}>
      <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
        style={{ background:'white', borderRadius:'28px', padding:'48px', maxWidth:'480px', width:'100%', boxShadow:'0 8px 40px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ width:'72px', height:'72px', background:'#ecfdf5', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
            <CheckCircle size={36} color="#059669"/>
          </div>
          <h2 style={{ fontSize:'22px', fontWeight:'900', color:'#0f172a', marginBottom:'8px' }}>Booking Placed!</h2>
          <p style={{ color:'#64748b', fontSize:'14px', lineHeight:1.6 }}>
            Booking #{booking.id} is pending.{negotiating && proposedPrice ? ' Your price proposal has been sent to the provider.' : ' Complete payment to secure your slot.'}
          </p>
          {negotiating && proposedPrice && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'6px 14px', background:'#fef9c3', border:'1px solid #fde047', borderRadius:'20px', fontSize:'12px', fontWeight:'700', color:'#854d0e' }}>
              💬 Proposed ₹{parseFloat(proposedPrice).toLocaleString('en-IN')} · awaiting provider response
            </div>
          )}
        </div>

        {/* Services summary */}
        <div style={{ background:'#f8fafc', borderRadius:'16px', padding:'20px', marginBottom:'24px' }}>
          {selectedServices.map(s => (
            <div key={s.id} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f1f5f9' }}>
              <span style={{ fontSize:'13px', color:'#374151' }}>{s.name}</span>
              <span style={{ fontSize:'13px', fontWeight:'700', color:'#0f172a' }}>₹{s.price.toLocaleString('en-IN')}</span>
            </div>
          ))}
          {[
            { label:'Date',     value: form.scheduled_date },
            { label:'Time',     value: form.scheduled_time },
            { label:'Provider', value: provider?.full_name || '—' },
          ].map(r => (
            <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f1f5f9' }}>
              <span style={{ fontSize:'13px', color:'#64748b' }}>{r.label}</span>
              <span style={{ fontSize:'13px', fontWeight:'700', color:'#0f172a' }}>{r.value}</span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', paddingTop:'12px' }}>
            <span style={{ fontSize:'14px', fontWeight:'700', color:'#374151' }}>Total</span>
            <span style={{ fontSize:'18px', fontWeight:'900', color:'#7c3aed' }}>₹{totalPrice.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <RazorpayButton
          bookingId={booking.id}
          amount={`₹${totalPrice.toLocaleString('en-IN')}`}
          onSuccess={() => navigate('/bookings')}
        />
        <div style={{ marginTop:'12px' }}>
          <Link to="/bookings" style={{ display:'block', textAlign:'center', padding:'12px', border:'2px solid #e5e7eb', color:'#374151', borderRadius:'13px', fontWeight:'700', fontSize:'14px', textDecoration:'none', transition:'border 0.2s' }}
            onMouseOver={e => e.currentTarget.style.borderColor='#7c3aed'}
            onMouseOut={e => e.currentTarget.style.borderColor='#e5e7eb'}>
            Pay Later — View Bookings
          </Link>
        </div>
      </motion.div>
    </div>
  )

  // Group provider services by category for display
  const grouped = providerServices.reduce((acc, s) => {
    const cat = s.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {})

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:'system-ui,-apple-system,sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth:'920px', margin:'0 auto', padding:'40px 40px' }}>

        <Link to={-1} style={{ display:'inline-flex', alignItems:'center', gap:'8px', color:'#64748b', fontSize:'14px', fontWeight:'600', textDecoration:'none', marginBottom:'28px' }}
          onMouseOver={e=>e.currentTarget.style.color='#7c3aed'}
          onMouseOut={e=>e.currentTarget.style.color='#64748b'}>
          <ArrowLeft size={15}/> Back
        </Link>

        {isRebook && (
          <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'14px 18px', background:'#f5f3ff', border:'2px solid #ddd6fe', borderRadius:'14px', marginBottom:'24px' }}>
            <span style={{ fontSize:'20px' }}>🔁</span>
            <div>
              <div style={{ fontSize:'13px', fontWeight:'800', color:'#6d28d9' }}>Rebooking</div>
              <div style={{ fontSize:'12px', color:'#8b5cf6' }}>Previous address pre-filled — just pick a new date, time &amp; services.</div>
            </div>
          </div>
        )}

        <h1 style={{ fontSize:'26px', fontWeight:'900', color:'#0f172a', marginBottom:'6px', letterSpacing:'-0.4px' }}>
          {isRebook ? 'Book Again' : 'Book a Service'}
        </h1>
        <p style={{ color:'#64748b', fontSize:'14px', marginBottom:'36px' }}>Select one or more services, then fill in your details</p>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'28px', alignItems:'start' }}>

          {/* Left: service picker + form */}
          <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>

            {/* ── Service picker ── */}
            <div style={{ background:'white', borderRadius:'24px', padding:'28px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
                <h3 style={{ fontSize:'15px', fontWeight:'800', color:'#0f172a', margin:0 }}>Select Services</h3>
                {selectedServices.length > 0 && (
                  <span style={{ fontSize:'12px', fontWeight:'700', padding:'4px 10px', borderRadius:'20px', background:'#f5f3ff', color:'#7c3aed' }}>
                    {selectedServices.length} selected
                  </span>
                )}
              </div>

              {providerServices.length === 0 ? (
                <p style={{ fontSize:'13px', color:'#94a3b8', textAlign:'center', padding:'20px 0' }}>This provider has no services listed yet.</p>
              ) : (
                Object.entries(grouped).map(([cat, svcs]) => (
                  <div key={cat} style={{ marginBottom:'16px' }}>
                    <p style={{ fontSize:'11px', fontWeight:'800', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'8px' }}>{cat}</p>
                    <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                      {svcs.map(svc => {
                        const isSelected = selectedServices.some(s => s.id === svc.id)
                        return (
                          <motion.div key={svc.id} whileTap={{ scale:0.98 }}
                            onClick={() => toggleService(svc)}
                            style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 16px', borderRadius:'14px', border:`2px solid ${isSelected ? '#7c3aed' : '#f1f5f9'}`, background: isSelected ? '#faf5ff' : 'white', cursor:'pointer', transition:'all 0.15s', userSelect:'none' }}>
                            {/* Checkbox */}
                            <div style={{ width:'20px', height:'20px', borderRadius:'6px', border:`2px solid ${isSelected ? '#7c3aed' : '#d1d5db'}`, background: isSelected ? '#7c3aed' : 'white', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' }}>
                              {isSelected && <CheckCircle size={13} color="white" strokeWidth={3}/>}
                            </div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:'14px', fontWeight: isSelected ? '700' : '600', color: isSelected ? '#6d28d9' : '#0f172a' }}>{svc.name}</div>
                              <div style={{ fontSize:'11px', color:'#94a3b8', marginTop:'2px' }}>{svc.duration_display}</div>
                            </div>
                            <div style={{ textAlign:'right' }}>
                              <div style={{ fontSize:'15px', fontWeight:'800', color: isSelected ? '#7c3aed' : '#0f172a' }}>
                                ₹{svc.effectivePrice.toLocaleString('en-IN')}
                              </div>
                              {svc.custom_price !== null && (
                                <div style={{ fontSize:'11px', color:'#94a3b8', textDecoration:'line-through' }}>
                                  ₹{svc.base_price.toLocaleString('en-IN')}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ── Booking form ── */}
            <form onSubmit={handleSubmit}>
              <div style={{ background:'white', borderRadius:'24px', padding:'28px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', display:'flex', flexDirection:'column', gap:'20px' }}>
                <h3 style={{ fontSize:'15px', fontWeight:'800', color:'#0f172a', margin:0 }}>Booking Details</h3>

                {/* Date & Time */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
                  <div>
                    <label style={{ display:'block', fontSize:'13px', fontWeight:'700', color:'#374151', marginBottom:'8px' }}>Date *</label>
                    <input type="date" name="scheduled_date" min={today} value={form.scheduled_date} onChange={handleChange}
                      style={inputStyle(focusedField==='date')}
                      onFocus={()=>setFocused('date')} onBlur={()=>setFocused('')}/>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:'13px', fontWeight:'700', color:'#374151', marginBottom:'8px' }}>Time *</label>
                    <input type="time" name="scheduled_time" value={form.scheduled_time} onChange={handleChange}
                      style={inputStyle(focusedField==='time')}
                      onFocus={()=>setFocused('time')} onBlur={()=>setFocused('')}/>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label style={{ display:'block', fontSize:'13px', fontWeight:'700', color:'#374151', marginBottom:'8px' }}>Address *</label>
                  <input type="text" name="address" placeholder="House/flat no., street, area" value={form.address} onChange={handleChange}
                    style={inputStyle(focusedField==='address')}
                    onFocus={()=>setFocused('address')} onBlur={()=>setFocused('')}/>
                </div>

                {/* City + Pincode */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
                  <div>
                    <label style={{ display:'block', fontSize:'13px', fontWeight:'700', color:'#374151', marginBottom:'8px' }}>City *</label>
                    <input type="text" name="city" placeholder="Mumbai" value={form.city} onChange={handleChange}
                      style={inputStyle(focusedField==='city')}
                      onFocus={()=>setFocused('city')} onBlur={()=>setFocused('')}/>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:'13px', fontWeight:'700', color:'#374151', marginBottom:'8px' }}>Pincode</label>
                    <input type="text" name="pincode" placeholder="400001" maxLength={6} value={form.pincode} onChange={handleChange}
                      style={inputStyle(focusedField==='pincode')}
                      onFocus={()=>setFocused('pincode')} onBlur={()=>setFocused('')}/>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label style={{ display:'block', fontSize:'13px', fontWeight:'700', color:'#374151', marginBottom:'8px' }}>Notes <span style={{ fontWeight:'400', color:'#94a3b8' }}>(optional)</span></label>
                  <textarea name="notes" rows={3} placeholder="Any special instructions for the provider…" value={form.notes} onChange={handleChange}
                    style={{ ...inputStyle(focusedField==='notes'), resize:'vertical', fontFamily:'inherit' }}
                    onFocus={()=>setFocused('notes')} onBlur={()=>setFocused('')}/>
                </div>

                {/* Negotiate price toggle */}
                <div style={{ border:`2px solid ${negotiating ? '#7c3aed' : '#e5e7eb'}`, borderRadius:'14px', overflow:'hidden', transition:'border 0.2s' }}>
                  <button type="button" onClick={() => setNegotiating(v => !v)}
                    style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', background: negotiating ? '#faf5ff' : 'white', border:'none', cursor:'pointer', textAlign:'left' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <MessageSquare size={16} color={negotiating ? '#7c3aed' : '#94a3b8'}/>
                      <div>
                        <div style={{ fontSize:'13px', fontWeight:'700', color: negotiating ? '#6d28d9' : '#374151' }}>Negotiate the Price</div>
                        <div style={{ fontSize:'11px', color:'#94a3b8' }}>Propose a lower total — provider will accept or decline</div>
                      </div>
                    </div>
                    {negotiating ? <ChevronUp size={16} color="#7c3aed"/> : <ChevronDown size={16} color="#94a3b8"/>}
                  </button>

                  <AnimatePresence>
                    {negotiating && (
                      <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }}>
                        <div style={{ padding:'0 16px 16px', display:'flex', flexDirection:'column', gap:'12px', borderTop:'1px solid #f1f5f9' }}>
                          <div style={{ paddingTop:'12px' }}>
                            <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'#374151', marginBottom:'8px' }}>Your Proposed Total (₹)</label>
                            <div style={{ display:'flex', alignItems:'center', gap:'0', border:'2px solid #ddd6fe', borderRadius:'10px', overflow:'hidden' }}>
                              <span style={{ padding:'11px 12px', background:'#f5f3ff', fontSize:'13px', color:'#7c3aed', fontWeight:'700', borderRight:'2px solid #ddd6fe' }}>₹</span>
                              <input type="number" min="1" step="1" value={proposedPrice}
                                onChange={e => setProposedPrice(e.target.value)}
                                placeholder={totalPrice > 0 ? String(Math.round(totalPrice * 0.8)) : 'Enter amount'}
                                style={{ flex:1, border:'none', outline:'none', padding:'11px 12px', fontSize:'14px', color:'#0f172a', fontWeight:'700', background:'transparent' }}/>
                              {totalPrice > 0 && proposedPrice && (
                                <span style={{ padding:'0 12px', fontSize:'12px', color: parseFloat(proposedPrice) < totalPrice ? '#059669' : '#dc2626', fontWeight:'700', whiteSpace:'nowrap' }}>
                                  {parseFloat(proposedPrice) < totalPrice ? `Save ₹${(totalPrice - parseFloat(proposedPrice)).toLocaleString('en-IN')}` : 'Above list price'}
                                </span>
                              )}
                            </div>
                            {totalPrice > 0 && (
                              <p style={{ fontSize:'11px', color:'#94a3b8', marginTop:'4px' }}>Listed price: ₹{totalPrice.toLocaleString('en-IN')}</p>
                            )}
                          </div>
                          <div>
                            <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'#374151', marginBottom:'8px' }}>Message to Provider <span style={{ fontWeight:'400', color:'#94a3b8' }}>(optional)</span></label>
                            <textarea rows={2} value={negotiationNote} onChange={e => setNegotiationNote(e.target.value)}
                              placeholder="e.g. Regular customer, can we do ₹500 for both services?"
                              style={{ width:'100%', padding:'10px 12px', border:'2px solid #e5e7eb', borderRadius:'10px', fontSize:'13px', color:'#0f172a', outline:'none', resize:'none', fontFamily:'inherit', boxSizing:'border-box' }}
                              onFocus={e => e.target.style.borderColor='#7c3aed'}
                              onBlur={e => e.target.style.borderColor='#e5e7eb'}/>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {error && (
                  <div style={{ display:'flex', alignItems:'flex-start', gap:'10px', padding:'14px 16px', background:'#fef2f2', borderRadius:'12px', border:'1px solid #fecaca' }}>
                    <AlertCircle size={16} color="#ef4444" style={{ flexShrink:0, marginTop:'1px' }}/>
                    <p style={{ color:'#dc2626', fontSize:'13px', margin:0, lineHeight:1.5 }}>{error}</p>
                  </div>
                )}

                <button type="submit" disabled={submitting || !selectedServices.length}
                  style={{ padding:'15px', background: !selectedServices.length ? '#e5e7eb' : 'linear-gradient(135deg,#7c3aed,#4338ca)', color: !selectedServices.length ? '#9ca3af' : 'white', border:'none', borderRadius:'14px', fontWeight:'800', fontSize:'15px', cursor: (submitting || !selectedServices.length) ? 'not-allowed' : 'pointer', boxShadow: selectedServices.length ? '0 4px 16px rgba(124,58,237,0.35)' : 'none', transition:'all 0.2s', opacity: submitting ? 0.75 : 1 }}>
                  {submitting ? 'Placing Booking…' : `Confirm Booking${selectedServices.length ? ` · ₹${totalPrice.toLocaleString('en-IN')}` : ''}`}
                </button>
              </div>
            </form>
          </div>

          {/* Right: sticky summary */}
          <div style={{ position:'sticky', top:'88px' }}>
            <div style={{ background:'white', borderRadius:'24px', padding:'28px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize:'15px', fontWeight:'800', color:'#0f172a', marginBottom:'20px' }}>Booking Summary</h3>

              {/* Provider */}
              <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'20px', paddingBottom:'20px', borderBottom:'1px solid #f1f5f9' }}>
                <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'800', fontSize:'18px', flexShrink:0 }}>
                  {(provider?.full_name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight:'700', color:'#0f172a', fontSize:'14px' }}>{provider?.full_name || '—'}</div>
                  <div style={{ fontSize:'12px', color:'#94a3b8', marginTop:'2px' }}>{provider?.city || 'Provider'}</div>
                </div>
              </div>

              {/* Schedule details */}
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                {[
                  { icon:Calendar, label:'Date', value: form.scheduled_date || '—' },
                  { icon:Clock,    label:'Time', value: form.scheduled_time || '—' },
                  { icon:MapPin,   label:'City', value: form.city || '—' },
                ].map(({ icon:Icon, label, value }) => (
                  <div key={label} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'32px', height:'32px', background:'#faf5ff', borderRadius:'9px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Icon size={14} color="#7c3aed"/>
                    </div>
                    <div>
                      <div style={{ fontSize:'11px', color:'#94a3b8' }}>{label}</div>
                      <div style={{ fontSize:'13px', fontWeight:'600', color:'#0f172a' }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected services line items */}
              {selectedServices.length > 0 ? (
                <div style={{ borderTop:'1px solid #f1f5f9', paddingTop:'16px', marginBottom:'16px' }}>
                  <p style={{ fontSize:'11px', fontWeight:'800', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'10px' }}>Services</p>
                  {selectedServices.map(s => (
                    <div key={s.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:'1px solid #f8fafc' }}>
                      <span style={{ fontSize:'13px', color:'#374151' }}>{s.name}</span>
                      <span style={{ fontSize:'13px', fontWeight:'700', color:'#0f172a' }}>₹{s.price.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ borderTop:'1px solid #f1f5f9', paddingTop:'16px', marginBottom:'16px', textAlign:'center', color:'#94a3b8', fontSize:'13px' }}>
                  No services selected yet
                </div>
              )}

              {/* Total */}
              <div style={{ background:'#faf5ff', borderRadius:'14px', padding:'16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'13px', fontWeight:'700', color:'#374151' }}>
                  Total{selectedServices.length > 1 ? ` (${selectedServices.length} services)` : ''}
                </span>
                <span style={{ display:'flex', alignItems:'center', gap:'2px', fontSize:'20px', fontWeight:'900', color: selectedServices.length ? '#7c3aed' : '#94a3b8' }}>
                  <IndianRupee size={15} strokeWidth={2.5}/>
                  {totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
