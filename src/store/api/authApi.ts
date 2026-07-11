import { baseApi } from './baseApi'
import type { User, SendOTPRequest, SendOTPResponse, SendOTPError, VerifyOTPRequest, VerifyOTPResponse, SetPasswordRequest, SetPasswordResponse, AuthTokens, TokenRefreshRequest } from '@/types'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendOTP: builder.mutation<SendOTPResponse, SendOTPRequest>({
      query: (data) => ({
        url: 'v1/accounts/auth/send-otp/',
        method: 'POST',
        body: data,
      }),
    }),
    verifyOTP: builder.mutation<VerifyOTPResponse, VerifyOTPRequest>({
      query: (data) => ({
        url: 'v1/accounts/auth/verify-otp/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    setPassword: builder.mutation<SetPasswordResponse, SetPasswordRequest>({
      query: (data) => ({
        url: 'v1/accounts/auth/set-password/',
        method: 'POST',
        body: data,
      }),
    }),
    completeProfile: builder.mutation<any, any>({
      query: (data) => ({
        url: 'v1/accounts/profile/complete/',
        method: 'POST',
        body: data,
      }),
    }),
    getMe: builder.query<User, void>({
      query: () => 'v1/accounts/users/me/',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<User, Partial<User>>({
      query: (data) => ({
        url: 'v1/accounts/users/me/',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    refreshToken: builder.mutation<AuthTokens, TokenRefreshRequest>({
      query: (data) => ({
        url: 'v1/accounts/token/refresh/',
        method: 'POST',
        body: data,
      }),
    }),
    // Used internally: call verifyOTP at startup to check if token is still valid
    verifyToken: builder.query<User, void>({
      query: () => 'v1/accounts/users/me/',
    }),
  }),
})

export const {
  useSendOTPMutation,
  useVerifyOTPMutation,
  useSetPasswordMutation,
  useCompleteProfileMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useRefreshTokenMutation,
  useVerifyTokenQuery,
} = authApi
