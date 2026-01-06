import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login'
import Signup from './pages/Signup';
import Home from './pages/Home';
import { useState } from 'react';
import RefreshHandler from './RefreshHandler';
import Tracked from './Tracked';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EmailVerification from './pages/EmailVerification';
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />
  }
  return (
    <div className="App">
      <RefreshHandler setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path='/' element={<Navigate to="/login" />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify" element={<EmailVerification />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path='/home' element={<PrivateRoute element={<Home />} />} />
        <Route path='/tracked' element={<PrivateRoute element={<Tracked />} />} />
      </Routes>
    </div>
  );
}
export default App;