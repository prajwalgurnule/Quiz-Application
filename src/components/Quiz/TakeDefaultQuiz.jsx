import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { getQuizTypeById } from '../../data/quizTypes';
import ReactQuiz from '../../assets/data/react-questions.json';
import JavaScriptQuiz from '../../assets/data/javascript-questions.json';
import PythonQuiz from '../../assets/data/python-questions.json';
import WebDevQuiz from '../../assets/data/webdev-questions.json';
import TailwindQuiz from '../../assets/data/tailwindcss-questions.json';
import Default from '../../assets/data/default-questions.json'

const TakeDefaultQuiz = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Load the appropriate quiz based on quizId
    const loadQuiz = () => {
      let quizData;
      switch(quizId) {
        case 'react':
          quizData = ReactQuiz;
          break;
        case 'javascript':
          quizData = JavaScriptQuiz;
          break;
        case 'python':
          quizData = PythonQuiz;
          break;
        case 'webdev':
          quizData = WebDevQuiz;
          break;
        case 'tailwindcss':
          quizData = TailwindQuiz;
          break;
        default:
          quizData = Default;
      }

      const quizType = getQuizTypeById(quizId);
      
      setQuiz({
        title: quizData.quizTitle,
        questions: quizData.questions.map(q => ({
          text: q.question,
          options: q.choices,
          correctAnswer: q.correctAnswer
        })),
        timeLimit: 10, // 10 minutes default
        category: quizType.title,
        isDefault: true
      });
      
      setTimeLeft(10 * 60); // 10 minutes in seconds
      setLoading(false);
    };

    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && !quizFinished) {
      handleFinishQuiz();
    }
  }, [timeLeft, quizFinished]);

  useEffect(() => {
    if (quiz) {
      const newProgress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
      setProgress(newProgress);
    }
  }, [currentQuestionIndex, quiz]);

  const handleOptionSelect = (optionIndex) => {
    if (showFeedback) return;
    setSelectedOption(optionIndex);
  };

  const handleNextQuestion = () => {
    if (selectedOption === null) return;

    // Show feedback
    const currentQuestion = quiz.questions[currentQuestionIndex];
    setIsCorrect(selectedOption === currentQuestion.correctAnswer);
    setShowFeedback(true);

    // After 1.5 seconds, move to next question
    setTimeout(() => {
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = selectedOption;
      setAnswers(newAnswers);
      setShowFeedback(false);

      if (currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(answers[currentQuestionIndex + 1] ?? null);
      } else {
        handleFinishQuiz();
      }
    }, 1500);
  };

  const handleFinishQuiz = async () => {
    setQuizFinished(true);
    
    // Calculate score
    const finalAnswers = [...answers];
    if (selectedOption !== null && currentQuestionIndex < quiz.questions.length) {
      finalAnswers[currentQuestionIndex] = selectedOption;
    }

    const score = quiz.questions.reduce((acc, question, index) => {
      return acc + (finalAnswers[index] === question.correctAnswer ? 1 : 0);
    }, 0);

    // Save results
    try {
      await addDoc(collection(db, 'results'), {
        quizId,
        quizTitle: quiz.title,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Anonymous',
        answers: finalAnswers,
        score,
        totalQuestions: quiz.questions.length,
        completedAt: new Date(),
        isDefaultQuiz: true
      });
    } catch (err) {
      console.error('Failed to save results:', err);
    }

    navigate(`/quiz-results/${quizId}`, {
      state: {
        score,
        totalQuestions: quiz.questions.length,
        answers: finalAnswers,
        questions: quiz.questions,
        isDefaultQuiz: true
      },
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-indigo-700">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quiz Not Found</h2>
          <p className="text-gray-600 mb-6">The quiz you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Browse Quizzes
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-3xl mx-auto">
        {/* Header with progress */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex justify-between items-center mb-4">
            <motion.h1 
              key={`title-${currentQuestionIndex}`}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-2xl font-bold"
            >
              {quiz.title}
            </motion.h1>
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="flex items-center bg-white/20 px-3 py-1 rounded-full"
            >
              <ClockIcon className="h-5 w-5 mr-1" />
              <span className="font-medium">{formatTime(timeLeft)}</span>
            </motion.div>
          </div>
          
          <div className="mb-2 text-sm font-medium flex justify-between">
            <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          
          <div className="w-full bg-white/20 rounded-full h-2.5">
            <motion.div 
              className="bg-white h-2.5 rounded-full" 
              initial={{ width: `${progress}%` }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Question area */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`question-${currentQuestionIndex}`}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <h2 className="text-xl font-medium text-gray-900 mb-6 leading-relaxed">
                {currentQuestion.text}
              </h2>
              
              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOptionSelect(index)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedOption === index
                        ? showFeedback
                          ? isCorrect
                            ? 'border-green-500 bg-green-50 shadow-green-sm'
                            : 'border-red-500 bg-red-50 shadow-red-sm'
                          : 'border-indigo-500 bg-indigo-50 shadow-indigo-sm'
                        : 'border-gray-200 hover:border-indigo-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center">
                      {showFeedback && selectedOption === index && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="mr-3"
                        >
                          {isCorrect ? (
                            <CheckCircleIcon className="h-6 w-6 text-green-500" />
                          ) : (
                            <XCircleIcon className="h-6 w-6 text-red-500" />
                          )}
                        </motion.div>
                      )}
                      <span className={`font-medium ${
                        selectedOption === index && showFeedback
                          ? isCorrect ? 'text-green-700' : 'text-red-700'
                          : 'text-gray-800'
                      }`}>
                        {option}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer with action button */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleNextQuestion}
            disabled={selectedOption === null || showFeedback}
            className={`px-6 py-3 rounded-xl text-white font-medium shadow-md transition-all ${
              selectedOption === null || showFeedback
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
            }`}
          >
            {currentQuestionIndex < quiz.questions.length - 1 ? (
              <span>Next Question →</span>
            ) : (
              <span>Finish Quiz 🎉</span>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default TakeDefaultQuiz;