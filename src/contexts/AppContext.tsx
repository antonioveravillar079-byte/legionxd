import React, { createContext, useContext, useReducer, useEffect } from "react";
import { User, Question, ClanApplication, Raffle, AuthState, Ticket, TicketResponse } from "../types";
import { apiService } from "../services/api";

interface AppState {
  auth: AuthState;
  users: User[];
  questions: Question[];
  applications: ClanApplication[];
  raffles: Raffle[];
  tickets: Ticket[];
}

type AppAction =
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" }
  | { type: "REGISTER"; payload: User }
  | { type: "SET_USERS"; payload: User[] }
  | { type: "SET_QUESTIONS"; payload: Question[] }
  | { type: "SET_APPLICATIONS"; payload: ClanApplication[] }
  | { type: "SET_RAFFLES"; payload: Raffle[] }
  | { type: "SET_TICKETS"; payload: Ticket[] }
  | { type: "LOAD_STATE"; payload: AppState }
  | { type: "ADD_QUESTION"; payload: Question }
  | { type: "UPDATE_QUESTION"; payload: Question }
  | { type: "DELETE_QUESTION"; payload: string }
  | { type: "REORDER_QUESTIONS"; payload: Question[] }
  | { type: "SUBMIT_APPLICATION"; payload: ClanApplication }
  | { type: "ADD_RAFFLE"; payload: Raffle }
  | { type: "UPDATE_RAFFLE"; payload: Raffle }
  | { type: "DELETE_RAFFLE"; payload: string }
  | { type: "JOIN_RAFFLE"; payload: { raffleId: string; userId: string } }
  | { type: "SET_RAFFLE_WINNER"; payload: { raffleId: string; winnerId: string } }
  | { type: "DELETE_USER"; payload: string }
  | { type: "BAN_USER"; payload: string }
  | { type: "UNBAN_USER"; payload: string }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "UPDATE_APPLICATION_STATUS"; payload: { appId: string; status: 'approved' | 'rejected' } }
  | { type: "CREATE_TICKET"; payload: Ticket }
  | { type: "UPDATE_TICKET"; payload: Ticket }
  | { type: "ADD_TICKET_RESPONSE"; payload: TicketResponse }
  | { type: "CLOSE_TICKET"; payload: string };

