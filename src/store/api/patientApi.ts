import { baseApi } from './baseApi'
import type { Patient, PatientNote, PatientListResponse } from '@/types'

export const patientApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPatients: builder.query<PatientListResponse, { page?: number; search?: string }>({
      query: ({ page = 1, search = '' } = {}) => 
        `accounts/v1/patients/?page=${page}${search ? `&search=${search}` : ''}`,
      providesTags: ['Patient'],
    }),
    getPatient: builder.query<Patient, number>({
      query: (id) => `accounts/v1/patients/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Patient', id }],
    }),
    createPatient: builder.mutation<Patient, Partial<Patient>>({
      query: (data) => ({
        url: 'accounts/v1/patients/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Patient'],
    }),
    updatePatient: builder.mutation<Patient, { id: number; data: Partial<Patient> }>({
      query: ({ id, data }) => ({
        url: `accounts/v1/patients/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Patient', id }, 'Patient'],
    }),
    deletePatient: builder.mutation<void, number>({
      query: (id) => ({
        url: `accounts/v1/patients/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Patient'],
    }),
    getPatientNotes: builder.query<PatientNote[], number>({
      query: (patientId) => `accounts/v1/patients/${patientId}/notes/`,
      providesTags: (result, error, patientId) => [{ type: 'PatientNote', id: patientId }],
    }),
    createPatientNote: builder.mutation<PatientNote, { patientId: number; content: string }>({
      query: ({ patientId, content }) => ({
        url: `accounts/v1/patients/${patientId}/notes/`,
        method: 'POST',
        body: { content },
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