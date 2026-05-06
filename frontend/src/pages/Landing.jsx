import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import useAuthStore from '../store/authStore'
import {
  Zap, MapPin, Star, Shield, Clock, ChevronRight,
  Wrench, Zap as ElecIcon, Sparkles, Wind,
  BookOpen, Monitor, Scissors, Car,
  ArrowRight, CheckCircle, Users, TrendingUp, Award, HeartHandshake
} from 'lucide-react'
import Logo from '../components/layout/Logo'

/* ─── Tiny helpers ─────────────────────────────────────────────────── */
const fade = { hidden:{opacity:0,y:32}, visible:{opacity:1,y:0,transition:{duration:0.6,ease:'easeOut'}} }
const stagger = { visible:{transition:{staggerChildren:0.1}} }

function Section({ children, style={} }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once:true, margin:'-60px' })
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView?'visible':'hidden'} style={style}>
      {children}
    </motion.div>
  )
}
const FadeUp = ({ children, style={}, delay=0 }) => (
  <motion.div variants={fade} transition={{ delay }} style={style}>{children}</motion.div>
)

/* ─── Data ─────────────────────────────────────────────────────────── */
const services = [
  { Icon:Wrench,   label:'Plumbing',    count:'240+ pros', color:'#eff6ff', icon:'#3b82f6' },
  { Icon:ElecIcon, label:'Electrician', count:'180+ pros', color:'#fefce8', icon:'#eab308' },
  { Icon:Sparkles, label:'Cleaning',    count:'320+ pros', color:'#f0fdf4', icon:'#22c55e' },
  { Icon:Wind,     label:'AC Repair',   count:'150+ pros', color:'#ecfeff', icon:'#06b6d4' },
  { Icon:Monitor,  label:'Appliances',  count:'200+ pros', color:'#faf5ff', icon:'#a855f7' },
  { Icon:BookOpen, label:'Tutoring',    count:'400+ pros', color:'#fff1f2', icon:'#f43f5e' },
  { Icon:Scissors, label:'Salon',       count:'280+ pros', color:'#fdf2f8', icon:'#ec4899' },
  { Icon:Car,      label:'Car Wash',    count:'90+ pros',  color:'#fff7ed', icon:'#f97316' },
]

const steps = [
  { Icon:MapPin,       n:'1', title:'Search a Service',   desc:'Browse by category or search what you need. We detect your location automatically.' },
  { Icon:Star,         n:'2', title:'Pick a Provider',    desc:'Compare ratings, reviews, prices, and availability. Choose the best fit for you.' },
  { Icon:Shield,       n:'3', title:'Book & Pay',         desc:'Select a time slot and pay securely online. Instant booking confirmation.' },
  { Icon:CheckCircle,  n:'4', title:'Service Done ✓',     desc:'Provider arrives on time. Rate and review after the job is complete.' },
]

const stats = [
  { Icon:Users,      val:'50K+', lbl:'Happy Customers' },
  { Icon:Award,      val:'8K+',  lbl:'Verified Providers' },
  { Icon:TrendingUp, val:'98%',  lbl:'Satisfaction Rate' },
  { Icon:MapPin,     val:'25+',  lbl:'Cities Covered' },
]

const features = [
  { Icon:Shield,        title:'Verified Professionals', desc:'Every provider is background-checked, trained, and rated by real customers.' },
  { Icon:Clock,         title:'Same-Day Booking',       desc:'Need help today? Book in minutes and get a pro at your door within hours.' },
  { Icon:Star,          title:'Satisfaction Guaranteed',desc:"Not happy? We'll re-do the job for free or refund you. No questions asked." },
  { Icon:HeartHandshake,title:'Fair Pricing',           desc:'Transparent pricing — no hidden charges. See the full cost before you confirm.' },
]

const testimonials = [
  { name:'Mehak Vatyani',  role:'Homeowner',         text:'"Found a plumber in 10 minutes. Arrived on time, fixed the issue, fair price. Absolutely love UrbanEase!"',  rating:5, av:'MV' },
  { name:'Rahul Mehta',    role:'Working Professional',text:'"Booked AC servicing on a Sunday morning. The technician was professional and thorough. Highly recommend!"', rating:5, av:'RM' },
  { name:'Anita Nair',     role:'Startup Founder',   text:'"We use UrbanEase for our office cleaning every week. Consistent quality and always on time."',                rating:5, av:'AN' },
]

/* ─── Sections ─────────────────────────────────────────────────────── */

