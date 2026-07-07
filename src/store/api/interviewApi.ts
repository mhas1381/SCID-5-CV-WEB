import { baseApi } from './baseApi'
import type { Question, Session, DiagnosticResult, Overview, OverviewQuestionsResponse, OverviewAnswer, PaginatedResponse } from '@/types'

export const interviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==========================================================
    // Questions (Backend: /api/v1/questions/...)
    // ==========================================================
    getModuleQuestions: builder.query<Question[], { module: string; lang?: 'en' | 'fa' }>({
      query: ({ module, lang = 'en' }) =>
        `v1/questions/modules/${module}/questions/?lang=${lang}`,
    }),
    getOverviewQuestions: builder.query<OverviewQuestionsResponse, { lang?: 'en' | 'fa' }>({
      query: ({ lang = 'en' } = {}) =>
        `v1/questions/overview-questions/?lang=${lang}`,
      providesTags: ['OverviewQuestions'],
    }),
    // ==========================================================
    // Sessions (Backend: /api/v1/interviews/...)
    // ==========================================================
    getSessions: builder.query<PaginatedResponse<Session>, { patient?: number; module?: string; page?: number }>({
      query: (params) => ({
        url: 'v1/interviews/sessions/',
        params,
      }),
      providesTags: ['Session'],
    }),
    getSession: builder.query<Session, number>({
      query: (id) => `v1/interviews/sessions/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Session', id }],
    }),
    createSession: builder.mutation<Session, { patient: number; module: string }>({
      query: (data) => ({
        url: 'v1/interviews/sessions/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Session'],
    }),
    updateSession: builder.mutation<Session, { id: number; data: Partial<Session> }>({
      query: ({ id, data }) => ({
        url: `v1/interviews/sessions/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Session', id }, 'Session'],
    }),
    submitAnswer: builder.mutation<Session, { sessionId: number; questionId: string; value: string | boolean | number; notes?: string }>({
      query: ({ sessionId, ...data }) => ({
        url: `v1/interviews/sessions/${sessionId}/submit-answer/`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { sessionId }) => [{ type: 'Session', id: sessionId }],
    }),
    completeSession: builder.mutation<Session, number>({
      query: (id) => ({
        url: `v1/interviews/sessions/${id}/complete/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Session', id }, 'Session'],
    }),
    // ==========================================================
    // Diagnostic Results
    // ==========================================================
    getDiagnosticResult: builder.query<DiagnosticResult[], number>({
      query: (sessionId) => `v1/interviews/sessions/${sessionId}/results/`,
    }),
    // ==========================================================
    // Overview (Patient Background) — Backend: /api/v1/accounts/...
    // ==========================================================
    getPatientOverviews: builder.query<PaginatedResponse<Overview>, number>({
      query: (patientId) => `v1/accounts/patients/${patientId}/overviews/`,
      providesTags: (result, error, patientId) => [{ type: 'Overview', id: patientId }],
    }),
    createOverview: builder.mutation<Overview, { patientId: number; answers: OverviewAnswer[] }>({
      query: ({ patientId, answers }) => ({
        url: `v1/accounts/patients/${patientId}/overviews/`,
        method: 'POST',
        body: { answers },
      }),
      invalidatesTags: (result, error, { patientId }) => [{ type: 'Overview', id: patientId }],
    }),
    getOverview: builder.query<Overview, number>({
      query: (id) => `v1/accounts/overviews/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Overview', id }],
    }),
    updateOverview: builder.mutation<Overview, { id: number; data: { answers: OverviewAnswer[] } }>({
      query: ({ id, data }) => ({
        url: `v1/accounts/overviews/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Overview', id }],
    }),
  }),
})

export const {
  useGetModuleQuestionsQuery,
  useGetOverviewQuestionsQuery,
  useGetSessionsQuery,
  useGetSessionQuery,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useSubmitAnswerMutation,
  useCompleteSessionMutation,
  useGetDiagnosticResultQuery,
  useGetPatientOverviewsQuery,
  useCreateOverviewMutation,
  useGetOverviewQuery,
  useUpdateOverviewMutation,
} = interviewApi
