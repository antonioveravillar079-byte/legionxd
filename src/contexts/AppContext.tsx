import React, { createContext, useContext, useReducer, useEffect } from "react";
import { User, Question, ClanApplication, Raffle, AuthState, Ticket, TicketResponse } from "../types";
import { database } from "../database/database";

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
      // Guardar sesión en localStorage
      localStorage.setItem('novalegion_session', JSON.stringify(action.payload));
      return {
        ...state,
        auth: { isAuthenticated: true, currentUser: action.payload },
      };
    case "LOGOUT":
      // Limpiar sesión de localStorage
      localStorage.removeItem('novalegion_session');
      return {
        ...state,
        auth: { isAuthenticated: false, currentUser: null },
      };
    case "REGISTER":
      // Guardar sesión en localStorage
      localStorage.setItem('novalegion_session', JSON.stringify(action.payload));
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
      database.createQuestion(action.payload);
      return { ...state, questions: [...state.questions, action.payload] };
    case "UPDATE_QUESTION":
      database.updateQuestion(action.payload);
      return {
        ...state,
        questions: state.questions.map(q => q.id === action.payload.id ? action.payload : q)
      };
    case "DELETE_QUESTION":
      database.deleteQuestion(action.payload);
      return {
        ...state,
        questions: state.questions.filter(q => q.id !== action.payload)
      };
    case "REORDER_QUESTIONS":
      database.reorderQuestions(action.payload);
      return { ...state, questions: action.payload };
    case "SUBMIT_APPLICATION":
      database.createApplication(action.payload);
      database.updateUserAppliedStatus(action.payload.userId, true);
      const updatedUser = { ...state.auth.currentUser!, hasApplied: true };
      localStorage.setItem('novalegion_session', JSON.stringify(updatedUser));
      return {
        ...state,
        applications: [...state.applications, action.payload],
        auth: { ...state.auth, currentUser: updatedUser },
        users: state.users.map(u => u.id === action.payload.userId ? updatedUser : u)
      };
    case "ADD_RAFFLE":
      database.createRaffle(action.payload);
      return { ...state, raffles: [...state.raffles, action.payload] };
    case "UPDATE_RAFFLE":
      database.updateRaffle(action.payload);
      return {
        ...state,
        raffles: state.raffles.map(r => r.id === action.payload.id ? action.payload : r)
      };
    case "DELETE_RAFFLE":
      database.deleteRaffle(action.payload);
      return {
        ...state,
        raffles: state.raffles.filter(r => r.id !== action.payload)
      };
    case "JOIN_RAFFLE":
      database.joinRaffle(action.payload.raffleId, action.payload.userId);
      return {
        ...state,
        raffles: state.raffles.map(r => 
          r.id === action.payload.raffleId 
            ? { ...r, participants: [...r.participants, action.payload.userId] }
            : r
        )
      };
    case "SET_RAFFLE_WINNER":
      database.setRaffleWinner(action.payload.raffleId, action.payload.winnerId);
      return {
        ...state,
        raffles: state.raffles.map(r => 
          r.id === action.payload.raffleId 
            ? { ...r, winner: action.payload.winnerId, isActive: false }
            : r
        )
      };
    case "DELETE_USER":
      database.deleteUser(action.payload);
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
      database.banUser(action.payload);
      return {
        ...state,
        users: state.users.map(u => u.id === action.payload ? { ...u, banned: true } : u)
      };
    case "UNBAN_USER":
      database.unbanUser(action.payload);
      return {
        ...state,
        users: state.users.map(u => u.id === action.payload ? { ...u, banned: false } : u)
      };
    case "UPDATE_USER":
      database.updateUser(action.payload);
      // Si es el usuario actual, actualizar la sesión
      if (state.auth.currentUser?.id === action.payload.id) {
        localStorage.setItem('novalegion_session', JSON.stringify(action.payload));
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
      database.updateApplicationStatus(action.payload.appId, action.payload.status);
      return {
        ...state,
        applications: state.applications.map(app => 
          app.id === action.payload.appId 
            ? { ...app, status: action.payload.status }
            : app
        )
      };
    case "CREATE_TICKET":
      database.createTicket(action.payload);
      return { ...state, tickets: [...state.tickets, action.payload] };
    case "UPDATE_TICKET":
      database.updateTicket(action.payload);
      return {
        ...state,
        tickets: state.tickets.map(t => t.id === action.payload.id ? action.payload : t)
      };
    case "ADD_TICKET_RESPONSE":
      database.addTicketResponse(action.payload);
      return {
        ...state,
        tickets: state.tickets.map(t => 
          t.id === action.payload.ticketId 
            ? { ...t, responses: [...t.responses, action.payload], updatedAt: new Date() }
            : t
        )
      };
    case "CLOSE_TICKET":
      database.closeTicket(action.payload);
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
    const initializeDatabase = async () => {
      try {
        console.log("[INIT] Inicializando base de datos...");
        await database.initialize();

        // Cargar datos de la base de datos
        const users = await database.getAllUsers();
        const questions = await database.getAllQuestions();
        const applications = await database.getAllApplications();
        const raffles = await database.getAllRaffles();
        const tickets = await database.getAllTickets();

        // Intentar restaurar sesión desde localStorage
        let currentUser = null;
        let isAuthenticated = false;
        
        const savedSession = localStorage.getItem('novalegion_session');
        if (savedSession) {
          try {
            const sessionUser = JSON.parse(savedSession);
            // Verificar que el usuario aún existe en la base de datos
            const dbUser = await database.getUserById(sessionUser.id);
            if (dbUser && !dbUser.banned) {
              currentUser = dbUser;
              isAuthenticated = true;
              console.log("[INIT] Sesión restaurada para:", dbUser.username);
            } else {
              // Usuario no existe o está baneado, limpiar sesión
              localStorage.removeItem('novalegion_session');
              console.log("[INIT] Sesión inválida, limpiando...");
            }
          } catch (error) {
            console.error("[INIT] Error parsing session:", error);
            localStorage.removeItem('novalegion_session');
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
        console.error("[INIT ERROR] Error cargando datos:", error);
      }
    };

    initializeDatabase();
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