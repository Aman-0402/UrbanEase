import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Star, MapPin, Briefcase, Clock, CheckCircle, ArrowLeft,
  IndianRupee, MessageSquare, Calendar, ChevronRight, Zap,
} from 'lucide-react'
import { getProviderById, getProviderReviews } from '../api/services'
import Navbar from '../components/layout/Navbar'
import useAuthStore from '../store/authStore'

const ICON_MAP = {
  wrench:'🔧', zap:'⚡', home:'🏠', leaf:'🌿', shield:'🛡️', scissors:'✂️',
  truck:'🚛', sparkles:'✨', paintbrush:'🎨', droplets:'💧', wind:'🌬️',
  tool:'🔩', star:'⭐', heart:'❤️', settings:'⚙️',
}

function StarRow({ rating, size = 14 }) {
  const r = Math.round(parseFloat(rating) || 0)
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={size}
          fill={n <= r ? '#f59e0b' : 'none'}
          color={n <= r ? '#f59e0b' : '#d1d5db'}
          strokeWidth={1.5}/>
      ))}
    </div>
  )
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 30)  return `${d} days ago`
  if (d < 365) return `${Math.floor(d / 30)} months ago`
  return `${Math.floor(d / 365)} years ago`
}

export default function ProviderProfile() {
  const { id }              = useParams()
  const navigate            = useNavigate()
  const isAuthenticated     = useAuthStore(s => s.isAuthenticated)
  const [provider, setProvider] = useState(null)
  const [reviews,  setReviews]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState('about') // about | services | reviews

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getProviderById(id),
      getProviderReviews(id),
    ]).then(([pRes, rRes]) => {
      setProvider(pRes.data)
      setReviews(rRes.data.results ?? rRes.data)
    }).finally(() => setLoading(false))
  }, [id])

  function handleBook() {
    if (!isAuthenticated) {
      navigate('/login', { state: { next: `/book/${id}` } })
    } else {
      // Navigate to booking with first service pre-selected if available
      const firstService = provider?.services?.[0]
      navigate(`/book/${id}${firstService ? `?service=${firstService.id}` : ''}`)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>Loading profile…</div>
    </div>
  )

  if (!provider) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Provider not found</h2>
        <Link to="/services" style={{ color: '#7c3aed', fontWeight: '700', textDecoration: 'none' }}>Browse Services</Link>
      </div>
    </div>
  )

  const avg = parseFloat(provider.avg_rating || 0).toFixed(1)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui,-apple-system,sans-serif' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#7c3aed 0%,#4338ca 100%)', paddingTop: '90px', paddingBottom: '0' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 40px' }}>
          <Link to={-1}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', color: 'rgba(255,255,255,0.65)', fontSize: '13px', fontWeight: '600', textDecoration: 'none', marginBottom: '24px' }}
            onMouseOver={e => e.currentTarget.style.color = 'white'}
            onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}>
            <ArrowLeft size={14}/> Back
          </Link>

          <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-end', flexWrap: 'wrap', paddingBottom: '32px' }}>
            {/* Avatar */}
            <div style={{ width: '96px', height: '96px', borderRadius: '24px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '3px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '36px', flexShrink: 0 }}>
              {(provider.full_name || '?').charAt(0).toUpperCase()}
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <h1 style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: '900', color: 'white', margin: 0, letterSpacing: '-0.4px' }}>
                  {provider.full_name || 'Provider'}
                </h1>
                {provider.is_verified && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#34d399', background: 'rgba(52,211,153,0.15)', padding: '4px 10px', borderRadius: '20px', fontWeight: '700', border: '1px solid rgba(52,211,153,0.3)' }}>
                    <CheckCircle size={11}/> Verified
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <StarRow rating={provider.avg_rating} size={16}/>
                <span style={{ color: 'white', fontWeight: '800', fontSize: '15px' }}>{avg}</span>
                <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px' }}>({provider.total_reviews} review{provider.total_reviews !== 1 ? 's' : ''})</span>
              </div>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {provider.city && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                    <MapPin size={13}/> {provider.city}
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                  <Briefcase size={13}/> {provider.total_jobs} jobs done
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                  <Clock size={13}/> {provider.experience_years} yr{provider.experience_years !== 1 ? 's' : ''} experience
                </span>
              </div>
            </div>

            {/* Book CTA */}
            <div style={{ flexShrink: 0 }}>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', textAlign: 'right', marginBottom: '6px' }}>Starting from</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'white', fontWeight: '900', fontSize: '26px', justifyContent: 'flex-end', marginBottom: '12px' }}>
                <IndianRupee size={18} strokeWidth={2.5}/>
                {parseFloat(provider.hourly_rate || 0).toLocaleString('en-IN')}
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.6)', marginLeft: '2px' }}>/hr</span>
              </div>
              <button onClick={handleBook} disabled={!provider.is_available}
                style={{ padding: '13px 32px', background: provider.is_available ? 'white' : 'rgba(255,255,255,0.2)', color: provider.is_available ? '#7c3aed' : 'rgba(255,255,255,0.5)', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '15px', cursor: provider.is_available ? 'pointer' : 'not-allowed', boxShadow: provider.is_available ? '0 4px 20px rgba(0,0,0,0.2)' : 'none', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                onMouseOver={e => { if (provider.is_available) e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseOut={e => e.currentTarget.style.transform = ''}>
                {provider.is_available ? 'Book Now' : 'Currently Unavailable'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: '68px', zIndex: 40 }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 40px', display: 'flex', gap: '0' }}>
          {[
            { key: 'about',    label: 'About' },
            { key: 'services', label: `Services (${provider.services?.length || 0})` },
            { key: 'reviews',  label: `Reviews (${provider.total_reviews})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: '16px 24px', border: 'none', background: 'transparent', fontSize: '14px', fontWeight: '700', cursor: 'pointer', borderBottom: `3px solid ${tab === t.key ? '#7c3aed' : 'transparent'}`, color: tab === t.key ? '#7c3aed' : '#64748b', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '36px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '28px', alignItems: 'start' }}>

          {/* Left column */}
          <div>
            {/* About tab */}
            {tab === 'about' && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ background: 'white', borderRadius: '20px', padding: '28px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '14px' }}>About</h3>
                  {provider.bio ? (
                    <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.8, margin: 0 }}>{provider.bio}</p>
                  ) : (
                    <p style={{ fontSize: '14px', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>No bio provided.</p>
                  )}
                </div>

                {/* Stats grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
                  {[
                    { label: 'Rating',       value: avg + ' ★',              color: '#f59e0b', bg: '#fffbeb' },
                    { label: 'Jobs Done',    value: provider.total_jobs,      color: '#059669', bg: '#ecfdf5' },
                    { label: 'Experience',   value: provider.experience_years + ' yrs', color: '#3b82f6', bg: '#eff6ff' },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                      <div style={{ fontSize: '22px', fontWeight: '900', color: s.color, marginBottom: '4px' }}>{s.value}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Services tab */}
            {tab === 'services' && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                {!provider.services?.length ? (
                  <div style={{ background: 'white', borderRadius: '20px', padding: '48px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
                    <p style={{ color: '#94a3b8', fontSize: '14px' }}>No services listed yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {provider.services.map(svc => (
                      <div key={svc.id} style={{ background: 'white', borderRadius: '18px', padding: '22px 24px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '18px' }}>
                        <div style={{ width: '48px', height: '48px', background: '#faf5ff', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                          {ICON_MAP[svc.category_icon] || '🔧'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '15px', marginBottom: '4px' }}>{svc.name}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{svc.category_name} · {svc.duration_display}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontWeight: '900', fontSize: '17px', color: '#0f172a' }}>
                            <IndianRupee size={13} strokeWidth={2.5}/>
                            {parseFloat(svc.base_price).toLocaleString('en-IN')}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>starting</div>
                        </div>
                        <button onClick={() => navigate(isAuthenticated ? `/book/${id}?service=${svc.id}` : '/login')}
                          style={{ padding: '9px 18px', background: 'linear-gradient(135deg,#7c3aed,#4338ca)', color: 'white', border: 'none', borderRadius: '11px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 3px 10px rgba(124,58,237,0.3)', flexShrink: 0 }}>
                          Book
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Reviews tab */}
            {tab === 'reviews' && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                {reviews.length === 0 ? (
                  <div style={{ background: 'white', borderRadius: '20px', padding: '60px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
                    <MessageSquare size={32} color="#e2e8f0" style={{ marginBottom: '12px' }}/>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>No reviews yet</h3>
                    <p style={{ color: '#94a3b8', fontSize: '13px' }}>Be the first to book and leave a review!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Rating summary */}
                    <div style={{ background: 'white', borderRadius: '20px', padding: '24px 28px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '32px' }}>
                      <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: '48px', fontWeight: '900', color: '#0f172a', lineHeight: 1 }}>{avg}</div>
                        <StarRow rating={provider.avg_rating} size={16}/>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>{provider.total_reviews} reviews</div>
                      </div>
                      {/* Rating breakdown */}
                      <div style={{ flex: 1 }}>
                        {[5,4,3,2,1].map(star => {
                          const count = reviews.filter(r => r.rating === star).length
                          const pct   = reviews.length ? (count / reviews.length) * 100 : 0
                          return (
                            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                              <span style={{ fontSize: '12px', color: '#64748b', width: '14px', textAlign: 'right' }}>{star}</span>
                              <Star size={11} fill="#f59e0b" color="#f59e0b"/>
                              <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: '#f59e0b', borderRadius: '3px', width: `${pct}%`, transition: 'width 0.5s' }}/>
                              </div>
                              <span style={{ fontSize: '11px', color: '#94a3b8', width: '24px' }}>{count}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Individual reviews */}
                    {reviews.map((rev, i) => (
                      <motion.div key={rev.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                        <div style={{ background: 'white', borderRadius: '18px', padding: '22px 24px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'linear-gradient(135deg,#7c3aed,#4338ca)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '15px', flexShrink: 0 }}>
                                {(rev.reviewer_name || '?').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{rev.reviewer_name || 'Customer'}</div>
                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{rev.service_name}</div>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <StarRow rating={rev.rating} size={12}/>
                              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>{timeAgo(rev.created_at)}</div>
                            </div>
                          </div>
                          {rev.comment && (
                            <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.7, margin: 0 }}>{rev.comment}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Right sticky card */}
          <div style={{ position: 'sticky', top: '130px' }}>
            <div style={{ background: 'white', borderRadius: '22px', padding: '26px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: '900', fontSize: '28px', color: '#0f172a', marginBottom: '4px' }}>
                <IndianRupee size={20} strokeWidth={2.5}/>
                {parseFloat(provider.hourly_rate || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>per hour · price may vary by service</div>

              <button onClick={handleBook} disabled={!provider.is_available}
                style={{ width: '100%', padding: '14px', background: provider.is_available ? 'linear-gradient(135deg,#7c3aed,#4338ca)' : '#e5e7eb', color: provider.is_available ? 'white' : '#9ca3af', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '15px', cursor: provider.is_available ? 'pointer' : 'not-allowed', boxShadow: provider.is_available ? '0 4px 14px rgba(124,58,237,0.35)' : 'none', transition: 'all 0.2s', marginBottom: '12px' }}
                onMouseOver={e => { if (provider.is_available) e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseOut={e => e.currentTarget.style.transform = ''}>
                {provider.is_available ? 'Book Now' : 'Unavailable'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', marginBottom: '20px' }}>
                <CheckCircle size={12} color="#059669"/>
                <span style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>Free cancellation before confirmation</span>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { icon: Calendar,  text: 'Choose your date & time' },
                  { icon: MapPin,    text: provider.city ? `Serves ${provider.city}` : 'Flexible location' },
                  { icon: Briefcase, text: `${provider.total_jobs} jobs completed` },
                ].map(item => (
                  <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', background: '#faf5ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <item.icon size={13} color="#7c3aed"/>
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
