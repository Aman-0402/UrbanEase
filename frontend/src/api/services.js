import api from './client'

export const getCategories   = ()           => api.get('/categories/')
export const getServices     = (params)     => api.get('/services/', { params })
export const getServiceBySlug = (slug)      => api.get(`/services/${slug}/`)
export const getProviders    = (params)     => api.get('/providers/', { params })
export const getProviderById = (id)         => api.get(`/providers/${id}/`)
export const getProviderReviews  = (id)      => api.get(`/providers/${id}/reviews/`)
export const suggestService      = (data)    => api.post('/suggestions/', data)
export const getMySuggestions    = ()        => api.get('/suggestions/mine/')
