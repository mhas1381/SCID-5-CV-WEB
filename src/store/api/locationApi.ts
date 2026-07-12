import { baseApi } from './baseApi'
import type { Province, City, PaginatedResponse } from '@/types'

export const locationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProvinces: builder.query<Province[], void>({
      query: () => 'v1/base/provinces/',
      transformResponse: (res: Province[] | PaginatedResponse<Province>) =>
        Array.isArray(res) ? res : res.results,
    }),
    getCities: builder.query<City[], number | void>({
      query: (provinceId) => provinceId
        ? `v1/base/cities/?province=${provinceId}`
        : 'v1/base/cities/',
      transformResponse: (res: City[] | PaginatedResponse<City>) =>
        Array.isArray(res) ? res : res.results,
    }),
  }),
})

export const { useGetProvincesQuery, useGetCitiesQuery } = locationApi
