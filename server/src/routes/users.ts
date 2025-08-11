import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Obtener todos los usuarios (solo admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT id, email, username, discord_username, roblox_username, is_admin, 
             registered_at, has_applied, banned, ip_address, last_login
      FROM users 
      ORDER BY registered_at DESC
    `);

    const formattedUsers = (users as any[]).map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      discordUsername: user.discord_username,
      robloxUsername: user.roblox_username,
      isAdmin: user.is_admin,
      registeredAt: user.registered_at,
      hasApplied: user.has_applied,
      banned: user.banned,
      ipAddress: user.ip_address,
      lastLogin: user.last_login
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener perfil del usuario actual
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, email, username, discord_username, roblox_username, is_admin, 
              registered_at, has_applied, banned, ip_address, last_login
       FROM users WHERE id = ?`,
      [req.user!.id]
    );

    const user = (users as any[])[0];
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      discordUsername: user.discord_username,
      robloxUsername: user.roblox_username,
      isAdmin: user.is_admin,
      registeredAt: user.registered_at,
      hasApplied: user.has_applied,
      banned: user.banned,
      ipAddress: user.ip_address,
      lastLogin: user.last_login
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar perfil del usuario
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, email, discordUsername, robloxUsername, currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    // Validaciones básicas
    if (!username || !email || !discordUsername || !robloxUsername) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar si el username o email ya están en uso por otro usuario
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE (email = ? OR username = ?) AND id != ?',
      [email, username, userId]
    );

    if ((existingUsers as any[]).length > 0) {
      return res.status(400).json({ error: 'El email o nombre de usuario ya están en uso' });
    }

    let updateQuery = `
      UPDATE users 
      SET username = ?, email = ?, discord_username = ?, roblox_username = ?
      WHERE id = ?
    `;
    let updateParams = [username, email, discordUsername, robloxUsername, userId];

    // Si se proporciona nueva contraseña, validar y actualizar
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Contraseña actual requerida' });
      }

      // Verificar contraseña actual
      const [users] = await pool.execute('SELECT password FROM users WHERE id = ?', [userId]);
      const user = (users as any[])[0];
      
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Contraseña actual incorrecta' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateQuery = `
        UPDATE users 
        SET username = ?, email = ?, discord_username = ?, roblox_username = ?, password = ?
        WHERE id = ?
      `;
      updateParams = [username, email, discordUsername, robloxUsername, hashedPassword, userId];
    }

    await pool.execute(updateQuery, updateParams);

    // Obtener datos actualizados
    const [updatedUser] = await pool.execute(
      `SELECT id, email, username, discord_username, roblox_username, is_admin, 
              registered_at, has_applied, banned, ip_address, last_login
       FROM users WHERE id = ?`,
      [userId]
    );

    const user = (updatedUser as any[])[0];
    res.json({
      message: 'Perfil actualizado exitosamente',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        discordUsername: user.discord_username,
        robloxUsername: user.roblox_username,
        isAdmin: user.is_admin,
        registeredAt: user.registered_at,
        hasApplied: user.has_applied,
        banned: user.banned,
        ipAddress: user.ip_address,
        lastLogin: user.last_login
      }
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Banear usuario (solo admin)
router.put('/:id/ban', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id === req.user!.id) {
      return res.status(400).json({ error: 'No puedes banearte a ti mismo' });
    }

    await pool.execute('UPDATE users SET banned = TRUE WHERE id = ?', [id]);
    res.json({ message: 'Usuario baneado exitosamente' });
  } catch (error) {
    console.error('Error baneando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Desbanear usuario (solo admin)
router.put('/:id/unban', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute('UPDATE users SET banned = FALSE WHERE id = ?', [id]);
    res.json({ message: 'Usuario desbaneado exitosamente' });
  } catch (error) {
    console.error('Error desbaneando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar usuario (solo admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id === req.user!.id) {
      return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
    }

    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;