const initialState: AppState = {
  auth: { isAuthenticated: false, currentUser: null },
  users: [],
  questions: [],
  applications: [],
  raffles: [],
  tickets: [],
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  console.log("%c[Reducer Dispatch]", "color: purple", action.type, action.payload);
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        auth: { isAuthenticated: true, currentUser: action.payload },
      };
    case "LOGOUT":
      apiService.clearToken();
      return {
        ...state,
        auth: { isAuthenticated: false, currentUser: null },
      };
    case "REGISTER":
      return {
        ...state,
        auth: { isAuthenticated: true, currentUser: action.payload },
        users: [...state.users, action.payload],
      };
    case "SET_USERS":
      return { ...state, users: action.payload };
    case "SET_QUESTIONS":
      return { ...state, questions: action.payload };
    case "SET_APPLICATIONS":
      return { ...state, applications: action.payload };
    case "SET_RAFFLES":
      return { ...state, raffles: action.payload };
    case "SET_TICKETS":
      return { ...state, tickets: action.payload };
    case "LOAD_STATE":
      return action.payload;
    case "ADD_QUESTION":
      return { ...state, questions: [...state.questions, action.payload] };
    case "UPDATE_QUESTION":
      return {
        ...state,
        questions: state.questions.map(q => q.id === action.payload.id ? action.payload : q)
      };
    case "DELETE_QUESTION":
      return {
        ...state,
        questions: state.questions.filter(q => q.id !== action.payload)
      };
    case "REORDER_QUESTIONS":
      return { ...state, questions: action.payload };
    case "SUBMIT_APPLICATION":
      const updatedUser = { ...state.auth.currentUser!, hasApplied: true };
      return {
        ...state,
        applications: [...state.applications, action.payload],
        auth: { ...state.auth, currentUser: updatedUser },
        users: state.users.map(u => u.id === action.payload.userId ? updatedUser : u)
      };
    case "ADD_RAFFLE":
      return { ...state, raffles: [...state.raffles, action.payload] };
    case "UPDATE_RAFFLE":
      return {
        ...state,
        raffles: state.raffles.map(r => r.id === action.payload.id ? action.payload : r)
      };
    case "DELETE_RAFFLE":
      return {
        ...state,
        raffles: state.raffles.filter(r => r.id !== action.payload)
      };
    case "JOIN_RAFFLE":
      return {
        ...state,
        raffles: state.raffles.map(r => 
          r.id === action.payload.raffleId 
            ? { ...r, participants: [...r.participants, action.payload.userId] }
            : r
        )
      };
    case "SET_RAFFLE_WINNER":
      return {
        ...state,
        raffles: state.raffles.map(r => 
          r.id === action.payload.raffleId 
            ? { ...r, winner: action.payload.winnerId, isActive: false }
            : r
        )
      };
    case "DELETE_USER":
      return {
        ...state,
        users: state.users.filter(u => u.id !== action.payload),
        applications: state.applications.filter(a => a.userId !== action.payload),
        raffles: state.raffles.map(r => ({
          ...r,
          participants: r.participants.filter(p => p !== action.payload)
        }))
      };
    case "BAN_USER":
      return {
        ...state,
        users: state.users.map(u => u.id === action.payload ? { ...u, banned: true } : u)
      };
    case "UNBAN_USER":
      return {
        ...state,
        users: state.users.map(u => u.id === action.payload ? { ...u, banned: false } : u)
      };
    case "UPDATE_USER":
      // Si es el usuario actual, actualizar el estado de autenticación
      if (state.auth.currentUser?.id === action.payload.id) {
        return {
          ...state,
          auth: { ...state.auth, currentUser: action.payload },
          users: state.users.map(u => u.id === action.payload.id ? action.payload : u)
        };
      }
      return {
        ...state,
        users: state.users.map(u => u.id === action.payload.id ? action.payload : u)
      };
    case "UPDATE_APPLICATION_STATUS":
      return {
        ...state,
        applications: state.applications.map(app => 
          app.id === action.payload.appId 
            ? { ...app, status: action.payload.status }
            : app
        )
      };
    case "CREATE_TICKET":
      return { ...state, tickets: [...state.tickets, action.payload] };
    case "UPDATE_TICKET":
      return {
        ...state,
        tickets: state.tickets.map(t => t.id === action.payload.id ? action.payload : t)
      };
    case "ADD_TICKET_RESPONSE":
      return {
        ...state,
        tickets: state.tickets.map(t => 
          t.id === action.payload.ticketId 
            ? { ...t, responses: [...t.responses, action.payload], updatedAt: new Date() }
            : t
        )
      };
    case "CLOSE_TICKET":
      return {
        ...state,
        tickets: state.tickets.map(t => 
          t.id === action.payload 
            ? { ...t, status: 'closed', updatedAt: new Date() }
            : t
        )
      };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("[INIT] Inicializando aplicación...");

        // Intentar cargar preguntas (públicas)
        let questions: Question[] = [];
        try {
          questions = await apiService.getAllQuestions();
          console.log("[INIT] Preguntas cargadas desde API");
        } catch (error) {
          console.warn("[INIT] Backend no disponible, usando datos por defecto");
          // Usar preguntas por defecto si el backend no está disponible
          questions = [
            { id: '1', text: '¿Por qué quieres unirte a Nova Dark Legion?', type: 'text', required: true, order: 1 },
            { id: '2', text: '¿Cuál es tu experiencia en Roblox?', type: 'text', required: true, order: 2 }
          ];
        }

        // Intentar restaurar sesión desde localStorage
        let currentUser = null;
        let isAuthenticated = false;
        let users: User[] = [];
        let applications: ClanApplication[] = [];
        let raffles: Raffle[] = [];
        let tickets: Ticket[] = [];
        
        const savedToken = localStorage.getItem('novalegion_token');
        if (savedToken) {
          try {
            apiService.setToken(savedToken);
            const userProfile = await apiService.getUserProfile();
            if (userProfile && !userProfile.banned) {
              currentUser = userProfile;
              isAuthenticated = true;
              console.log("[INIT] Sesión restaurada para:", userProfile.username);
              
              // Cargar datos adicionales si está autenticado
              if (questions.length > 0) { // Solo si el backend está disponible
              try {
                if (currentUser.isAdmin) {
                  users = await apiService.getAllUsers();
                  applications = await apiService.getAllApplications();
                  tickets = await apiService.getAllTickets();
                }
                raffles = await apiService.getAllRaffles();
              } catch (error) {
                console.warn("[INIT] Error cargando datos adicionales:", error);
              }
              }
            } else {
              // Usuario baneado o no válido, limpiar sesión
              apiService.clearToken();
              console.log("[INIT] Sesión inválida, limpiando...");
            }
          } catch (error) {
            console.error("[INIT] Error parsing session:", error);
            apiService.clearToken();
          }
        }

        const loadedState: AppState = {
          auth: { isAuthenticated, currentUser },
          users,
          questions,
          applications,
          raffles,
          tickets,
        };

        console.log("[INIT] Estado inicial cargado:", loadedState);
        dispatch({ type: "LOAD_STATE", payload: loadedState });
      } catch (error) {
        console.error("[INIT ERROR] Error inicializando aplicación:", error);
      }
    };

    initializeApp();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}