import api from './client'
import axios from 'axios'

export const loginUser = (phone, password) =>
  axios.post('/api/token/', { phone, password })

export const registerUser = (data) =>
  api.post('/users/register/', data)

// Pass access token explicitly so we don't depend on localStorage being set yet
export const getMe = (accessToken) =>
  api.get('/users/me/', {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  })
