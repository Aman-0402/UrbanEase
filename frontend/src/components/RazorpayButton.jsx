import { useState } from 'react'
import { CreditCard, Lock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react'
import { createOrder, verifyPayment } from '../api/payments'

function formatCard(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}
function formatExpiry(val) {
  const v = val.replace(/\D/g, '').slice(0, 4)
  return v.length >= 3 ? v.slice(0, 2) + '/' + v.slice(2) : v
}

const inp = (focus) => ({
  width: '100%', padding: '12px 14px', border: `2px solid ${focus ? '#7c3aed' : '#e5e7eb'}`,
  borderRadius: '11px', fontSize: '14px', color: '#0f172a', outline: 'none',
  background: 'white', transition: 'border 0.2s', boxSizing: 'border-box', fontFamily: 'monospace',
})

/**
 * Props:  bookingId, amount (display string), onSuccess
 *
 * Test cards:
 *   4242 4242 4242 4242  →  Success
 *   4000 0000 0000 0002  →  Decline
 */
export default function MockPaymentButton({ bookingId, amount, onSuccess }) {
  const [open,    setOpen]    = useState(false)
  const [card,    setCard]    = useState('')
  const [expiry,  setExpiry]  = useState('')
  const [cvv,     setCvv]     = useState('')
  const [name,    setName]    = useState('')
  const [focus,   setFocus]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [paid,    setPaid]    = useState(false)

  async function handlePay(e) {
    e.preventDefault()
    setError('')

    const rawCard = card.replace(/\s/g, '')
    if (rawCard.length < 16)   { setError('Enter a valid 16-digit card number.'); return }
    if (expiry.length < 5)     { setError('Enter a valid expiry date.'); return }
    if (cvv.length < 3)        { setError('Enter a valid CVV.'); return }
    if (!name.trim())          { setError('Enter the cardholder name.'); return }

    setLoading(true)
    try {
      // Step 1: create order
      const orderRes = await createOrder(bookingId)
      const { order_id } = orderRes.data

      // Step 2: "process" the card
      await verifyPayment({ order_id, card_number: rawCard })

      setPaid(true)
      onSuccess?.()
    } catch (err) {
      setError(err.response?.data?.detail || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (paid) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 20px', background: '#ecfdf5', borderRadius: '14px', border: '1.5px solid #a7f3d0' }}>
      <CheckCircle size={20} color="#059669" />
      <div>
        <div style={{ fontSize: '14px', fontWeight: '800', color: '#059669' }}>Payment Successful!</div>
        <div style={{ fontSize: '12px', color: '#6ee7b7', marginTop: '2px' }}>Your booking is confirmed and paid.</div>
      </div>
    </div>
  )

  return (
    <div>
      {!open ? (
        <button onClick={() => setOpen(true)}
          style={{ width: '100%', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'linear-gradient(135deg,#059669,#047857)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(5,150,105,0.3)', transition: 'all 0.2s' }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseOut={e => e.currentTarget.style.transform = ''}>
          <CreditCard size={18} /> Pay {amount}
        </button>
      ) : (
        <div style={{ border: '2px solid #e5e7eb', borderRadius: '18px', overflow: 'hidden' }}>

          {/* Card header */}
          <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)', padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={13} color="rgba(255,255,255,0.6)" />
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>Secure Payment</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {/* Visa-like logo */}
                <div style={{ background: 'white', borderRadius: '4px', padding: '2px 7px', fontSize: '11px', fontWeight: '900', color: '#1a1f71', letterSpacing: '-0.5px' }}>VISA</div>
                <div style={{ background: '#eb001b', borderRadius: '50%', width: '20px', height: '20px', opacity: 0.9 }}/>
                <div style={{ background: '#f79e1b', borderRadius: '50%', width: '20px', height: '20px', marginLeft: '-10px', opacity: 0.9 }}/>
              </div>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '20px', fontWeight: '700', color: 'white', letterSpacing: '3px', marginBottom: '16px' }}>
              {card || '•••• •••• •••• ••••'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px', textTransform: 'uppercase' }}>Card Holder</div>
                <div style={{ fontSize: '13px', color: 'white', fontWeight: '600' }}>{name || 'YOUR NAME'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px', textTransform: 'uppercase' }}>Expires</div>
                <div style={{ fontSize: '13px', color: 'white', fontWeight: '600' }}>{expiry || 'MM/YY'}</div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handlePay} style={{ padding: '20px 22px', background: 'white', display: 'flex', flexDirection: 'column', gap: '14px' }}>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Card Number</label>
              <input value={card} onChange={e => setCard(formatCard(e.target.value))} placeholder="4242 4242 4242 4242"
                style={inp(focus === 'card')} onFocus={() => setFocus('card')} onBlur={() => setFocus('')} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Cardholder Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="John Smith"
                style={{ ...inp(focus === 'name'), fontFamily: 'system-ui' }}
                onFocus={() => setFocus('name')} onBlur={() => setFocus('')} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Expiry</label>
                <input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY"
                  style={inp(focus === 'expiry')} onFocus={() => setFocus('expiry')} onBlur={() => setFocus('')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>CVV</label>
                <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="•••"
                  type="password" style={inp(focus === 'cvv')} onFocus={() => setFocus('cvv')} onBlur={() => setFocus('')} />
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '11px 13px', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca' }}>
                <AlertCircle size={13} color="#ef4444" style={{ flexShrink: 0, marginTop: '1px' }} />
                <p style={{ color: '#dc2626', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>{error}</p>
              </div>
            )}

            {/* Test hint */}
            <div style={{ padding: '10px 13px', background: '#faf5ff', borderRadius: '10px', border: '1px solid #e9d5ff' }}>
              <p style={{ fontSize: '11px', color: '#7c3aed', margin: 0, fontWeight: '600' }}>
                Test cards — Success: <code style={{ background: '#ede9fe', padding: '1px 5px', borderRadius: '4px' }}>4242 4242 4242 4242</code> &nbsp;
                Decline: <code style={{ background: '#ede9fe', padding: '1px 5px', borderRadius: '4px' }}>4000 0000 0000 0002</code>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => { setOpen(false); setError('') }}
                style={{ flex: 1, padding: '13px', border: '2px solid #e5e7eb', borderRadius: '12px', fontWeight: '700', fontSize: '14px', color: '#374151', background: 'white', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={loading}
                style={{ flex: 2, padding: '13px', background: loading ? '#e5e7eb' : 'linear-gradient(135deg,#7c3aed,#4338ca)', color: loading ? '#9ca3af' : 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '14px', cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
                {loading ? 'Processing…' : <><ChevronRight size={16} /> Pay {amount}</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
