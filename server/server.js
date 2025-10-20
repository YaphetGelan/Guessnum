const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

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

// Game state storage
const games = new Map();
const players = new Map();

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
