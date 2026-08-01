import { baseApi } from './baseApi'
import type {
  AnswerResponse,
  CompleteOverviewResponse,
  CompleteSessionResponse,
  DiagnosticCriteriaItem,
  DiagnosticResultsResponse,
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
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

export const interviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==========================================================
    // Modules (Backend: GET /api/v1/questions/modules/)
    // ==========================================================
    getModules: builder.query<Module[], void>({
      query: () => 'v1/questions/modules/',
      transformResponse: (res: PaginatedResponse<Module>) => res.results,
    }),

    getDiagnosticCriteria: builder.query<DiagnosticCriteriaItem[], void>({
      async queryFn(): Promise<{ data: DiagnosticCriteriaItem[] } | { error: FetchBaseQueryError }> {
        try {
          const all: DiagnosticCriteriaItem[] = []
          let page = 1
          // eslint-disable-next-line no-constant-condition
          while (true) {
            const res = await fetch(`/api/v1/questions/diagnostic-criteria/?page=${page}`, {
              headers: { 'Content-Type': 'application/json' },
            })
            const data = await res.json()
            all.push(...(data.results ?? []))
            if (!data.next) break
            page += 1
          }
          return { data: all }
        } catch (err) {
          return {
            error: { status: 'FETCH_ERROR', error: err instanceof Error ? err.message : String(err) },
          }
        }
      },
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
