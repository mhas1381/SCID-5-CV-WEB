import { baseApi } from './baseApi'
import type { User, SendOTPRequest, SendOTPResponse, SendOTPError, VerifyOTPRequest, VerifyOTPResponse, GoogleLoginResponse, SetPasswordRequest, SetPasswordResponse, AuthTokens, TokenRefreshRequest } from '@/types'

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
      query: () => 'v1/accounts/me/',
      providesTags: ['User'],
    }),
    refreshToken: builder.mutation<AuthTokens, TokenRefreshRequest>({
      query: (data) => ({
        url: 'v1/accounts/token/refresh/',
        method: 'POST',
        body: data,
      }),
    }),
    googleLogin: builder.mutation<GoogleLoginResponse, { id_token: string }>({
      query: (data) => ({
        url: 'v1/accounts/auth/google/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    // Used internally: call verifyOTP at startup to check if token is still valid
    verifyToken: builder.query<User, void>({
      query: () => 'v1/accounts/me/',
    }),
  }),
})

export const {
  useSendOTPMutation,
  useVerifyOTPMutation,
  useSetPasswordMutation,
  useCompleteProfileMutation,
  useGetMeQuery,
  useRefreshTokenMutation,
  useVerifyTokenQuery,
  useGoogleLoginMutation,
} = authApi
