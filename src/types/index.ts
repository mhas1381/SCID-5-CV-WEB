// ==========================================================
// User & Auth Types
// ==========================================================
export interface User {
  id: number;
  email: string;
  full_name: string;
  is_clinician: boolean;
  phone_number: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password2: string;
  full_name: string;
  is_clinician: boolean;
  phone_number: string;
}

export interface SendOTPRequest {
  phone_number: string;
}

export interface VerifyOTPRequest {
  phone_number: string;
  code: string;
}

export interface SetPasswordRequest {
  phone_number: string;
  code: string;
  password: string;
  password2: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface Profile {
  user: User;
  specialization?: string;
  license_number?: string;
  work_place?: string;
  bio?: string;
}

// ==========================================================
// Patient Types
// ==========================================================
export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  national_id: string;
  phone_number: string;
  date_of_birth: string;
  gender: 'male' | 'female';
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface PatientNote {
  id: number;
  patient: number;
  content: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface PatientListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Patient[];
}

// ==========================================================
// Overview Types
// ==========================================================
export interface OverviewQuestion {
  id: string;
  field_type: string;
  label: string;
  required: boolean;
  order: number;
  options?: { label: string; value: string }[];
  placeholder?: string;
  help_text?: string;
}

export interface OverviewAnswer {
  question_id: string;
  value: string | string[] | boolean | number;
}

export interface Overview {
  id: number;
  patient: number;
  clinician: number;
  answers: OverviewAnswer[];
  created_at: string;
  updated_at: string;
}

// ==========================================================
// Interview / Module Types
// ==========================================================
export interface Question {
  id: string;
  module: string;
  question_text: string;
  question_type: 'yes_no' | 'multiple_choice' | 'text' | 'scale';
  options?: { label: string; value: string }[];
  order: number;
  required: boolean;
  conditional_on?: string;
  conditional_value?: string;
  criteria?: string;
  severity?: number;
}

export interface Answer {
  question_id: string;
  value: string | boolean | number;
  notes?: string;
}

export interface Session {
  id: number;
  patient: number;
  patient_name: string;
  clinician: number;
  module: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  answers: Answer[];
  current_question_index: number;
  started_at: string;
  completed_at?: string;
  created_at: string;
}

export interface DiagnosticResult {
  module: string;
  diagnosis: string;
  criteria_met: string[];
  severity: string;
  confidence: number;
  recommendations: string[];
}

// ==========================================================
// API Response Types
// ==========================================================
export interface APIError {
  detail?: string;
  [key: string]: string | string[] | undefined;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}