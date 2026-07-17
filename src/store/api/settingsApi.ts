import { baseApi } from './baseApi'
import type { UserPreference, ChangePasswordRequest } from '@/types'

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<UserPreference, void>({
      query: () => 'v1/accounts/settings/',
      providesTags: ['Settings'],
    }),
    updateSettings: builder.mutation<UserPreference, Partial<UserPreference>>({
      query: (data) => ({
        url: 'v1/accounts/settings/',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),
    changePassword: builder.mutation<{ detail: string }, ChangePasswordRequest>({
      query: (data) => ({
        url: 'v1/accounts/change-password/',
        method: 'POST',
        body: data,
      }),
    }),
  }),
})

export const {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useChangePasswordMutation,
} = settingsApi
