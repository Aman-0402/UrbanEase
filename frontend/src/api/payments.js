import api from './client'

export const createOrder    = (bookingId) => api.post('/payments/create-order/', { booking_id: bookingId })
export const verifyPayment  = (data)      => api.post('/payments/verify/', data)
export const getPaymentStatus = (bookingId) => api.get(`/payments/status/${bookingId}/`)