function Hero() {
  const { isAuthenticated, user } = useAuthStore()
  return (
    <section style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', background:'linear-gradient(135deg,#0f0a1e 0%,#1e1040 45%,#0e1a3a 100%)', paddingTop:'80px' }}>

      {/* blobs */}
      {[['#7c3aed','#33',-160,-160],['#4338ca','#22',-160,-160,true],['#6d28d9','#18',null,null,false,true]].map(([c,op,t,l,right,center],i)=>(
        <motion.div key={i}
          animate={{ scale:[1,1.2,1], opacity:[0.25,0.45,0.25] }}
          transition={{ duration:8+i*2, repeat:Infinity, delay:i*2, ease:'easeInOut' }}
          style={{ position:'absolute', width:'500px', height:'500px', borderRadius:'50%', filter:'blur(80px)', background:c, opacity:0.25,
            ...(i===0 ? {top:t,left:l} : i===1 ? {bottom:t,right:l} : {top:'30%',left:'55%',transform:'translateX(-50%)'}) }} />
      ))}

      {/* grid overlay */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize:'60px 60px' }} />

      <div style={{ position:'relative', zIndex:1, maxWidth:'800px', margin:'0 auto', padding:'0 24px', textAlign:'center' }}>

        {/* badge */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5}}
          style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'8px 18px', borderRadius:'100px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.75)', fontSize:'13px', fontWeight:'500', marginBottom:'32px', backdropFilter:'blur(8px)' }}>
          <span style={{ width:'8px', height:'8px', background:'#4ade80', borderRadius:'50%', animation:'pulse 2s infinite' }} />
          Now available in 25+ cities across India
        </motion.div>

        {/* headline */}
        <motion.h1 initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.1}}
          style={{ fontSize:'clamp(40px,6vw,72px)', fontWeight:'900', color:'white', lineHeight:1.1, letterSpacing:'-2px', marginBottom:'24px' }}>
          Home services,{' '}
          <span style={{ background:'linear-gradient(90deg,#a78bfa,#818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', textDecoration:'underline', textDecorationColor:'rgba(167,139,250,0.4)', textUnderlineOffset:'8px' }}>
            on demand
          </span>
          <br />at your doorstep
        </motion.h1>

        {/* sub */}
        <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.2}}
          style={{ fontSize:'18px', color:'rgba(255,255,255,0.55)', maxWidth:'560px', margin:'0 auto 40px', lineHeight:1.7 }}>
          Connect with trusted, verified service professionals near you — instantly.<br />
          Plumbers, electricians, cleaners, tutors and more.
        </motion.p>

        {/* CTAs */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.3}}
          style={{ display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap', marginBottom:'48px' }}>
          {isAuthenticated ? (
            <Link to="/dashboard" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'16px 32px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', color:'white', fontWeight:'700', fontSize:'16px', borderRadius:'16px', textDecoration:'none', boxShadow:'0 8px 32px rgba(124,58,237,0.4)', transition:'all 0.2s' }}
              onMouseOver={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 12px 40px rgba(124,58,237,0.5)'}}
              onMouseOut={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 8px 32px rgba(124,58,237,0.4)'}}>
              Go to Dashboard <ArrowRight size={18}/>
            </Link>
          ) : (
            <Link to="/register" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'16px 32px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', color:'white', fontWeight:'700', fontSize:'16px', borderRadius:'16px', textDecoration:'none', boxShadow:'0 8px 32px rgba(124,58,237,0.4)', transition:'all 0.2s' }}
              onMouseOver={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 12px 40px rgba(124,58,237,0.5)'}}
              onMouseOut={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 8px 32px rgba(124,58,237,0.4)'}}>
              Get started free <ArrowRight size={18}/>
            </Link>
          )}
          <a href="#how-it-works" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'16px 32px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.18)', color:'white', fontWeight:'600', fontSize:'16px', borderRadius:'16px', textDecoration:'none', backdropFilter:'blur(8px)', transition:'all 0.2s' }}
            onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.15)'}
            onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,0.08)'}>
            See how it works
          </a>
        </motion.div>

        {/* trust badges */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:1,delay:0.5}}
          style={{ display:'flex', flexWrap:'wrap', gap:'24px', justifyContent:'center' }}>
          {['Background verified pros','Instant booking','Secure payments','30-day guarantee'].map(b=>(
            <div key={b} style={{ display:'flex', alignItems:'center', gap:'6px', color:'rgba(255,255,255,0.45)', fontSize:'13px' }}>
              <CheckCircle size={14} color="#4ade80"/>  {b}
            </div>
          ))}
        </motion.div>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </section>
  )
}

