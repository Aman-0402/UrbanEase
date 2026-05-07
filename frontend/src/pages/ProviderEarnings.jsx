import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IndianRupee, TrendingUp, Briefcase, ArrowLeft, Calendar, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { getMyEarnings } from '../api/provider'
import Navbar from '../components/layout/Navbar'

const ICON_MAP = {
  wrench:'🔧', zap:'⚡', home:'🏠', leaf:'🌿', shield:'🛡️', scissors:'✂️',
  truck:'🚛', sparkles:'✨', paintbrush:'🎨', droplets:'💧', wind:'🌬️',
  tool:'🔩', star:'⭐', heart:'❤️', settings:'⚙️',
}

export default function ProviderEarnings() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyEarnings()
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:'system-ui,-apple-system,sans-serif' }}>
      <Navbar/>
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
        <div style={{ width:'40px', height:'40px', border:'4px solid #e5e7eb', borderTopColor:'#7c3aed', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  const { total_earned, this_month, last_month, total_jobs, monthly, recent } = data || {}
  const maxAmount = Math.max(...(monthly||[]).map(m => m.amount), 1)

  const monthDiff = this_month - last_month
  const monthPct  = last_month > 0 ? Math.round((monthDiff / last_month) * 100) : null

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:'system-ui,-apple-system,sans-serif' }}>
      <Navbar/>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#7c3aed 0%,#4338ca 100%)', padding:'108px 40px 36px' }}>
        <div style={{ maxWidth:'1000px', margin:'0 auto' }}>
          <Link to="/provider" style={{ display:'inline-flex', alignItems:'center', gap:'8px', color:'rgba(255,255,255,0.7)', fontSize:'14px', fontWeight:'600', textDecoration:'none', marginBottom:'20px' }}
            onMouseOver={e=>e.currentTarget.style.color='white'}
            onMouseOut={e=>e.currentTarget.style.color='rgba(255,255,255,0.7)'}>
            <ArrowLeft size={15}/> Provider Dashboard
          </Link>
          <h1 style={{ fontSize:'clamp(22px,3vw,32px)', fontWeight:'900', color:'white', marginBottom:'6px' }}>Earnings</h1>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'14px' }}>Your completed-job revenue summary</p>
        </div>
      </div>

      <div style={{ maxWidth:'1000px', margin:'0 auto', padding:'32px 40px' }}>

        {/* Stat cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'28px' }}>
          <StatCard
            label="Total Earned"
            value={<><IndianRupee size={18} strokeWidth={2.5}/>{parseFloat(total_earned||0).toLocaleString('en-IN')}</>}
            sub={`${total_jobs} completed jobs`}
            color="#7c3aed" bg="#f5f3ff"
          />
          <StatCard
            label="This Month"
            value={<><IndianRupee size={18} strokeWidth={2.5}/>{parseFloat(this_month||0).toLocaleString('en-IN')}</>}
            sub={monthPct !== null
              ? <TrendBadge pct={monthPct}/>
              : 'No prior month data'}
            color="#059669" bg="#ecfdf5"
          />
          <StatCard
            label="Last Month"
            value={<><IndianRupee size={18} strokeWidth={2.5}/>{parseFloat(last_month||0).toLocaleString('en-IN')}</>}
            sub="Previous month total"
            color="#0ea5e9" bg="#f0f9ff"
          />
        </div>

        {/* Monthly bar chart */}
        {monthly?.length > 0 && (
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.4}}
            style={{ background:'white', borderRadius:'20px', padding:'28px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', marginBottom:'28px' }}>
            <h3 style={{ fontSize:'15px', fontWeight:'800', color:'#0f172a', marginBottom:'24px' }}>Monthly Breakdown</h3>
            <div style={{ display:'flex', gap:'12px', alignItems:'flex-end', height:'160px' }}>
              {[...monthly].reverse().map((m, i) => {
                const pct = (m.amount / maxAmount) * 100
                return (
                  <div key={m.month} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', height:'100%', justifyContent:'flex-end' }}>
                    <div style={{ fontSize:'10px', fontWeight:'700', color:'#7c3aed' }}>
                      ₹{m.amount >= 1000 ? (m.amount/1000).toFixed(1)+'k' : m.amount}
                    </div>
                    <motion.div
                      initial={{ height:0 }} animate={{ height:`${pct}%` }}
                      transition={{ duration:0.6, delay:i*0.08 }}
                      style={{ width:'100%', background:'linear-gradient(180deg,#7c3aed,#4338ca)', borderRadius:'8px 8px 0 0', minHeight:'4px' }}/>
                    <div style={{ fontSize:'10px', color:'#94a3b8', textAlign:'center', whiteSpace:'nowrap' }}>{m.month}</div>
                    <div style={{ fontSize:'10px', color:'#64748b' }}>{m.jobs} job{m.jobs!==1?'s':''}</div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Recent completed jobs */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.4,delay:0.1}}
          style={{ background:'white', borderRadius:'20px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', overflow:'hidden' }}>
          <div style={{ padding:'24px 28px 16px' }}>
            <h3 style={{ fontSize:'15px', fontWeight:'800', color:'#0f172a', margin:0 }}>Recent Completed Jobs</h3>
          </div>

          {!recent?.length ? (
            <div style={{ textAlign:'center', padding:'48px 0', color:'#94a3b8' }}>
              <Briefcase size={40} style={{ marginBottom:'12px', opacity:0.4 }}/>
              <p style={{ margin:0, fontSize:'14px' }}>No completed jobs yet</p>
            </div>
          ) : (
            <div>
              {/* Table header */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 140px 120px 100px', gap:'16px', padding:'10px 28px', background:'#f8fafc', fontSize:'11px', fontWeight:'700', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.5px', borderTop:'1px solid #f1f5f9' }}>
                <span>Service</span><span>Customer</span><span>Date</span><span style={{ textAlign:'right' }}>Amount</span>
              </div>
              {recent.map((b, i) => (
                <motion.div key={b.id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{duration:0.25,delay:i*0.04}}
                  style={{ display:'grid', gridTemplateColumns:'1fr 140px 120px 100px', gap:'16px', padding:'14px 28px', borderTop:'1px solid #f8fafc', alignItems:'center', transition:'background 0.15s' }}
                  onMouseOver={e=>e.currentTarget.style.background='#fafafa'}
                  onMouseOut={e=>e.currentTarget.style.background='white'}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <span style={{ fontSize:'18px' }}>{ICON_MAP[b.service_icon] || '🔧'}</span>
                    <div>
                      <div style={{ fontSize:'13px', fontWeight:'700', color:'#0f172a' }}>{b.service_name}</div>
                      <div style={{ fontSize:'11px', color:'#94a3b8' }}>#{b.id}</div>
                    </div>
                  </div>
                  <span style={{ fontSize:'13px', color:'#374151', fontWeight:'600' }}>{b.customer_name}</span>
                  <span style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'12px', color:'#64748b' }}>
                    <Calendar size={11}/>
                    {new Date(b.scheduled_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                  </span>
                  <span style={{ display:'flex', alignItems:'center', gap:'2px', fontSize:'14px', fontWeight:'900', color:'#059669', justifyContent:'flex-end' }}>
                    <IndianRupee size={11} strokeWidth={2.5}/>
                    {parseFloat(b.total_price||0).toLocaleString('en-IN')}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, color, bg }) {
  return (
    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.4}}
      style={{ background:'white', borderRadius:'20px', padding:'24px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ fontSize:'12px', fontWeight:'700', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'10px' }}>{label}</div>
      <div style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'24px', fontWeight:'900', color:'#0f172a', marginBottom:'6px' }}>
        {value}
      </div>
      <div style={{ fontSize:'12px', color:'#64748b' }}>{sub}</div>
    </motion.div>
  )
}

function TrendBadge({ pct }) {
  if (pct === 0) return <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', fontSize:'12px', color:'#64748b' }}><Minus size={12}/> Same as last month</span>
  const up = pct > 0
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', fontSize:'12px', fontWeight:'700', color: up ? '#059669' : '#dc2626' }}>
      {up ? <ArrowUp size={12}/> : <ArrowDown size={12}/>}
      {Math.abs(pct)}% vs last month
    </span>
  )
}
