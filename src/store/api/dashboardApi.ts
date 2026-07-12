import { baseApi } from './baseApi'
import type { DashboardSummary } from '@/types'

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<DashboardSummary, void>({
      query: () => 'v1/dashboard/summary/',
      providesTags: ['Dashboard'],
    }),
  }),
})

export const { useGetDashboardSummaryQuery } = dashboardApi
