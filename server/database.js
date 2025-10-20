const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const dbPath = path.join(__dirname, 'game_data.db');
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      const queries = [
        // Users table
        `CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Daily games table
        `CREATE TABLE IF NOT EXISTS daily_games (
          date TEXT NOT NULL,
          mode TEXT NOT NULL,
          secret TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (date, mode)
        )`,
        
        // User stats table
        `CREATE TABLE IF NOT EXISTS user_stats (
          user_id TEXT PRIMARY KEY,
          total_games INTEGER DEFAULT 0,
          wins INTEGER DEFAULT 0,
          losses INTEGER DEFAULT 0,
          current_streak INTEGER DEFAULT 0,
          longest_streak INTEGER DEFAULT 0,
          last_played_date TEXT,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )`,
        
        // Daily game attempts table
        `CREATE TABLE IF NOT EXISTS daily_attempts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          date TEXT NOT NULL,
          mode TEXT NOT NULL,
          guess TEXT NOT NULL,
          correct_numbers INTEGER NOT NULL,
          correct_positions INTEGER NOT NULL,
          won BOOLEAN NOT NULL,
          submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )`
      ];

      let completed = 0;
      queries.forEach((query, index) => {
        this.db.run(query, (err) => {
          if (err) {
            console.error(`Error creating table ${index + 1}:`, err);
            reject(err);
          } else {
            completed++;
            if (completed === queries.length) {
              console.log('Database tables created successfully');
              resolve();
            }
          }
        });
      });
    });
  }

  // User methods
  async createUser(userId, userName) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT OR IGNORE INTO users (id, name) VALUES (?, ?)',
        [userId, userName],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  async getUser(userId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE id = ?',
        [userId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  // Daily game methods
  async getDailyGame(date, mode) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM daily_games WHERE date = ? AND mode = ?',
        [date, mode],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  async createDailyGame(date, mode, secret) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT OR IGNORE INTO daily_games (date, mode, secret) VALUES (?, ?, ?)',
        [date, mode, secret],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  // User stats methods
  async getUserStats(userId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM user_stats WHERE user_id = ?',
        [userId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || {
              user_id: userId,
              total_games: 0,
              wins: 0,
              losses: 0,
              current_streak: 0,
              longest_streak: 0,
              last_played_date: null
            });
          }
        }
      );
    });
  }

  async updateUserStats(userId, stats) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR REPLACE INTO user_stats 
         (user_id, total_games, wins, losses, current_streak, longest_streak, last_played_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          stats.total_games,
          stats.wins,
          stats.losses,
          stats.current_streak,
          stats.longest_streak,
          stats.last_played_date
        ],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  // Daily attempts methods
  async getDailyAttempts(userId, date, mode) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM daily_attempts WHERE user_id = ? AND date = ? AND mode = ? ORDER BY submitted_at',
        [userId, date, mode],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  async addDailyAttempt(userId, date, mode, guess, correctNumbers, correctPositions, won) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO daily_attempts 
         (user_id, date, mode, guess, correct_numbers, correct_positions, won)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, date, mode, guess, correctNumbers, correctPositions, won],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  async hasCompletedDailyGame(userId, date, mode) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT COUNT(*) as count FROM daily_attempts WHERE user_id = ? AND date = ? AND mode = ? AND won = 1',
        [userId, date, mode],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row.count > 0);
          }
        }
      );
    });
  }

  async getDailyGamePlayerCount(date, mode) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT COUNT(DISTINCT user_id) as count FROM daily_attempts WHERE date = ? AND mode = ?',
        [date, mode],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row.count);
          }
        }
      );
    });
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed');
        }
      });
    }
  }
}

module.exports = Database;
