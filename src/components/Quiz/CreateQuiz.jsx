import { useState, useEffect } from 'react';
import { addDoc, collection, serverTimestamp, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useNavigate, useParams } from 'react-router-dom';
import { PlusIcon, TrashIcon, CheckIcon, ClockIcon, PencilIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const CreateQuiz = () => {
  const { quizId } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([
    {
      text: '',
      options: ['', '', '', ''],
      correctAnswer: null,
    },
  ]);
  const [timeLimit, setTimeLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const navigate = useNavigate();

  // Fetch quiz data if in edit mode
  useEffect(() => {
    if (quizId) {
      const fetchQuiz = async () => {
        setLoading(true);
        try {
          const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
          if (quizDoc.exists()) {
            const quizData = quizDoc.data();
            setTitle(quizData.title);
            setDescription(quizData.description);
            setQuestions(quizData.questions);
            setTimeLimit(quizData.timeLimit);
            setIsEditing(true);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchQuiz();
    }
  }, [quizId]);

  // Add a new question
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        options: ['', '', '', ''],
        correctAnswer: null,
      },
    ]);
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
  };

  // Remove a question
  const removeQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  // Handle question text change
  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  // Handle option change
  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  // Set correct answer
  const setCorrectAnswer = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctAnswer = oIndex;
    setQuestions(newQuestions);
  };

  // Add option to a question
  const addOption = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push('');
    setQuestions(newQuestions);
  };

  // Remove option from a question
  const removeOption = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.splice(oIndex, 1);
    
    if (newQuestions[qIndex].correctAnswer === oIndex) {
      newQuestions[qIndex].correctAnswer = null;
    } else if (newQuestions[qIndex].correctAnswer > oIndex) {
      newQuestions[qIndex].correctAnswer -= 1;
    }
    
    setQuestions(newQuestions);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const hasInvalidQuestions = questions.some(q => q.correctAnswer === null || q.correctAnswer === undefined);
    if (hasInvalidQuestions) {
      alert('Please select correct answers for all questions');
      setLoading(false);
      return;
    }

    try {
      if (isEditing) {
        await updateDoc(doc(db, 'quizzes', quizId), {
          title,
          description,
          questions,
          timeLimit,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'quizzes'), {
          title,
          description,
          questions,
          timeLimit,
          createdAt: serverTimestamp(),
          createdBy: auth.currentUser.uid,
        });
      }
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete quiz
  const handleDeleteQuiz = async () => {
    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'quizzes', quizId));
        navigate('/dashboard');
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Quiz' : 'Create New Quiz'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Update your quiz details and questions' : 'Build an engaging quiz for your audience'}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'details' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Quiz Details
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'questions' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Questions ({questions.length})
              </button>
            </nav>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6">
              {activeTab === 'details' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Quiz Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        placeholder="Enter a catchy quiz title"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        placeholder="What's this quiz about?"
                      />
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-1 items-center">
                        <ClockIcon className="h-5 w-5 mr-2 text-green-600" />Time Limit (minutes) *
                        
                      </label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          id="timeLimit"
                          min="1"
                          max="120"
                          value={timeLimit}
                          onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                          className="w-24 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                          required
                        />
                        <span className="ml-3 text-sm text-gray-500">minutes per attempt</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'questions' && (
                <div className="space-y-6">
                  <AnimatePresence>
                    {questions.map((question, qIndex) => (
                      <motion.div
                        key={qIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.2 }}
                        className="bg-gray-50 rounded-lg p-5 border border-gray-200 relative"
                      >
                        <div className="absolute top-3 right-3 flex space-x-2">
                          {questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQuestion(qIndex)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                              title="Remove question"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                        
                        <div className="mb-5">
                          <label htmlFor={`question-${qIndex}`} className="block text-sm font-medium text-gray-700 mb-2">
                            Question {qIndex + 1} *
                          </label>
                          <div className="flex items-center">
                            <div className="bg-green-100 text-black-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold flex-shrink-0">
                              {qIndex + 1}
                            </div>
                            <input
                              type="text"
                              id={`question-${qIndex}`}
                              value={question.text}
                              onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                              placeholder="Enter your question here"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Answer Options *
                          </label>
                          {question.options.map((option, oIndex) => (
                            <motion.div 
                              key={oIndex}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: oIndex * 0.05 }}
                              className="flex items-center group"
                            >
                              <button
                                type="button"
                                onClick={() => setCorrectAnswer(qIndex, oIndex)}
                                className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 transition-all ${
                                  question.correctAnswer === oIndex
                                    ? 'bg-green-500 text-white shadow-md'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                                title={question.correctAnswer === oIndex ? 'Correct answer' : 'Mark as correct'}
                              >
                                {question.correctAnswer === oIndex ? (
                                  <CheckIcon className="h-4 w-4" />
                                ) : (
                                  <span className="text-xs">✓</span>
                                )}
                              </button>
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                placeholder={`Option ${oIndex + 1}`}
                                required
                              />
                              {question.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(qIndex, oIndex)}
                                  className="ml-3 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                  title="Remove option"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              )}
                            </motion.div>
                          ))}
                        </div>
                        
                        {question.options.length < 6 && (
                          <button
                            type="button"
                            onClick={() => addOption(qIndex)}
                            className="mt-4 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <PlusIcon className="-ml-0.5 mr-1.5 h-4 w-4" />
                            Add Option
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  <motion.button
                    type="button"
                    onClick={addQuestion}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:text-green-600 hover:border-green-400 hover:bg-green-50 transition-all flex flex-col items-center justify-center"
                  >
                    <PlusIcon className="h-6 w-6 mb-1" />
                    <span>Add Another Question</span>
                  </motion.button>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between">
              <div className="flex space-x-3">
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleDeleteQuiz}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    <TrashIcon className="-ml-1 mr-2 h-5 w-5" />
                    Delete Quiz
                  </button>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'details' ? 'questions' : 'details')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  {activeTab === 'details' ? (
                    <>
                      <PencilIcon className="-ml-1 mr-2 h-5 w-5" />
                      Edit Questions
                    </>
                  ) : (
                    <>
                      <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
                      Back to Details
                    </>
                  )}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : isEditing ? (
                    'Update Quiz'
                  ) : (
                    'Publish Quiz'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;