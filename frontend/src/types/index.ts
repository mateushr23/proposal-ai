export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  user: User;
}

export interface Proposal {
  id: string;
  client_name: string;
  segment: string;
  service: string;
  estimated_value: number;
  deadline: string;
  content: ProposalContent | null;
  status: ProposalStatus;
  created_at: string;
  updated_at: string;
}

export type ProposalStatus = "draft" | "sent" | "accepted" | "rejected";

export interface ProposalContent {
  introduction: string;
  scope: string;
  investment: string;
  next_steps: string;
}

export interface ProposalCreatePayload {
  client_name: string;
  segment: string;
  service: string;
  estimated_value: number;
  deadline: string;
}

export interface ProposalUpdatePayload {
  client_name?: string;
  segment?: string;
  service?: string;
  estimated_value?: number;
  deadline?: string;
  content?: ProposalContent;
}

export interface RoutineLog {
  id: string;
  routine_name: string;
  triggered_by: "cron" | "manual";
  status: "running" | "completed" | "failed";
  proposals_affected: number;
  details: Record<string, unknown> | null;
  started_at: string;
  finished_at: string | null;
}

export interface ApiError {
  message: string;
  status: number;
}
