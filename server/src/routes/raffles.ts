import express from 'express';
import { pool } from '../config/database';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Obtener todos los sorteos
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [raffles] = await pool.execute(`
      SELECT id, title, description, end_date, participants, winner, is_active, created_by
      FROM raffles 
      ORDER BY created_at DESC
    `);

    const formattedRaffles = (raffles as any[]).map(raffle => ({
      id: raffle.id,
      title: raffle.title,
      description: raffle.description,
      endDate: raffle.end_date,
      participants: JSON.parse(raffle.participants),
      winner: raffle.winner,
      isActive: raffle.is_active,
      createdBy: raffle.created_by
    }));

    res.json(formattedRaffles);
  } catch (error) {
    console.error('Error obteniendo sorteos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nuevo sorteo (solo admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, endDate } = req.body;
    const createdBy = req.user!.id;

    if (!title || !description || !endDate) {
      return res.status(400).json({ error: 'Título, descripción y fecha de fin son requeridos' });
    }

    const raffleId = uuidv4();
    
    await pool.execute(`
      INSERT INTO raffles (id, title, description, end_date, participants, created_by)
      VALUES (?, ?, ?, ?, '[]', ?)
    `, [raffleId, title, description, endDate, createdBy]);

    const newRaffle = {
      id: raffleId,
      title,
      description,
      endDate: new Date(endDate),
      participants: [],
      winner: undefined,
      isActive: true,
      createdBy
    };

    res.status(201).json({ message: 'Sorteo creado exitosamente', raffle: newRaffle });
  } catch (error) {
    console.error('Error creando sorteo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar sorteo (solo admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, endDate } = req.body;

    await pool.execute(`
      UPDATE raffles 
      SET title = ?, description = ?, end_date = ?
      WHERE id = ?
    `, [title, description, endDate, id]);

    res.json({ message: 'Sorteo actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando sorteo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar sorteo (solo admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute('DELETE FROM raffles WHERE id = ?', [id]);
    res.json({ message: 'Sorteo eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando sorteo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Unirse a sorteo
router.post('/:id/join', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Obtener sorteo actual
    const [raffles] = await pool.execute(
      'SELECT participants, is_active, end_date FROM raffles WHERE id = ?',
      [id]
    );

    if ((raffles as any[]).length === 0) {
      return res.status(404).json({ error: 'Sorteo no encontrado' });
    }

    const raffle = (raffles as any[])[0];
    
    if (!raffle.is_active) {
      return res.status(400).json({ error: 'El sorteo no está activo' });
    }

    if (new Date(raffle.end_date) < new Date()) {
      return res.status(400).json({ error: 'El sorteo ha finalizado' });
    }

    const participants = JSON.parse(raffle.participants);
    
    if (participants.includes(userId)) {
      return res.status(400).json({ error: 'Ya estás participando en este sorteo' });
    }

    participants.push(userId);
    
    await pool.execute(
      'UPDATE raffles SET participants = ? WHERE id = ?',
      [JSON.stringify(participants), id]
    );

    res.json({ message: 'Te has unido al sorteo exitosamente' });
  } catch (error) {
    console.error('Error uniéndose al sorteo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Sortear ganador (solo admin)
router.post('/:id/draw-winner', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener sorteo
    const [raffles] = await pool.execute(
      'SELECT participants, winner FROM raffles WHERE id = ?',
      [id]
    );

    if ((raffles as any[]).length === 0) {
      return res.status(404).json({ error: 'Sorteo no encontrado' });
    }

    const raffle = (raffles as any[])[0];
    
    if (raffle.winner) {
      return res.status(400).json({ error: 'Este sorteo ya tiene un ganador' });
    }

    const participants = JSON.parse(raffle.participants);
    
    if (participants.length === 0) {
      return res.status(400).json({ error: 'No hay participantes en este sorteo' });
    }

    // Seleccionar ganador aleatorio
    const randomIndex = Math.floor(Math.random() * participants.length);
    const winnerId = participants[randomIndex];

    await pool.execute(
      'UPDATE raffles SET winner = ?, is_active = FALSE WHERE id = ?',
      [winnerId, id]
    );

    res.json({ message: 'Ganador sorteado exitosamente', winnerId });
  } catch (error) {
    console.error('Error sorteando ganador:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;