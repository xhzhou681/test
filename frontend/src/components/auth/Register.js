import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

export default function Register({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState([]);

  const validateForm = () => {
    const newErrors = [];
    if (!/^\w{4,20}$/.test(formData.username)) {
      newErrors.push('用户名需4-20位字母数字');
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.push('邮箱格式不正确');
    }
    if (formData.password.length < 6) {
      newErrors.push('密码至少6位');
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.push('两次密码不一致');
    }
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      const response = await axios.post('/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      if (response.data.success) {
        onSwitchToLogin();
      } else {
        setErrors([response.data.message || '注册失败']);
      }
    } catch (error) {
      setErrors(['连接服务器失败，请检查网络']);
      console.error('注册请求错误:', error);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: '500px' }}>
      <h2 className="text-center mb-4">用户注册</h2>
      {errors.length > 0 && (
        <Alert variant="danger" className="mb-3">
          {errors.map((err, i) => (
            <div key={i}>{err}</div>
          ))}
        </Alert>
      )}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>用户名</Form.Label>
          <Form.Control
            type="text"
            placeholder="4-20位字母数字"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            autoComplete="off"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>电子邮箱</Form.Label>
          <Form.Control
            type="email"
            placeholder="example@domain.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            autoComplete="off"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>密码</Form.Label>
          <Form.Control
            type="password"
            placeholder="至少6位"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            autoComplete="new-password"
            required
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>确认密码</Form.Label>
          <Form.Control
            type="password"
            placeholder="再次输入密码"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            autoComplete="new-password"
            required
          />
        </Form.Group>

        <div className="d-grid gap-2 mb-3">
          <Button variant="primary" type="submit" size="lg">
            立即注册
          </Button>
          <Button variant="outline-danger" size="lg" onClick={onSwitchToLogin}>
            返回登录
          </Button>
        </div>
      </Form>
    </Container>
  );
}