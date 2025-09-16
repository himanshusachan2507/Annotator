import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/register', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (error) {
      setErr(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="login-box">
      <h2>Register</h2>
      {err && <div style={{color:'red'}}>{err}</div>}
      <form onSubmit={submit}>
        <div className="form-row">
          <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div className="form-row">
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <div className="form-row">
          <button className="btn">Register</button>
        </div>
      </form>
      <div>Already have an account? <Link to="/login">Login</Link></div>
    </div>
  );
}
