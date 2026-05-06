import { useState } from 'react'
import { CreditCard, AlertCircle, CheckCircle } from 'lucide-react'
import { createOrder, verifyPayment } from '../api/payments'
import useAuthStore from '../store/authStore'

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload  = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/**
 * Props:
 *   bookingId  — number
 *   amount     — display amount string e.g. "₹499"
 *   onSuccess  — (paymentData) => void
 */
export default function RazorpayButton({ bookingId, amount, onSuccess }) {
  const { user }                = useAuthStore()
  const [loading, setLoading]   = useState(false)
  const [error,   setError]     = useState('')
  const [paid,    setPaid]      = useState(false)

  async function handlePay() {
    setError('')
    setLoading(true)

    const loaded = await loadRazorpayScript()
    if (!loaded) {
      setError('Could not load payment gateway. Check your internet connection.')
      setLoading(false)
      return
    }

    let orderData
    try {
      const res = await createOrder(bookingId)
      orderData = res.data
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create payment order.')
      setLoading(false)
      return
    }

    const options = {
      key:         orderData.key_id,
      amount:      orderData.amount,
      currency:    orderData.currency,
      name:        'UrbanEase',
      description: orderData.name,
      order_id:    orderData.order_id,
      prefill: {
        name:  user?.full_name  || '',
        email: user?.email      || '',
        contact: user?.phone    || '',
      },
      theme: { color: '#7c3aed' },
      handler: async (response) => {
        try {
          const verifyRes = await verifyPayment({
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
          })
          setPaid(true)
          onSuccess?.(verifyRes.data)
        } catch {
          setError('Payment verification failed. Contact support with your payment ID.')
        } finally {
          setLoading(false)
        }
      },
      modal: {
        ondismiss: () => setLoading(false),
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', (response) => {
      setError(`Payment failed: ${response.error.description}`)
      setLoading(false)
    })
    rzp.open()
  }

  if (paid) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', background: '#ecfdf5', borderRadius: '14px', border: '1.5px solid #a7f3d0' }}>
      <CheckCircle size={18} color="#059669" />
      <span style={{ fontSize: '14px', fontWeight: '700', color: '#059669' }}>Payment Successful!</span>
    </div>
  )

  return (
    <div>
      <button onClick={handlePay} disabled={loading}
        style={{
          width: '100%', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          background: loading ? '#e5e7eb' : 'linear-gradient(135deg,#059669,#047857)',
          color: loading ? '#9ca3af' : 'white',
          border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '15px',
          cursor: loading ? 'wait' : 'pointer',
          boxShadow: loading ? 'none' : '0 4px 16px rgba(5,150,105,0.35)',
          transition: 'all 0.2s',
        }}
        onMouseOver={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
        onMouseOut={e => e.currentTarget.style.transform = ''}>
        <CreditCard size={18} />
        {loading ? 'Opening payment…' : `Pay ${amount} via Razorpay`}
      </button>

      {error && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '12px', padding: '12px 14px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
          <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: '1px' }} />
          <p style={{ color: '#dc2626', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>{error}</p>
        </div>
      )}
    </div>
  )
}
