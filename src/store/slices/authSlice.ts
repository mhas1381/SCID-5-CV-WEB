import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { User, AuthTokens } from '@/types'
import { readTokens, writeTokens, clearTokens } from '@/utils/tokenStorage'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const persisted = readTokens()

const initialState: AuthState = {
  user: null,
  accessToken: persisted.access,
  refreshToken: persisted.refresh,
  isAuthenticated: !!persisted.access,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; tokens: AuthTokens }>) => {
      const { user, tokens } = action.payload
      state.user = user
      state.accessToken = tokens.access
      state.refreshToken = tokens.refresh
      state.isAuthenticated = true
      state.error = null
      writeTokens({ access: tokens.access, refresh: tokens.refresh })
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
    setTokens: (state, action: PayloadAction<AuthTokens>) => {
      state.accessToken = action.payload.access
      state.refreshToken = action.payload.refresh
      writeTokens({ access: action.payload.access, refresh: action.payload.refresh })
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
      clearTokens()
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
  },
})

export const { setCredentials, setUser, setTokens, logout, setError, setLoading } = authSlice.actions
export default authSlice.reducer