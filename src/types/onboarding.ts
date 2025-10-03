// Onboarding types matching backend models

export type QuestionType = 'text' | 'textarea' | 'select' | 'multiselect' | 'file';
export type TargetType = 'agency' | 'business';
export type RespondentType = 'agency' | 'business';

export interface OnboardingQuestion {
  id: number;
  template_id: number;
  section: string;
  question_key: string;
  question_text: string;
  question_type: QuestionType;
  options: string[];
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface OnboardingTemplate {
  id: number;
  name: string;
  description?: string;
  target_type: TargetType;
  is_default: boolean;
  is_active: boolean;
  created_by?: number;
  created_at: string;
  updated_at?: string;
  questions: OnboardingQuestion[];
}

export interface OnboardingResponseCreate {
  template_id: number;
  respondent_id?: number;
  respondent_type: RespondentType;
  question_id: number;
  response_value: string;
  response_data?: Record<string, any>;
}

export interface OnboardingResponse extends OnboardingResponseCreate {
  id: number;
  completed_at?: string;
  created_at: string;
  updated_at?: string;
}

// For the registration wizard
export interface RegistrationData {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  account_type: 'individual' | 'agency';
}

export interface OnboardingAnswers {
  [questionId: number]: string | string[];
}

export interface WizardData {
  registration: RegistrationData;
  onboarding: OnboardingAnswers;
}

