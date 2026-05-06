import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Zap, ArrowRight, Clock, IndianRupee, X } from 'lucide-react'
import { getCategories, getServices } from '../api/services'
import Navbar from '../components/layout/Navbar'

const ICON_MAP = {
  wrench:'🔧', zap:'⚡', home:'🏠', leaf:'🌿', shield:'🛡️', scissors:'✂️',
  truck:'🚛', sparkles:'✨', paintbrush:'🎨', droplets:'💧', wind:'🌬️',
  'tool':'🔩', star:'⭐', heart:'❤️', settings:'⚙️',
}

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories]     = useState([])
  const [services,   setServices]       = useState([])
  const [loading,    setLoading]        = useState(true)
  const [search,     setSearch]         = useState(searchParams.get('q') || '')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('cat') || '')

  useEffect(() => {
    getCategories().then(r => setCategories(r.data.results ?? r.data))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (search)         params.search          = search
    if (activeCategory) params['category__slug'] = activeCategory
    getServices(params)
      .then(r => setServices(r.data.results ?? r.data))
      .finally(() => setLoading(false))
  }, [search, activeCategory])

  function handleSearch(e) {
    e.preventDefault()
    const q = e.target.q.value.trim()
    setSearch(q)
    setSearchParams(q ? { q } : {})
  }

  function selectCategory(slug) {
    const next = activeCategory === slug ? '' : slug
    setActiveCategory(next)
    setSearch('')
    setSearchParams(next ? { cat: next } : {})
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:'system-ui,-apple-system,sans-serif' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#7c3aed 0%,#4338ca 100%)', padding:'64px 40px 48px', textAlign:'center' }}>
        <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
          style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:'900', color:'white', marginBottom:'12px', letterSpacing:'-0.5px' }}>
          What service do you need?
        </motion.h1>
        <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
          style={{ color:'rgba(255,255,255,0.7)', fontSize:'16px', marginBottom:'32px' }}>
          Book trusted professionals in your city
        </motion.p>
        <motion.form initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
          onSubmit={handleSearch}
          style={{ maxWidth:'560px', margin:'0 auto', display:'flex', gap:'0', background:'white', borderRadius:'16px', overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.2)' }}>
          <div style={{ flex:1, display:'flex', alignItems:'center', gap:'12px', padding:'0 20px' }}>
            <Search size={18} color="#9ca3af"/>
            <input name="q" defaultValue={search} placeholder="e.g. AC repair, plumber, cleaning…"
              style={{ flex:1, border:'none', outline:'none', fontSize:'15px', color:'#0f172a', background:'transparent', padding:'18px 0' }}/>
          </div>
          <button type="submit"
            style={{ padding:'0 28px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', color:'white', border:'none', cursor:'pointer', fontWeight:'700', fontSize:'15px', whiteSpace:'nowrap' }}>
            Search
          </button>
        </motion.form>
      </div>

      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'40px 40px' }}>

        {/* Category pills */}
        {categories.length > 0 && (
          <div style={{ marginBottom:'36px' }}>
            <h2 style={{ fontSize:'16px', fontWeight:'700', color:'#374151', marginBottom:'14px' }}>Browse by category</h2>
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
              {categories.map(cat => {
                const active = activeCategory === cat.slug
                return (
                  <button key={cat.slug} onClick={() => selectCategory(cat.slug)}
                    style={{
                      display:'flex', alignItems:'center', gap:'8px',
                      padding:'10px 18px', borderRadius:'40px', cursor:'pointer', fontSize:'14px', fontWeight:'600', transition:'all 0.2s',
                      background: active ? '#7c3aed' : 'white',
                      color: active ? 'white' : '#374151',
                      border: active ? '2px solid #7c3aed' : '2px solid #e5e7eb',
                      boxShadow: active ? '0 4px 12px rgba(124,58,237,0.3)' : 'none',
                    }}>
                    <span>{ICON_MAP[cat.icon] || '🔧'}</span>
                    {cat.name}
                    {active && <X size={13} style={{ marginLeft:'2px' }}/>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Active filter label */}
        {(search || activeCategory) && (
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
            <span style={{ fontSize:'14px', color:'#64748b' }}>
              {loading ? 'Searching…' : `${services.length} result${services.length !== 1 ? 's' : ''}`}
              {search && <> for "<strong>{search}</strong>"</>}
            </span>
            <button onClick={() => { setSearch(''); setActiveCategory(''); setSearchParams({}) }}
              style={{ fontSize:'12px', color:'#7c3aed', background:'none', border:'none', cursor:'pointer', fontWeight:'600', textDecoration:'underline' }}>
              Clear filters
            </button>
          </div>
        )}

        {/* Services grid */}
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'20px' }}>
            {[...Array(6)].map((_,i) => (
              <div key={i} style={{ background:'white', borderRadius:'20px', height:'220px', animation:'pulse 1.5s infinite', opacity:0.6 }}/>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>🔍</div>
            <h3 style={{ fontSize:'20px', fontWeight:'700', color:'#0f172a', marginBottom:'8px' }}>No services found</h3>
            <p style={{ color:'#64748b' }}>Try a different search term or category</p>
          </div>
        ) : (
          <motion.div layout style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'20px' }}>
            <AnimatePresence>
              {services.map((svc, i) => (
                <motion.div key={svc.id}
                  initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:0.95}}
                  transition={{duration:0.3, delay: i < 12 ? i * 0.04 : 0}}>
                  <Link to={`/services/${svc.slug}/providers`}
                    style={{ display:'block', background:'white', borderRadius:'20px', padding:'28px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', textDecoration:'none', transition:'all 0.25s', height:'100%' }}
                    onMouseOver={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,0.1)'}}
                    onMouseOut={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)'}}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'14px' }}>
                      <div style={{ width:'52px', height:'52px', background:'#faf5ff', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px' }}>
                        {ICON_MAP[svc.category_icon] || '🔧'}
                      </div>
                      <span style={{ fontSize:'11px', fontWeight:'600', color:'#7c3aed', background:'#f3e8ff', padding:'4px 10px', borderRadius:'20px' }}>
                        {svc.category_name}
                      </span>
                    </div>
                    <h3 style={{ fontSize:'16px', fontWeight:'800', color:'#0f172a', marginBottom:'8px', letterSpacing:'-0.2px' }}>{svc.name}</h3>
                    <p style={{ fontSize:'13px', color:'#64748b', lineHeight:1.6, marginBottom:'20px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                      {svc.description}
                    </p>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:'3px', color:'#0f172a', fontWeight:'800', fontSize:'16px' }}>
                          <IndianRupee size={14} strokeWidth={2.5}/>
                          {parseFloat(svc.base_price).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize:'11px', color:'#94a3b8', marginTop:'2px' }}>Starting price</div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'5px', color:'#64748b', fontSize:'12px' }}>
                        <Clock size={12}/>
                        {svc.duration_display}
                      </div>
                    </div>
                    <div style={{ marginTop:'20px', paddingTop:'16px', borderTop:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <span style={{ fontSize:'12px', color:'#7c3aed', fontWeight:'700' }}>View providers</span>
                      <ArrowRight size={14} color="#7c3aed"/>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}
