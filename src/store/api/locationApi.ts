import { baseApi } from './baseApi'
import type { Province, City, PaginatedResponse } from '@/types'

export const locationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProvinces: builder.query<Province[], void>({
      query: () => 'v1/base/provinces/',
      transformResponse: (res: Province[] | PaginatedResponse<Province>) => {
        const list = Array.isArray(res) ? res : res.results
        return Array.isArray(list[0]) ? list[0] : list
      },
    }),
    getCities: builder.query<City[], number | void>({
      query: (provinceId) => provinceId
        ? `v1/base/cities/?province=${provinceId}`
        : 'v1/base/cities/',
      transformResponse: (res: City[] | PaginatedResponse<City>) => {
        const list = Array.isArray(res) ? res : res.results
        return Array.isArray(list[0]) ? list[0] : list
      },
    }),
  }),
})

export const { useGetProvincesQuery, useGetCitiesQuery } = locationApi
