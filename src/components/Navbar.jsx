import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ArrowLeftOnRectangleIcon, LightBulbIcon, ChartBarIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-green-600 to-emerald-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link 
                to="/dashboard" 
                className="flex items-center text-2xl font-extrabold text-white"
              >
                <LightBulbIcon className="h-8 w-8 mr-2 text-yellow-300" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-white">
                  QuizGenius
                </span>
              </Link>
            </div>
            {user && (
              <div className="hidden sm:ml-10 sm:flex sm:space-x-6">
                <Link
                  to="/dashboard"
                  className="text-white hover:bg-emerald-600 hover:bg-opacity-30 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-200"
                >
                  <ChartBarIcon className="h-5 w-5 mr-1" />
                  Dashboard
                </Link>
                <Link
                  to="/quizzes"
                  className="text-white hover:bg-emerald-600 hover:bg-opacity-30 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  My Quizzes
                </Link>
                <Link
                  to="/create-quiz"
                  className="text-white hover:bg-emerald-600 hover:bg-opacity-30 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-200"
                >
                  <PlusCircleIcon className="h-5 w-5 mr-1" />
                  Create Quiz
                </Link>  
              </div>
            )}
          </div>
          {user && (
            <div className="hidden sm:flex sm:items-center">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-red-700 bg-white hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:scale-105"
              >
                {/* <ArrowLeftOnRectangleIcon className="-ml-1 mr-2 h-5 w-5" /> */}
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {user && (
        <div className="sm:hidden bg-emerald-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className="text-white block px-3 py-2 rounded-md text-base font-medium flex items-center"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
            <Link
              to="/create-quiz"
              className="text-white block px-3 py-2 rounded-md text-base font-medium flex items-center"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Create Quiz
            </Link>
            <Link
              to="/quizzes"
              className="text-white block px-3 py-2 rounded-md text-base font-medium flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              My Quizzes
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left text-white block px-3 py-2 rounded-md text-base font-medium flex items-center"
            >
              {/* <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" /> */}
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;