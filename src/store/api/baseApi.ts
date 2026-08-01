import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'
import { API_BASE_URL } from '@/config'

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    headers.set('Content-Type', 'application/json')
    return headers
  },
})

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['User', 'Profile', 'Patient', 'PatientNote', 'Session', 'Overview', 'OverviewQuestions', 'Dashboard', 'Settings', 'DiagnosticResult', 'AdminUsers'],
  endpoints: () => ({}),
})