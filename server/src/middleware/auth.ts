import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { User } from '../types';

interface AuthRequest extends Request {
  user?: User;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    // Verificar que el usuario existe y no está baneado
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ? AND banned = FALSE',
      [decoded.userId]
    );
    
    const users = rows as any[];
    if (users.length === 0) {
      return res.status(403).json({ error: 'Usuario no encontrado o baneado' });
    }

    const user = users[0];
    req.user = {
      id: user.id,
      email: user.email,
      password: user.password,
      username: user.username,
      discordUsername: user.discord_username,
      robloxUsername: user.roblox_username,
      isAdmin: user.is_admin,
      registeredAt: user.registered_at,
      hasApplied: user.has_applied,
      banned: user.banned,
      ipAddress: user.ip_address,
      lastLogin: user.last_login
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  next();
};