function Services() {
  return (
    <section id="services" style={{ padding:'96px 0', background:'#f8fafc' }}>
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 40px' }}>
        <Section style={{ textAlign:'center', marginBottom:'56px' }}>
          <FadeUp><p style={{ color:'#7c3aed', fontWeight:'700', fontSize:'12px', letterSpacing:'3px', textTransform:'uppercase', marginBottom:'12px' }}>What we offer</p></FadeUp>
          <FadeUp><h2 style={{ fontSize:'clamp(28px,4vw,44px)', fontWeight:'900', color:'#0f172a', marginBottom:'14px', letterSpacing:'-0.8px' }}>Services for every need</h2></FadeUp>
          <FadeUp><p style={{ color:'#64748b', fontSize:'17px', maxWidth:'480px', margin:'0 auto', lineHeight:1.7 }}>From quick fixes to deep cleaning — we've got every home service covered.</p></FadeUp>
        </Section>

        <Section style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px' }}>
          {services.map(({ Icon, label, count, color, icon }) => (
            <motion.div key={label} variants={fade}
              whileHover={{ y:-6, boxShadow:'0 20px 40px rgba(0,0,0,0.1)' }}
              style={{ background:'white', borderRadius:'20px', padding:'28px 24px', cursor:'pointer', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', transition:'all 0.3s' }}>
              <div style={{ width:'56px', height:'56px', background:color, borderRadius:'16px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px' }}>
                <Icon size={26} color={icon}/>
              </div>
              <div style={{ fontWeight:'700', color:'#0f172a', fontSize:'15px', marginBottom:'4px' }}>{label}</div>
              <div style={{ fontSize:'12px', color:'#94a3b8' }}>{count}</div>
            </motion.div>
          ))}
        </Section>

        <Section style={{ textAlign:'center', marginTop:'36px' }}>
          <FadeUp>
            <Link to="/register" style={{ display:'inline-flex', alignItems:'center', gap:'6px', color:'#7c3aed', fontWeight:'700', fontSize:'15px', textDecoration:'none', transition:'gap 0.2s' }}
              onMouseOver={e=>e.currentTarget.style.gap='10px'} onMouseOut={e=>e.currentTarget.style.gap='6px'}>
              View all services <ChevronRight size={18}/>
            </Link>
          </FadeUp>
        </Section>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding:'96px 0', background:'white' }}>
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 40px' }}>
        <Section style={{ textAlign:'center', marginBottom:'64px' }}>
          <FadeUp><p style={{ color:'#7c3aed', fontWeight:'700', fontSize:'12px', letterSpacing:'3px', textTransform:'uppercase', marginBottom:'12px' }}>Simple process</p></FadeUp>
          <FadeUp><h2 style={{ fontSize:'clamp(28px,4vw,44px)', fontWeight:'900', color:'#0f172a', marginBottom:'14px', letterSpacing:'-0.8px' }}>Book in 4 easy steps</h2></FadeUp>
          <FadeUp><p style={{ color:'#64748b', fontSize:'17px', maxWidth:'420px', margin:'0 auto', lineHeight:1.7 }}>Getting help at home has never been this simple.</p></FadeUp>
        </Section>

        <Section style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'32px', position:'relative' }}>
          {/* connector */}
          <div style={{ position:'absolute', top:'52px', left:'calc(12.5% + 28px)', right:'calc(12.5% + 28px)', height:'2px', background:'linear-gradient(90deg,#e2e8f0,#c4b5fd,#e2e8f0)', zIndex:0 }} />

          {steps.map(({ Icon, n, title, desc }) => (
            <motion.div key={title} variants={fade} style={{ textAlign:'center', position:'relative', zIndex:1 }}>
              <div style={{ position:'relative', display:'inline-flex', alignItems:'center', justifyContent:'center', width:'104px', height:'104px', marginBottom:'24px' }}>
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,#ede9fe,#e0e7ff)', borderRadius:'50%' }}/>
                <motion.div whileHover={{ rotate:360 }} transition={{ duration:0.6 }}
                  style={{ position:'relative', width:'68px', height:'68px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 24px rgba(124,58,237,0.3)' }}>
                  <Icon size={26} color="white"/>
                </motion.div>
                <span style={{ position:'absolute', top:'4px', right:'4px', width:'26px', height:'26px', background:'white', border:'2px solid #ede9fe', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'800', color:'#7c3aed' }}>{n}</span>
              </div>
              <h3 style={{ fontWeight:'800', color:'#0f172a', fontSize:'16px', marginBottom:'10px' }}>{title}</h3>
              <p style={{ color:'#64748b', fontSize:'14px', lineHeight:1.7 }}>{desc}</p>
            </motion.div>
          ))}
        </Section>
      </div>
    </section>
  )
}

