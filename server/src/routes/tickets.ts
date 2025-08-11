import express from 'express';
import { pool } from '../config/database';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Obtener tickets del usuario actual
router.get('/my-tickets', authenticateToken, async (req, res) => {
  try {
    const [tickets] = await pool.execute(`
      SELECT t.*, 
             JSON_ARRAYAGG(
               JSON_OBJECT(
                 'id', tr.id,
                 'message', tr.message,
                 'isAdminResponse', tr.is_admin_response,
                 'createdAt', tr.created_at,
                 'userId', tr.user_id
               )
             ) as responses
      FROM tickets t
      LEFT JOIN ticket_responses tr ON t.id = tr.ticket_id
      WHERE t.user_id = ?
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `, [req.user!.id]);

    const formattedTickets = (tickets as any[]).map(ticket => ({
      id: ticket.id,
      userId: ticket.user_id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      responses: ticket.responses ? JSON.parse(ticket.responses).filter((r: any) => r.id !== null) : []
    }));

    res.json(formattedTickets);
  } catch (error) {
    console.error('Error obteniendo tickets del usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener todos los tickets (solo admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [tickets] = await pool.execute(`
      SELECT t.*, u.username,
             JSON_ARRAYAGG(
               JSON_OBJECT(
                 'id', tr.id,
                 'message', tr.message,
                 'isAdminResponse', tr.is_admin_response,
                 'createdAt', tr.created_at,
                 'userId', tr.user_id
               )
             ) as responses
      FROM tickets t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN ticket_responses tr ON t.id = tr.ticket_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);

    const formattedTickets = (tickets as any[]).map(ticket => ({
      id: ticket.id,
      userId: ticket.user_id,
      username: ticket.username,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      responses: ticket.responses ? JSON.parse(ticket.responses).filter((r: any) => r.id !== null) : []
    }));

    res.json(formattedTickets);
  } catch (error) {
    console.error('Error obteniendo todos los tickets:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nuevo ticket
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    const userId = req.user!.id;

    if (!title || !description) {
      return res.status(400).json({ error: 'Título y descripción son requeridos' });
    }

    const ticketId = uuidv4();
    
    await pool.execute(`
      INSERT INTO tickets (id, user_id, title, description, priority)
      VALUES (?, ?, ?, ?, ?)
    `, [ticketId, userId, title, description, priority || 'medium']);

    res.status(201).json({ 
      message: 'Ticket creado exitosamente',
      ticketId 
    });
  } catch (error) {
    console.error('Error creando ticket:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Agregar respuesta a ticket
router.post('/:id/responses', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user!.id;

    if (!message) {
      return res.status(400).json({ error: 'Mensaje es requerido' });
    }

    // Verificar que el ticket existe y el usuario tiene acceso
    const [tickets] = await pool.execute(
      'SELECT user_id FROM tickets WHERE id = ?',
      [id]
    );

    if ((tickets as any[]).length === 0) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    const ticket = (tickets as any[])[0];
    const isAdmin = req.user!.isAdmin;
    
    // Solo el dueño del ticket o un admin pueden responder
    if (ticket.user_id !== userId && !isAdmin) {
      return res.status(403).json({ error: 'No tienes permisos para responder este ticket' });
    }

    const responseId = uuidv4();
    
    await pool.execute(`
      INSERT INTO ticket_responses (id, ticket_id, user_id, message, is_admin_response)
      VALUES (?, ?, ?, ?, ?)
    `, [responseId, id, userId, message, isAdmin]);

    // Actualizar timestamp del ticket
    await pool.execute(
      'UPDATE tickets SET updated_at = NOW() WHERE id = ?',
      [id]
    );

    res.status(201).json({ 
      message: 'Respuesta agregada exitosamente',
      responseId 
    });
  } catch (error) {
    console.error('Error agregando respuesta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Cerrar ticket (solo admin)
router.put('/:id/close', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute(
      'UPDATE tickets SET status = ?, updated_at = NOW() WHERE id = ?',
      ['closed', id]
    );

    res.json({ message: 'Ticket cerrado exitosamente' });
  } catch (error) {
    console.error('Error cerrando ticket:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar estado de ticket (solo admin)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'in_progress', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    await pool.execute(
      'UPDATE tickets SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    res.json({ message: 'Estado del ticket actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando estado del ticket:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;