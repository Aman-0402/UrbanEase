import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Clock, MapPin, IndianRupee, CheckCircle, AlertCircle } from 'lucide-react'
import { getProviderById, getServiceBySlug, getServices } from '../api/services'
import { createBooking } from '../api/bookings'
import Navbar from '../components/layout/Navbar'

const inputStyle = (focused) => ({
  width:'100%', padding:'13px 16px', border:`2px solid ${focused ? '#7c3aed' : '#e5e7eb'}`,
  borderRadius:'12px', fontSize:'14px', color:'#0f172a', outline:'none',
  background:'white', transition:'border 0.2s', boxSizing:'border-box',
})

export default function BookingFlow() {
  const { providerId } = useParams()
  const [searchParams]  = useSearchParams()
  const serviceId       = searchParams.get('service')
  const navigate        = useNavigate()

  const [provider, setProvider] = useState(null)
  const [services, setServices] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)
  const [focusedField, setFocused] = useState('')

  const [form, setForm] = useState({
    service:        serviceId || '',
    scheduled_date: '',
    scheduled_time: '',
    address:        '',
    city:           '',
    pincode:        '',
    notes:          '',
  })

  useEffect(() => {
    Promise.all([
      getProviderById(providerId),
      getServices(),
    ]).then(([pRes, sRes]) => {
      setProvider(pRes.data)
      const allServices = sRes.data.results ?? sRes.data
      // Show only services this provider offers
      const providerServiceIds = pRes.data.services?.map(s => s.id) ?? []
      setServices(allServices.filter(s => providerServiceIds.includes(s.id)))
    }).finally(() => setLoading(false))
  }, [providerId])

  const selectedService = services.find(s => s.id === parseInt(form.service))
  const totalPrice = selectedService
    ? parseFloat(selectedService.base_price).toFixed(2)
    : provider
      ? parseFloat(provider.hourly_rate).toFixed(2)
      : '0.00'

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.service || !form.scheduled_date || !form.scheduled_time || !form.address || !form.city) {
      setError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await createBooking({
        provider: parseInt(providerId),
        service:  parseInt(form.service),
        scheduled_date: form.scheduled_date,
        scheduled_time: form.scheduled_time,
        address: form.address,
        city:    form.city,
        pincode: form.pincode,
        notes:   form.notes,
        total_price: totalPrice,
      })
      setSuccess(true)
    } catch (err) {
      const data = err.response?.data
      if (typeof data === 'object') {
        setError(Object.values(data).flat().join(' '))
      } else {
        setError('Booking failed. Please try again.')
      }
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

  if (success) return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui,-apple-system,sans-serif' }}>
      <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
        style={{ background:'white', borderRadius:'28px', padding:'60px 48px', textAlign:'center', maxWidth:'440px', width:'100%', boxShadow:'0 8px 40px rgba(0,0,0,0.1)' }}>
        <div style={{ width:'80px', height:'80px', background:'#ecfdf5', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
          <CheckCircle size={40} color="#059669"/>
        </div>
        <h2 style={{ fontSize:'24px', fontWeight:'900', color:'#0f172a', marginBottom:'12px' }}>Booking Confirmed!</h2>
        <p style={{ color:'#64748b', fontSize:'15px', lineHeight:1.7, marginBottom:'32px' }}>
          Your booking has been placed successfully. The provider will confirm shortly.
        </p>
        <div style={{ display:'flex', gap:'12px', justifyContent:'center' }}>
          <Link to="/bookings" style={{ padding:'13px 28px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', color:'white', borderRadius:'14px', fontWeight:'700', fontSize:'14px', textDecoration:'none' }}>
            View Bookings
          </Link>
          <Link to="/services" style={{ padding:'13px 28px', border:'2px solid #e5e7eb', color:'#374151', borderRadius:'14px', fontWeight:'700', fontSize:'14px', textDecoration:'none' }}>
            Book Another
          </Link>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:'system-ui,-apple-system,sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth:'860px', margin:'0 auto', padding:'40px 40px' }}>

        <Link to={-1} style={{ display:'inline-flex', alignItems:'center', gap:'8px', color:'#64748b', fontSize:'14px', fontWeight:'600', textDecoration:'none', marginBottom:'28px' }}
          onMouseOver={e=>e.currentTarget.style.color='#7c3aed'}
          onMouseOut={e=>e.currentTarget.style.color='#64748b'}>
          <ArrowLeft size={15}/> Back
        </Link>

        <h1 style={{ fontSize:'26px', fontWeight:'900', color:'#0f172a', marginBottom:'6px', letterSpacing:'-0.4px' }}>Book a Service</h1>
        <p style={{ color:'#64748b', fontSize:'14px', marginBottom:'36px' }}>Fill in the details to confirm your booking</p>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'28px', alignItems:'start' }}>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ background:'white', borderRadius:'24px', padding:'36px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', display:'flex', flexDirection:'column', gap:'22px' }}>

              {/* Service selector */}
              <div>
                <label style={{ display:'block', fontSize:'13px', fontWeight:'700', color:'#374151', marginBottom:'8px' }}>Service *</label>
                <select name="service" value={form.service} onChange={handleChange}
                  style={{ ...inputStyle(focusedField==='service'), appearance:'auto' }}
                  onFocus={()=>setFocused('service')} onBlur={()=>setFocused('')}>
                  <option value="">Select a service…</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} — ₹{parseFloat(s.base_price).toLocaleString('en-IN')}</option>
                  ))}
                </select>
              </div>

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

              {error && (
                <div style={{ display:'flex', alignItems:'flex-start', gap:'10px', padding:'14px 16px', background:'#fef2f2', borderRadius:'12px', border:'1px solid #fecaca' }}>
                  <AlertCircle size={16} color="#ef4444" style={{ flexShrink:0, marginTop:'1px' }}/>
                  <p style={{ color:'#dc2626', fontSize:'13px', margin:0, lineHeight:1.5 }}>{error}</p>
                </div>
              )}

              <button type="submit" disabled={submitting}
                style={{ padding:'15px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', color:'white', border:'none', borderRadius:'14px', fontWeight:'800', fontSize:'15px', cursor: submitting ? 'wait' : 'pointer', boxShadow:'0 4px 16px rgba(124,58,237,0.35)', transition:'all 0.2s', opacity: submitting ? 0.75 : 1 }}>
                {submitting ? 'Placing Booking…' : 'Confirm Booking'}
              </button>
            </div>
          </form>

          {/* Summary card */}
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

              <div style={{ display:'flex', flexDirection:'column', gap:'14px', marginBottom:'24px' }}>
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

              <div style={{ background:'#faf5ff', borderRadius:'14px', padding:'16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'13px', fontWeight:'700', color:'#374151' }}>Estimated Price</span>
                <span style={{ display:'flex', alignItems:'center', gap:'2px', fontSize:'20px', fontWeight:'900', color:'#7c3aed' }}>
                  <IndianRupee size={15} strokeWidth={2.5}/>
                  {parseFloat(totalPrice).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
