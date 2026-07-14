// ==========================================================
// User & Auth Types (Based on Backend OpenAPI Schema)
// ==========================================================

/** Matches VerifyOTPUser / MeResponse from backend */
export interface User {
  id: number
  phone_number: string
  first_name: string
  last_name: string
  email: string | null
  role: 'clinician' | 'admin' | 'researcher'
  profile_image: string | null
  is_staff: boolean
  is_superuser: boolean
  has_password: boolean
}

/** POST /api/v1/accounts/auth/send-otp/ → body */
export interface SendOTPRequest {
  phone_number: string
}

/** POST /api/v1/accounts/auth/send-otp/ → 200 response */
export interface SendOTPResponse {
  detail: string
  user_exists: boolean
}

/** POST /api/v1/accounts/auth/send-otp/ → 400 error */
export interface SendOTPError {
  detail?: string
  phone_number?: string[]
}

/** POST /api/v1/accounts/auth/verify-otp/ → body */
export interface VerifyOTPRequest {
  phone_number: string
  otp_code: string
}

/** POST /api/v1/accounts/auth/verify-otp/ → 200 response */
export interface VerifyOTPResponse {
  refresh: string
  access: string
  user: User
  is_new_user: boolean
}

/** POST /api/v1/accounts/auth/google/ → response */
export interface GoogleLoginResponse {
  refresh: string
  access: string
  user: User
  message: string
}

/** POST /api/v1/accounts/token/ → body (Login with Phone & Password) */
export interface PasswordLoginRequest {
  phone_number: string
  password: string
}

/** GET /api/v1/dashboard/summary/ → response */
export interface DashboardSummary {
  total_patients: number
  total_sessions: number
  completed_sessions: number
  recent_sessions_count: number
  recent_patients: {
    id: number
    first_name: string
    last_name: string
    created_at: string
  }[]
  recent_sessions: {
    id: number
    patient_name: string
    patient_id: number
    status: string
    created_at: string
  }[]
}

/** POST /api/v1/accounts/auth/set-password/ → body */
export interface SetPasswordRequest {
  password: string
  confirm_password: string
}