function Stats() {
  return (
    <section style={{ padding:'80px 0', background:'linear-gradient(135deg,#7c3aed 0%,#4338ca 100%)' }}>
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 40px' }}>
        <Section style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'24px' }}>
          {stats.map(({ Icon, val, lbl }) => (
            <motion.div key={lbl} variants={fade} style={{ textAlign:'center', color:'white' }}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:'12px' }}>
                <div style={{ width:'48px', height:'48px', background:'rgba(255,255,255,0.15)', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon size={22} color="white"/>
                </div>
              </div>
              <div style={{ fontSize:'40px', fontWeight:'900', letterSpacing:'-1px', marginBottom:'4px' }}>{val}</div>
              <div style={{ color:'rgba(255,255,255,0.65)', fontSize:'14px', fontWeight:'500' }}>{lbl}</div>
            </motion.div>
          ))}
        </Section>
      </div>
    </section>
  )
}

function WhyUs() {
  return (
    <section id="providers" style={{ padding:'96px 0', background:'#f8fafc' }}>
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 40px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'80px', alignItems:'center' }}>
        <Section>
          <FadeUp><p style={{ color:'#7c3aed', fontWeight:'700', fontSize:'12px', letterSpacing:'3px', textTransform:'uppercase', marginBottom:'12px' }}>Why UrbanEase</p></FadeUp>
          <FadeUp><h2 style={{ fontSize:'clamp(28px,3.5vw,42px)', fontWeight:'900', color:'#0f172a', lineHeight:1.15, letterSpacing:'-0.8px', marginBottom:'20px' }}>Built for trust,<br/>designed for convenience</h2></FadeUp>
          <FadeUp><p style={{ color:'#64748b', fontSize:'17px', lineHeight:1.75, marginBottom:'36px' }}>We obsess over every detail so you can sit back and relax while the best professionals handle your home.</p></FadeUp>
          <FadeUp>
            <Link to="/register" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'15px 30px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', color:'white', fontWeight:'700', fontSize:'15px', borderRadius:'14px', textDecoration:'none', boxShadow:'0 6px 24px rgba(124,58,237,0.35)', transition:'all 0.2s' }}
              onMouseOver={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 10px 32px rgba(124,58,237,0.45)'}}
              onMouseOut={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 6px 24px rgba(124,58,237,0.35)'}}>
              Book your first service <ArrowRight size={17}/>
            </Link>
          </FadeUp>
        </Section>

        <Section style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
          {features.map(({ Icon, title, desc }) => (
            <motion.div key={title} variants={fade}
              whileHover={{ y:-4, boxShadow:'0 12px 32px rgba(0,0,0,0.08)' }}
              style={{ background:'white', padding:'24px', borderRadius:'20px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', transition:'all 0.3s' }}>
              <div style={{ width:'44px', height:'44px', background:'#faf5ff', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px' }}>
                <Icon size={20} color="#7c3aed"/>
              </div>
              <h3 style={{ fontWeight:'800', color:'#0f172a', fontSize:'15px', marginBottom:'8px' }}>{title}</h3>
              <p style={{ color:'#64748b', fontSize:'13px', lineHeight:1.7 }}>{desc}</p>
            </motion.div>
          ))}
        </Section>
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section style={{ padding:'96px 0', background:'white' }}>
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 40px' }}>
        <Section style={{ textAlign:'center', marginBottom:'56px' }}>
          <FadeUp><p style={{ color:'#7c3aed', fontWeight:'700', fontSize:'12px', letterSpacing:'3px', textTransform:'uppercase', marginBottom:'12px' }}>Testimonials</p></FadeUp>
          <FadeUp><h2 style={{ fontSize:'clamp(28px,4vw,44px)', fontWeight:'900', color:'#0f172a', letterSpacing:'-0.8px' }}>Loved by thousands</h2></FadeUp>
        </Section>
        <Section style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'20px' }}>
          {testimonials.map(({ name, role, text, rating, av }) => (
            <motion.div key={name} variants={fade}
              whileHover={{ y:-4, boxShadow:'0 16px 40px rgba(0,0,0,0.08)' }}
              style={{ background:'#f8fafc', padding:'28px', borderRadius:'20px', border:'1px solid #f1f5f9', transition:'all 0.3s' }}>
              <div style={{ display:'flex', gap:'3px', marginBottom:'16px' }}>
                {[...Array(rating)].map((_,i)=><Star key={i} size={15} color="#facc15" fill="#facc15"/>)}
              </div>
              <p style={{ color:'#334155', fontSize:'14px', lineHeight:1.75, marginBottom:'24px', fontStyle:'italic' }}>{text}</p>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:'42px', height:'42px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'12px', fontWeight:'800', flexShrink:0 }}>{av}</div>
                <div>
                  <div style={{ fontWeight:'700', color:'#0f172a', fontSize:'14px' }}>{name}</div>
                  <div style={{ color:'#94a3b8', fontSize:'12px', marginTop:'2px' }}>{role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </Section>
      </div>
    </section>
  )
}

function CTA() {
  const { isAuthenticated } = useAuthStore()
  return (
    <section style={{ padding:'100px 0', background:'linear-gradient(135deg,#0f0a1e 0%,#1e1040 50%,#0e1a3a 100%)', position:'relative', overflow:'hidden' }}>
      <motion.div animate={{ scale:[1,1.3,1], opacity:[0.15,0.3,0.15] }} transition={{ duration:8, repeat:Infinity }}
        style={{ position:'absolute', top:'-80px', right:'-80px', width:'400px', height:'400px', background:'#7c3aed', borderRadius:'50%', filter:'blur(80px)' }} />
      <motion.div animate={{ scale:[1.3,1,1.3], opacity:[0.1,0.2,0.1] }} transition={{ duration:10, repeat:Infinity, delay:3 }}
        style={{ position:'absolute', bottom:'-80px', left:'-80px', width:'400px', height:'400px', background:'#4338ca', borderRadius:'50%', filter:'blur(80px)' }} />

      <div style={{ position:'relative', zIndex:1, maxWidth:'640px', margin:'0 auto', padding:'0 24px', textAlign:'center' }}>
        <Section>
          <FadeUp>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'8px 18px', borderRadius:'100px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.7)', fontSize:'13px', fontWeight:'500', marginBottom:'28px' }}>
              <Zap size={13} color="#facc15"/> Join 50,000+ happy customers
            </div>
          </FadeUp>
          <FadeUp><h2 style={{ fontSize:'clamp(32px,5vw,52px)', fontWeight:'900', color:'white', marginBottom:'18px', letterSpacing:'-1px', lineHeight:1.15 }}>Ready to get started?</h2></FadeUp>
          <FadeUp><p style={{ color:'rgba(255,255,255,0.55)', fontSize:'17px', marginBottom:'40px', lineHeight:1.7 }}>Create your free account and book your first service in under 2 minutes.</p></FadeUp>
          <FadeUp>
            <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
              {isAuthenticated ? (
                <Link to="/dashboard" style={{ padding:'16px 36px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', color:'white', fontWeight:'700', fontSize:'16px', borderRadius:'14px', textDecoration:'none', boxShadow:'0 8px 32px rgba(124,58,237,0.4)', transition:'all 0.2s' }}
                  onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'}
                  onMouseOut={e=>e.currentTarget.style.transform=''}>
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" style={{ padding:'16px 36px', background:'linear-gradient(135deg,#7c3aed,#4338ca)', color:'white', fontWeight:'700', fontSize:'16px', borderRadius:'14px', textDecoration:'none', boxShadow:'0 8px 32px rgba(124,58,237,0.4)', transition:'all 0.2s' }}
                    onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'}
                    onMouseOut={e=>e.currentTarget.style.transform=''}>
                    Sign up — it's free
                  </Link>
                  <Link to="/login" style={{ padding:'16px 36px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.18)', color:'white', fontWeight:'600', fontSize:'16px', borderRadius:'14px', textDecoration:'none', backdropFilter:'blur(8px)', transition:'all 0.2s' }}
                    onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.15)'}
                    onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,0.08)'}>
                    Log in
                  </Link>
                </>
              )}
            </div>
          </FadeUp>
        </Section>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer style={{ background:'#0a0a0f', padding:'32px 40px' }}>
      <div style={{ maxWidth:'1200px', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px' }}>
        <Logo height={32}/>
        <p style={{ color:'#475569', fontSize:'13px' }}>© 2026 UrbanEase. All rights reserved.</p>
        <div style={{ display:'flex', gap:'24px' }}>
          {['Privacy','Terms','Support'].map(i=>(
            <a key={i} href="#" style={{ color:'#475569', fontSize:'13px', textDecoration:'none', transition:'color 0.2s' }}
              onMouseOver={e=>e.currentTarget.style.color='white'} onMouseOut={e=>e.currentTarget.style.color='#475569'}>{i}</a>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default function Landing() {
  return (
    <div style={{ fontFamily:'system-ui,-apple-system,sans-serif', WebkitFontSmoothing:'antialiased' }}>
      <Hero />
      <Services />
      <HowItWorks />
      <Stats />
      <WhyUs />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  )
}
