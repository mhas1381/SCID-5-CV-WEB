import { baseApi } from './baseApi'
import type { Province, City } from '@/types'

export const locationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProvinces: builder.query<Province[], void>({
      query: () => 'v1/base/provinces/',
    }),
    getCities: builder.query<City[], number | void>({
      query: (provinceId) => provinceId
        ? `v1/base/cities/?province=${provinceId}`
        : 'v1/base/cities/',
    }),
  }),
})

export const { useGetProvincesQuery, useGetCitiesQuery } = locationApi
