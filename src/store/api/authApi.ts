import { baseApi } from './baseApi'
import type { User, AuthTokens, LoginRequest, RegisterRequest, SendOTPRequest, VerifyOTPRequest, SetPasswordRequest, Profile } from '@/types'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<{ user: User; tokens: AuthTokens }, LoginRequest>({
      query: (credentials) => ({
        url: 'accounts/v1/token/',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<{ user: User; tokens: AuthTokens }, RegisterRequest>({
      query: (data) => ({
        url: 'accounts/v1/register/',
        method: 'POST',
        body: data,
      }),
    }),
    sendOTP: builder.mutation<{ message: string }, SendOTPRequest>({
      query: (data) => ({
        url: 'accounts/v1/auth/send-otp/',
        method: 'POST',
        body: data,
      }),
    }),
    verifyOTP: builder.mutation<{ message: string }, VerifyOTPRequest>({
      query: (data) => ({
        url: 'accounts/v1/auth/verify-otp/',
        method: 'POST',
        body: data,
      }),
    }),
    setPassword: builder.mutation<{ message: string }, SetPasswordRequest>({
      query: (data) => ({
        url: 'accounts/v1/auth/set-password/',
        method: 'POST',
        body: data,
      }),
    }),
    getMe: builder.query<User, void>({
      query: () => 'accounts/v1/me/',
    }),
    getProfile: builder.query<Profile, void>({
      query: () => 'accounts/v1/profile/',
    }),
    refreshToken: builder.mutation<AuthTokens, { refresh: string }>({
      query: (data) => ({
        url: 'accounts/v1/token/refresh/',
        method: 'POST',
        body: data,
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useSendOTPMutation,
  useVerifyOTPMutation,
  useSetPasswordMutation,
  useGetMeQuery,
  useGetProfileQuery,
  useRefreshTokenMutation,
} = authApi