/** POST /api/v1/accounts/auth/set-password/ → 200 response */
export interface SetPasswordResponse {
  detail: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

/** POST /api/v1/accounts/token/refresh/ → body & response */
export interface TokenRefreshRequest {
  refresh: string
}

// ==========================================================
// User Profile Types (Based on Backend OpenAPI Schema)
// ==========================================================

/** Matches UserProfileSerializer from backend */
export interface UserProfile {
  id: number
  user: number
  full_name: string
  phone_number: string
  birth_date: string | null
  gender: 'male' | 'female' | null
  role: 'clinician' | 'admin' | 'researcher'
  license_number: string
  specialization: string
  organization: string
  years_of_experience: number | null
  profile_image: string | null
  created_at: string
  updated_at: string
}

/** POST/PATCH /api/v1/accounts/profile/ → body */
export interface UserProfileUpdateRequest {
  first_name?: string
  last_name?: string
  email?: string
  phone_number?: string
  birth_date?: string | null
  gender?: 'male' | 'female' | 'other' | null
  role?: 'admin' | 'clinician' | 'researcher'
  license_number?: string
  specialization?: string
  organization?: string
  years_of_experience?: number | null
}

// ==========================================================
// Patient Types (Based on Backend OpenAPI Schema)
// ==========================================================

/** Patient list item / detail */
export interface Patient {
  id: number
  patient_code: string
  first_name: string
  last_name: string
  full_name: string
  national_id: string
  phone_number: string
  gender: 'male' | 'female'
  birth_date: string | null
  date_of_birth: string | null
  address: string
  province: number | null
  city: number | null
  created_by_name: string
  created_at: string
  is_active: boolean
}

export interface PatientCreateRequest {
  first_name: string
  last_name: string
  national_id: string
  phone_number?: string
  email?: string
  birth_date?: string
  gender?: 'male' | 'female'
  marital_status?: string
  education?: string
  occupation?: string
  address?: string
  province?: number | null
  city?: number | null
  emergency_contact_name?: string
  emergency_contact_phone?: string
}

export interface PatientCreateResponse {
  id: number
  patient_code: string
  first_name: string
  last_name: string
  full_name: string
  national_id: string
  phone_number: string
}

export interface PatientNote {
  id: number
  clinician_name: string
  note_type: 'general' | 'progress' | 'follow_up' | 'referral' | 'other'
  content: string
  created_at: string
}

export interface PatientNoteCreateRequest {
  content: string
  note_type?: 'general' | 'progress' | 'follow_up' | 'referral' | 'other'
}

export interface Province {
  id: number
  name: string
}

export interface City {
  id: number
  province: number
  name: string
}

export interface PatientNoteCreateResponse {
  id: number
  clinician_name: string
  note_type: string
  content: string
  created_at: string
}

// ==========================================================
// Overview Types (Based on Backend OpenAPI Schema)
// ==========================================================

/** GET /api/v1/accounts/overview-questions/ */
export interface OverviewQuestion {
  id: number
  key: string
  text: string
  text_fa?: string
  input_type: 'radio' | 'date' | 'number' | 'text' | 'textarea'
  required: boolean
  order: number
  choices: { label: string; value: string }[] | null
  depends_on: string | null
}

export interface OverviewSection {
  id: string
  title: string
  title_fa?: string
  icon?: string
  questions: OverviewQuestion[]
}

export interface OverviewQuestionsResponse {
  total: number
  lang: 'en' | 'fa'
  sections: OverviewSection[]
}

/** POST /api/v1/accounts/patients/{id}/overviews/ — body */
export interface OverviewCreateRequest {
  answers: Record<string, string | boolean | number>
}

/** GET /api/v1/accounts/patients/{id}/overviews/ — list item */
export interface Overview {
  id: number
  patient: number
  clinician: number
  clinician_name?: string
  patient_name?: string
  answers: Record<string, string | boolean | number>
  created_at: string
  updated_at: string
}

// ==========================================================
// Interview / Module Types (Based on Backend OpenAPI Schema)
// ==========================================================

// --- Session ---

export type SessionStatus = 'not_started' | 'in_progress' | 'completed' | 'abandoned'

export interface Session {
  id: number
  patient: number
  patient_name: string
  clinician: number
  clinician_name: string
  status: SessionStatus
  phase: 'overview' | 'diagnostic'
  current_question: number | null
  current_question_id: string | null
  current_module: number | null
  current_module_code: string | null
  started_at: string
  completed_at: string | null
  notes?: string | null
  responses?: SessionResponse[]
  total_responses?: number
}

export interface SessionCreateRequest {
  patient: number
  notes?: string
}

export interface SessionResponse {
  id: number
  question: number
  question_id_str: string
  selected_option: number | null
  selected_option_label: string | null
  selected_option_label_fa: string | null
  text_response: string | null
  numeric_response: number | null
  date_response: string | null
  answered_at: string
}

// --- Questions ---

export type QuestionType = 'screen' | 'symptom' | 'criteria' | 'chronology' | 'impairment' | 'differential' | 'diagnostic'
export type InputType = 'radio' | 'date' | 'number' | 'text' | 'textarea'
export type TemporalContext = 'current' | 'past' | 'lifetime'

export interface ResponseOption {
  id: number
  label: string
  label_fa: string
  value: string
  score: number
  is_skip_trigger: boolean
  skip_to_question: number | null
  is_deviation_check: boolean
  deviation_value: string
  order: number
}

export interface Question {
  id: number
  question_id: string
  module: string
  module_code: string
  module_name?: string
  module_name_fa?: string
  text: string
  text_fa: string
  notes?: string
  notes_fa?: string
  criteria_text?: string
  criteria_text_fa?: string
  question_type: QuestionType
  input_type: InputType
  is_branching?: boolean
  is_counted_symptom?: boolean
  symptom_group?: string
  temporal_context?: TemporalContext
  section?: string
  order?: number
  response_options: ResponseOption[]
}

// --- Module ---

export interface Module {
  id: number
  code: string
  name: string
  name_fa?: string
  description?: string
  description_fa?: string
  order?: number
  questions_count: number
}

// --- Submit Answer ---

export interface SubmitAnswerRequest {
  selected_option_id?: number
  text_response?: string
  numeric_response?: number
  date_response?: string
}

export interface AnswerResponseData {
  id: number
  question_id_str: string
  selected_option_label: string | null
  selected_option_label_fa: string | null
  text_response: string | null
  numeric_response: number | null
  date_response: string | null
  question_input_type: string
  answered_at: string
}

export interface NextQuestionInfo {
  question_id: string
  text: string
  text_fa: string
  question_type: string
}

export interface AnswerResponse {
  detail: string
  response: AnswerResponseData
  next_question: NextQuestionInfo | null
  session_status: string
}

// --- Progress ---

export interface ProgressResponse {
  session_id: number
  status: string
  current_module: string | null
  current_question: string | null
  total_questions_in_module: number
  answered_total: number
  progress_percent: number
}

// --- Complete Overview ---

export interface CompleteOverviewResponse {
  detail: string
  session: Session
}

// --- Complete Session ---

export interface CompleteDisorderResult {
  id: number
  criteria: number
  disorder_name: string
  disorder_name_fa: string
  diagnosis_code: string
  is_met: boolean
  is_current: boolean
  severity: string | null
  symptoms_met_count: number
  criteria_details: Record<string, unknown>
  clinician_confirmed: boolean
  confirmation_status: string
}

export interface CompleteSessionResponse {
  detail: string
  session_id: number
  results: CompleteDisorderResult[]
}

// --- Diagnostic Results ---

export interface DiagnosticResultItem {
  id: number
  criteria: number
  disorder_name: string
  disorder_name_fa: string
  diagnosis_code: string
  is_met: boolean
  is_current: boolean
  severity: string | null
  symptoms_met_count: number
  criteria_details: Record<string, unknown>
  clinician_confirmed: boolean
  confirmation_status: string
}

export interface DiagnosticResultsResponse {
  session_id: number
  status: string
  results: DiagnosticResultItem[]
}

// ==========================================================
// API Response Types
// ==========================================================

export interface APIError {
  detail?: string
  [key: string]: string | string[] | undefined
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}