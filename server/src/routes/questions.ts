import express from 'express';
import { pool } from '../config/database';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Obtener todas las preguntas
router.get('/', async (req, res) => {
  try {
    const [questions] = await pool.execute(`
      SELECT id, text, type, options, required, contradicts_with, order_num
      FROM questions 
      ORDER BY order_num ASC
    `);

    const formattedQuestions = (questions as any[]).map(q => ({
      id: q.id,
      text: q.text,
      type: q.type,
      options: q.options ? JSON.parse(q.options) : undefined,
      required: q.required,
      contradictsWith: q.contradicts_with ? JSON.parse(q.contradicts_with) : undefined,
      order: q.order_num
    }));

    res.json(formattedQuestions);
  } catch (error) {
    console.error('Error obteniendo preguntas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nueva pregunta (solo admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { text, type, options, required, contradictsWith } = req.body;

    if (!text || !type) {
      return res.status(400).json({ error: 'Texto y tipo son requeridos' });
    }

    // Obtener el siguiente número de orden
    const [maxOrder] = await pool.execute('SELECT MAX(order_num) as max_order FROM questions');
    const nextOrder = ((maxOrder as any[])[0].max_order || 0) + 1;

    const questionId = uuidv4();
    
    await pool.execute(`
      INSERT INTO questions (id, text, type, options, required, contradicts_with, order_num)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      questionId,
      text,
      type,
      options ? JSON.stringify(options) : null,
      required || false,
      contradictsWith ? JSON.stringify(contradictsWith) : null,
      nextOrder
    ]);

    const newQuestion = {
      id: questionId,
      text,
      type,
      options,
      required: required || false,
      contradictsWith,
      order: nextOrder
    };

    res.status(201).json({ message: 'Pregunta creada exitosamente', question: newQuestion });
  } catch (error) {
    console.error('Error creando pregunta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar pregunta (solo admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, type, options, required, contradictsWith } = req.body;

    await pool.execute(`
      UPDATE questions 
      SET text = ?, type = ?, options = ?, required = ?, contradicts_with = ?
      WHERE id = ?
    `, [
      text,
      type,
      options ? JSON.stringify(options) : null,
      required || false,
      contradictsWith ? JSON.stringify(contradictsWith) : null,
      id
    ]);

    res.json({ message: 'Pregunta actualizada exitosamente' });
  } catch (error) {
    console.error('Error actualizando pregunta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar pregunta (solo admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute('DELETE FROM questions WHERE id = ?', [id]);
    res.json({ message: 'Pregunta eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando pregunta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Reordenar preguntas (solo admin)
router.put('/reorder', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { questions } = req.body;

    if (!Array.isArray(questions)) {
      return res.status(400).json({ error: 'Se requiere un array de preguntas' });
    }

    // Actualizar el orden de cada pregunta
    for (let i = 0; i < questions.length; i++) {
      await pool.execute(
        'UPDATE questions SET order_num = ? WHERE id = ?',
        [i + 1, questions[i].id]
      );
    }

    res.json({ message: 'Preguntas reordenadas exitosamente' });
  } catch (error) {
    console.error('Error reordenando preguntas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;