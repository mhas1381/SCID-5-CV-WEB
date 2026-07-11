import { baseApi } from './baseApi'
import type { UserProfile, UserProfileUpdateRequest } from '@/types'

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<UserProfile, void>({
      query: () => 'v1/accounts/profile/',
      providesTags: ['Profile'],
    }),
    createProfile: builder.mutation<UserProfile, UserProfileUpdateRequest>({
      query: (data) => ({
        url: 'v1/accounts/profile/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Profile', 'User'],
    }),
    updateProfile: builder.mutation<UserProfile, UserProfileUpdateRequest | FormData>({
      query: (data) => ({
        url: 'v1/accounts/profile/',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Profile', 'User'],
    }),
  }),
})

export const {
  useGetProfileQuery,
  useCreateProfileMutation,
  useUpdateProfileMutation,
} = profileApi