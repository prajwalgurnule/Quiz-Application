import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';


const PrivateRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;