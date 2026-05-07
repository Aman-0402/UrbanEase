import api from './client'

export const getStats            = ()           => api.get('/admin-api/stats/')
export const getAdminUsers       = (params)     => api.get('/admin-api/users/', { params })
export const toggleUserActive    = (id)         => api.patch(`/admin-api/users/${id}/toggle/`)
export const getAdminBookings    = (params)     => api.get('/admin-api/bookings/', { params })
export const getAdminProviders   = (params)     => api.get('/admin-api/providers/', { params })
export const toggleVerified      = (id)         => api.patch(`/admin-api/providers/${id}/verify/`)
export const getAdminKYCList     = (params)     => api.get('/admin-api/kyc/', { params })
export const reviewKYC           = (id, data)   => api.patch(`/admin-api/kyc/${id}/review/`, data)

// Categories
export const getAdminCategories  = (params)     => api.get('/admin-api/categories/', { params })
export const createCategory      = (data)       => api.post('/admin-api/categories/', data)
export const updateCategory      = (id, data)   => api.patch(`/admin-api/categories/${id}/`, data)
export const deleteCategory      = (id)         => api.delete(`/admin-api/categories/${id}/`)

// Services
export const getAdminServices    = (params)     => api.get('/admin-api/services/', { params })
export const createService       = (data)       => api.post('/admin-api/services/', data)
export const updateService       = (id, data)   => api.patch(`/admin-api/services/${id}/`, data)
export const deleteService       = (id)         => api.delete(`/admin-api/services/${id}/`)

// Suggestions
export const getAdminSuggestions = (params)     => api.get('/admin-api/suggestions/', { params })
export const reviewSuggestion    = (id, data)   => api.patch(`/admin-api/suggestions/${id}/review/`, data)
