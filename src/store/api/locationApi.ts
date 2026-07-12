import { baseApi } from './baseApi'
import type { Province, City, PaginatedResponse } from '@/types'

export const locationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProvinces: builder.query<Province[], void>({
      query: () => 'v1/base/provinces/?page_size=200',
      transformResponse: (res: Province[] | PaginatedResponse<Province>) => {
        const list = Array.isArray(res) ? res : res.results
        return Array.isArray(list[0]) ? list[0] : list
      },
    }),
    getAllCities: builder.query<City[], void>({
      query: () => 'v1/base/cities/?page_size=200',
      transformResponse: (res: City[] | PaginatedResponse<City>) => {
        const list = Array.isArray(res) ? res : res.results
        return Array.isArray(list[0]) ? list[0] : list
      },
    }),
  }),
})

export const { useGetProvincesQuery, useGetAllCitiesQuery } = locationApi
