import { baseApi } from './baseApi'
import type {
  AdminActivityFeed,
  AdminActivityParams,
  AdminAgreement,
  AdminDemographics,
  AdminInterviewAnalytics,
  AdminOverview,
  AdminUser,
  AdminUserUpdateRequest,
} from '@/types'

/** Optional demographic filter params for the demographics endpoint. */
export interface DemographicsParams {
  gender?: string
  education?: string
  marital_status?: string
  age_group?: string
  province?: string
  from?: string
  to?: string
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminOverview: builder.query<AdminOverview, void>({
      query: () => 'v1/admin/overview/',
    }),

    getAdminInterviewAnalytics: builder.query<
      AdminInterviewAnalytics,
      { days?: number }
    >({
      query: ({ days = 30 } = {}) => ({
        url: 'v1/admin/analytics/interviews/',
        params: { days },
      }),
    }),

    getAdminAgreement: builder.query<AdminAgreement, void>({
      query: () => 'v1/admin/analytics/agreement/',
    }),

    getAdminDemographics: builder.query<AdminDemographics, DemographicsParams>(
      {
        query: (params) => ({
          url: 'v1/admin/analytics/demographics/',
          params,
        }),
      }
    ),

    getAdminActivity: builder.query<AdminActivityFeed, AdminActivityParams>(
      {
        query: (params) => {
          const query: Record<string, string> = {
            limit: String(params.limit ?? 50),
            offset: String(params.offset ?? 0),
          }
          if (params.event_type) {
            query.event_type = params.event_type
          }
          return { url: 'v1/admin/activity/', params: query }
        },
      }
    ),

    getAdminUsers: builder.query<
      AdminUser[],
      {
        search?: string
        role?: string
        verification_status?: string
        is_active?: string
      } | void
    >({
      query: (params) => ({
        url: 'v1/admin/users/',
        params: params || undefined,
      }),
      providesTags: ['AdminUsers'],
    }),

    updateAdminUser: builder.mutation<
      AdminUser,
      { id: number; data: AdminUserUpdateRequest }
    >({
      query: ({ id, data }) => ({
        url: `v1/admin/users/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['AdminUsers', 'User'],
    }),
  }),
})

export const {
  useGetAdminOverviewQuery,
  useGetAdminInterviewAnalyticsQuery,
  useGetAdminAgreementQuery,
  useGetAdminDemographicsQuery,
  useGetAdminActivityQuery,
  useGetAdminUsersQuery,
  useUpdateAdminUserMutation,
} = adminApi
