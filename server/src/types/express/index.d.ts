// src/types/express/index.d.ts
import { User } from "../../types"; // ruta relativa a donde está tu User

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
