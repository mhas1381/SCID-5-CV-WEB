import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  type QueryReturnValue,
} from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'
import { API_BASE_URL } from '@/config'
import { setTokens, logout } from '../slices/authSlice'

const rawBaseQuery = fetchBaseQuery({
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

interface ExtraOptions {
  skipAuthRefresh?: boolean
}

/** Single-flight refresh so concurrent 401s share one token renewal. */
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(
  api: {
    getState: () => unknown
    dispatch: (action: unknown) => unknown
  },
): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const state = api.getState() as RootState
      const refreshToken = state.auth.refreshToken
      if (!refreshToken) return null
      try {
        const result = (await rawBaseQuery(
          {
            url: 'v1/accounts/token/refresh/',
            method: 'POST',
            body: { refresh: refreshToken },
          },
          api as never,
          { skipAuthRefresh: true } as never,
        )) as QueryReturnValue<{ access?: string; refresh?: string }, FetchBaseQueryError>
        const data = result.data
        if (!data?.access) return null
        api.dispatch(
          setTokens({ access: data.access, refresh: data.refresh ?? refreshToken }),
        )
        return data.access
      } catch {
        return null
      } finally {
        refreshPromise = null
      }
    })()
  }
  return refreshPromise
}

export const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)
  const skipRefresh = (extraOptions as ExtraOptions | undefined)?.skipAuthRefresh
  if (result.error?.status === 401 && !skipRefresh) {
    const newToken = await refreshAccessToken(api)
    if (newToken) {
      result = await rawBaseQuery(args, api, extraOptions)
    } else {
      api.dispatch(logout())
    }
  }
  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['User', 'Profile', 'Patient', 'PatientNote', 'Session', 'Overview', 'OverviewQuestions', 'Dashboard', 'Settings', 'DiagnosticResult', 'AdminUsers'],
  endpoints: () => ({}),
})