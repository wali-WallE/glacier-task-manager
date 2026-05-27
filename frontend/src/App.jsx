import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import api from './api/axios';

const PrivateRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const verifySession = async () => {
      try {
        await api.get('/teams');
        setIsAuth(true);
      } catch (error) {
        setIsAuth(false);
      }
    };
    verifySession();
  }, []);

  if (isAuth === null) {
    return <div className="min-h-screen bg-[#EDE9E6] flex items-center justify-center text-[#5C4F4A]/50">Verifying session...</div>;
  }

  return isAuth ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;