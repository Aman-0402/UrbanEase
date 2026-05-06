import api from './client'

export const getStats            = ()           => api.get('/admin-api/stats/')
export const getAdminUsers       = (params)     => api.get('/admin-api/users/', { params })
export const toggleUserActive    = (id)         => api.patch(`/admin-api/users/${id}/toggle/`)
export const getAdminBookings    = (params)     => api.get('/admin-api/bookings/', { params })
export const getAdminProviders   = (params)     => api.get('/admin-api/providers/', { params })
export const toggleVerified      = (id)         => api.patch(`/admin-api/providers/${id}/verify/`)
