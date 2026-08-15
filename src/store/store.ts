import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import dataSourceReducer from './slices/dataSourceSlice'
import { baseApi, API_TAG_TYPES } from './api/baseApi'

const apiResetMiddleware: import('@reduxjs/toolkit').Middleware = () => (next) => (action) => {
  const result = next(action)
  const type = (action as { type: string }).type
  // Mark cached query data stale when a new login happens (token changes) or on
  // logout, so active queries refetch with the correct credentials instead of
  // showing another user's data. Unlike resetApiState, invalidateTags only
  // flags queries as stale: active subscriptions refetch and cache entries are
  // kept, but nothing aborts in-flight requests or wipes subscriptions. A full
  // resetApiState could drop the fresh getMe subscription that ProtectedRoute
  // creates right after login, leaving the app stuck on the auth spinner.
  if (type === 'auth/logout' || type === 'auth/setCredentials') {
    next(baseApi.util.invalidateTags(API_TAG_TYPES))
  }
  return result
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dataSource: dataSourceReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, apiResetMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch