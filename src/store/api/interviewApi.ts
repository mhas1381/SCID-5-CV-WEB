import { baseApi } from './baseApi'
import type {
  AnswerResponse,
  CompleteOverviewResponse,
  CompleteSessionResponse,
  DiagnosticCriteriaItem,
  DiagnosticResultsResponse,
  InterpretationResponse,
  Module,
  NavigateResponse,
  Overview,
  OverviewCreateRequest,
  OverviewQuestionsResponse,
  PaginatedResponse,
  ProgressResponse,
  Question,
  ReviewResponse,
  Session,
  SessionCreateRequest,
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
      // Reference catalog — cache in memory until the page reloads.
      keepUnusedDataFor: Infinity,
    }),

    getDiagnosticCriteria: builder.query<DiagnosticCriteriaItem[], void>({
      query: () => 'v1/questions/diagnostic-criteria/?page_size=1000',
      transformResponse: (res: PaginatedResponse<DiagnosticCriteriaItem>) => res.results,
      keepUnusedDataFor: Infinity,
    }),

    getModuleQuestions: builder.query<Question[], string>({
      query: (code) => `v1/questions/modules/${code}/questions/`,
      keepUnusedDataFor: Infinity,
    }),

    // ==========================================================
    // Overview Questions (Backend: GET /api/v1/accounts/overview-questions/)
    // ==========================================================
    getOverviewQuestions: builder.query<OverviewQuestionsResponse, { lang?: 'en' | 'fa' }>({
      query: ({ lang = 'en' } = {}) =>
        `v1/accounts/overview-questions/?lang=${lang}`,
      providesTags: ['OverviewQuestions'],
      keepUnusedDataFor: Infinity,
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

    createSession: builder.mutation<Session, SessionCreateRequest>({
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

    // GET /api/v1/interviews/sessions/{id}/review/?question_id=X
    // Read-only: returns the question + recorded response without changing
    // the session's current_question, so the interview flow is never mutated.
    reviewQuestion: builder.query<ReviewResponse, { sessionId: number; question_id: string }>({
      query: ({ sessionId, question_id }) => ({
        url: `v1/interviews/sessions/${sessionId}/review/`,
        params: { question_id },
      }),
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
      providesTags: (result, error, sessionId) => [
        { type: 'DiagnosticResult', id: sessionId },
      ],
    }),

    // GET /api/v1/interviews/sessions/{id}/interpretation/
    // Read-only: returns the stored interpretation (empty when none exists).
    // Used as an active query so an existing interpretation is shown on page
    // load without triggering any AI call.
    getInterpretation: builder.query<InterpretationResponse, number>({
      query: (sessionId) => `v1/interviews/sessions/${sessionId}/interpretation/`,
      providesTags: (result, error, sessionId) => [
        { type: 'Interpretation', id: sessionId },
      ],
    }),

    // POST /api/v1/interviews/sessions/{id}/interpretation/
    // Generates (or regenerates) the interpretation, optionally steered by a
    // clinician-supplied prompt.
    generateInterpretation: builder.mutation<
      InterpretationResponse,
      { sessionId: number; prompt?: string }
    >({
      query: ({ sessionId, prompt = '' }) => ({
        url: `v1/interviews/sessions/${sessionId}/interpretation/`,
        method: 'POST',
        body: { prompt },
      }),
      invalidatesTags: (result, error, { sessionId }) => [
        { type: 'Interpretation', id: sessionId },
      ],
    }),

    // PATCH /api/v1/interviews/sessions/{id}/interpretation/
    // Persists the clinician's edited (or cleared) interpretation text.
    updateInterpretation: builder.mutation<
      InterpretationResponse,
      { sessionId: number; interpretation: string }
    >({
      query: ({ sessionId, interpretation }) => ({
        url: `v1/interviews/sessions/${sessionId}/interpretation/`,
        method: 'PATCH',
        body: { interpretation },
      }),
      invalidatesTags: (result, error, { sessionId }) => [
        { type: 'Interpretation', id: sessionId },
      ],
    }),

    // Confirm / unconfirm / disagree a single diagnostic result
    confirmDiagnosticResult: builder.mutation<
      { detail: string; result_id: number; clinician_confirmed: boolean; clinician_disagreed: boolean; confirmation_status: string },
      { sessionId: number; resultId: number; action: 'confirm' | 'unconfirm' | 'disagree' }
    >({
      query: ({ sessionId, resultId, action }) => ({
        url: `v1/interviews/sessions/${sessionId}/results/${resultId}/confirm/`,
        method: 'POST',
        body: { action },
      }),
      invalidatesTags: (result, error, { sessionId }) => [
        { type: 'DiagnosticResult', id: sessionId },
      ],
    }),

    // Confirm all diagnostic results for a session
    confirmAllDiagnosticResults: builder.mutation<
      { detail: string; confirmed_count: number },
      number
    >({
      query: (sessionId) => ({
        url: `v1/interviews/sessions/${sessionId}/results/confirm-all/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, sessionId) => [
        { type: 'DiagnosticResult', id: sessionId },
      ],
    }),

    // Submit system feedback (session-bound or general)
    submitSystemFeedback: builder.mutation<
      { detail: string; id: number; feedback_type: string },
      { content: string; session_id?: number; feedback_type?: string }
    >({
      query: (body) => ({
        url: 'v1/interviews/feedback/',
        method: 'POST',
        body,
      }),
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
  useGetDiagnosticCriteriaQuery,
  useGetModuleQuestionsQuery,
  useGetOverviewQuestionsQuery,
  useGetSessionsQuery,
  useGetSessionQuery,
  useCreateSessionMutation,
  useSubmitAnswerMutation,
  useNavigateSessionMutation,
  useReviewQuestionQuery,
  useCompleteOverviewMutation,
  useCompleteSessionMutation,
  useGetSessionProgressQuery,
  useGetDiagnosticResultsQuery,
  useGetInterpretationQuery,
  useGenerateInterpretationMutation,
  useUpdateInterpretationMutation,
  useConfirmDiagnosticResultMutation,
  useConfirmAllDiagnosticResultsMutation,
  useSubmitSystemFeedbackMutation,
  useGetPatientOverviewsQuery,
  useGetOverviewDetailQuery,
  useCreateOverviewMutation,
  useDeleteSessionMutation,
  useContinueSessionMutation,
  useUpdateSessionMutation,
} = interviewApi
