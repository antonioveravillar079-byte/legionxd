const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
class ApiService {
  private token: string | null = null;
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('novalegion_token');
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    try {
      // Verificar si el backend está disponible con un timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Timeout: El servidor no responde');
      }
      throw error;
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('novalegion_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('novalegion_token');
  }

  // Auth endpoints
  async register(userData: {
    email: string;
    password: string;
    username: string;
    discordUsername: string;
    robloxUsername: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async login(credentials: { email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });
    return this.handleResponse(response);
  }

  // User endpoints
  async getAllUsers() {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getUserProfile() {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateUserProfile(userData: {
    username: string;
    email: string;
    discordUsername: string;
    robloxUsername: string;
    currentPassword?: string;
    newPassword?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async banUser(userId: string) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/ban`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async unbanUser(userId: string) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/unban`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async deleteUser(userId: string) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Question endpoints
  async getAllQuestions() {
    const response = await fetch(`${API_BASE_URL}/questions`);
    return this.handleResponse(response);
  }

  async createQuestion(questionData: any) {
    const response = await fetch(`${API_BASE_URL}/questions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(questionData),
    });
    return this.handleResponse(response);
  }

  async updateQuestion(questionId: string, questionData: any) {
    const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(questionData),
    });
    return this.handleResponse(response);
  }

  async deleteQuestion(questionId: string) {
    const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async reorderQuestions(questions: any[]) {
    const response = await fetch(`${API_BASE_URL}/questions/reorder`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ questions }),
    });
    return this.handleResponse(response);
  }

  // Application endpoints
  async getAllApplications() {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getMyApplication() {
    const response = await fetch(`${API_BASE_URL}/applications/my-application`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createApplication(applicationData: { responses: any[] }) {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(applicationData),
    });
    return this.handleResponse(response);
  }

  async updateApplicationStatus(applicationId: string, status: 'approved' | 'rejected') {
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ status }),
    });
    return this.handleResponse(response);
  }

  // Raffle endpoints
  async getAllRaffles() {
    const response = await fetch(`${API_BASE_URL}/raffles`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createRaffle(raffleData: {
    title: string;
    description: string;
    endDate: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/raffles`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(raffleData),
    });
    return this.handleResponse(response);
  }

  async updateRaffle(raffleId: string, raffleData: {
    title: string;
    description: string;
    endDate: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/raffles/${raffleId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(raffleData),
    });
    return this.handleResponse(response);
  }

  async deleteRaffle(raffleId: string) {
    const response = await fetch(`${API_BASE_URL}/raffles/${raffleId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async joinRaffle(raffleId: string) {
    const response = await fetch(`${API_BASE_URL}/raffles/${raffleId}/join`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async drawRaffleWinner(raffleId: string) {
    const response = await fetch(`${API_BASE_URL}/raffles/${raffleId}/draw-winner`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Ticket endpoints
  async getMyTickets() {
    const response = await fetch(`${API_BASE_URL}/tickets/my-tickets`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getAllTickets() {
    const response = await fetch(`${API_BASE_URL}/tickets`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createTicket(ticketData: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
  }) {
    const response = await fetch(`${API_BASE_URL}/tickets`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(ticketData),
    });
    return this.handleResponse(response);
  }

  async addTicketResponse(ticketId: string, message: string) {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/responses`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ message }),
    });
    return this.handleResponse(response);
  }

  async closeTicket(ticketId: string) {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/close`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateTicketStatus(ticketId: string, status: 'open' | 'in_progress' | 'closed') {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/status`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ status }),
    });
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();