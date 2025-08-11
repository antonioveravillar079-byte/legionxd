import initSqlJs, { Database } from 'sql.js';
import { User, Question, ClanApplication, Raffle, Ticket, TicketResponse } from '../types';

class DatabaseManager {
  private db: Database | null = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    const SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`
    });

    // Intentar cargar base de datos existente desde localStorage
    const savedDb = localStorage.getItem('novalegion_db');
    if (savedDb) {
      try {
        const uint8Array = new Uint8Array(JSON.parse(savedDb));
        this.db = new SQL.Database(uint8Array);
      } catch (e) {
        console.error("Error al cargar la base de datos desde localStorage, creando una nueva:", e);
        this.db = new SQL.Database();
      }
    } else {
      this.db = new SQL.Database();
    }

    this.initializeTables();
    this.insertDefaultQuestions();
    this.initialized = true;
  }

  private saveToLocalStorage() {
    if (!this.db) return;
    const data = this.db.export();
    const dataArray = Array.from(data);
    localStorage.setItem('novalegion_db', JSON.stringify(dataArray));
  }

  /**
   * Comprueba si una columna existe en una tabla dada.
   * @param tableName El nombre de la tabla.
   * @param columnName El nombre de la columna a comprobar.
   * @returns `true` si la columna existe, `false` en caso contrario.
   */
  private columnExists(tableName: string, columnName: string): boolean {
    if (!this.db) return false;
    try {
      // PRAGMA table_info(tableName) devuelve información sobre las columnas de la tabla.
      const stmt = this.db.prepare(`PRAGMA table_info(${tableName})`);
      while (stmt.step()) {
        const row = stmt.get();
        // row[1] contiene el nombre de la columna
        if (row[1] === columnName) {
          stmt.free();
          return true;
        }
      }
      stmt.free();
      return false;
    } catch (e) {
      console.error(`Error al comprobar la existencia de la columna ${columnName} en ${tableName}:`, e);
      return false;
    }
  }

  private initializeTables() {
    if (!this.db) return;

    // Tabla de usuarios
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        isAdmin INTEGER NOT NULL DEFAULT 0,
        registeredAt TEXT NOT NULL,
        hasApplied INTEGER NOT NULL DEFAULT 0,
        banned INTEGER NOT NULL DEFAULT 0,
        ipAddress TEXT
      )
    `);

    // Asegura que las columnas se añadan solo si no existen para compatibilidad con versiones anteriores.
    if (!this.columnExists('users', 'banned')) {
        this.db.exec('ALTER TABLE users ADD COLUMN banned INTEGER DEFAULT 0');
    }
    // Añadida la comprobación para isAdmin para asegurar compatibilidad con bases de datos antiguas.
    if (!this.columnExists('users', 'isAdmin')) {
        this.db.exec('ALTER TABLE users ADD COLUMN isAdmin INTEGER DEFAULT 0 NOT NULL');
    }
    if (!this.columnExists('users', 'discordUsername')) {
        this.db.exec('ALTER TABLE users ADD COLUMN discordUsername TEXT');
    }
    if (!this.columnExists('users', 'robloxUsername')) {
        this.db.exec('ALTER TABLE users ADD COLUMN robloxUsername TEXT');
    }
    if (!this.columnExists('users', 'lastLogin')) {
        this.db.exec('ALTER TABLE users ADD COLUMN lastLogin TEXT');
    }

    // Tabla de preguntas
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('radio', 'checkbox')),
        options TEXT,
        required INTEGER NOT NULL DEFAULT 1,
        contradictsWith TEXT,
        order_num INTEGER NOT NULL
      )
    `);

    // Tabla de aplicaciones
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        responses TEXT NOT NULL,
        submittedAt TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
      )
    `);

    // Tabla de sorteos
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS raffles (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        endDate TEXT NOT NULL,
        participants TEXT NOT NULL DEFAULT '[]',
        winner TEXT,
        isActive INTEGER NOT NULL DEFAULT 1,
        createdBy TEXT NOT NULL
      )
    `);

    // Tabla de tickets
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
        priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);

    // Tabla de respuestas de tickets
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ticket_responses (
        id TEXT PRIMARY KEY,
        ticketId TEXT NOT NULL,
        userId TEXT NOT NULL,
        message TEXT NOT NULL,
        isAdminResponse INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (ticketId) REFERENCES tickets (id)
      )
    `);
  }

  private insertDefaultQuestions() {
    if (!this.db) return;

    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM questions');
    const result = stmt.get();
    const count = result ? result[0] : 0;
    stmt.free(); // Liberar el statement después de usarlo.
    
    if (count === 0) {
      const defaultQuestions = [
        {
          id: '1',
          text: '¿Tienes experiencia previa en clanes de Roblox?',
          type: 'radio',
          options: ['Sí, mucha experiencia', 'Algo de experiencia', 'Soy nuevo en esto'],
          required: true,
          order: 1
        },
        {
          id: '2',
          text: '¿Cuántas horas juegas Roblox a la semana?',
          type: 'radio',
          options: ['Menos de 5 horas', '5-15 horas', 'Más de 15 horas'],
          required: true,
          order: 2
        },
        {
          id: '3',
          text: '¿Estás dispuesto/a a seguir las reglas del clan?',
          type: 'radio',
          options: ['Sí, completamente', 'Depende de las reglas', 'No estoy seguro/a'],
          required: true,
          contradictsWith: ['Depende de las reglas', 'No estoy seguro/a'],
          order: 3
        }
      ];

      this.db.exec('BEGIN TRANSACTION;'); // Iniciar una transacción para inserciones masivas
      try {
        const insertStmt = this.db.prepare(
          `INSERT INTO questions (id, text, type, options, required, contradictsWith, order_num)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        );
        for (const question of defaultQuestions) {
          insertStmt.run(
            question.id,
            question.text,
            question.type,
            JSON.stringify(question.options),
            question.required ? 1 : 0,
            question.contradictsWith ? JSON.stringify(question.contradictsWith) : null,
            question.order
          );
        }
        insertStmt.free(); // Liberar el statement
        this.db.exec('COMMIT;'); // Confirmar la transacción
      } catch (e) {
        console.error("Error al insertar preguntas predeterminadas:", e);
        this.db.exec('ROLLBACK;'); // Revertir la transacción en caso de error
      }
      this.saveToLocalStorage();
    }
  }

  // Métodos para usuarios
  createUser(user: User): void {
    if (!this.db) return;
    
    this.db.run(
      `INSERT INTO users (id, email, password, username, discordUsername, robloxUsername, isAdmin, registeredAt, hasApplied, banned, ipAddress, lastLogin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        user.email,
        user.password,
        user.username,
        user.discordUsername || null,
        user.robloxUsername || null,
        user.isAdmin ? 1 : 0,
        user.registeredAt.toISOString(),
        user.hasApplied ? 1 : 0,
        user.banned ? 1 : 0,
        user.ipAddress || null,
        user.lastLogin ? user.lastLogin.toISOString() : null
      ]
    );
    this.saveToLocalStorage();
  }

  getUserByEmail(email: string): User | null {
    if (!this.db) return null;
    
    try {
      const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
      stmt.bind([email]);
      if (stmt.step()) {
        const result = stmt.get();
        stmt.free(); // Liberar el statement
        return this.mapRowToUser(result);
      }
      stmt.free(); // Liberar el statement
      return null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  getUserByUsername(username: string): User | null {
    if (!this.db) return null;
    
    try {
      const stmt = this.db.prepare('SELECT * FROM users WHERE username = ?');
      stmt.bind([username]);
      if (stmt.step()) {
        const result = stmt.get();
        stmt.free(); // Liberar el statement
        return this.mapRowToUser(result);
      }
      stmt.free(); // Liberar el statement
      return null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return null;
    }
  }

  getUserById(userId: string): User | null {
    if (!this.db) return null;
    
    try {
      const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
      stmt.bind([userId]);
      if (stmt.step()) {
        const result = stmt.get();
        stmt.free(); // Liberar el statement
        return this.mapRowToUser(result);
      }
      stmt.free(); // Liberar el statement
      return null;
    } catch (error) {
      console.error('Error getting user by id:', error);
      return null;
    }
  }

  getAllUsers(): User[] {
    if (!this.db) return [];
    
    const stmt = this.db.prepare('SELECT * FROM users');
    const results = [];
    while (stmt.step()) {
      results.push(this.mapRowToUser(stmt.get()));
    }
    stmt.free(); // Liberar el statement
    return results;
  }

  updateUserAppliedStatus(userId: string, hasApplied: boolean): void {
    if (!this.db) return;
    
    this.db.run('UPDATE users SET hasApplied = ? WHERE id = ?', [hasApplied ? 1 : 0, userId]);
    this.saveToLocalStorage();
  }

  updateUser(user: User): void {
    if (!this.db) return;
    
    this.db.run(
      `UPDATE users 
       SET email = ?, password = ?, username = ?, discordUsername = ?, robloxUsername = ?, isAdmin = ?, hasApplied = ?, banned = ?, ipAddress = ?, lastLogin = ?
       WHERE id = ?`,
      [
        user.email,
        user.password,
        user.username,
        user.discordUsername || null,
        user.robloxUsername || null,
        user.isAdmin ? 1 : 0,
        user.hasApplied ? 1 : 0,
        user.banned ? 1 : 0,
        user.ipAddress || null,
        user.lastLogin ? user.lastLogin.toISOString() : null,
        user.id
      ]
    );
    this.saveToLocalStorage();
  }

  deleteUser(userId: string): void {
    if (!this.db) return;
    
    this.db.exec('BEGIN TRANSACTION;'); // Iniciar transacción
    try {
      // También eliminar aplicaciones y participaciones en sorteos del usuario
      this.db.run('DELETE FROM applications WHERE userId = ?', [userId]);
      
      // Remover de participantes de sorteos
      const raffles = this.getAllRaffles();
      raffles.forEach(raffle => {
        if (raffle.participants.includes(userId)) {
          const newParticipants = raffle.participants.filter(id => id !== userId);
          this.db!.run('UPDATE raffles SET participants = ? WHERE id = ?', [JSON.stringify(newParticipants), raffle.id]);
        }
      });
      
      this.db.run('DELETE FROM users WHERE id = ?', [userId]);
      this.db.exec('COMMIT;'); // Confirmar transacción
    } catch (e) {
      console.error('Error al eliminar usuario y sus datos asociados:', e);
      this.db.exec('ROLLBACK;'); // Revertir transacción
    }
    this.saveToLocalStorage();
  }

  banUser(userId: string): void {
    if (!this.db) return;
    
    // El campo 'banned' ya debería estar garantizado por initializeTables
    this.db.run('UPDATE users SET banned = 1 WHERE id = ?', [userId]);
    this.saveToLocalStorage();
  }

  unbanUser(userId: string): void {
    if (!this.db) return;
    
    this.db.run('UPDATE users SET banned = 0 WHERE id = ?', [userId]);
    this.saveToLocalStorage();
  }

  private mapRowToUser(row: any[]): User {
    return {
      id: row[0],
      email: row[1],
      password: row[2],
      username: row[3],
      discordUsername: row[4] || undefined,
      robloxUsername: row[5] || undefined,
      isAdmin: row[6] === 1,
      registeredAt: new Date(row[7]),
      hasApplied: row[8] === 1,
      banned: row[9] === 1,
      ipAddress: row[10] || undefined,
      lastLogin: row[11] ? new Date(row[11]) : undefined
    };
  }

  // Métodos para preguntas
  getAllQuestions(): Question[] {
    if (!this.db) return [];
    
    const stmt = this.db.prepare('SELECT * FROM questions ORDER BY order_num');
    const results = [];
    while (stmt.step()) {
      results.push(this.mapRowToQuestion(stmt.get()));
    }
    stmt.free(); // Liberar el statement
    return results;
  }

  createQuestion(question: Question): void {
    if (!this.db) return;
    
    this.db.run(
      `INSERT INTO questions (id, text, type, options, required, contradictsWith, order_num)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        question.id,
        question.text,
        question.type,
        question.options ? JSON.stringify(question.options) : null,
        question.required ? 1 : 0,
        question.contradictsWith ? JSON.stringify(question.contradictsWith) : null,
        question.order
      ]
    );
    this.saveToLocalStorage();
  }

  updateQuestion(question: Question): void {
    if (!this.db) return;
    
    this.db.run(
      `UPDATE questions 
       SET text = ?, type = ?, options = ?, required = ?, contradictsWith = ?, order_num = ?
       WHERE id = ?`,
      [
        question.text,
        question.type,
        question.options ? JSON.stringify(question.options) : null,
        question.required ? 1 : 0,
        question.contradictsWith ? JSON.stringify(question.contradictsWith) : null,
        question.order,
        question.id
      ]
    );
    this.saveToLocalStorage();
  }

  deleteQuestion(questionId: string): void {
    if (!this.db) return;
    
    this.db.run('DELETE FROM questions WHERE id = ?', [questionId]);
    this.saveToLocalStorage();
  }

  reorderQuestions(questions: Question[]): void {
    if (!this.db) return;
    
    this.db.exec('BEGIN TRANSACTION;'); // Iniciar transacción
    try {
      questions.forEach((question, index) => {
        this.db!.run('UPDATE questions SET order_num = ? WHERE id = ?', [index + 1, question.id]);
      });
      this.db.exec('COMMIT;'); // Confirmar transacción
    } catch (e) {
      console.error('Error al reordenar preguntas:', e);
      this.db.exec('ROLLBACK;'); // Revertir transacción
    }
    this.saveToLocalStorage();
  }

  private mapRowToQuestion(row: any[]): Question {
    return {
      id: row[0],
      text: row[1],
      type: row[2] as 'radio' | 'checkbox',
      options: row[3] ? JSON.parse(row[3]) : undefined,
      required: row[4] === 1,
      contradictsWith: row[5] ? JSON.parse(row[5]) : undefined,
      order: row[6]
    };
  }

  // Métodos para aplicaciones
  getAllApplications(): ClanApplication[] {
    if (!this.db) return [];
    
    const stmt = this.db.prepare('SELECT * FROM applications ORDER BY submittedAt DESC');
    const results = [];
    while (stmt.step()) {
      results.push(this.mapRowToApplication(stmt.get()));
    }
    stmt.free(); // Liberar el statement
    return results;
  }

  createApplication(application: ClanApplication): void {
    if (!this.db) return;
    
    this.db.run(
      `INSERT INTO applications (id, userId, responses, submittedAt, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        application.id,
        application.userId,
        JSON.stringify(application.responses),
        application.submittedAt.toISOString(),
        application.status
      ]
    );
    this.saveToLocalStorage();
  }

  updateApplicationStatus(appId: string, status: 'approved' | 'rejected'): void {
    if (!this.db) return;
    
    this.db.run('UPDATE applications SET status = ? WHERE id = ?', [status, appId]);
    this.saveToLocalStorage();
  }

  private mapRowToApplication(row: any[]): ClanApplication {
    return {
      id: row[0],
      userId: row[1],
      responses: JSON.parse(row[2]),
      submittedAt: new Date(row[3]),
      status: row[4] as 'pending' | 'approved' | 'rejected'
    };
  }

  // Métodos para sorteos
  getAllRaffles(): Raffle[] {
    if (!this.db) return [];
    
    const stmt = this.db.prepare('SELECT * FROM raffles ORDER BY endDate DESC');
    const results = [];
    while (stmt.step()) {
      results.push(this.mapRowToRaffle(stmt.get()));
    }
    stmt.free(); // Liberar el statement
    return results;
  }

  createRaffle(raffle: Raffle): void {
    if (!this.db) return;
    
    this.db.run(
      `INSERT INTO raffles (id, title, description, endDate, participants, winner, isActive, createdBy)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        raffle.id,
        raffle.title,
        raffle.description,
        raffle.endDate.toISOString(),
        JSON.stringify(raffle.participants),
        raffle.winner || null,
        raffle.isActive ? 1 : 0,
        raffle.createdBy
      ]
    );
    this.saveToLocalStorage();
  }

  updateRaffle(raffle: Raffle): void {
    if (!this.db) return;
    
    this.db.run(
      `UPDATE raffles 
       SET title = ?, description = ?, endDate = ?, participants = ?, winner = ?, isActive = ?
       WHERE id = ?`,
      [
        raffle.title,
        raffle.description,
        raffle.endDate.toISOString(),
        JSON.stringify(raffle.participants),
        raffle.winner || null,
        raffle.isActive ? 1 : 0,
        raffle.id
      ]
    );
    this.saveToLocalStorage();
  }

  deleteRaffle(raffleId: string): void {
    if (!this.db) return;
    
    this.db.run('DELETE FROM raffles WHERE id = ?', [raffleId]);
    this.saveToLocalStorage();
  }

  joinRaffle(raffleId: string, userId: string): void {
    if (!this.db) return;
    
    const stmt = this.db.prepare('SELECT participants FROM raffles WHERE id = ?');
    stmt.bind([raffleId]);
    const result = stmt.get();
    stmt.free(); // Liberar el statement
    
    if (result) {
      const participants = JSON.parse(result[0]);
      if (!participants.includes(userId)) {
        participants.push(userId);
        this.db.run('UPDATE raffles SET participants = ? WHERE id = ?', [JSON.stringify(participants), raffleId]);
        this.saveToLocalStorage();
      }
    }
  }

  setRaffleWinner(raffleId: string, winnerId: string): void {
    if (!this.db) return;
    
    this.db.run('UPDATE raffles SET winner = ?, isActive = 0 WHERE id = ?', [winnerId, raffleId]);
    this.saveToLocalStorage();
  }

  private mapRowToRaffle(row: any[]): Raffle {
    return {
      id: row[0],
      title: row[1],
      description: row[2],
      endDate: new Date(row[3]),
      participants: JSON.parse(row[4]),
      winner: row[5] || undefined,
      isActive: row[6] === 1,
      createdBy: row[7]
    };
  }

  // Métodos para tickets
  getAllTickets(): Ticket[] {
    if (!this.db) return [];
    
    const stmt = this.db.prepare('SELECT * FROM tickets ORDER BY createdAt DESC');
    const results = [];
    while (stmt.step()) {
      const ticket = this.mapRowToTicket(stmt.get());
      // Cargar respuestas del ticket
      ticket.responses = this.getTicketResponses(ticket.id);
      results.push(ticket);
    }
    stmt.free(); // Liberar el statement
    return results;
  }

  createTicket(ticket: Ticket): void {
    if (!this.db) return;
    
    this.db.run(
      `INSERT INTO tickets (id, userId, title, description, status, priority, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ticket.id,
        ticket.userId,
        ticket.title,
        ticket.description,
        ticket.status,
        ticket.priority,
        ticket.createdAt.toISOString(),
        ticket.updatedAt.toISOString()
      ]
    );
    this.saveToLocalStorage();
  }

  updateTicket(ticket: Ticket): void {
    if (!this.db) return;
    
    this.db.run(
      `UPDATE tickets 
       SET title = ?, description = ?, status = ?, priority = ?, updatedAt = ?
       WHERE id = ?`,
      [
        ticket.title,
        ticket.description,
        ticket.status,
        ticket.priority,
        ticket.updatedAt.toISOString(),
        ticket.id
      ]
    );
    this.saveToLocalStorage();
  }

  closeTicket(ticketId: string): void {
    if (!this.db) return;
    
    this.db.run(
      'UPDATE tickets SET status = ?, updatedAt = ? WHERE id = ?',
      ['closed', new Date().toISOString(), ticketId]
    );
    this.saveToLocalStorage();
  }

  addTicketResponse(response: TicketResponse): void {
    if (!this.db) return;
    
    this.db.run(
      `INSERT INTO ticket_responses (id, ticketId, userId, message, isAdminResponse, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        response.id,
        response.ticketId,
        response.userId,
        response.message,
        response.isAdminResponse ? 1 : 0,
        response.createdAt.toISOString()
      ]
    );
    this.saveToLocalStorage();
  }

  getTicketResponses(ticketId: string): TicketResponse[] {
    if (!this.db) return [];
    
    const stmt = this.db.prepare('SELECT * FROM ticket_responses WHERE ticketId = ? ORDER BY createdAt ASC');
    const results = [];
    stmt.bind([ticketId]);
    while (stmt.step()) {
      results.push(this.mapRowToTicketResponse(stmt.get()));
    }
    stmt.free(); // Liberar el statement
    return results;
  }

  private mapRowToTicket(row: any[]): Ticket {
    return {
      id: row[0],
      userId: row[1],
      title: row[2],
      description: row[3],
      status: row[4] as 'open' | 'in_progress' | 'closed',
      priority: row[5] as 'low' | 'medium' | 'high',
      createdAt: new Date(row[6]),
      updatedAt: new Date(row[7]),
      responses: [] // Se cargan por separado
    };
  }

  private mapRowToTicketResponse(row: any[]): TicketResponse {
    return {
      id: row[0],
      ticketId: row[1],
      userId: row[2],
      message: row[3],
      isAdminResponse: row[4] === 1,
      createdAt: new Date(row[5])
    };
  }

  close(): void {
    if (this.db) {
      this.saveToLocalStorage();
      this.db.close();
    }
  }
}

export const database = new DatabaseManager();
