import { baseApi } from './baseApi'
import type { User, SendOTPRequest, SendOTPResponse, VerifyOTPRequest, VerifyOTPResponse, GoogleLoginResponse, PasswordLoginRequest, RegisterRequest, RegisterResponse, SetPasswordRequest, SetPasswordResponse, AuthTokens, TokenRefreshRequest, PasswordResetRequest, PasswordResetResponse, PasswordResetConfirmRequest, PasswordResetConfirmResponse } from '@/types'

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
      invalidatesTags: ['User'],
    }),
    completeProfile: builder.mutation<any, any>({
      query: (data) => ({
        url: 'v1/accounts/profile/complete/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (data) => ({
        url: 'v1/accounts/register/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
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
    passwordLogin: builder.mutation<VerifyOTPResponse, PasswordLoginRequest>({
      query: (data) => ({
        url: 'v1/accounts/token/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    googleLogin: builder.mutation<GoogleLoginResponse, { id_token: string }>({
      query: (data) => ({
        url: 'v1/accounts/auth/google/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    requestPasswordReset: builder.mutation<PasswordResetResponse, PasswordResetRequest>({
      query: (data) => ({
        url: 'v1/accounts/auth/password-reset/',
        method: 'POST',
        body: data,
      }),
    }),
    confirmPasswordReset: builder.mutation<PasswordResetConfirmResponse, PasswordResetConfirmRequest>({
      query: (data) => ({
        url: 'v1/accounts/auth/password-reset/confirm/',
        method: 'POST',
        body: data,
      }),
    }),
  }),
})

export const {
  useSendOTPMutation,
  useVerifyOTPMutation,
  useSetPasswordMutation,
  useCompleteProfileMutation,
  useRegisterMutation,
  useGetMeQuery,
  useRefreshTokenMutation,
  useGoogleLoginMutation,
  usePasswordLoginMutation,
  useRequestPasswordResetMutation,
  useConfirmPasswordResetMutation,
} = authApi
