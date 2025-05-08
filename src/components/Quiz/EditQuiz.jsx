import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusIcon, TrashIcon
 } from '@heroicons/react/24/outline';

const questionTypes = [
  { id: 'multiple', name: 'Multiple Choice' },
  { id: 'truefalse', name: 'True/False' },
  { id: 'shortanswer', name: 'Short Answer' },
];

const EditQuiz = () => {
  const { quizId } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [timeLimit, setTimeLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
        if (quizDoc.exists()) {
          const quizData = quizDoc.data();
          setTitle(quizData.title);
          setDescription(quizData.description);
          setQuestions(quizData.questions);
          setTimeLimit(quizData.timeLimit);
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error(err);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, navigate]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        type: 'multiple',
        options: ['', '', '', ''],
        correctAnswer: 0,
        imageUrl: '',
      },
    ]);
  };

  const removeQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    
    if (field === 'type') {
      if (value === 'truefalse') {
        newQuestions[index].correctAnswer = true;
        newQuestions[index].options = ['True', 'False'];
      } else if (value === 'shortanswer') {
        newQuestions[index].correctAnswer = '';
        newQuestions[index].options = [];
      } else {
        newQuestions[index].correctAnswer = 0;
        newQuestions[index].options = ['', '', '', ''];
      }
    }
    
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const addOption = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push('');
    setQuestions(newQuestions);
  };

  const removeOption = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.splice(oIndex, 1);
    
    if (newQuestions[qIndex].type === 'multiple' && 
        newQuestions[qIndex].correctAnswer >= oIndex) {
      newQuestions[qIndex].correctAnswer = Math.max(0, newQuestions[qIndex].correctAnswer - 1);
    }
    
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (qIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctAnswer = value;
    setQuestions(newQuestions);
  };

  const handleImageUrlChange = (qIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].imageUrl = value;
    setQuestions(newQuestions);
  };

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    setSaving(true);

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        alert(`Question ${i + 1} text cannot be empty`);
        setSaving(false);
        return;
      }

      if (q.type === 'multiple' && q.options.some(opt => !opt.trim())) {
        alert(`Question ${i + 1} has empty options`);
        setSaving(false);
        return;
      }

      if (q.type === 'shortanswer' && !q.correctAnswer.trim()) {
        alert(`Question ${i + 1} needs a correct answer`);
        setSaving(false);
        return;
      }
    }

    try {
      await updateDoc(doc(db, 'quizzes', quizId), {
        title,
        description,
        questions,
        timeLimit,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to update quiz');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'quizzes', quizId));
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to delete quiz');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading quiz...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Quiz</h1>
        <button
          onClick={handleDeleteQuiz}
          disabled={deleting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        >
          <TrashIcon className="-ml-1 mr-2 h-5 w-5" />
          {deleting ? 'Deleting...' : 'Delete Quiz'}
        </button>
      </div>
      
      <form onSubmit={handleUpdateQuiz}>
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Quiz Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-1">
              Time Limit (minutes) *
            </label>
            <input
              type="number"
              id="timeLimit"
              min="1"
              value={timeLimit}
              onChange={(e) => setTimeLimit(parseInt(e.target.value))}
              className="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        </div>

        {questions.map((question, qIndex) => (
          <div key={qIndex} className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Question {qIndex + 1}</h2>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Type *
              </label>
              <select
                value={question.type}
                onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {questionTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor={`question-${qIndex}`} className="block text-sm font-medium text-gray-700 mb-1">
                Question Text *
              </label>
              <input
                type="text"
                id={`question-${qIndex}`}
                value={question.text}
                onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL (optional)
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={question.imageUrl}
                  onChange={(e) => handleImageUrlChange(qIndex, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://example.com/image.jpg"
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500">
                  {/* <PhotographIcon className="h-5 w-5" /> */}
                </span>
              </div>
              {question.imageUrl && (
                <div className="mt-2">
                  <img 
                    src={question.imageUrl} 
                    alt="Question preview" 
                    className="max-h-40 rounded-md"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            
            {question.type === 'multiple' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options *
                </label>
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center mb-2">
                    <input
                      type="radio"
                      name={`correct-answer-${qIndex}`}
                      checked={question.correctAnswer === oIndex}
                      onChange={() => handleCorrectAnswerChange(qIndex, oIndex)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                      className="ml-2 flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                    {question.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(qIndex, oIndex)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addOption(qIndex)}
                  className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PlusIcon className="-ml-0.5 mr-1.5 h-4 w-4" />
                  Add Option
                </button>
              </div>
            )}
            
            {question.type === 'truefalse' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correct Answer *
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`correct-answer-${qIndex}`}
                      checked={question.correctAnswer === true}
                      onChange={() => handleCorrectAnswerChange(qIndex, true)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-2 text-gray-700">True</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`correct-answer-${qIndex}`}
                      checked={question.correctAnswer === false}
                      onChange={() => handleCorrectAnswerChange(qIndex, false)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-2 text-gray-700">False</span>
                  </label>
                </div>
              </div>
            )}
            
            {question.type === 'shortanswer' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correct Answer *
                </label>
                <input
                  type="text"
                  value={question.correctAnswer}
                  onChange={(e) => handleCorrectAnswerChange(qIndex, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-between">
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Question
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditQuiz;