import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { HelpCircle, ChevronDown, ChevronUp, Home, Calendar, Users, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Analytics } from '@vercel/analytics/react';

const FAQ = ({ onBackToGame }) => {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const faqData = [
    {
      id: 'what-is',
      question: 'What is the Number Guessing Game?',
      answer: 'The Number Guessing Game is a fun puzzle game where you try to guess a 4-digit secret number. You get feedback on each guess telling you how many digits are correct and in the right position. It\'s like the classic "Mastermind" game but with numbers!'
    },
    {
      id: 'how-to-play',
      question: 'How do I play the game?',
      answer: '1. Enter a 4-digit number (all digits must be different)\n2. Click "Check" to submit your guess\n3. Get feedback:\n   • "Pos" = correct digit in correct position\n   • "No" = correct digit in wrong position\n4. Use the feedback to make your next guess\n5. Try to solve it in as few guesses as possible!'
    },
    {
      id: 'game-modes',
      question: 'What are the different game modes?',
      answer: '• Single Player: Play against the computer\n• Daily Challenge: One game per day with the same number for everyone\n• Multiplayer: Play with friends in real-time\n• With/Without Zero: Choose if 0 can be used in the secret number'
    },
    {
      id: 'daily-challenge',
      question: 'What is the Daily Challenge?',
      answer: 'The Daily Challenge is a special mode where everyone gets the same secret number each day. You can only play once per day, and your stats are tracked. It\'s a great way to compete with friends and see how you compare to other players!'
    },
    {
      id: 'streaks',
      question: 'How do streaks work?',
      answer: 'Your streak increases each day you play the Daily Challenge. If you miss a day, your streak resets. The longer your streak, the more impressive your dedication! We track both your current streak and your longest streak ever.'
    },
    {
      id: 'multiplayer',
      question: 'How does multiplayer work?',
      answer: 'In multiplayer mode, you and a friend each create a secret number, then take turns guessing each other\'s numbers. The first person to guess the other\'s number wins! You can play on different devices by sharing a game code.'
    },
    {
      id: 'unlimited-mode',
      question: 'What is unlimited mode?',
      answer: 'Unlimited mode removes the 6-guess limit, allowing you to keep guessing until you solve the puzzle. This is great for learning the game or if you want to take your time without pressure.'
    },
    {
      id: 'mobile-friendly',
      question: 'Can I play on my phone?',
      answer: 'Yes! The game is fully responsive and works great on mobile devices. We even have a special numpad for mobile users to make entering numbers easier.'
    },
    {
      id: 'privacy',
      question: 'Is my data private?',
      answer: 'Yes! We only store your game statistics (wins, losses, streaks) and don\'t collect any personal information. Your data is stored locally in your browser and on our secure servers.'
    },
    {
      id: 'troubleshooting',
      question: 'The game isn\'t working, what should I do?',
      answer: 'Try these steps:\n1. Refresh the page\n2. Check your internet connection\n3. Make sure JavaScript is enabled\n4. Try using a different browser\n5. Clear your browser cache if needed'
    }
  ];

  const features = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Daily Challenge',
      description: 'One puzzle per day, same for everyone'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Multiplayer',
      description: 'Play with friends in real-time'
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: 'Statistics',
      description: 'Track your wins, losses, and streaks'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-200 to-slate-300 flex items-center justify-center p-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-4xl"
      >
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-blue-900 mb-2" style={{ fontFamily: 'Caveat, cursive' }}>
                Frequently Asked Questions
              </h1>
              <p className="text-lg text-slate-600" style={{ fontFamily: 'Caveat, cursive' }}>
                Everything you need to know about the Number Guessing Game
              </p>
            </div>
            <Button
              onClick={onBackToGame}
              className="bg-blue-900 hover:bg-blue-800 text-white"
              style={{ fontFamily: 'Caveat, cursive' }}
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Game
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-blue-50 p-4 rounded-lg border border-blue-200"
              >
                <div className="flex items-center mb-2">
                  <div className="text-blue-600 mr-3">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Caveat, cursive' }}>
                    {feature.title}
                  </h3>
                </div>
                <p className="text-slate-600 text-sm" style={{ fontFamily: 'Caveat, cursive' }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <button
                onClick={() => toggleSection(faq.id)}
                className="w-full p-6 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Caveat, cursive' }}>
                    {faq.question}
                  </h3>
                  {openSections[faq.id] ? (
                    <ChevronUp className="w-5 h-5 text-blue-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </button>
              
              <AnimatePresence>
                {openSections[faq.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                      <div className="border-t border-slate-200 pt-4">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line" style={{ fontFamily: 'Caveat, cursive' }}>
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 bg-white rounded-lg shadow-xl p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-blue-900 mb-4" style={{ fontFamily: 'Caveat, cursive' }}>
              Ready to Start Playing?
            </h2>
            <p className="text-slate-600 mb-6" style={{ fontFamily: 'Caveat, cursive' }}>
              Join thousands of players in the ultimate number guessing challenge!
            </p>
            <Button
              onClick={onBackToGame}
              size="lg"
              className="bg-blue-900 hover:bg-blue-800 text-white text-lg px-8 py-3"
              style={{ fontFamily: 'Caveat, cursive' }}
            >
              Play Now
            </Button>
          </div>
        </div>

        {/* Vercel Analytics */}
        <Analytics />
      </motion.div>

      {/* Load Caveat font */}
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap" rel="stylesheet" />
    </div>
  );
};

export default FAQ;
