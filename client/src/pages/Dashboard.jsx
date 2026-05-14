import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api/notes';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [noteStats, setNoteStats] = useState({ wordCount: 0, uniqueKeywords: 0, updatedAt: null });
  const [topKeywords, setTopKeywords] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(API_URL);
        const { keywords, wordCount, updatedAt } = res.data;
        const sorted = Object.entries(keywords || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        setTopKeywords(sorted);
        setNoteStats({
          wordCount: wordCount || 0,
          uniqueKeywords: Object.keys(keywords || {}).length,
          updatedAt: updatedAt ? new Date(updatedAt) : null
        });
      } catch (err) {
        // no note yet — silently ignore
      }
    };
    fetchStats();
  }, []);

  const getInitials = (name) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

  const formatTime = (date) => {
    if (!date) return '—';
    return date.toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-layout">
      <div className="app-background"></div>
      <nav className="dashboard-nav">
        <span className="nav-brand">VI Notes</span>
        <div className="editor-nav-right">
          <div className="nav-profile-chip">
            <div className="nav-avatar" title={user?.name}>{user ? getInitials(user.name) : '?'}</div>
            <div className="nav-profile-info">
              <span className="nav-profile-name">{user?.name || 'User'}</span>
              <span className="nav-profile-email">{user?.email || ''}</span>
            </div>
          </div>
          <button className="btn-danger-sm" onClick={logout} id="logout-btn">
            ⏻ Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content dashboard-content-wide">

        {/* ── Profile Card ── */}
        <div className="dashboard-card">
          <div className="avatar">{user ? getInitials(user.name) : '?'}</div>
          <h2>Welcome, {user?.name}!</h2>
          <p className="user-email">{user?.email}</p>
          <p className="user-joined">
            Member since {user?.createdAt ? formatDate(user.createdAt) : '—'}
          </p>

          {/* Stats row */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-value">{noteStats.wordCount}</div>
              <div className="stat-label">Words Written</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{noteStats.uniqueKeywords}</div>
              <div className="stat-label">Keywords</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">✓</div>
              <div className="stat-label">Verified</div>
            </div>
          </div>

          {/* Top Keywords Preview */}
          {topKeywords.length > 0 && (
            <div className="top-keywords-preview">
              <p className="tkp-title">🔑 Top Keywords</p>
              <div className="tkp-tags">
                {topKeywords.map(([word, count]) => (
                  <span key={word} className="tkp-tag">
                    {word} <span className="tkp-count">{count}</span>
                  </span>
                ))}
              </div>
              {noteStats.updatedAt && (
                <p className="tkp-updated">Last saved: {formatTime(noteStats.updatedAt)}</p>
              )}
            </div>
          )}

          {/* CTA Button */}
          <button
            className="btn btn-primary"
            id="open-editor-btn"
            onClick={() => navigate('/editor')}
            style={{ marginTop: '1.5rem' }}
          >
            <span>✏ Open Editor</span>
            <span className="btn-shimmer"></span>
          </button>
        </div>
      </div>
    </div>
  );
}
