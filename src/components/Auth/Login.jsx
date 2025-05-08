import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-8 flex items-center justify-center bg-green-100">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md px-6 py-12"
      >
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="text-center mb-5">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              Welcome back
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500"
            >
              Sign in to your account
            </motion.p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm"
              role="alert"
            >
              {error}
            </motion.div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="pt-2"
            >
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-150"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Continue <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 text-center text-sm text-gray-500"
          >
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="font-medium text-green-600 hover:text-green-500 transition-colors"
            >
              Sign up
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;