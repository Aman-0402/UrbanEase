import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, MapPin, Clock, IndianRupee, CheckCircle, ArrowLeft, Briefcase } from 'lucide-react'
import { getServiceBySlug, getProviders } from '../api/services'
import Navbar from '../components/layout/Navbar'
import useAuthStore from '../store/authStore'

function StarRow({ rating, size = 14 }) {
  return (
    <div style={{ display:'flex', gap:'2px' }}>
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={size} fill={n <= Math.round(rating) ? '#f59e0b' : 'none'} color={n <= Math.round(rating) ? '#f59e0b' : '#d1d5db'} strokeWidth={1.5}/>
      ))}
    </div>
  )
}

export default function Providers() {
  const { slug }           = useParams()
  const navigate           = useNavigate()
  const isAuthenticated    = useAuthStore(s => s.isAuthenticated)
  const [service,  setService]  = useState(null)
  const [providers,setProviders]= useState([])
  const [loading,  setLoading]  = useState(true)
  const [city,     setCity]     = useState('')
  const [sort,     setSort]     = useState('-avg_rating')

  useEffect(() => {
    getServiceBySlug(slug).then(r => setService(r.data))
  }, [slug])

  useEffect(() => {
    if (!service) return
    setLoading(true)
    const params = { service: service.id, ordering: sort }
    if (city) params.city = city
    getProviders(params)
      .then(r => setProviders(r.data.results ?? r.data))
      .finally(() => setLoading(false))
  }, [service, city, sort])

  function handleBook(providerId) {
    if (!isAuthenticated) {
      navigate('/login', { state: { next: `/book/${providerId}?service=${service?.id}` } })
    } else {
      navigate(`/book/${providerId}?service=${service?.id}`)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:'system-ui,-apple-system,sans-serif' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#7c3aed 0%,#4338ca 100%)', padding:'40px 40px 36px' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
          <Link to="/services" style={{ display:'inline-flex', alignItems:'center', gap:'8px', color:'rgba(255,255,255,0.7)', fontSize:'14px', fontWeight:'600', textDecoration:'none', marginBottom:'20px' }}
            onMouseOver={e=>e.currentTarget.style.color='white'}
            onMouseOut={e=>e.currentTarget.style.color='rgba(255,255,255,0.7)'}>
            <ArrowLeft size={15}/> All services
          </Link>
          {service && (
            <div>
              <h1 style={{ fontSize:'clamp(22px,3vw,34px)', fontWeight:'900', color:'white', marginBottom:'8px', letterSpacing:'-0.5px' }}>
                {service.name}
              </h1>
              <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'15px', marginBottom:'0', maxWidth:'600px' }}>{service.description}</p>
              <div style={{ display:'flex', gap:'24px', marginTop:'16px' }}>
                <span style={{ color:'rgba(255,255,255,0.8)', fontSize:'13px', display:'flex', alignItems:'center', gap:'6px' }}>
                  <IndianRupee size={13}/> Starting ₹{parseFloat(service.base_price).toLocaleString('en-IN')}
                </span>
                <span style={{ color:'rgba(255,255,255,0.8)', fontSize:'13px', display:'flex', alignItems:'center', gap:'6px' }}>
                  <Clock size={13}/> {service.duration_display}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'32px 40px' }}>

        {/* Filters bar */}
        <div style={{ display:'flex', gap:'12px', alignItems:'center', marginBottom:'28px', flexWrap:'wrap' }}>
          <input value={city} onChange={e=>setCity(e.target.value)} placeholder="Filter by city…"
            style={{ padding:'10px 16px', border:'2px solid #e5e7eb', borderRadius:'12px', fontSize:'14px', outline:'none', color:'#0f172a', background:'white', transition:'border 0.2s', width:'200px' }}
            onFocus={e=>e.target.style.borderColor='#7c3aed'}
            onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
          <select value={sort} onChange={e=>setSort(e.target.value)}
            style={{ padding:'10px 16px', border:'2px solid #e5e7eb', borderRadius:'12px', fontSize:'14px', color:'#374151', background:'white', cursor:'pointer', outline:'none' }}>
            <option value="-avg_rating">Highest rated</option>
            <option value="-total_jobs">Most jobs</option>
            <option value="hourly_rate">Price: Low to high</option>
            <option value="-hourly_rate">Price: High to low</option>
          </select>
          <span style={{ fontSize:'14px', color:'#64748b', marginLeft:'auto' }}>
            {loading ? 'Loading…' : `${providers.length} provider${providers.length !== 1 ? 's' : ''} found`}
          </span>
        </div>

        {/* Provider cards */}
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {[...Array(3)].map((_,i) => (
              <div key={i} style={{ background:'white', borderRadius:'20px', height:'160px', opacity:0.5 }}/>
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>😔</div>
            <h3 style={{ fontSize:'20px', fontWeight:'700', color:'#0f172a', marginBottom:'8px' }}>No providers found</h3>
            <p style={{ color:'#64748b' }}>Try clearing the city filter or check back later</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {providers.map((p, i) => (
              <motion.div key={p.id} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.3, delay:i*0.06}}>
                <div style={{ background:'white', borderRadius:'20px', padding:'28px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', display:'flex', gap:'24px', alignItems:'flex-start', flexWrap:'wrap' }}>

                  {/* Avatar */}
                  <div style={{ width:'64px', height:'64px', borderRadius:'18px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'24px', fontWeight:'800', flexShrink:0 }}>
                    {(p.full_name || '?').charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:'220px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px', flexWrap:'wrap' }}>
                      <h3 style={{ fontSize:'17px', fontWeight:'800', color:'#0f172a', margin:0 }}>{p.full_name || 'Provider'}</h3>
                      {p.is_verified && (
                        <span style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', color:'#059669', background:'#ecfdf5', padding:'3px 9px', borderRadius:'20px', fontWeight:'700' }}>
                          <CheckCircle size={11}/> Verified
                        </span>
                      )}
                      {!p.is_available && (
                        <span style={{ fontSize:'11px', color:'#dc2626', background:'#fef2f2', padding:'3px 9px', borderRadius:'20px', fontWeight:'700' }}>Unavailable</span>
                      )}
                    </div>

                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
                      <StarRow rating={p.avg_rating}/>
                      <span style={{ fontSize:'13px', fontWeight:'700', color:'#0f172a' }}>{parseFloat(p.avg_rating).toFixed(1)}</span>
                      <span style={{ fontSize:'12px', color:'#94a3b8' }}>({p.total_reviews} review{p.total_reviews !== 1 ? 's' : ''})</span>
                    </div>

                    {p.bio && (
                      <p style={{ fontSize:'13px', color:'#64748b', lineHeight:1.6, marginBottom:'12px', maxWidth:'480px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                        {p.bio}
                      </p>
                    )}

                    <div style={{ display:'flex', gap:'20px', flexWrap:'wrap' }}>
                      {p.city && (
                        <span style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'12px', color:'#64748b' }}>
                          <MapPin size={12}/> {p.city}
                        </span>
                      )}
                      <span style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'12px', color:'#64748b' }}>
                        <Briefcase size={12}/> {p.total_jobs} job{p.total_jobs !== 1 ? 's' : ''} completed
                      </span>
                      <span style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'12px', color:'#64748b' }}>
                        <Clock size={12}/> {p.experience_years} yr{p.experience_years !== 1 ? 's' : ''} experience
                      </span>
                    </div>
                  </div>

                  {/* Price + CTA */}
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'12px', flexShrink:0 }}>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'2px', fontWeight:'900', fontSize:'22px', color:'#0f172a', justifyContent:'flex-end' }}>
                        <IndianRupee size={16} strokeWidth={2.5}/>
                        {parseFloat(p.hourly_rate).toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize:'11px', color:'#94a3b8' }}>per hour</div>
                    </div>
                    <Link to={`/providers/${p.id}`}
                      style={{ padding:'11px 18px', border:'2px solid #e5e7eb', borderRadius:'13px', color:'#374151', fontWeight:'700', fontSize:'13px', textDecoration:'none', transition:'all 0.2s', whiteSpace:'nowrap' }}
                      onMouseOver={e=>{e.currentTarget.style.borderColor='#7c3aed';e.currentTarget.style.color='#7c3aed'}}
                      onMouseOut={e=>{e.currentTarget.style.borderColor='#e5e7eb';e.currentTarget.style.color='#374151'}}>
                      View Profile
                    </Link>
                    <button onClick={() => handleBook(p.id)} disabled={!p.is_available}
                      style={{ padding:'12px 28px', background: p.is_available ? 'linear-gradient(135deg,#7c3aed,#4338ca)' : '#e5e7eb', color: p.is_available ? 'white' : '#9ca3af', border:'none', borderRadius:'14px', fontWeight:'700', fontSize:'14px', cursor: p.is_available ? 'pointer' : 'not-allowed', boxShadow: p.is_available ? '0 4px 14px rgba(124,58,237,0.35)' : 'none', transition:'all 0.2s', whiteSpace:'nowrap' }}
                      onMouseOver={e=>{ if(p.is_available) e.currentTarget.style.transform='translateY(-2px)' }}
                      onMouseOut={e=>e.currentTarget.style.transform=''}>
                      {p.is_available ? 'Book Now' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
