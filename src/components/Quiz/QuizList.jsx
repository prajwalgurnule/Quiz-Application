import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { Link } from "react-router-dom";
import {
  ClockIcon,
  DocumentTextIcon,
  PencilIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  TrophyIcon,
  PuzzlePieceIcon
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const q = query(collection(db, "quizzes"));
        const querySnapshot = await getDocs(q);
        const quizzesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuizzes(quizzesData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };

    fetchQuizzes();
  }, []);

  const refreshQuizzes = () => {
    setIsRefreshing(true);
    const fetchQuizzes = async () => {
      try {
        const q = query(collection(db, "quizzes"));
        const querySnapshot = await getDocs(q);
        const quizzesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuizzes(quizzesData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsRefreshing(false);
      }
    };

    fetchQuizzes();
  };

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
              Explore Quizzes
            </h1>
            <p className="text-gray-600 mt-2">
              Test your knowledge and challenge yourself
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search quizzes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="flex gap-3">
              {/* <button
                onClick={refreshQuizzes}
                disabled={isRefreshing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button> */}
              
              <Link
                to="/create-quiz"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <PuzzlePieceIcon className="h-4 w-4 mr-2" />
                Create Quiz
              </Link>
            </div>
          </div>
        </motion.div>

        {filteredQuizzes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No quizzes found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try a different search term' : 'Be the first to create a quiz!'}
            </p>
            <div className="mt-6">
              <Link
                to="/create-quiz"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Create New Quiz
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredQuizzes.map((quiz) => (
              <motion.div
                key={quiz.id}
                variants={item}
                whileHover={{ y: -5 }}
                className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                        {quiz.title}
                      </h2>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {quiz.description}
                      </p>
                    </div>
                    {quiz.createdBy === auth.currentUser?.uid && (
                      <Link
                        to={`/edit-quiz/${quiz.id}`}
                        className="text-green-600 hover:text-green-800 transition-colors duration-200"
                        title="Edit quiz"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                    )}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>{quiz.timeLimit} min</span>
                    </div>
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-4 w-4 mr-1" />
                      <span>{quiz.questions.length} Qs</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Link
                      to={`/take-quiz/${quiz.id}`}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                    >
                      Take Quiz
                    </Link>
                    {quiz.createdBy === auth.currentUser?.uid && (
                      <Link
                        to={`/quiz-results/${quiz.id}`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                      >
                        Results
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default QuizList;