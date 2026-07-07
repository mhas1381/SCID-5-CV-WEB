import { baseApi } from './baseApi'
import type { Session, Question, DiagnosticResult, Overview, OverviewQuestion } from '@/types'

export const interviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==========================================================
    // Questions
    // ==========================================================
    getModuleQuestions: builder.query<Question[], string>({
      query: (module) => `questions/modules/${module}/questions/`,
    }),
    getOverviewQuestions: builder.query<OverviewQuestion[], void>({
      query: () => 'accounts/v1/overview-questions/',
      providesTags: ['OverviewQuestions'],
    }),
    // ==========================================================
    // Sessions
    // ==========================================================
    getSessions: builder.query<Session[], { patient?: number; module?: string }>({
      query: (params) => ({
        url: 'interviews/v1/sessions/',
        params,
      }),
      providesTags: ['Session'],
    }),
    getSession: builder.query<Session, number>({
      query: (id) => `interviews/v1/sessions/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Session', id }],
    }),
    createSession: builder.mutation<Session, { patient: number; module: string }>({
      query: (data) => ({
        url: 'interviews/v1/sessions/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Session'],
    }),
    updateSession: builder.mutation<Session, { id: number; data: Partial<Session> }>({
      query: ({ id, data }) => ({
        url: `interviews/v1/sessions/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Session', id }, 'Session'],
    }),
    submitAnswer: builder.mutation<Session, { sessionId: number; questionId: string; value: string | boolean | number; notes?: string }>({
      query: ({ sessionId, ...data }) => ({
        url: `interviews/v1/sessions/${sessionId}/submit-answer/`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { sessionId }) => [{ type: 'Session', id: sessionId }],
    }),
    completeSession: builder.mutation<Session, number>({
      query: (id) => ({
        url: `interviews/v1/sessions/${id}/complete/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Session', id }, 'Session'],
    }),
    // ==========================================================
    // Diagnostic Results
    // ==========================================================
    getDiagnosticResult: builder.query<DiagnosticResult[], number>({
      query: (sessionId) => `interviews/v1/sessions/${sessionId}/results/`,
    }),
    // ==========================================================
    // Overview (Patient Background)
    // ==========================================================
    getPatientOverviews: builder.query<Overview[], number>({
      query: (patientId) => `accounts/v1/patients/${patientId}/overviews/`,
      providesTags: (result, error, patientId) => [{ type: 'Overview', id: patientId }],
    }),
    createOverview: builder.mutation<Overview, { patientId: number; answers: Overview['answers'] }>({
      query: ({ patientId, answers }) => ({
        url: `accounts/v1/patients/${patientId}/overviews/`,
        method: 'POST',
        body: { answers },
      }),
      invalidatesTags: (result, error, { patientId }) => [{ type: 'Overview', id: patientId }],
    }),
    getOverview: builder.query<Overview, number>({
      query: (id) => `accounts/v1/overviews/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Overview', id }],
    }),
    updateOverview: builder.mutation<Overview, { id: number; data: { answers: Overview['answers'] } }>({
      query: ({ id, data }) => ({
        url: `accounts/v1/overviews/${id}/`,
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