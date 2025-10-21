import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { RefreshCw, Star, HelpCircle, Users, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import io from 'socket.io-client';
import { Analytics } from '@vercel/analytics/react';

const MultiplayerGame = ({ onBackToSingle }) => {
  const [socket, setSocket] = useState(null);
  const [gameId, setGameId] = useState('');
  const [playerNumber, setPlayerNumber] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [myGuesses, setMyGuesses] = useState([]);
  const [opponentGuesses, setOpponentGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [message, setMessage] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [unlimitedMode, setUnlimitedMode] = useState(false);
  const [isHost, setIsHost] = useState(false);

  const toggleUnlimitedMode = () => {
    setUnlimitedMode(!unlimitedMode);
  };

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('gameCreated', (data) => {
      setGameId(data.gameId);
      setPlayerNumber(data.playerNumber);
      setIsHost(true);
      setMessage(`Game created! Share this code: ${data.gameId}`);
    });

    newSocket.on('gameStarted', (data) => {
      setGameStarted(true);
      setCurrentPlayer(data.currentPlayer);
      setMessage('Game started! Take turns guessing each other\'s secret number.');
    });

    newSocket.on('gameUpdate', (data) => {
      setCurrentPlayer(data.currentPlayer);
      setMyGuesses(data.player1Guesses || []);
      setOpponentGuesses(data.player2Guesses || []);
      setGameOver(data.gameOver);
      setWinner(data.winner);
      
      if (data.gameOver) {
        if (data.winner === playerNumber) {
          setMessage('You won! 🎉');
        } else if (data.winner === 'tie') {
          setMessage('It\'s a tie!');
        } else {
          setMessage('You lost! Better luck next time.');
        }
      }
    });

    newSocket.on('gameReset', (data) => {
      setMyGuesses([]);
      setOpponentGuesses([]);
      setCurrentGuess('');
      setGameOver(false);
      setWinner(null);
      setCurrentPlayer(data.currentPlayer);
      setMessage('Game reset! New round started.');
    });

    newSocket.on('playerDisconnected', (data) => {
      setMessage(`Player ${data.playerNumber} disconnected.`);
    });

    newSocket.on('error', (data) => {
      setMessage(data.message);
    });

    return () => newSocket.close();
  }, [playerNumber]);

  const createGame = () => {
    if (socket) {
      socket.emit('createGame', { unlimitedMode });
    }
  };

  const joinGame = () => {
    if (socket && gameId) {
      socket.emit('joinGame', { gameId });
    }
  };

  const submitGuess = () => {
    if (socket && gameId && currentGuess.length === 4) {
      socket.emit('submitGuess', { gameId, guess: currentGuess });
      setCurrentGuess('');
    }
  };

  const resetGame = () => {
    if (socket && gameId) {
      socket.emit('resetGame', { gameId });
    }
  };

  const copyGameId = () => {
    navigator.clipboard.writeText(gameId);
    setMessage('Game ID copied to clipboard!');
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-200 to-slate-300 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-md h-[calc(100vh-4rem)] flex flex-col"
        >
          <div className="relative bg-[#fffef7] shadow-2xl rounded-sm flex-1 flex flex-col overflow-hidden p-6">
            <div className="text-center mb-6">
              <h1 className="text-4xl text-blue-900 mb-2" style={{ fontFamily: 'Caveat, cursive' }}>
                Multiplayer Game
              </h1>
              <p className="text-lg text-slate-600" style={{ fontFamily: 'Caveat, cursive' }}>
                Play with friends on different devices!
              </p>
            </div>

            {!gameId ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Button 
                    onClick={toggleUnlimitedMode}
                    size="sm"
                    variant="outline"
                    className={`border-2 ${
                      unlimitedMode 
                        ? 'border-green-600 bg-green-50 text-green-900' 
                        : 'border-blue-900 hover:bg-blue-50 text-blue-900'
                    }`}
                  >
                    <span style={{ fontFamily: 'Caveat, cursive' }}>Unlimited Mode</span>
                  </Button>
                </div>
                
                <Button 
                  onClick={createGame}
                  className="w-full bg-blue-900 hover:bg-blue-800 text-lg py-3"
                  style={{ fontFamily: 'Caveat, cursive' }}
                >
                  Create New Game
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-lg text-blue-900 mb-2" style={{ fontFamily: 'Caveat, cursive' }}>
                    Game Code:
                  </p>
                  <div className="flex items-center gap-2 justify-center">
                    <code className="text-2xl font-mono bg-slate-100 px-4 py-2 rounded border-2 border-blue-900">
                      {gameId}
                    </code>
                    <Button 
                      onClick={copyGameId}
                      size="sm"
                      variant="outline"
                      className="border-2 border-blue-900"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-slate-600 mt-2" style={{ fontFamily: 'Caveat, cursive' }}>
                    Share this code with your friend
                  </p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-lg text-blue-900 mb-2" style={{ fontFamily: 'Caveat, cursive' }}>
                    Or join a game:
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter game code"
                      value={gameId}
                      onChange={(e) => setGameId(e.target.value.toUpperCase())}
                      className="flex-1 text-center font-mono"
                    />
                    <Button 
                      onClick={joinGame}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Join
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {message && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-center">
                <p className="text-blue-800" style={{ fontFamily: 'Caveat, cursive' }}>
                  {message}
                </p>
              </div>
            )}

            <div className="mt-auto pt-4">
              <Button 
                onClick={onBackToSingle}
                variant="outline"
                className="w-full border-2 border-slate-600"
                style={{ fontFamily: 'Caveat, cursive' }}
              >
                Back to Single Player
              </Button>
            </div>
          </div>
          
          {/* Vercel Analytics */}
          <Analytics />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-200 to-slate-300 flex items-center justify-center p-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md h-[calc(100vh-4rem)] flex flex-col"
      >
        <div className="relative bg-[#fffef7] shadow-2xl rounded-sm flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 pb-2 flex-shrink-0">
            <div className="flex items-start justify-between mb-2">
              <div style={{ fontFamily: 'Caveat, cursive' }}>
                <h1 className="text-3xl text-blue-900">
                  Player {playerNumber}
                </h1>
                <p className="text-lg text-slate-600 italic">
                  {currentPlayer === playerNumber ? 'Your turn!' : 'Opponent\'s turn'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={resetGame}
                  size="icon"
                  variant="outline"
                  className="border-2 border-slate-600 hover:bg-slate-100 rounded-full"
                >
                  <RefreshCw className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Win Message */}
            <AnimatePresence>
              {gameOver && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-3 p-3 border-4 border-green-600 bg-green-50 rounded-sm"
                  style={{ fontFamily: 'Caveat, cursive' }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-400" />
                    <p className="text-2xl text-green-700">
                      {winner === playerNumber ? 'You Won!' : winner === 'tie' ? 'Tie Game!' : 'You Lost!'}
                    </p>
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-400" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Table Section */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <h2 className="text-2xl text-blue-900 mb-3 underline sticky top-0 bg-[#fffef7] py-2" style={{ fontFamily: 'Caveat, cursive' }}>
              My Guesses:
            </h2>
            
            <div className="space-y-3">
              {myGuesses.length === 0 ? (
                <div className="py-12 text-center text-xl text-slate-400 italic" style={{ fontFamily: 'Caveat, cursive' }}>
                  (no guesses yet...)
                </div>
              ) : (
                myGuesses.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="grid grid-cols-[2fr_1fr_1fr] gap-2 py-2 border-b border-slate-300"
                  >
                    <div className="flex gap-1.5">
                      {result.guess.split('').map((digit, i) => (
                        <div 
                          key={i}
                          className="w-10 h-10 flex items-center justify-center border-2 border-blue-900 bg-white rounded-sm text-2xl text-blue-900"
                          style={{ fontFamily: 'Caveat, cursive' }}
                        >
                          {digit}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-center">
                      <div 
                        className={`w-10 h-10 flex items-center justify-center rounded-full text-xl ${
                          result.correctNumbers > 0 
                            ? 'bg-orange-200 border-2 border-orange-600 text-orange-900' 
                            : 'bg-slate-100 border-2 border-slate-400 text-slate-500'
                        }`}
                        style={{ fontFamily: 'Caveat, cursive' }}
                      >
                        {result.correctNumbers}
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div 
                        className={`w-10 h-10 flex items-center justify-center rounded-full text-xl ${
                          result.correctPositions > 0 
                            ? 'bg-green-200 border-2 border-green-600 text-green-900' 
                            : 'bg-slate-100 border-2 border-slate-400 text-slate-500'
                        }`}
                        style={{ fontFamily: 'Caveat, cursive' }}
                      >
                        {result.correctPositions}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 border-t-2 border-blue-900 bg-[#fffef7] p-4">
            <p className="text-xl text-blue-900 mb-3 text-center" style={{ fontFamily: 'Caveat, cursive' }}>
              Your guess:
            </p>
            
            {message && (
              <div className="text-center mb-3">
                <p className="text-base text-red-600" style={{ fontFamily: 'Caveat, cursive' }}>
                  {message}
                </p>
              </div>
            )}

            <div className="flex gap-2 items-center justify-center">
              <Input
                type="text"
                placeholder="????"
                value={currentGuess}
                onChange={(e) => setCurrentGuess(e.target.value.replace(/[^1-9]/g, '').slice(0, 4))}
                disabled={gameOver || currentPlayer !== playerNumber}
                maxLength={4}
                className="w-32 text-center tracking-[0.5em] border-2 border-blue-900 bg-white text-2xl h-12"
                style={{ fontFamily: 'Caveat, cursive' }}
              />
              <Button 
                onClick={submitGuess} 
                disabled={gameOver || currentPlayer !== playerNumber || currentGuess.length !== 4}
                className="bg-blue-900 hover:bg-blue-800 text-lg px-6 h-12"
                style={{ fontFamily: 'Caveat, cursive' }}
              >
                Check
              </Button>
            </div>
          </div>
        </div>
        
        {/* Vercel Analytics */}
        <Analytics />
      </motion.div>
    </div>
  );
};

export default MultiplayerGame;
