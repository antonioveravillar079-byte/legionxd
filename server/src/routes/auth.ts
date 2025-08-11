import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, discordUsername, robloxUsername } = req.body;

    // Validaciones básicas
    if (!email || !password || !username || !discordUsername || !robloxUsername) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar si el usuario ya existe
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if ((existingUsers as any[]).length > 0) {
      return res.status(400).json({ error: 'El email o nombre de usuario ya están en uso' });
    }

    // Verificar si es el primer usuario (será admin)
    const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
    const isFirstUser = (userCount as any[])[0].count === 0;

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const userIP = req.ip || req.connection.remoteAddress || 'unknown';

    // Crear usuario
    await pool.execute(
      `INSERT INTO users (id, email, password, username, discord_username, roblox_username, is_admin, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, email, hashedPassword, username, discordUsername, robloxUsername, isFirstUser, userIP]
    );

    // Generar token JWT
    const token = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRES_IN });

    // Obtener datos del usuario creado
    const [newUser] = await pool.execute(
      'SELECT id, email, username, discord_username, roblox_username, is_admin, registered_at, has_applied, banned FROM users WHERE id = ?',
      [userId]
    );

    const user = (newUser as any[])[0];

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        discordUsername: user.discord_username,
        robloxUsername: user.roblox_username,
        isAdmin: user.is_admin,
        registeredAt: user.registered_at,
        hasApplied: user.has_applied,
        banned: user.banned
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    const user = (users as any[])[0];
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar si está baneado
    if (user.banned) {
      return res.status(403).json({ error: 'Tu cuenta ha sido suspendida' });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Actualizar último login
    await pool.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Generar token JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        discordUsername: user.discord_username,
        robloxUsername: user.roblox_username,
        isAdmin: user.is_admin,
        registeredAt: user.registered_at,
        hasApplied: user.has_applied,
        banned: user.banned
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;