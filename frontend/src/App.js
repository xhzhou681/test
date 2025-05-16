import React, { createContext, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Container } from 'react-bootstrap';
import SearchForm from './components/search/SearchForm';
import { BrowserRouter as Router, Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

export const AuthContext = createContext();

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth必须在AuthProvider中使用');
  }
  return context;
};

function App() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await axios.get('/api/auth/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      } catch (error) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    };
    verifyToken();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      <Container fluid className="p-4">
        <Helmet>
          <title>测试项目效果展示</title>
        </Helmet>
        <h1 className="mb-4 text-center">测试项目效果展示</h1>
        <Routes>
          <Route path="/login" element={<Login onSwitchToRegister={() => navigate('/register')} />} />
          <Route path="/register" element={<Register onSwitchToLogin={() => navigate('/login')} />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <SearchForm />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Container>
    </AuthContext.Provider>
  );
}

export default App;