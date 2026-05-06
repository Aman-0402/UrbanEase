import api from './client'

export const createBooking       = (data)       => api.post('/bookings/', data)
export const getMyBookings       = (params)     => api.get('/bookings/my/', { params })
export const getBookingDetail    = (id)         => api.get(`/bookings/${id}/`)
export const cancelBooking       = (id, reason) => api.post(`/bookings/${id}/cancel/`, { reason })
export const submitReview        = (bookingId, data) => api.post(`/bookings/${bookingId}/review/`, data)
export const getBookingReview    = (bookingId)  => api.get(`/bookings/${bookingId}/review/`)
