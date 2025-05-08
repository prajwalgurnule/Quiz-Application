import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Link } from 'react-router-dom';
import { ChartBarIcon, DocumentTextIcon, ArrowRightIcon, PlusIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { getAllQuizTypes } from '../data/quizTypes';

const Dashboard = () => {
  const [userQuizzes, setUserQuizzes] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('default');
  const [defaultQuizzes, setDefaultQuizzes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch quizzes created by the user
        const quizzesQuery = query(
          collection(db, 'quizzes'),
          where('createdBy', '==', auth.currentUser.uid)
        );
        const quizzesSnapshot = await getDocs(quizzesQuery);
        const quizzesData = quizzesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUserQuizzes(quizzesData);

        // Fetch quiz results for the user
        const resultsQuery = query(
          collection(db, 'results'),
          where('userId', '==', auth.currentUser.uid)
        );
        const resultsSnapshot = await getDocs(resultsQuery);
        const resultsData = resultsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUserResults(resultsData);

        // Load default quiz types
        const quizTypes = getAllQuizTypes();
        const defaultQuizData = quizTypes.map(type => ({
          id: type.id,
          title: type.display,
          category: type.title,
          isDefault: true,
          questions: [], // Will be loaded when quiz is selected
          icon: type.icon
        }));
        setDefaultQuizzes(defaultQuizData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateAverageScore = () => {
    if (userResults.length === 0) return 0;
    const total = userResults.reduce((sum, result) => sum + (result.score / result.totalQuestions), 0);
    return Math.round((total / userResults.length) * 100);
  };

  const stats = [
    {
      id: 1,
      name: 'Quizzes Created',
      value: userQuizzes.length,
      icon: DocumentTextIcon,
      color: 'purple',
      trend: userQuizzes.length > 0 ? 'up' : 'none'
    },
    {
      id: 2,
      name: 'Average Score',
      value: `${calculateAverageScore()}%`,
      icon: ChartBarIcon,
      color: 'blue',
      trend: calculateAverageScore() > 70 ? 'up' : calculateAverageScore() > 40 ? 'steady' : 'down'
    },
    {
      id: 3,
      name: 'Quizzes Taken',
      value: userResults.length,
      icon: AcademicCapIcon,
      color: 'emerald',
      trend: userResults.length > 0 ? 'up' : 'none'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading quizzes...</h2>
          <p className="text-gray-500 mt-2">Preparing your learning adventure</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-600">Your Dashboard</span>
        </h1>
        {userResults.some(r => r.score / r.totalQuestions >= 0.9) && (
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center bg-yellow-50 px-4 py-2 rounded-full"
          >
            <SparklesIcon className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="text-sm font-medium text-yellow-700">Quiz Master!</span>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat) => (
          <motion.div
            key={stat.id}
            whileHover={{ y: -5 }}
            className={`bg-white rounded-xl shadow-md overflow-hidden border-l-4 ${
              stat.color === 'purple' ? 'border-purple-500' : 
              stat.color === 'emerald' ? 'border-emerald-500' : 'border-blue-500'
            }`}
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${
                  stat.color === 'purple' ? 'bg-purple-100 text-purple-600' : 
                  stat.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">{stat.name}</h3>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
              {stat.trend !== 'none' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`mt-4 text-sm ${
                    stat.trend === 'up' ? 'text-emerald-600' : 
                    stat.trend === 'down' ? 'text-red-600' : 'text-yellow-600'
                  }`}
                >
                  {stat.trend === 'up' ? '↑ Improving' : stat.trend === 'down' ? '↓ Needs work' : '→ Steady'}
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
          <button
              onClick={() => setActiveTab('default')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'default'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Default Quizzes
            </button>
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'quizzes'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Your Created Quizzes
            </button>
            
            <button
              onClick={() => setActiveTab('results')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'results'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Your Results
            </button>
          </nav>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === 'quizzes' ? -20 : activeTab === 'results' ? 20 : 0 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeTab === 'quizzes' ? -20 : activeTab === 'results' ? 20 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'quizzes' ? (
            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Your Created Quizzes</h2>
                <Link
                  to="/create-quiz"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-medium rounded-lg shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create New Quiz
                </Link>
              </div>
              
              {userQuizzes.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-12 text-center"
                >
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No quizzes yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating your first quiz!</p>
                  <div className="mt-6">
                    <Link
                      to="/create-quiz"
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-medium rounded-lg shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create Quiz
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {userQuizzes.map((quiz, index) => (
                    <motion.li
                      key={quiz.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <Link to={`/take-quiz/${quiz.id}`} className="block group">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">
                              {quiz.title}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {quiz.questions.length} questions • {quiz.category || 'General'}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-emerald-600 mr-2">
                              View
                            </span>
                            <ArrowRightIcon className="h-4 w-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          ) : activeTab === 'default' ? (
            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Default Quizzes</h2>
                <p className="mt-1 text-sm text-gray-500">Practice with these pre-made quizzes on various technologies</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {defaultQuizzes.map((quiz, index) => (
                  <motion.div
                    key={quiz.id}
                    whileHover={{ y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <Link to={`/take-default-quiz/${quiz.id}`} className="block">
                      <div className="p-6">
                        <div className="flex items-center justify-center mb-4">
                          <img src={quiz.icon} alt={quiz.title} className="h-16 w-16 object-contain" />
                        </div>
                        <h3 className="text-lg font-medium text-center text-gray-900">
                          {quiz.title}
                        </h3>
                        <div className="mt-4 flex justify-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            Start Quiz
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Recent Results</h2>
              </div>
              
              {userResults.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-12 text-center"
                >
                  <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No results yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Take some quizzes to see your results here!</p>
                  <div className="mt-6">
                    <Link
                      to="/quizzes"
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-medium rounded-lg shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all"
                    >
                      Browse Quizzes
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {userResults.slice(0, 5).map((result, index) => {
                    const percentage = Math.round((result.score / result.totalQuestions) * 100);
                    return (
                      <motion.li
                        key={result.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-medium text-gray-900">{result.quizTitle}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              percentage >= 80 ? 'bg-emerald-100 text-emerald-800' :
                              percentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {percentage}%
                            </span>
                          </div>
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                                className={`h-2.5 rounded-full ${
                                  percentage >= 80 ? 'bg-emerald-500' :
                                  percentage >= 50 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                              />
                            </div>
                          </div>
                          <div className="mt-3 flex justify-between text-sm text-gray-500">
                            <span>Score: {result.score}/{result.totalQuestions}</span>
                            <span>
                              {new Date(result.completedAt?.seconds * 1000).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;