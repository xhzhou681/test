import React, { useState, useContext } from 'react';
import { AuthContext } from '../../App';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

export default function Login({ onSwitchToRegister }) {
  const { setIsAuthenticated, isAuthenticated } = React.useContext(AuthContext);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('用户名和密码不能为空');
      return;
    }

    if (formData.password.length < 6) {
      setError('密码长度不能小于6位');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post('/api/auth/login', formData);
      
      const { token } = response.data;
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
        navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || '登录失败，请检查网络连接');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: '500px' }}>
      <h2 className="text-center mb-4">用户登录</h2>
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>用户名</Form.Label>
          <Form.Control
            type="text"
            placeholder="请输入用户名"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            autoComplete="off"
            required
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>密码</Form.Label>
          <Form.Control
            type="password"
            placeholder="请输入密码"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            autoComplete="new-password"
            required
          />
        </Form.Group>

        <div className="d-grid gap-2">
          <Button variant="primary" type="submit" size="lg" disabled={isLoading}>
            {isLoading ? '登录中...' : '登录'}
          </Button>
          <Button variant="outline-secondary" size="lg" onClick={onSwitchToRegister}>
            注册新账号
          </Button>
        </div>
      </Form>
    </Container>
  );
}