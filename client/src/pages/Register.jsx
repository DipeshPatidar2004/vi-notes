import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const { register, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/editor', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => { clearError(); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) clearError();
    if (localError) setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }
    setSubmitting(true);
    const success = await register(formData.name, formData.email, formData.password);
    if (success) navigate('/editor', { replace: true });
    setSubmitting(false);
  };

  const displayError = localError || error;

  return (
    <div className="auth-layout">
      <div className="glass-card">
        <div className="card-header">
          <div className="card-icon">✨</div>
          <h1>Create Account</h1>
          <p>Join us and get started today</p>
        </div>
        {displayError && <div className="alert alert-error"><span>⚠️</span><span>{displayError}</span></div>}
        <form onSubmit={handleSubmit} id="register-form">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <div className="input-wrapper">
              <input id="reg-name" className="form-input" type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
              <span className="input-icon">👤</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <div className="input-wrapper">
              <input id="reg-email" className="form-input" type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required autoComplete="email" />
              <span className="input-icon">✉️</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div className="input-wrapper">
              <input id="reg-password" className="form-input" type={showPassword ? 'text' : 'password'} name="password" placeholder="Min. 6 characters" value={formData.password} onChange={handleChange} required autoComplete="new-password" />
              <span className="input-icon">🔒</span>
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>{showPassword ? '🙈' : '👁️'}</button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
            <div className="input-wrapper">
              <input id="reg-confirm" className="form-input" type={showPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleChange} required autoComplete="new-password" />
              <span className="input-icon">🔒</span>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting || !formData.name || !formData.email || !formData.password || !formData.confirmPassword} id="register-submit">
            {submitting ? (<><div className="spinner"></div><span>Creating account...</span></>) : (<><span>Create Account</span><span className="btn-shimmer"></span></>)}
          </button>
        </form>
        <div className="card-footer">Already have an account? <Link to="/login">Sign in</Link></div>
      </div>
    </div>
  );
}
