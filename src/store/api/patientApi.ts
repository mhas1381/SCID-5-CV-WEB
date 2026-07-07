import { baseApi } from './baseApi'
import type { Patient, PatientCreateRequest, PatientCreateResponse, PatientNote, PatientNoteCreateRequest, PatientNoteCreateResponse, PaginatedResponse } from '@/types'

export const patientApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPatients: builder.query<PaginatedResponse<Patient>, { page?: number; search?: string }>({
      query: ({ page = 1, search = '' } = {}) => 
        `v1/accounts/patients/?page=${page}${search ? `&search=${search}` : ''}`,
      providesTags: ['Patient'],
    }),
    getPatient: builder.query<Patient, number>({
      query: (id) => `v1/accounts/patients/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Patient', id }],
    }),
    createPatient: builder.mutation<PatientCreateResponse, PatientCreateRequest>({
      query: (data) => ({
        url: 'v1/accounts/patients/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Patient'],
    }),
    updatePatient: builder.mutation<Patient, { id: number; data: Partial<PatientCreateRequest> }>({
      query: ({ id, data }) => ({
        url: `v1/accounts/patients/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Patient', id }, 'Patient'],
    }),
    deletePatient: builder.mutation<void, number>({
      query: (id) => ({
        url: `v1/accounts/patients/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Patient'],
    }),
    getPatientNotes: builder.query<PaginatedResponse<PatientNote>, number>({
      query: (patientId) => `v1/accounts/patients/${patientId}/notes/`,
      providesTags: (result, error, patientId) => [{ type: 'PatientNote', id: patientId }],
    }),
    createPatientNote: builder.mutation<PatientNoteCreateResponse, { patientId: number; data: PatientNoteCreateRequest }>({
      query: ({ patientId, data }) => ({
        url: `v1/accounts/patients/${patientId}/notes/`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { patientId }) => [{ type: 'PatientNote', id: patientId }],
    }),
  }),
})

export const {
  useGetPatientsQuery,
  useGetPatientQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
  useGetPatientNotesQuery,
  useCreatePatientNoteMutation,
} = patientApi
