import { baseApi } from './baseApi'
import type {
  AnswerResponse,
  CompleteOverviewResponse,
  CompleteSessionResponse,
  DiagnosticResultsResponse,
  Module,
  NavigateResponse,
  Overview,
  OverviewCreateRequest,
  OverviewQuestionsResponse,
  PaginatedResponse,
  ProgressResponse,
  Question,
  Session,
  SubmitAnswerRequest,
} from '@/types'

export const interviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==========================================================
    // Modules (Backend: GET /api/v1/questions/modules/)
    // ==========================================================
    getModules: builder.query<Module[], void>({
      query: () => 'v1/questions/modules/',
      transformResponse: (res: PaginatedResponse<Module>) => res.results,
    }),

    getModuleQuestions: builder.query<Question[], string>({
      query: (code) => `v1/questions/modules/${code}/questions/`,
    }),

    // ==========================================================
    // Overview Questions (Backend: GET /api/v1/accounts/overview-questions/)
    // ==========================================================
    getOverviewQuestions: builder.query<OverviewQuestionsResponse, { lang?: 'en' | 'fa' }>({
      query: ({ lang = 'en' } = {}) =>
        `v1/accounts/overview-questions/?lang=${lang}`,
      providesTags: ['OverviewQuestions'],
    }),

    // ==========================================================
    // Sessions (Backend: /api/v1/interviews/sessions/)
    // ==========================================================
    getSessions: builder.query<PaginatedResponse<Session>, Record<string, unknown>>({
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

    createSession: builder.mutation<Session, { patient: number; notes?: string }>({
      query: (body) => ({
        url: 'v1/interviews/sessions/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Session'],
    }),

    // DELETE /api/v1/interviews/sessions/{id}/
    deleteSession: builder.mutation<void, number>({
      query: (id) => ({
        url: `v1/interviews/sessions/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Session'],
    }),

    // PATCH /api/v1/interviews/sessions/{id}/
    updateSession: builder.mutation<Session, { id: number; elapsed_time: number }>({
      query: ({ id, ...body }) => ({
        url: `v1/interviews/sessions/${id}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Session', id }],
    }),

    // POST /api/v1/interviews/sessions/{id}/continue/
    continueSession: builder.mutation<Session, number>({
      query: (id) => ({
        url: `v1/interviews/sessions/${id}/continue/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Session', id }, 'Session'],
    }),

    // POST /api/v1/interviews/sessions/{id}/answer/
    submitAnswer: builder.mutation<AnswerResponse, { sessionId: number } & SubmitAnswerRequest>({
      query: ({ sessionId, ...body }) => ({
        url: `v1/interviews/sessions/${sessionId}/answer/`,
        method: 'POST',
        body,
      }),
    }),

    // POST /api/v1/interviews/sessions/{id}/navigate/
    navigateSession: builder.mutation<NavigateResponse, { sessionId: number; question_id: string }>({
      query: ({ sessionId, question_id }) => ({
        url: `v1/interviews/sessions/${sessionId}/navigate/`,
        method: 'POST',
        body: { question_id },
      }),
      invalidatesTags: (result, error, { sessionId }) => [{ type: 'Session', id: sessionId }],
    }),

    // POST /api/v1/interviews/sessions/{id}/complete-overview/
    completeOverview: builder.mutation<CompleteOverviewResponse, number>({
      query: (id) => ({
        url: `v1/interviews/sessions/${id}/complete-overview/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Session', id }, 'Session'],
    }),

    // POST /api/v1/interviews/sessions/{id}/complete/
    completeSession: builder.mutation<CompleteSessionResponse, number>({
      query: (id) => ({
        url: `v1/interviews/sessions/${id}/complete/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Session', id }, 'Session'],
    }),

    // GET /api/v1/interviews/sessions/{id}/progress/
    getSessionProgress: builder.query<ProgressResponse, number>({
      query: (id) => `v1/interviews/sessions/${id}/progress/`,
    }),

    // ==========================================================
    // Diagnostic Results (GET /api/v1/interviews/sessions/{id}/results/)
    // ==========================================================
    getDiagnosticResults: builder.query<DiagnosticResultsResponse, number>({
      query: (sessionId) => `v1/interviews/sessions/${sessionId}/results/`,
    }),

    // ==========================================================
    // Overview (Patient Background) — Backend: /api/v1/accounts/...
    // ==========================================================
    getPatientOverviews: builder.query<PaginatedResponse<Overview>, number>({
      query: (patientId) => `v1/accounts/patients/${patientId}/overviews/`,
      providesTags: (result, error, patientId) => [{ type: 'Overview', id: patientId }],
    }),

    getOverviewDetail: builder.query<Overview, number>({
      query: (id) => `v1/accounts/overviews/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Overview', id }],
    }),

    createOverview: builder.mutation<Overview, { patientId: number; data: OverviewCreateRequest }>({
      query: ({ patientId, data }) => ({
        url: `v1/accounts/patients/${patientId}/overviews/`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { patientId }) => [{ type: 'Overview', id: patientId }],
    }),
  }),
})

export const {
  useGetModulesQuery,
  useGetModuleQuestionsQuery,
  useGetOverviewQuestionsQuery,
  useGetSessionsQuery,
  useGetSessionQuery,
  useCreateSessionMutation,
  useSubmitAnswerMutation,
  useNavigateSessionMutation,
  useCompleteOverviewMutation,
  useCompleteSessionMutation,
  useGetSessionProgressQuery,
  useGetDiagnosticResultsQuery,
  useGetPatientOverviewsQuery,
  useGetOverviewDetailQuery,
  useCreateOverviewMutation,
  useDeleteSessionMutation,
  useContinueSessionMutation,
  useUpdateSessionMutation,
} = interviewApi
