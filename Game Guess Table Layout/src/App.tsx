import { useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { RefreshCw, Star, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GuessResult {
  guess: string;
  correctNumbers: number;
  correctPositions: number;
}

function generateSecretNumber(): string {
  const digits = [];
  while (digits.length < 4) {
    const digit = Math.floor(Math.random() * 10).toString();
    if (!digits.includes(digit)) {
      digits.push(digit);
    }
  }
  return digits.join('');
}

function checkGuess(secret: string, guess: string): { correctNumbers: number; correctPositions: number } {
  let correctPositions = 0;
  let correctNumbers = 0;

  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) {
      correctPositions++;
    }
  }

  for (let i = 0; i < 4; i++) {
    if (secret.includes(guess[i]) && guess[i] !== secret[i]) {
      correctNumbers++;
    }
  }

  return { correctNumbers, correctPositions };
}

export default function App() {
  const [secretNumber, setSecretNumber] = useState(() => generateSecretNumber());
  const [currentGuess, setCurrentGuess] = useState('');
  const [guessHistory, setGuessHistory] = useState<GuessResult[]>([]);
  const [gameWon, setGameWon] = useState(false);

  const handleSubmitGuess = () => {
    if (currentGuess.length !== 4 || !/^\d+$/.test(currentGuess)) {
      return;
    }

    const hasDuplicates = new Set(currentGuess).size !== 4;
    if (hasDuplicates) {
      return;
    }

    const result = checkGuess(secretNumber, currentGuess);
    const newGuess: GuessResult = {
      guess: currentGuess,
      correctNumbers: result.correctNumbers,
      correctPositions: result.correctPositions,
    };

    setGuessHistory([...guessHistory, newGuess]);
    
    if (result.correctPositions === 4) {
      setGameWon(true);
    }

    setCurrentGuess('');
  };

  const handleReset = () => {
    setSecretNumber(generateSecretNumber());
    setCurrentGuess('');
    setGuessHistory([]);
    setGameWon(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !gameWon) {
      handleSubmitGuess();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-200 to-slate-300 flex items-center justify-center p-4">
      {/* Notebook Page - Mobile Optimized */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md h-[calc(100vh-2rem)] flex flex-col"
      >
        {/* Spiral Binding Holes */}
        <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-around py-8 z-10">
          {[...Array(14)].map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full bg-slate-400 shadow-inner border-2 border-slate-500" />
          ))}
        </div>

        {/* Notebook Paper */}
        <div 
          className="relative bg-[#fffef7] shadow-2xl rounded-r-sm ml-8 flex-1 flex flex-col overflow-hidden"
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
          <div className="p-4 pb-2 pl-14 flex-shrink-0">
            <div className="flex items-start justify-between mb-2">
              <div style={{ fontFamily: 'Caveat, cursive' }}>
                <h1 className="text-3xl text-blue-900 underline decoration-wavy decoration-blue-400">
                  Number Game
                </h1>
                <p className="text-lg text-slate-600 italic">
                  Guess the secret!
                </p>
              </div>
              <div className="flex gap-2">
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
            </AnimatePresence>
          </div>

          {/* Table Section - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 pl-14 pb-4">
            <h2 className="text-2xl text-blue-900 mb-3 underline sticky top-0 bg-[#fffef7] py-2" style={{ fontFamily: 'Caveat, cursive' }}>
              My Guesses:
            </h2>
            
            {/* Hand-drawn table */}
            <div className="relative">
              {/* Table Header Row */}
              <div className="grid grid-cols-[2fr_1fr_1fr] gap-2 mb-2 pb-2 border-b-2 border-blue-900 sticky top-14 bg-[#fffef7]">
                <div className="text-xl text-blue-900" style={{ fontFamily: 'Caveat, cursive' }}>
                  Guess
                </div>
                <div className="text-xl text-blue-900 text-center" style={{ fontFamily: 'Caveat, cursive' }}>
                  No:
                </div>
                <div className="text-xl text-blue-900 text-center" style={{ fontFamily: 'Caveat, cursive' }}>
                  Pos
                </div>
              </div>

              {/* Table Body */}
              <div className="space-y-3">
                {guessHistory.length === 0 ? (
                  <div className="py-12 text-center text-xl text-slate-400 italic" style={{ fontFamily: 'Caveat, cursive' }}>
                    (no guesses yet...)
                  </div>
                ) : (
                  guessHistory.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="grid grid-cols-[2fr_1fr_1fr] gap-2 py-2 border-b border-slate-300"
                    >
                      {/* Guess */}
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

                      {/* No: (correct numbers wrong position) */}
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

                      {/* Pos (correct position) */}
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
          </div>

          {/* Input Area - Fixed at Bottom */}
          <div className="flex-shrink-0 border-t-2 border-blue-900 bg-[#fffef7] p-4 pl-14">
            <p className="text-xl text-blue-900 mb-3 text-center" style={{ fontFamily: 'Caveat, cursive' }}>
              Your guess:
            </p>
            <div className="flex gap-2 items-center justify-center">
              <Input
                type="text"
                placeholder="????"
                value={currentGuess}
                onChange={(e) => setCurrentGuess(e.target.value.replace(/\D/g, '').slice(0, 4))}
                onKeyPress={handleKeyPress}
                disabled={gameWon}
                maxLength={4}
                className="w-32 text-center tracking-[0.5em] border-2 border-blue-900 bg-white text-2xl h-12"
                style={{ fontFamily: 'Caveat, cursive' }}
              />
              <Button 
                onClick={handleSubmitGuess} 
                disabled={gameWon || currentGuess.length !== 4}
                className="bg-blue-900 hover:bg-blue-800 text-lg px-6 h-12"
                style={{ fontFamily: 'Caveat, cursive' }}
              >
                Check
              </Button>
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
}
