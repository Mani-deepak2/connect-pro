export type Role = 'freelancer' | 'client';

export interface User {
  id: string;
  email: string;
  role: Role;
  username?: string;
  created_at: string;
}

export interface FreelancerProfile {
  id: string;
  user_id: string;
  full_name: string;
  professional_title: string;
  skills: string[];
  bio: string;
  hourly_rate: number;
  experience_level: string;
  portfolio_link?: string;
  profile_image?: string;
  username?: string;
  created_at: string;
}

export interface ClientProfile {
  id: string;
  user_id: string;
  company_name: string;
  industry: string;
  company_website?: string;
  company_description: string;
  company_logo?: string;
  username?: string;
  created_at: string;
}

export type ProjectStatus = 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled' | 'closed';
export type BudgetType = 'fixed' | 'hourly';

export interface Project {
  id: string;
  client_id: string;
  title: string;
  category: string;
  description: string;
  required_skills: string[];
  budget_type: BudgetType;
  budget_amount: number;
  duration: string;
  experience_level: string;
  deadline: string;
  attachments: string[];
  status: ProjectStatus;
  created_at: string;
}

export type ApplicationStatus = 'pending' | 'shortlisted' | 'accepted' | 'rejected';

export interface Application {
  id: string;
  project_id: string;
  freelancer_id: string;
  proposal: string;
  bid_amount: number;
  estimated_delivery_days: number;
  status: ApplicationStatus;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  metadata: any;
  created_at: string;
}

export interface Credit {
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'signup_bonus' | 'application_fee' | 'purchase';
  description?: string;
  created_at: string;
}

export type ContractStatus = 'active' | 'completed' | 'cancelled';

export type InterviewStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';

export interface Interview {
  id: string;
  client_id: string;
  freelancer_id: string;
  project_id?: string;
  scheduled_at: string;
  status: InterviewStatus;
  meeting_link?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  project_id: string;
  freelancer_id: string;
  client_id: string;
  amount: number;
  status: ContractStatus;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  project_id: string;
  client_id: string;
  freelancer_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
