export interface User {
  id: string;
  email: string;
  password: string;
  username: string;
  discordUsername?: string;
  robloxUsername?: string;
  isAdmin: boolean;
  registeredAt: Date;
  hasApplied: boolean;
  banned?: boolean;
  ipAddress?: string;
  lastLogin?: Date;
}

export interface Question {
  id: string;
  text: string;
  type: 'checkbox' | 'radio';
  options?: string[];
  required: boolean;
  contradictsWith?: string[];
  order: number;
}

export interface FormResponse {
  questionId: string;
  answer: string | string[];
}

export interface ClanApplication {
  id: string;
  userId: string;
  responses: FormResponse[];
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Raffle {
  id: string;
  title: string;
  description: string;
  endDate: Date;
  participants: string[];
  winner?: string;
  isActive: boolean;
  createdBy: string;
}

export interface Ticket {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  responses: TicketResponse[];
}

export interface TicketResponse {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  isAdminResponse: boolean;
  createdAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
}