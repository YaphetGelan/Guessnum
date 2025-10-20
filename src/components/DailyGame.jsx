import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { RefreshCw, Star, HelpCircle, Trophy, Calendar, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DailyGame = ({ onBackToSingle, userId }) => {
  const [gameMode, setGameMode] = useState('no0'); // 'no0' or 'with0'
  const [currentGuess, setCurrentGuess] = useState('');
  const [guessHistory, setGuessHistory] = useState([]);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [message, setMessage] = useState('');
  const [unlimitedMode, setUnlimitedMode] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [dailyGameInfo, setDailyGameInfo] = useState(null);
  const [hasPlayedToday, setHasPlayedToday] = useState(false);

  useEffect(() => {
    fetchDailyGameInfo();
    fetchUserStats();
  }, [gameMode]);

  const fetchDailyGameInfo = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/daily-game/${gameMode === 'with0'}`);
      const data = await response.json();
      setDailyGameInfo(data);
    } catch (error) {
      console.error('Error fetching daily game info:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/user-stats/${userId}`);
      const data = await response.json();
      setUserStats(data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleSubmitGuess = async () => {
    if (currentGuess.length !== 4) {
      setMessage('Please enter 4 digits');
      return;
    }

    const hasDuplicates = new Set(currentGuess).size !== 4;
    if (hasDuplicates) {
      setMessage('All digits must be different');
      return;
    }

    if (gameMode === 'no0' && currentGuess.includes('0')) {
      setMessage('Digit 0 is not allowed in this mode');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/daily-game/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          guess: currentGuess,
          includeZero: gameMode === 'with0'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const newGuess = {
          guess: currentGuess,
          correctNumbers: data.feedback.correctNumbers,
          correctPositions: data.feedback.correctPositions,
        };

        setGuessHistory([...guessHistory, newGuess]);

        if (data.won) {
          setGameWon(true);
        } else if (!unlimitedMode && guessHistory.length >= 5) {
          setGameLost(true);
        }

        setUserStats(data.stats);
        setHasPlayedToday(true);
        setCurrentGuess('');
        setMessage('');
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('Error submitting guess. Please try again.');
      console.error('Error:', error);
    }
  };

  const handleReset = () => {
    setCurrentGuess('');
    setGuessHistory([]);
    setGameWon(false);
    setGameLost(false);
    setMessage('');
  };

  const toggleUnlimitedMode = () => {
    setUnlimitedMode(!unlimitedMode);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !gameWon && !gameLost && !hasPlayedToday) {
      handleSubmitGuess();
    }
  };

  const handleNumpadClick = (num) => {
    if (currentGuess.length < 4 && !gameWon && !gameLost && !hasPlayedToday) {
      setCurrentGuess(currentGuess + num);
    }
  };

  const handleBackspace = () => {
    if (!gameWon && !gameLost && !hasPlayedToday) {
      setCurrentGuess(currentGuess.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (!gameWon && !gameLost && !hasPlayedToday) {
      setCurrentGuess('');
    }
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
        <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-around py-8 z-10 hidden md:flex">
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
                  Daily Challenge
                </h1>
                <p className="text-xl md:text-lg text-slate-600 italic">
                  {gameMode === 'with0' ? 'With 0 (0-9)' : 'Without 0 (1-9)'}
                </p>
                {dailyGameInfo && (
                  <p className="text-sm text-slate-500">
                    {dailyGameInfo.playerCount} players today
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="border-2 border-blue-900 hover:bg-blue-50 rounded-full">
                      <HelpCircle className="w-5 h-5 text-blue-900" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#fffef7] border-2 border-blue-900">
                    <DialogHeader>
                      <DialogTitle style={{ fontFamily: 'Caveat, cursive' }} className="text-2xl text-blue-900">
                        Daily Challenge Rules
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 text-lg" style={{ fontFamily: 'Caveat, cursive' }}>
                      <div className="flex items-start gap-2">
                        <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                        <span className="text-slate-700">One game per day, same number for everyone</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Trophy className="w-5 h-5 text-yellow-600 mt-1" />
                        <span className="text-slate-700">Track your wins, losses, and streaks</span>
                      </div>
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
                    </div>
                  </DialogContent>
                </Dialog>
                <Button onClick={handleReset} size="icon" variant="outline" className="border-2 border-slate-600 hover:bg-slate-100 rounded-full">
                  <RefreshCw className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* User Stats */}
            {userStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-900" style={{ fontFamily: 'Caveat, cursive' }}>
                    {userStats.wins}
                  </div>
                  <div className="text-xs text-blue-700" style={{ fontFamily: 'Caveat, cursive' }}>
                    Wins
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600" style={{ fontFamily: 'Caveat, cursive' }}>
                    {userStats.losses}
                  </div>
                  <div className="text-xs text-red-700" style={{ fontFamily: 'Caveat, cursive' }}>
                    Losses
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-lg font-bold text-orange-600" style={{ fontFamily: 'Caveat, cursive' }}>
                      {userStats.currentStreak}
                    </span>
                  </div>
                  <div className="text-xs text-orange-700" style={{ fontFamily: 'Caveat, cursive' }}>
                    Streak
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600" style={{ fontFamily: 'Caveat, cursive' }}>
                    {userStats.longestStreak}
                  </div>
                  <div className="text-xs text-purple-700" style={{ fontFamily: 'Caveat, cursive' }}>
                    Best
                  </div>
                </div>
              </div>
            )}

            {/* Game Mode Toggle */}
            <div className="flex gap-2 mb-3">
              <Button
                onClick={() => setGameMode('no0')}
                size="sm"
                variant={gameMode === 'no0' ? 'default' : 'outline'}
                className={gameMode === 'no0' ? 'bg-blue-900 text-white' : 'border-2 border-blue-900 text-blue-900'}
                style={{ fontFamily: 'Caveat, cursive' }}
              >
                Without 0
              </Button>
              <Button
                onClick={() => setGameMode('with0')}
                size="sm"
                variant={gameMode === 'with0' ? 'default' : 'outline'}
                className={gameMode === 'with0' ? 'bg-blue-900 text-white' : 'border-2 border-blue-900 text-blue-900'}
                style={{ fontFamily: 'Caveat, cursive' }}
              >
                With 0
              </Button>
              <Button
                onClick={toggleUnlimitedMode}
                size="sm"
                variant="outline"
                className={`border-2 ${unlimitedMode ? 'border-green-600 bg-green-50 text-green-900' : 'border-blue-900 hover:bg-blue-50 text-blue-900'}`}
                style={{ fontFamily: 'Caveat, cursive' }}
              >
                S
              </Button>
            </div>

            {/* Win/Loss Messages */}
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
                      Daily Challenge Won! 🎉
                    </p>
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-400" />
                  </div>
                </motion.div>
              )}
              {gameLost && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-3 p-3 border-4 border-red-600 bg-red-50 rounded-sm"
                  style={{ fontFamily: 'Caveat, cursive' }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-2xl text-red-700">
                      Game Over! Try again tomorrow
                    </p>
                  </div>
                </motion.div>
              )}
              {hasPlayedToday && !gameWon && !gameLost && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-3 p-3 border-4 border-blue-600 bg-blue-50 rounded-sm"
                  style={{ fontFamily: 'Caveat, cursive' }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-lg text-blue-700">
                      You've already played today! Come back tomorrow for a new challenge.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Table Section - Always visible, compact */}
          <div className="flex-1 px-4 pl-12 md:pl-14 pb-2">
            <h2 className="text-lg md:text-xl text-blue-900 mb-1 underline" style={{ fontFamily: 'Caveat, cursive' }}>
              My Guesses:
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
                {guessHistory.length === 0 ? (
                  <div className="py-4 text-center text-sm md:text-lg text-slate-400 italic" style={{ fontFamily: 'Caveat, cursive' }}>
                    (no guesses yet...)
                  </div>
                ) : (
                  guessHistory.slice(-6).map((result, index) => (
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
                  ))
                )}
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
                {(gameMode === 'with0' ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : [1, 2, 3, 4, 5, 6, 7, 8, 9]).map((num) => (
                  <Button
                    key={num}
                    onClick={() => handleNumpadClick(num.toString())}
                    disabled={gameWon || gameLost || hasPlayedToday}
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
                  disabled={gameWon || gameLost || hasPlayedToday}
                  variant="outline"
                  className="h-10 text-sm border border-red-600 text-red-600 hover:bg-red-50"
                  style={{ fontFamily: 'Caveat, cursive' }}
                >
                  Clear
                </Button>
                <Button
                  onClick={handleBackspace}
                  disabled={gameWon || gameLost || hasPlayedToday}
                  variant="outline"
                  className="h-10 text-sm border border-orange-600 text-orange-600 hover:bg-orange-50"
                  style={{ fontFamily: 'Caveat, cursive' }}
                >
                  ←
                </Button>
                <Button 
                  onClick={handleSubmitGuess} 
                  disabled={gameWon || gameLost || hasPlayedToday || currentGuess.length !== 4}
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
                onChange={(e) => setCurrentGuess(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                onKeyPress={handleKeyPress}
                disabled={gameWon || gameLost || hasPlayedToday}
                maxLength={4}
                className="w-28 text-center tracking-[0.5em] border-2 border-blue-900 bg-white text-lg h-10"
                style={{ fontFamily: 'Caveat, cursive' }}
              />
              <Button 
                onClick={handleSubmitGuess} 
                disabled={gameWon || gameLost || hasPlayedToday || currentGuess.length !== 4}
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
    </div>
  );
};

export default DailyGame;
