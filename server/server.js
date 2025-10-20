const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const Database = require('./database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Initialize database
const db = new Database();

// Initialize database on startup
db.init().catch(console.error);

// API Routes
app.get('/api/daily-game/:includeZero', async (req, res) => {
  try {
    const includeZero = req.params.includeZero === 'true';
    const today = getTodayString();
    const mode = includeZero ? 'with0' : 'no0';
    
    // Get or create today's daily game
    let dailyGame = await db.getDailyGame(today, mode);
    if (!dailyGame) {
      const secret = generateDailySecret(includeZero);
      await db.createDailyGame(today, mode, secret);
      dailyGame = { date: today, mode, secret };
    }
    
    // Get player count
    const playerCount = await db.getDailyGamePlayerCount(today, mode);
    
    res.json({
      date: dailyGame.date,
      includeZero: dailyGame.mode === 'with0',
      playerCount: playerCount
    });
  } catch (error) {
    console.error('Error fetching daily game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/daily-game/submit', async (req, res) => {
  try {
    const { userId, guess, includeZero } = req.body;
    const today = getTodayString();
    const mode = includeZero ? 'with0' : 'no0';
    
    // Validate guess
    if (guess.length !== 4) {
      return res.status(400).json({ error: 'Please enter 4 digits' });
    }
    
    const hasDuplicates = new Set(guess).size !== 4;
    if (hasDuplicates) {
      return res.status(400).json({ error: 'All digits must be different' });
    }
    
    if (!includeZero && guess.includes('0')) {
      return res.status(400).json({ error: 'Digit 0 is not allowed in this mode' });
    }
    
    // Get today's daily game
    let dailyGame = await db.getDailyGame(today, mode);
    if (!dailyGame) {
      const secret = generateDailySecret(includeZero);
      await db.createDailyGame(today, mode, secret);
      dailyGame = { date: today, mode, secret };
    }
    
    // Check if user already completed today's game
    const hasCompleted = await db.hasCompletedDailyGame(userId, today, mode);
    if (hasCompleted) {
      return res.status(400).json({ error: 'You already completed today\'s game' });
    }
    
    // Calculate feedback
    const feedback = calculateFeedback(guess, dailyGame.secret);
    const won = feedback.correctPositions === 4;
    
    // Store the attempt
    await db.addDailyAttempt(userId, today, mode, guess, feedback.correctNumbers, feedback.correctPositions, won);
    
    // Get or create user
    await db.createUser(userId, 'Anonymous User'); // We'll get the real name from frontend later
    
    // Get current stats
    let stats = await db.getUserStats(userId);
    const lastPlayed = stats.last_played_date;
    
    // Update streak logic
    if (lastPlayed === today) {
      // Already played today, don't update streak
    } else if (lastPlayed === getYesterdayString()) {
      // Played yesterday, continue streak
      stats.current_streak++;
    } else if (lastPlayed && lastPlayed !== today) {
      // Missed a day, reset streak
      stats.current_streak = 1;
    } else {
      // First time playing
      stats.current_streak = 1;
    }
    
    // Update stats
    stats.total_games++;
    stats.last_played_date = today;
    
    if (won) {
      stats.wins++;
    } else {
      // Check if this was the 6th guess (loss)
      const attempts = await db.getDailyAttempts(userId, today, mode);
      if (attempts.length >= 6) {
        stats.losses++;
      }
    }
    
    stats.longest_streak = Math.max(stats.longest_streak, stats.current_streak);
    
    // Save updated stats
    await db.updateUserStats(userId, stats);
    
    res.json({
      feedback,
      won: won,
      stats: {
        totalGames: stats.total_games,
        wins: stats.wins,
        losses: stats.losses,
        currentStreak: stats.current_streak,
        longestStreak: stats.longest_streak
      }
    });
  } catch (error) {
    console.error('Error submitting daily game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/user-stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await db.getUserStats(userId);
    
    res.json({
      totalGames: stats.total_games,
      wins: stats.wins,
      losses: stats.losses,
      currentStreak: stats.current_streak,
      longestStreak: stats.longest_streak
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function getYesterdayString() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

// Game state storage (for multiplayer)
const games = new Map();
const players = new Map();

// Get today's date as string (YYYY-MM-DD)
function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

// Generate daily secret number
function generateDailySecret(includeZero = false) {
  let num = '';
  const digits = includeZero ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = 0; i < 4; i++) {
    const randIdx = Math.floor(Math.random() * digits.length);
    num += digits[randIdx];
    digits.splice(randIdx, 1);
  }
  return num;
}


// Generate secret number (1-9, no duplicates, no 0)
function generateSecretNumber() {
  let num = '';
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = 0; i < 4; i++) {
    const randIdx = Math.floor(Math.random() * digits.length);
    num += digits[randIdx];
    digits.splice(randIdx, 1);
  }
  return num;
}

// Calculate feedback
function calculateFeedback(guess, secret) {
  let correctPositions = 0;
  let correctNumbers = 0;
  const secretArr = secret.split('');
  const guessArr = guess.split('');
  const secretUsed = new Array(4).fill(false);

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (!secretUsed[j] && guessArr[i] === secretArr[j]) {
        correctNumbers++;
        secretUsed[j] = true;
        break;
      }
    }
  }

  for (let i = 0; i < 4; i++) {
    if (guessArr[i] === secretArr[i]) {
      correctPositions++;
    }
  }

  return { correctNumbers, correctPositions };
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create a new game
  socket.on('createGame', (data) => {
    const gameId = Math.random().toString(36).substr(2, 9);
    const secretNumber = generateSecretNumber();
    
    const game = {
      id: gameId,
      player1: {
        id: socket.id,
        secret: secretNumber,
        guesses: [],
        won: false
      },
      player2: null,
      currentPlayer: 1,
      gameStarted: false,
      gameOver: false,
      winner: null,
      unlimitedMode: data.unlimitedMode || false
    };

    games.set(gameId, game);
    players.set(socket.id, { gameId, playerNumber: 1 });
    
    socket.join(gameId);
    socket.emit('gameCreated', { gameId, playerNumber: 1, secret: secretNumber });
    console.log(`Game created: ${gameId} by ${socket.id}`);
  });

  // Join an existing game
  socket.on('joinGame', (data) => {
    const { gameId } = data;
    const game = games.get(gameId);

    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    if (game.player2) {
      socket.emit('error', { message: 'Game is full' });
      return;
    }

    const secretNumber = generateSecretNumber();
    game.player2 = {
      id: socket.id,
      secret: secretNumber,
      guesses: [],
      won: false
    };
    game.gameStarted = true;

    players.set(socket.id, { gameId, playerNumber: 2 });
    socket.join(gameId);
    
    // Notify both players that game has started
    io.to(gameId).emit('gameStarted', {
      player1Secret: game.player1.secret,
      player2Secret: game.player2.secret,
      currentPlayer: game.currentPlayer
    });

    console.log(`Player joined game: ${gameId}`);
  });

  // Submit a guess
  socket.on('submitGuess', (data) => {
    const { gameId, guess } = data;
    const game = games.get(gameId);
    const player = players.get(socket.id);

    if (!game || !player) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    if (game.gameOver) {
      socket.emit('error', { message: 'Game is over' });
      return;
    }

    // Validate guess
    if (guess.length !== 4) {
      socket.emit('error', { message: 'Please enter 4 digits' });
      return;
    }

    const hasDuplicates = new Set(guess).size !== 4;
    if (hasDuplicates) {
      socket.emit('error', { message: 'All digits must be different' });
      return;
    }

    if (guess.includes('0')) {
      socket.emit('error', { message: 'Digit 0 is not allowed' });
      return;
    }

    // Check if it's the player's turn
    if (game.currentPlayer !== player.playerNumber) {
      socket.emit('error', { message: 'Not your turn' });
      return;
    }

    // Calculate feedback
    const targetSecret = player.playerNumber === 1 ? game.player2.secret : game.player1.secret;
    const feedback = calculateFeedback(guess, targetSecret);

    // Add guess to player's history
    const newGuess = {
      guess,
      correctNumbers: feedback.correctNumbers,
      correctPositions: feedback.correctPositions,
      timestamp: Date.now()
    };

    if (player.playerNumber === 1) {
      game.player1.guesses.push(newGuess);
    } else {
      game.player2.guesses.push(newGuess);
    }

    // Check for win
    if (feedback.correctPositions === 4) {
      game.gameOver = true;
      game.winner = player.playerNumber;
      if (player.playerNumber === 1) {
        game.player1.won = true;
      } else {
        game.player2.won = true;
      }
    } else if (!game.unlimitedMode && game.player1.guesses.length >= 6 && game.player2.guesses.length >= 6) {
      game.gameOver = true;
      game.winner = 'tie';
    }

    // Switch turns if game continues
    if (!game.gameOver) {
      game.currentPlayer = game.currentPlayer === 1 ? 2 : 1;
    }

    // Broadcast update to all players in the game
    io.to(gameId).emit('gameUpdate', {
      gameId,
      currentPlayer: game.currentPlayer,
      player1Guesses: game.player1.guesses,
      player2Guesses: game.player2.guesses,
      gameOver: game.gameOver,
      winner: game.winner,
      lastGuess: newGuess
    });

    console.log(`Guess submitted in game ${gameId}: ${guess} by player ${player.playerNumber}`);
  });

  // Reset game
  socket.on('resetGame', (data) => {
    const { gameId } = data;
    const game = games.get(gameId);

    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    // Reset game state
    game.player1.secret = generateSecretNumber();
    game.player2.secret = generateSecretNumber();
    game.player1.guesses = [];
    game.player2.guesses = [];
    game.player1.won = false;
    game.player2.won = false;
    game.currentPlayer = 1;
    game.gameOver = false;
    game.winner = null;

    // Notify both players
    io.to(gameId).emit('gameReset', {
      player1Secret: game.player1.secret,
      player2Secret: game.player2.secret,
      currentPlayer: game.currentPlayer
    });

    console.log(`Game reset: ${gameId}`);
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    const player = players.get(socket.id);
    if (player) {
      const game = games.get(player.gameId);
      if (game) {
        // Notify other player that someone disconnected
        socket.to(player.gameId).emit('playerDisconnected', {
          playerNumber: player.playerNumber
        });
        
        // Clean up game if both players disconnected
        const remainingPlayers = Array.from(players.values()).filter(p => p.gameId === player.gameId);
        if (remainingPlayers.length === 0) {
          games.delete(player.gameId);
        }
      }
      players.delete(socket.id);
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  db.close();
  process.exit(0);
});
