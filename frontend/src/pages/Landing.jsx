import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  Zap, MapPin, Star, Shield, Clock, ChevronRight,
  Wrench, Zap as ElecIcon, Droplets, Sparkles, BookOpen,
  Monitor, Scissors, Car, ArrowRight, CheckCircle, Play,
  Users, TrendingUp, Award, HeartHandshake
} from 'lucide-react'

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

function AnimatedSection({ children, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const services = [
  { icon: Wrench, label: 'Plumbing', color: 'bg-blue-50 text-blue-600', count: '240+ pros' },
  { icon: ElecIcon, label: 'Electrician', color: 'bg-yellow-50 text-yellow-600', count: '180+ pros' },
  { icon: Sparkles, label: 'Cleaning', color: 'bg-green-50 text-green-600', count: '320+ pros' },
  { icon: Droplets, label: 'AC Repair', color: 'bg-cyan-50 text-cyan-600', count: '150+ pros' },
  { icon: Monitor, label: 'Appliances', color: 'bg-purple-50 text-purple-600', count: '200+ pros' },
  { icon: BookOpen, label: 'Tutoring', color: 'bg-rose-50 text-rose-600', count: '400+ pros' },
  { icon: Scissors, label: 'Salon', color: 'bg-pink-50 text-pink-600', count: '280+ pros' },
  { icon: Car, label: 'Car Wash', color: 'bg-orange-50 text-orange-600', count: '90+ pros' },
]

const steps = [
  { step: '01', title: 'Search a Service', desc: 'Browse by category or search what you need. We detect your location automatically.', icon: MapPin },
  { step: '02', title: 'Pick a Provider', desc: 'Compare ratings, reviews, prices, and availability. Choose the best fit for you.', icon: Star },
  { step: '03', title: 'Book & Pay', desc: 'Select a time slot and pay securely online. Instant booking confirmation.', icon: Shield },
  { step: '04', title: 'Service Done ✓', desc: 'Provider arrives on time. Rate and review after the job is complete.', icon: CheckCircle },
]

const stats = [
  { value: '50K+', label: 'Happy Customers', icon: Users },
  { value: '8K+', label: 'Verified Providers', icon: Award },
  { value: '98%', label: 'Satisfaction Rate', icon: TrendingUp },
  { value: '25+', label: 'Cities Covered', icon: MapPin },
]

const testimonials = [
  { name: 'Priya Sharma', role: 'Homeowner', text: 'Found a plumber in 10 minutes. Arrived on time, fixed the issue, fair price. Absolutely love UrbanEase!', rating: 5, avatar: 'PS' },
  { name: 'Rahul Mehta', role: 'Working Professional', text: 'Booked AC servicing on a Sunday morning. The technician was professional and thorough. Highly recommend!', rating: 5, avatar: 'RM' },
  { name: 'Anita Nair', role: 'Startup Founder', text: 'We use UrbanEase for our office cleaning every week. Consistent quality and always on time.', rating: 5, avatar: 'AN' },
]

// ─── Sections ─────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-950 pt-16">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-violet-500 rounded-full blur-3xl opacity-30"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20"
        />
        <motion.div
          animate={{ y: [-20, 20, -20] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-violet-400 rounded-full blur-3xl opacity-10"
        />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMEgwdjYwaDYwVjB6TTEgMWg1OHY1OEgxVjF6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii4wMyIvPjwvZz48L3N2Zz4=')] opacity-40" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-8 backdrop-blur-sm"
        >
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Now available in 25+ cities across India
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6"
        >
          Home services,{' '}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              on demand
            </span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-violet-400 to-indigo-400 rounded-full origin-left"
            />
          </span>
          <br />
          at your doorstep
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10"
        >
          Connect with trusted, verified service professionals near you — instantly.
          Plumbers, electricians, cleaners, tutors and more.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link
            to="/register"
            className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-violet-500/30 hover:-translate-y-1 transition-all duration-300 text-lg"
          >
            Get started free
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm text-lg"
          >
            <Play size={18} className="text-violet-400" />
            See how it works
          </a>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-6 text-white/50 text-sm"
        >
          {['Background verified pros', 'Instant booking', 'Secure payments', '30-day guarantee'].map((badge) => (
            <div key={badge} className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-green-400" />
              {badge}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center pt-2">
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </div>
      </motion.div>
    </section>
  )
}

function Services() {
  return (
    <section id="services" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <motion.p variants={fadeUp} className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-3">
            What we offer
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Services for every need
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-500 text-lg max-w-xl mx-auto">
            From quick fixes to deep cleaning — we've got every home service covered.
          </motion.p>
        </AnimatedSection>

        <AnimatedSection className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {services.map(({ icon: Icon, label, color, count }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-white rounded-2xl p-6 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100"
            >
              <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={26} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{label}</h3>
              <p className="text-xs text-gray-400">{count}</p>
            </motion.div>
          ))}
        </AnimatedSection>

        <AnimatedSection className="text-center mt-10">
          <motion.div variants={fadeUp}>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-violet-600 font-semibold hover:gap-3 transition-all duration-200"
            >
              View all services <ChevronRight size={18} />
            </Link>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <motion.p variants={fadeUp} className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-3">
            Simple process
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Book in 4 easy steps
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-500 text-lg max-w-xl mx-auto">
            Getting help at home has never been this simple.
          </motion.p>
        </AnimatedSection>

        <AnimatedSection className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-violet-200 via-indigo-300 to-violet-200" />

          {steps.map(({ step, title, desc, icon: Icon }, i) => (
            <motion.div key={step} variants={fadeUp} className="relative text-center">
              <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full" />
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="relative z-10 w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-violet-200"
                >
                  <Icon size={24} className="text-white" />
                </motion.div>
                <span className="absolute -top-1 -right-1 w-7 h-7 bg-white border-2 border-violet-200 rounded-full flex items-center justify-center text-xs font-bold text-violet-600">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </AnimatedSection>
      </div>
    </section>
  )
}

function Stats() {
  return (
    <section className="py-20 bg-gradient-to-br from-violet-600 to-indigo-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(({ value, label, icon: Icon }) => (
            <motion.div key={label} variants={fadeUp} className="text-center text-white">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Icon size={22} className="text-white" />
                </div>
              </div>
              <div className="text-4xl font-extrabold mb-1">{value}</div>
              <div className="text-white/70 text-sm">{label}</div>
            </motion.div>
          ))}
        </AnimatedSection>
      </div>
    </section>
  )
}

function WhyUs() {
  const features = [
    { icon: Shield, title: 'Verified Professionals', desc: 'Every provider is background-checked, trained, and rated by real customers.' },
    { icon: Clock, title: 'Same-Day Booking', desc: 'Need help today? Book in minutes and get a pro at your door within hours.' },
    { icon: Star, title: 'Satisfaction Guaranteed', desc: "Not happy? We'll re-do the job for free or refund you. No questions asked." },
    { icon: HeartHandshake, title: 'Fair Pricing', desc: 'Transparent pricing — no hidden charges. See the full cost before you confirm.' },
  ]

  return (
    <section id="providers" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <AnimatedSection>
            <motion.p variants={fadeUp} className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-3">
              Why UrbanEase
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Built for trust,<br />designed for convenience
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-500 text-lg mb-10">
              We obsess over every detail so you can sit back and relax while the best professionals handle your home.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-violet-200 hover:-translate-y-0.5 transition-all duration-300"
              >
                Book your first service <ArrowRight size={18} />
              </Link>
            </motion.div>
          </AnimatedSection>

          <AnimatedSection className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
              >
                <div className="w-11 h-11 bg-violet-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={22} className="text-violet-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <motion.p variants={fadeUp} className="text-violet-600 font-semibold text-sm uppercase tracking-widest mb-3">
            Testimonials
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-bold text-gray-900">
            Loved by thousands
          </motion.h2>
        </AnimatedSection>

        <AnimatedSection className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ name, role, text, rating, avatar }) => (
            <motion.div
              key={name}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {Array(rating).fill(0).map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">"{text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{name}</div>
                  <div className="text-gray-400 text-xs">{role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatedSection>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-20 -right-20 w-80 h-80 bg-violet-500 rounded-full blur-3xl opacity-20"
        />
        <motion.div
          animate={{ scale: [1.3, 1, 1.3], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, delay: 3 }}
          className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-20"
        />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
        <AnimatedSection>
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-8">
            <Zap size={14} className="text-yellow-400" />
            Join 50,000+ happy customers
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
            Ready to get started?
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/60 text-lg mb-10">
            Create your free account and book your first service in under 2 minutes.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-10 py-4 bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-violet-500/30 hover:-translate-y-1 transition-all duration-300 text-lg"
            >
              Sign up — it's free
            </Link>
            <Link
              to="/login"
              className="px-10 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm text-lg"
            >
              Log in
            </Link>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg">UrbanEase</span>
          </div>
          <p className="text-sm">© 2026 UrbanEase. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            {['Privacy', 'Terms', 'Support'].map((item) => (
              <a key={item} href="#" className="hover:text-white transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <div className="font-sans antialiased">
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
