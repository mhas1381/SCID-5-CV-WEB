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
  province_name?: string
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

export interface OverviewQuestion {
  id: number
  key: string
  text: string
  field_type: 'text' | 'textarea' | 'boolean' | 'number' | 'select' | 'json'
  required: boolean
  order: number
  choices: { label: string; value: string }[] | null
  depends_on: string | null
}

export interface OverviewSection {
  id: string
  title: string
  icon: string
  questions: OverviewQuestion[]
}

export interface OverviewQuestionsResponse {
  total: number
  lang: 'en' | 'fa'
  sections: OverviewSection[]
}

export interface OverviewAnswer {
  question_id: string
  value: string | string[] | boolean | number
}

export interface Overview {
  id: number
  patient: number
  clinician: number
  answers: OverviewAnswer[]
  created_at: string
  updated_at: string
}

// ==========================================================
// Interview / Module Types (Based on Backend OpenAPI Schema)
// ==========================================================

export interface Question {
  id: string
  module: string
  question_text: string
  question_type: 'yes_no' | 'multiple_choice' | 'text' | 'scale'
  options?: { label: string; value: string }[]
  order: number
  required: boolean
  conditional_on?: string
  conditional_value?: string
  criteria?: string
  severity?: number
}

export interface Answer {
  question_id: string
  value: string | boolean | number
  notes?: string
}

export interface Session {
  id: number
  patient: number
  patient_name: string
  clinician: number
  module: string
  status: 'in_progress' | 'completed' | 'cancelled'
  answers: Answer[]
  current_question_index: number
  started_at: string
  completed_at?: string
  created_at: string
}

export interface DiagnosticResult {
  module: string
  diagnosis: string
  criteria_met: string[]
  severity: string
  confidence: number
  recommendations: string[]
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