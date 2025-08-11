import express from 'express';
import { pool } from '../config/database';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Obtener todas las aplicaciones (solo admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [applications] = await pool.execute(`
      SELECT a.*, u.username 
      FROM applications a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.submitted_at DESC
    `);

    const formattedApplications = (applications as any[]).map(app => ({
      id: app.id,
      userId: app.user_id,
      responses: JSON.parse(app.responses),
      submittedAt: app.submitted_at,
      status: app.status,
      reviewedBy: app.reviewed_by,
      reviewedAt: app.reviewed_at,
      username: app.username
    }));

    res.json(formattedApplications);
  } catch (error) {
    console.error('Error obteniendo aplicaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener aplicación del usuario actual
router.get('/my-application', authenticateToken, async (req, res) => {
  try {
    const [applications] = await pool.execute(
      'SELECT * FROM applications WHERE user_id = ?',
      [req.user!.id]
    );

    if ((applications as any[]).length === 0) {
      return res.status(404).json({ error: 'No tienes ninguna aplicación' });
    }

    const app = (applications as any[])[0];
    res.json({
      id: app.id,
      userId: app.user_id,
      responses: JSON.parse(app.responses),
      submittedAt: app.submitted_at,
      status: app.status,
      reviewedBy: app.reviewed_by,
      reviewedAt: app.reviewed_at
    });
  } catch (error) {
    console.error('Error obteniendo aplicación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nueva aplicación
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { responses } = req.body;
    const userId = req.user!.id;

    // Verificar si el usuario ya tiene una aplicación
    const [existingApps] = await pool.execute(
      'SELECT id FROM applications WHERE user_id = ?',
      [userId]
    );

    if ((existingApps as any[]).length > 0) {
      return res.status(400).json({ error: 'Ya tienes una aplicación enviada' });
    }

    if (!responses || !Array.isArray(responses)) {
      return res.status(400).json({ error: 'Respuestas son requeridas' });
    }

    const applicationId = uuidv4();
    
    await pool.execute(`
      INSERT INTO applications (id, user_id, responses, submitted_at)
      VALUES (?, ?, ?, NOW())
    `, [applicationId, userId, JSON.stringify(responses)]);

    // Actualizar el estado del usuario
    await pool.execute(
      'UPDATE users SET has_applied = TRUE WHERE id = ?',
      [userId]
    );

    res.status(201).json({ 
      message: 'Aplicación enviada exitosamente',
      applicationId 
    });
  } catch (error) {
    console.error('Error creando aplicación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar estado de aplicación (solo admin)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const reviewerId = req.user!.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    await pool.execute(`
      UPDATE applications 
      SET status = ?, reviewed_by = ?, reviewed_at = NOW()
      WHERE id = ?
    `, [status, reviewerId, id]);

    res.json({ message: `Aplicación ${status === 'approved' ? 'aprobada' : 'rechazada'} exitosamente` });
  } catch (error) {
    console.error('Error actualizando estado de aplicación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;