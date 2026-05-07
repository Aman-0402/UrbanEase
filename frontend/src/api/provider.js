import api from './client'

export const getMyProfile        = ()           => api.get('/providers/me/')
export const updateMyProfile     = (data)       => api.patch('/providers/me/', data)
export const getProviderBookings = (params)     => api.get('/bookings/provider/', { params })
export const updateBookingStatus = (id, data)   => api.patch(`/bookings/${id}/status/`, data)
export const getMyReviews        = ()           => api.get('/reviews/mine/')
export const getMyEarnings       = ()           => api.get('/bookings/provider/earnings/')
