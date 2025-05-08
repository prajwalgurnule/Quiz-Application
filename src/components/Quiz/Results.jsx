import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { CheckCircleIcon, XCircleIcon, TrophyIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const Results = () => {
  const { quizId } = useParams();
  const location = useLocation();
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    });

    // Check if coming from quiz completion
    if (location.state) {
      setScore(location.state.score);
      setTotalQuestions(location.state.totalQuestions);
      setAnswers(location.state.answers);
      setQuestions(location.state.questions);
      setLoading(false);
      setShowConfetti(true);
      
      // Hide confetti after 5 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      // Fetch results if page is refreshed
      const fetchResults = async () => {
        try {
          const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
          if (quizDoc.exists()) {
            const quizData = quizDoc.data();
            setQuestions(quizData.questions);
            setTotalQuestions(quizData.questions.length);
            
            const resultsQuery = query(
              collection(db, 'results'),
              where('quizId', '==', quizId),
              where('userId', '==', auth.currentUser.uid)
            );
            const querySnapshot = await getDocs(resultsQuery);
            
            if (!querySnapshot.empty) {
              const resultData = querySnapshot.docs[0].data();
              setScore(resultData.score);
              setAnswers(resultData.answers);
            }
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchResults();
    }
  }, [quizId, location.state]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 bg-white rounded-xl shadow-lg"
        >
          <div className="flex justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
            />
          </div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading results...</p>
        </motion.div>
      </div>
    );
  }

  if (totalQuestions === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white rounded-xl shadow-lg"
        >
          <div className="w-16 h-16 mx-auto bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <LightBulbIcon className="h-10 w-10 text-indigo-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Results Found</h2>
          <p className="text-gray-600 mb-6">It looks like you haven't taken this quiz yet.</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Take the Quiz
          </button>
        </motion.div>
      </div>
    );
  }

  const percentage = Math.round((score / totalQuestions) * 100);
  
  let performanceMessage, performanceIcon, performanceColor;
  if (percentage >= 80) {
    performanceMessage = 'Excellent!';
    performanceIcon = <TrophyIcon className="h-6 w-6 text-yellow-500" />;
    performanceColor = 'from-green-400 to-emerald-500';
  } else if (percentage >= 60) {
    performanceMessage = 'Good job!';
    performanceIcon = <EmojiHappyIcon className="h-6 w-6 text-blue-500" />;
    performanceColor = 'from-blue-400 to-cyan-500';
  } else if (percentage >= 40) {
    performanceMessage = 'Not bad!';
    performanceIcon = <EmojiHappyIcon className="h-6 w-6 text-indigo-500" />;
    performanceColor = 'from-indigo-400 to-purple-500';
  } else {
    performanceMessage = 'Keep practicing!';
    performanceIcon = <EmojiSadIcon className="h-6 w-6 text-red-500" />;
    performanceColor = 'from-red-400 to-pink-500';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-8 px-4">
      {showConfetti && (
        <Confetti
          width={dimensions.width}
          height={dimensions.height}
          recycle={false}
          numberOfPieces={500}
        />
      )}
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`bg-gradient-to-r ${performanceColor} rounded-2xl shadow-lg text-white overflow-hidden mb-6`}
        >
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0 text-center md:text-left">
                <h1 className="text-2xl font-bold mb-2">Quiz Results</h1>
                <div className="flex items-center justify-center md:justify-start">
                  {performanceIcon}
                  <p className="ml-2 text-lg">{performanceMessage}</p>
                </div>
                <p className="mt-2 text-indigo-100">Your score:</p>
                <p className="text-4xl font-bold">
                  {score} / {totalQuestions}
                </p>
              </div>
              
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
                className="relative w-32 h-32"
              >
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeDasharray={`${percentage}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{percentage}%</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Question Review */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Question Review</h2>
          </div>
          
          <AnimatePresence>
            {questions.map((question, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="p-6 border-b border-gray-200 last:border-b-0"
              >
                <div className="flex items-start">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mr-3 mt-1"
                  >
                    {answers[index] === question.correctAnswer ? (
                      <CheckCircleIcon className="h-6 w-6 text-green-500" />
                    ) : (
                      <XCircleIcon className="h-6 w-6 text-red-500" />
                    )}
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-md font-medium text-gray-900">{question.text}</h3>
                    <div className="mt-3 space-y-2">
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-sm p-3 rounded-lg bg-gray-50"
                      >
                        <span className="font-medium">Your answer:</span>{' '}
                        <span
                          className={
                            answers[index] === question.correctAnswer
                              ? 'text-green-600 font-medium'
                              : 'text-red-600 font-medium'
                          }
                        >
                          {question.options[answers[index]]}
                        </span>
                      </motion.p>
                      {answers[index] !== question.correctAnswer && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-sm p-3 rounded-lg bg-green-50"
                        >
                          <span className="font-medium">Correct answer:</span>{' '}
                          <span className="text-green-600 font-medium">
                            {question.options[question.correctAnswer]}
                          </span>
                        </motion.p>
                      )}
                    </div>
                  </div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="ml-4 text-sm font-medium"
                  >
                    {answers[index] === question.correctAnswer ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        +1
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        0
                      </span>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Results;