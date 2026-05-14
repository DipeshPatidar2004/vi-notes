import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/editor', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => { clearError(); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await login(formData.email, formData.password);
    if (success) navigate('/editor', { replace: true });
    setSubmitting(false);
  };

  return (
    <div className="auth-layout">
      <div className="glass-card">
        <div className="card-header">
          <div className="card-icon">🔐</div>
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>
        {error && <div className="alert alert-error"><span>⚠️</span><span>{error}</span></div>}
        <form onSubmit={handleSubmit} id="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div className="input-wrapper">
              <input id="login-email" className="form-input" type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required autoComplete="email" />
              <span className="input-icon">✉️</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="input-wrapper">
              <input id="login-password" className="form-input" type={showPassword ? 'text' : 'password'} name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} required autoComplete="current-password" />
              <span className="input-icon">🔒</span>
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>{showPassword ? '🙈' : '👁️'}</button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting || !formData.email || !formData.password} id="login-submit">
            {submitting ? (<><div className="spinner"></div><span>Signing in...</span></>) : (<><span>Sign In</span><span className="btn-shimmer"></span></>)}
          </button>
        </form>
        <div className="card-footer">Don't have an account? <Link to="/register">Please Register</Link></div>
      </div>
    </div>
  );
}
