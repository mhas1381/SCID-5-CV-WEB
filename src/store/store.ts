import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import { baseApi } from './api/baseApi'

const apiResetMiddleware: import('@reduxjs/toolkit').Middleware = () => (next) => (action) => {
  const result = next(action)
  const type = (action as { type: string }).type
  // Reset the API cache when a new login happens (token changes) or on logout,
  // so queries refetch with the correct credentials instead of showing stale data.
  if (type === 'auth/logout' || type === 'auth/setCredentials') {
    next(baseApi.util.resetApiState())
  }
  return result
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, apiResetMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch