import api from './client'
import axios from 'axios'

export const loginUser = (phone, password) =>
  axios.post('/api/token/', { phone, password })

export const registerUser = (data) =>
  api.post('/users/register/', data)

export const getMe = () =>
  api.get('/users/me/')
