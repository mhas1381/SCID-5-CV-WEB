import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import { baseApi } from './api/baseApi'

const apiResetMiddleware: import('@reduxjs/toolkit').Middleware = () => (next) => (action) => {
  const result = next(action)
  if (action.type === 'auth/logout') {
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