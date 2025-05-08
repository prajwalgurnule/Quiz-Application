import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/Auth/PrivateRoute';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import QuizList from './components/Quiz/QuizList';
import CreateQuiz from './components/Quiz/CreateQuiz';
import TakeQuiz from './components/Quiz/TakeQuiz';
import Results from './components/Quiz/Results';
import TakeDefaultQuiz from './components/Quiz/TakeDefaultQuiz';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <div className="py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/create-quiz"
                element={
                  <PrivateRoute>
                    <CreateQuiz />
                  </PrivateRoute>
                }
              />
              <Route
                path="/edit-quiz/:quizId"
                element={
                  <PrivateRoute>
                    <CreateQuiz />
                  </PrivateRoute>
                }
              />
              <Route
                path="/quizzes"
                element={
                  <PrivateRoute>
                    <QuizList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/take-quiz/:quizId"
                element={
                  <PrivateRoute>
                    <TakeQuiz />
                  </PrivateRoute>
                }
              />
              <Route
                path="/quiz-results/:quizId"
                element={
                  <PrivateRoute>
                    <Results />
                  </PrivateRoute>
                }
              />
              // Add this route
              <Route path="/take-default-quiz/:quizId" element={<TakeDefaultQuiz />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;