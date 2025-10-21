import { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { RefreshCw, Star, HelpCircle, Users, Calendar, Trophy, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MultiplayerGame from './components/MultiplayerGame';
import DailyGame from './components/DailyGame';
import FAQ from './components/FAQ';
import About from './components/About';
import { Analytics } from '@vercel/analytics/react';

  const generateNewGame = () => {
  let num = '';
    const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = 0; i < 4; i++) {
      const randIdx = Math.floor(Math.random() * digits.length);
      num += digits[randIdx];
      digits.splice(randIdx, 1);
    }
  return num;
  };

  const calculateFeedback = (guess, secret) => {
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
  };

export default function App() {
  const [secretNumber, setSecretNumber] = useState(() => generateNewGame());
  const [currentGuess, setCurrentGuess] = useState('');
  const [guessHistory, setGuessHistory] = useState([]);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [message, setMessage] = useState('');
  const [unlimitedMode, setUnlimitedMode] = useState(false);
  const [gameMode, setGameMode] = useState('single'); // 'single' or 'multiplayer'
  const [player1Secret, setPlayer1Secret] = useState('');
  const [player2Secret, setPlayer2Secret] = useState('');
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [player1Guesses, setPlayer1Guesses] = useState([]);
  const [player2Guesses, setPlayer2Guesses] = useState([]);
  const [player1Won, setPlayer1Won] = useState(false);
  const [player2Won, setPlayer2Won] = useState(false);
  const [showMultiplayer, setShowMultiplayer] = useState(false);
  const [showDailyGame, setShowDailyGame] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [showLogin, setShowLogin] = useState(false);

  // Initialize user ID on component mount
  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    const savedUserName = localStorage.getItem('userName');
    
    if (savedUserId && savedUserName) {
      setUserId(savedUserId);
      setUserName(savedUserName);
    } else {
      setShowLogin(true);
    }
  }, []);

  const handleLogin = (name) => {
    const newUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    setUserId(newUserId);
    setUserName(name);
    setShowLogin(false);
    localStorage.setItem('userId', newUserId);
    localStorage.setItem('userName', name);
  };

  const handleLogout = () => {
    setUserId(null);
    setUserName('');
    setShowLogin(true);
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
  };

  const handleSubmitGuess = () => {
    if (currentGuess.length !== 4) {
      setMessage('Please enter 4 digits');
      return;
    }

    // Check for duplicates
    const hasDuplicates = new Set(currentGuess).size !== 4;
    if (hasDuplicates) {
      setMessage('All digits must be different');
      return;
    }

    // Check for 0
    if (currentGuess.includes('0')) {
      setMessage('Digit 0 is not allowed');
      return;
    }

    if (gameMode === 'single') {
    const feedback = calculateFeedback(currentGuess, secretNumber);

    const newGuess = {
        guess: currentGuess,
        correctNumbers: feedback.correctNumbers,
        correctPositions: feedback.correctPositions,
      };

      const updatedGuesses = [...guessHistory, newGuess];
      setGuessHistory(updatedGuesses);

    if (feedback.correctPositions === 4) {
      setGameWon(true);
      } else if (!unlimitedMode && updatedGuesses.length === 6) {
      setGameLost(true);
      }
    } else {
      // Multiplayer mode
      const targetSecret = currentPlayer === 1 ? player2Secret : player1Secret;
      const feedback = calculateFeedback(currentGuess, targetSecret);

      const newGuess = {
        guess: currentGuess,
        correctNumbers: feedback.correctNumbers,
        correctPositions: feedback.correctPositions,
      };

      if (currentPlayer === 1) {
        const updatedGuesses = [...player1Guesses, newGuess];
        setPlayer1Guesses(updatedGuesses);
        if (feedback.correctPositions === 4) {
          setPlayer1Won(true);
        } else if (!unlimitedMode && updatedGuesses.length === 6) {
          setMessage('Player 1 lost! Player 2 wins!');
        }
      } else {
        const updatedGuesses = [...player2Guesses, newGuess];
        setPlayer2Guesses(updatedGuesses);
        if (feedback.correctPositions === 4) {
          setPlayer2Won(true);
        } else if (!unlimitedMode && updatedGuesses.length === 6) {
          setMessage('Player 2 lost! Player 1 wins!');
        }
      }

      // Switch players if no one won
      if (feedback.correctPositions !== 4) {
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
      }
    }

    setCurrentGuess('');
    setMessage('');
  };

  const handleReset = () => {
    if (gameMode === 'single') {
      setSecretNumber(generateNewGame());
      setCurrentGuess('');
      setGuessHistory([]);
      setGameWon(false);
      setGameLost(false);
    } else {
      // Reset multiplayer game
      setPlayer1Secret('');
      setPlayer2Secret('');
      setCurrentPlayer(1);
      setPlayer1Guesses([]);
      setPlayer2Guesses([]);
      setPlayer1Won(false);
      setPlayer2Won(false);
      setCurrentGuess('');
    }
    setMessage('');
  };

  const toggleUnlimitedMode = () => {
    setUnlimitedMode(!unlimitedMode);
    setMessage('');
  };

  const startMultiplayerGame = () => {
    setGameMode('multiplayer');
    setPlayer1Secret(generateNewGame());
    setPlayer2Secret(generateNewGame());
    setCurrentPlayer(1);
    setPlayer1Guesses([]);
    setPlayer2Guesses([]);
    setPlayer1Won(false);
    setPlayer2Won(false);
    setCurrentGuess('');
    setMessage('');
  };

  const startSingleGame = () => {
    setGameMode('single');
    setSecretNumber(generateNewGame());
    setCurrentGuess('');
    setGuessHistory([]);
    setGameWon(false);
    setGameLost(false);
    setMessage('');
  };

  const startDailyGame = () => {
    setShowDailyGame(true);
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-200 to-slate-300 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full"
        >
          <h1 className="text-3xl font-bold text-center mb-6 text-blue-900" style={{ fontFamily: 'Caveat, cursive' }}>
            Welcome to Number Game!
          </h1>
          <p className="text-center mb-6 text-slate-600" style={{ fontFamily: 'Caveat, cursive' }}>
            Enter your name to start playing
          </p>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="text-center text-lg"
              onKeyPress={(e) => e.key === 'Enter' && userName.trim() && handleLogin(userName.trim())}
              style={{ fontFamily: 'Caveat, cursive' }}
            />
            <Button 
              onClick={() => userName.trim() && handleLogin(userName.trim())}
              disabled={!userName.trim()}
              className="w-full bg-blue-900 hover:bg-blue-800 text-lg py-3"
              style={{ fontFamily: 'Caveat, cursive' }}
            >
              Start Playing
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showMultiplayer) {
    return <MultiplayerGame onBackToSingle={() => setShowMultiplayer(false)} />;
  }

  if (showDailyGame) {
    return <DailyGame onBackToSingle={() => setShowDailyGame(false)} userId={userId} />;
  }

  if (showFAQ) {
    return <FAQ onBackToGame={() => setShowFAQ(false)} />;
  }

  if (showAbout) {
    return <About onBackToGame={() => setShowAbout(false)} />;
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !gameWon && !gameLost && !player1Won && !player2Won) {
      handleSubmitGuess();
    }
  };

  const handleNumpadClick = (num) => {
    if (currentGuess.length < 4 && !gameWon && !gameLost && !player1Won && !player2Won) {
      setCurrentGuess(currentGuess + num);
    }
  };

  const handleBackspace = () => {
    setCurrentGuess(currentGuess.slice(0, -1));
  };

  const handleClear = () => {
    setCurrentGuess('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-200 to-slate-300 flex items-center justify-center p-4 py-8 md:py-4">
      {/* Notebook Page - Mobile Optimized */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md h-[calc(100vh-4rem)] md:h-[calc(100vh-2rem)] flex flex-col"
      >
        {/* Spiral Binding Holes - Hidden on mobile */}
        <div className="hidden md:flex absolute left-2 top-0 bottom-0 flex-col justify-around py-8 z-10">
          {[...Array(14)].map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full bg-slate-400 shadow-inner border-2 border-slate-500" />
          ))}
        </div>

        {/* Notebook Paper */}
        <div 
          className="relative bg-[#fffef7] shadow-2xl rounded-sm md:rounded-r-sm md:ml-8 flex-1 flex flex-col overflow-hidden"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                transparent,
                transparent 31px,
                #d1d5db 31px,
                #d1d5db 32px
              ),
              linear-gradient(
                to right,
                transparent 0,
                transparent 40px,
                #93c5fd 40px,
                #93c5fd 42px,
                transparent 42px
              )
            `,
            backgroundSize: '100% 32px, 100% 100%'
          }}
        >
          {/* Header Section */}
          <div className="p-4 pb-2 pl-12 md:pl-14 flex-shrink-0">
            <div className="flex items-start justify-between mb-2">
              <div style={{ fontFamily: 'Caveat, cursive' }}>
                <h1 className="text-4xl md:text-3xl text-blue-900 underline decoration-wavy decoration-blue-400">
                  Number Game
        </h1>
                <p className="text-xl md:text-lg text-slate-600 italic">
                  Guess the secret!
                </p>
              </div>
              <div className="flex gap-2">
                {/* Menu Button */}
                <Button
                  onClick={() => setShowMenu(!showMenu)}
                  size="icon"
                  variant="outline"
                  className="border-2 border-slate-600 hover:bg-slate-50 text-slate-900 rounded-full"
                  title="Menu"
                >
                  {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
                
                <Button 
                  onClick={startDailyGame}
                  size="icon"
                  variant="outline"
                  className="border-2 border-green-600 hover:bg-green-50 text-green-900 rounded-full"
                  title="Daily Challenge"
                >
                  <Calendar className="w-5 h-5" />
                </Button>
                <Button 
                  onClick={() => setShowMultiplayer(true)}
                  size="icon"
                  variant="outline"
                  className="border-2 border-purple-600 hover:bg-purple-50 text-purple-900 rounded-full"
                >
                  <Users className="w-5 h-5" />
                </Button>
                <Button 
                  onClick={toggleUnlimitedMode}
                  size="icon"
                  variant="outline"
                  className={`border-2 rounded-full ${
                    unlimitedMode 
                      ? 'border-green-600 bg-green-50 text-green-900' 
                      : 'border-blue-900 hover:bg-blue-50 text-blue-900'
                  }`}
                >
                  <span className="text-lg font-bold" style={{ fontFamily: 'Caveat, cursive' }}>S</span>
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline"
                      size="icon"
                      className="border-2 border-blue-900 hover:bg-blue-50 rounded-full"
                    >
                      <HelpCircle className="w-5 h-5 text-blue-900" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#fffef7] border-2 border-blue-900">
                    <DialogHeader>
                      <DialogTitle style={{ fontFamily: 'Caveat, cursive' }} className="text-2xl text-blue-900">
                        How to Play
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 text-lg" style={{ fontFamily: 'Caveat, cursive' }}>
                      <div className="flex items-start gap-2">
                        <span className="text-orange-600">→</span>
                        <span className="text-slate-700">
                          <span className="inline-block w-6 h-6 bg-orange-200 border border-orange-600 rounded-full text-center leading-6 text-sm">No</span> = right number, wrong spot
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600">→</span>
                        <span className="text-slate-700">
                          <span className="inline-block w-6 h-6 bg-green-200 border border-green-600 rounded-full text-center leading-6 text-sm">Pos</span> = right number, right spot!
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600">→</span>
                        <span className="text-slate-700">All 4 digits are different</span>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button 
                  onClick={handleReset} 
                  size="icon"
                  variant="outline"
                  className="border-2 border-slate-600 hover:bg-slate-100 rounded-full"
                >
                  <RefreshCw className="w-5 h-5" />
                </Button>
              </div>
          </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-16 right-4 bg-white rounded-lg shadow-xl border border-slate-200 p-4 z-50 min-w-48"
                >
                  <div className="space-y-2">
                    <Button
                      onClick={() => {
                        setShowAbout(true);
                        setShowMenu(false);
                      }}
                      variant="ghost"
                      className="w-full justify-start text-left"
                      style={{ fontFamily: 'Caveat, cursive' }}
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      About Game
                    </Button>
                    <Button
                      onClick={() => {
                        setShowFAQ(true);
                        setShowMenu(false);
                      }}
                      variant="ghost"
                      className="w-full justify-start text-left"
                      style={{ fontFamily: 'Caveat, cursive' }}
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      FAQ
                    </Button>
                    <Button
                      onClick={() => {
                        setShowDailyGame(true);
                        setShowMenu(false);
                      }}
                      variant="ghost"
                      className="w-full justify-start text-left"
                      style={{ fontFamily: 'Caveat, cursive' }}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Daily Challenge
                    </Button>
                    <Button
                      onClick={() => {
                        setShowMultiplayer(true);
                        setShowMenu(false);
                      }}
                      variant="ghost"
                      className="w-full justify-start text-left"
                      style={{ fontFamily: 'Caveat, cursive' }}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Multiplayer
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Win Message */}
            <AnimatePresence>
              {gameWon && (
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
                      Won in {guessHistory.length}!
                    </p>
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-400" />
                  </div>
                </motion.div>
              )}
              {player1Won && (
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
                      Player 1 Wins!
                    </p>
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-400" />
            </div>
                </motion.div>
              )}
              {player2Won && (
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
                      Player 2 Wins!
                    </p>
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-400" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Table Section - Always visible, compact */}
          <div className="flex-1 px-4 pl-12 md:pl-14 pb-2">
            <h2 className="text-lg md:text-xl text-blue-900 mb-1 underline" style={{ fontFamily: 'Caveat, cursive' }}>
              {gameMode === 'single' ? 'My Guesses:' : `Player ${currentPlayer}'s Turn:`}
            </h2>
            
            {/* Hand-drawn table */}
            <div className="relative">
              {/* Table Header Row */}
              <div className="grid grid-cols-[2fr_1fr_1fr] gap-1 mb-1 pb-1 border-b-2 border-blue-900">
                <div className="text-sm md:text-lg text-blue-900" style={{ fontFamily: 'Caveat, cursive' }}>
                  Guess
                </div>
                <div className="text-sm md:text-lg text-blue-900 text-center" style={{ fontFamily: 'Caveat, cursive' }}>
                  No:
                </div>
                <div className="text-sm md:text-lg text-blue-900 text-center" style={{ fontFamily: 'Caveat, cursive' }}>
                  Pos
                </div>
              </div>

              {/* Table Body - Show last 6 guesses */}
              <div className="space-y-1">
                {(() => {
                  const currentGuesses = gameMode === 'single' ? guessHistory : 
                    (currentPlayer === 1 ? player1Guesses : player2Guesses);
                  
                  if (currentGuesses.length === 0) {
                    return (
                      <div className="py-4 text-center text-sm md:text-lg text-slate-400 italic" style={{ fontFamily: 'Caveat, cursive' }}>
                        (no guesses yet...)
                      </div>
                    );
                  }
                  
                  // Show only the last 6 guesses
                  const recentGuesses = currentGuesses.slice(-6);
                  
                  return recentGuesses.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="grid grid-cols-[2fr_1fr_1fr] gap-1 py-1 border-b border-slate-200"
                    >
                      {/* Guess */}
                      <div className="flex gap-0.5">
                        {result.guess.split('').map((digit, i) => (
                          <div 
                            key={i}
                            className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center border border-blue-900 bg-white rounded text-sm md:text-lg text-blue-900"
                            style={{ fontFamily: 'Caveat, cursive' }}
                          >
                            {digit}
                          </div>
                        ))}
                      </div>

                      {/* No: (correct numbers wrong position) */}
                      <div className="flex items-center justify-center">
                        <div 
                          className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full text-sm md:text-lg ${
                            result.correctNumbers > 0 
                              ? 'bg-orange-200 border border-orange-600 text-orange-900' 
                              : 'bg-slate-100 border border-slate-400 text-slate-500'
                          }`}
                          style={{ fontFamily: 'Caveat, cursive' }}
                        >
                          {result.correctNumbers}
                        </div>
                      </div>

                      {/* Pos (correct position) */}
                      <div className="flex items-center justify-center">
                        <div 
                          className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full text-sm md:text-lg ${
                            result.correctPositions > 0 
                              ? 'bg-green-200 border border-green-600 text-green-900' 
                              : 'bg-slate-100 border border-slate-400 text-slate-500'
                          }`}
                          style={{ fontFamily: 'Caveat, cursive' }}
                        >
                          {result.correctPositions}
                        </div>
                      </div>
                    </motion.div>
                  ));
                })()}
              </div>
            </div>
          </div>

          {/* Input Area - Fixed at Bottom */}
          <div className="flex-shrink-0 border-t-2 border-blue-900 bg-[#fffef7] p-3 pl-12 md:pl-14">
            {/* Message Display */}
              {message && (
              <div className="text-center mb-2">
                <p className="text-sm md:text-base text-red-600" style={{ fontFamily: 'Caveat, cursive' }}>
                  {message}
                </p>
            </div>
          )}

            {/* Game Lost Message */}
            {gameLost && (
              <div className="text-center mb-2">
                <p className="text-sm md:text-base text-red-600" style={{ fontFamily: 'Caveat, cursive' }}>
                  Game Over! The secret number was {secretNumber}
                </p>
              </div>
            )}

            {/* Current Guess Display */}
            <div className="flex justify-center items-center gap-1 mb-2">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border-2 border-blue-900 bg-white rounded-sm text-lg md:text-xl text-blue-900"
                  style={{ fontFamily: 'Caveat, cursive' }}
                >
                  {currentGuess[i] || '?'}
                </div>
              ))}
          </div>

            {/* Mobile Numpad - Medium Size */}
            <div className="md:hidden">
              <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Button
                    key={num}
                    onClick={() => handleNumpadClick(num.toString())}
                    disabled={gameWon || gameLost || player1Won || player2Won}
                    className="h-10 text-base bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-900"
                    style={{ fontFamily: 'Caveat, cursive' }}
                  >
                    {num}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <Button
                  onClick={handleClear}
                  disabled={gameWon || gameLost || player1Won || player2Won}
                  variant="outline"
                  className="h-10 text-sm border border-red-600 text-red-600 hover:bg-red-50"
                  style={{ fontFamily: 'Caveat, cursive' }}
                >
                  Clear
                </Button>
                <Button
                  onClick={handleBackspace}
                  disabled={gameWon || gameLost || player1Won || player2Won}
                  variant="outline"
                  className="h-10 text-sm border border-orange-600 text-orange-600 hover:bg-orange-50"
                  style={{ fontFamily: 'Caveat, cursive' }}
                >
                  ←
                </Button>
                <Button 
                  onClick={handleSubmitGuess} 
                  disabled={gameWon || gameLost || player1Won || player2Won || currentGuess.length !== 4}
                  className="h-10 text-sm bg-green-600 hover:bg-green-700 text-white"
                  style={{ fontFamily: 'Caveat, cursive' }}
                >
                  Check
                </Button>
              </div>
            </div>

            {/* Desktop Input */}
            <div className="hidden md:flex gap-2 items-center justify-center">
              <Input
                type="text"
                placeholder="????"
                value={currentGuess}
                onChange={(e) => setCurrentGuess(e.target.value.replace(/[^1-9]/g, '').slice(0, 4))}
                onKeyPress={handleKeyPress}
                disabled={gameWon || gameLost || player1Won || player2Won}
                maxLength={4}
                className="w-28 text-center tracking-[0.5em] border-2 border-blue-900 bg-white text-lg h-10"
                style={{ fontFamily: 'Caveat, cursive' }}
              />
              <Button 
                onClick={handleSubmitGuess} 
                disabled={gameWon || gameLost || player1Won || player2Won || currentGuess.length !== 4}
                className="bg-blue-900 hover:bg-blue-800 text-sm px-4 h-10"
                style={{ fontFamily: 'Caveat, cursive' }}
              >
                Check
              </Button>
            </div>

            {/* Mode Indicator */}
            <div className="text-center mt-2">
              <p className="text-xs text-slate-500" style={{ fontFamily: 'Caveat, cursive' }}>
                {unlimitedMode ? 'Unlimited Mode' : '6 Guesses Limit'}
              </p>
            </div>
          </div>
        </div>

        {/* Page shadow/curl effect */}
        <div className="absolute bottom-0 right-0 w-12 h-12 bg-slate-400 opacity-20 rounded-tl-full" />
      </motion.div>

      {/* Load Caveat font */}
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap" rel="stylesheet" />
      
      {/* Vercel Analytics */}
      <Analytics />
    </div>
  );
}