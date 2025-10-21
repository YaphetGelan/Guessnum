import { Button } from './ui/button';
import { Home, Calendar, Users, Trophy, Star, Zap, Target, Gamepad2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Analytics } from '@vercel/analytics/react';

const About = ({ onBackToGame }) => {
  const features = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Daily Challenge',
      description: 'One puzzle per day, same secret number for everyone. Compete with players worldwide!',
      color: 'text-green-600'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Real-time Multiplayer',
      description: 'Play with friends on different devices. Create or join games instantly!',
      color: 'text-purple-600'
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Statistics & Streaks',
      description: 'Track your wins, losses, and build impressive daily streaks!',
      color: 'text-yellow-600'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Multiple Game Modes',
      description: 'Choose between with/without zero, unlimited guesses, and more!',
      color: 'text-blue-600'
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Mobile Optimized',
      description: 'Perfect gameplay on any device with our custom mobile numpad!',
      color: 'text-orange-600'
    },
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: 'Easy to Learn',
      description: 'Simple rules, instant feedback, and addictive gameplay for all ages!',
      color: 'text-red-600'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Daily Players' },
    { number: '50,000+', label: 'Games Played' },
    { number: '95%', label: 'Player Satisfaction' },
    { number: '24/7', label: 'Available' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-200 to-slate-300 flex items-center justify-center p-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-6xl"
      >
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold text-blue-900 mb-4" style={{ fontFamily: 'Caveat, cursive' }}>
                About Number Guessing Game
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl" style={{ fontFamily: 'Caveat, cursive' }}>
                The ultimate puzzle game that challenges your logic and deduction skills. 
                Guess the secret 4-digit number and compete with players worldwide!
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

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center bg-blue-50 p-4 rounded-lg border border-blue-200"
              >
                <div className="text-3xl font-bold text-blue-900 mb-2" style={{ fontFamily: 'Caveat, cursive' }}>
                  {stat.number}
                </div>
                <div className="text-sm text-slate-600" style={{ fontFamily: 'Caveat, cursive' }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className={`${feature.color} mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-3" style={{ fontFamily: 'Caveat, cursive' }}>
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed" style={{ fontFamily: 'Caveat, cursive' }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* How to Play */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center" style={{ fontFamily: 'Caveat, cursive' }}>
            How to Play
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-blue-900 mb-4" style={{ fontFamily: 'Caveat, cursive' }}>
                Basic Rules
              </h3>
              <ul className="space-y-3" style={{ fontFamily: 'Caveat, cursive' }}>
                <li className="flex items-start">
                  <Star className="w-5 h-5 text-yellow-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-slate-700">Enter a 4-digit number (all digits must be different)</span>
                </li>
                <li className="flex items-start">
                  <Star className="w-5 h-5 text-yellow-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-slate-700">Get feedback on each guess</span>
                </li>
                <li className="flex items-start">
                  <Star className="w-5 h-5 text-yellow-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-slate-700">Use logic to solve the puzzle</span>
                </li>
                <li className="flex items-start">
                  <Star className="w-5 h-5 text-yellow-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-slate-700">Try to solve in as few guesses as possible!</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-blue-900 mb-4" style={{ fontFamily: 'Caveat, cursive' }}>
                Feedback System
              </h3>
              <div className="space-y-3" style={{ fontFamily: 'Caveat, cursive' }}>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-200 border border-green-600 rounded-full flex items-center justify-center text-green-900 font-bold mr-3">
                    Pos
                  </div>
                  <span className="text-slate-700">Correct digit in correct position</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-200 border border-orange-600 rounded-full flex items-center justify-center text-orange-900 font-bold mr-3">
                    No
                  </div>
                  <span className="text-slate-700">Correct digit in wrong position</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Modes */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center" style={{ fontFamily: 'Caveat, cursive' }}>
            Game Modes
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
              <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-blue-900 mb-3" style={{ fontFamily: 'Caveat, cursive' }}>
                Daily Challenge
              </h3>
              <p className="text-slate-600" style={{ fontFamily: 'Caveat, cursive' }}>
                One puzzle per day, same for everyone. Compete globally!
              </p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
              <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-purple-900 mb-3" style={{ fontFamily: 'Caveat, cursive' }}>
                Multiplayer
              </h3>
              <p className="text-slate-600" style={{ fontFamily: 'Caveat, cursive' }}>
                Play with friends in real-time on different devices.
              </p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
              <Gamepad2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-900 mb-3" style={{ fontFamily: 'Caveat, cursive' }}>
                Single Player
              </h3>
              <p className="text-slate-600" style={{ fontFamily: 'Caveat, cursive' }}>
                Practice mode with unlimited games and custom settings.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Caveat, cursive' }}>
            Ready to Start Playing?
          </h2>
          <p className="text-xl mb-6 opacity-90" style={{ fontFamily: 'Caveat, cursive' }}>
            Join thousands of players in the ultimate number guessing challenge!
          </p>
          <Button
            onClick={onBackToGame}
            size="lg"
            className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-8 py-3"
            style={{ fontFamily: 'Caveat, cursive' }}
          >
            Play Now
          </Button>
        </div>

        {/* Vercel Analytics */}
        <Analytics />
      </motion.div>

      {/* Load Caveat font */}
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap" rel="stylesheet" />
    </div>
  );
};

export default About;
