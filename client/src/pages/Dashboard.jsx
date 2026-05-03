import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="dashboard-layout">
      <div className="app-background"></div>
      <nav className="dashboard-nav">
        <span className="nav-brand">VI Notes Project</span>
        <button className="btn btn-ghost" onClick={logout} id="logout-btn">
          Sign Out
        </button>
      </nav>
      <div className="dashboard-content">
        <div className="dashboard-card">
          <div className="avatar">{user ? getInitials(user.name) : '?'}</div>
          <h2>Welcome, {user?.name}!</h2>
          <p className="user-email">{user?.email}</p>
          <p className="user-joined">
            Member since {user?.createdAt ? formatDate(user.createdAt) : '—'}
          </p>
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-value">✓</div>
              <div className="stat-label">Verified</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">🔒</div>
              <div className="stat-label">Secured</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">⚡</div>
              <div className="stat-label">Active</div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={logout} id="dashboard-logout">
            <span>Sign Out</span>
            <span className="btn-shimmer"></span>
          </button>
        </div>
      </div>
    </div>
  );
}
