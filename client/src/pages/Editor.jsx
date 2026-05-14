import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api/notes';
const AUTOSAVE_DELAY = 2000;

export default function Editor() {
  const { user, logout } = useAuth();

  // ── Notes list state
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);

  // ── Active note state
  const [title, setTitle]           = useState('Untitled Note');
  const [content, setContent]       = useState('');
  const [wordCount, setWordCount]   = useState(0);
  const [charCount, setCharCount]   = useState(0);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [lastSaved, setLastSaved]   = useState(null);
  const [loadError, setLoadError]   = useState(null);

  const debounceTimer = useRef(null);
  const textareaRef   = useRef(null);

  // ── Load notes list
  const fetchNotes = useCallback(async () => {
    try {
      const res = await axios.get(API_URL);
      setNotes(res.data);
      return res.data;
    } catch (err) {
      setLoadError('Failed to load notes.');
      return [];
    }
  }, []);

  // ── Initial load
  useEffect(() => {
    const init = async () => {
      const list = await fetchNotes();
      if (list.length > 0) {
        loadNote(list[0]._id);
      }
    };
    init();
  }, []);

  // ── Load a single note into the editor
  const loadNote = async (id) => {
    try {
      const res = await axios.get(`${API_URL}/${id}`);
      const { _id, content: saved, title: savedTitle, updatedAt } = res.data;
      setActiveNoteId(_id);
      setTitle(savedTitle || 'Untitled Note');
      setContent(saved || '');
      recalc(saved || '');
      if (updatedAt) setLastSaved(new Date(updatedAt));
      setSaveStatus('idle');
      setLoadError(null);
    } catch (err) {
      setLoadError('Failed to load note.');
    }
  };

  function recalc(text) {
    const words = text.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
    setCharCount(text.length);
  }

  // ── Auto-save
  const triggerAutoSave = useCallback((noteId, text, noteTitle) => {
    if (!noteId) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setSaveStatus('unsaved');
    debounceTimer.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const res = await axios.put(`${API_URL}/${noteId}`, { content: text, title: noteTitle });
        setLastSaved(new Date(res.data.updatedAt));
        setSaveStatus('saved');
        // Update list title in sidebar
        setNotes(prev => prev.map(n => n._id === noteId ? { ...n, title: res.data.title, wordCount: res.data.wordCount, updatedAt: res.data.updatedAt } : n));
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch {
        setSaveStatus('error');
      }
    }, AUTOSAVE_DELAY);
  }, []);

  const handleChange = (e) => {
    const text = e.target.value;
    setContent(text);
    recalc(text);
    triggerAutoSave(activeNoteId, text, title);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    triggerAutoSave(activeNoteId, content, e.target.value);
  };

  // ── Create new note
  const createNewNote = async () => {
    try {
      const res = await axios.post(`${API_URL}/create`);
      const newNote = res.data;
      setNotes(prev => [newNote, ...prev]);
      loadNote(newNote._id);
    } catch (err) {
      setLoadError('Failed to create note.');
    }
  };

  // ── Delete a note
  const deleteNote = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      const updatedNotes = notes.filter(n => n._id !== id);
      setNotes(updatedNotes);
      if (activeNoteId === id) {
        if (updatedNotes.length > 0) {
          loadNote(updatedNotes[0]._id);
        } else {
          setActiveNoteId(null);
          setTitle('');
          setContent('');
          setWordCount(0);
          setCharCount(0);
          setLastSaved(null);
        }
      }
    } catch (err) {
      setLoadError('Failed to delete note.');
    }
  };

  // ── Switch note
  const switchNote = (id) => {
    if (id === activeNoteId) return;
    loadNote(id);
  };

  useEffect(() => {
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, []);

  const formatTime = (date) => {
    if (!date) return null;
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getInitials = (name) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const statusConfig = {
    idle:    { label: '',             className: '' },
    unsaved: { label: '● Unsaved',   className: 'badge-unsaved' },
    saving:  { label: '⟳ Saving…',  className: 'badge-saving' },
    saved:   { label: '✓ Saved',     className: 'badge-saved' },
    error:   { label: '✕ Save Failed', className: 'badge-error' },
  };
  const badge = statusConfig[saveStatus];

  return (
    <div className="editor-layout">
      <div className="app-background"></div>

      {/* ── Top Nav ── */}
      <nav className="editor-nav">
        <div className="editor-nav-left">
          <span className="nav-brand">VI Notes</span>
        </div>

        <div className="editor-nav-right">
          {badge.label && (
            <span className={`save-badge ${badge.className}`}>{badge.label}</span>
          )}
          {lastSaved && saveStatus !== 'saving' && saveStatus !== 'unsaved' && (
            <span className="last-saved-text">Saved {formatTime(lastSaved)}</span>
          )}

          {/* Profile chip */}
          <div className="nav-profile-chip">
            <div className="nav-avatar" title={user?.name}>{getInitials(user?.name)}</div>
            <div className="nav-profile-info">
              <span className="nav-profile-name">{user?.name || 'User'}</span>
              <span className="nav-profile-email">{user?.email || ''}</span>
            </div>
          </div>

          <button className="btn-danger-sm" id="editor-logout-btn" onClick={logout}>
            ⏻ Logout
          </button>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <div className="editor-with-sidebar">

        {/* ── Notes Sidebar ── */}
        <aside className="notes-sidebar">
          <div className="sidebar-header">
            <h3 className="sidebar-title">My Notes</h3>
            <button
              className="btn-add-note"
              id="add-note-btn"
              onClick={createNewNote}
              title="Add new note"
            >
              + New
            </button>
          </div>

          <div className="notes-list">
            {notes.length === 0 && (
              <div className="notes-list-empty">
                <p>No notes yet</p>
                <p className="notes-list-empty-hint">Click "+ New" to create your first note</p>
              </div>
            )}
            {notes.map((note) => (
              <div
                key={note._id}
                className={`note-item ${note._id === activeNoteId ? 'note-item-active' : ''}`}
                onClick={() => switchNote(note._id)}
              >
                <div className="note-item-content">
                  <span className="note-item-title">{note.title || 'Untitled Note'}</span>
                  <span className="note-item-meta">
                    {note.wordCount || 0} words · {formatDate(note.updatedAt)}
                  </span>
                </div>
                <button
                  className="note-item-delete"
                  title="Delete note"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note._id);
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Editor Area ── */}
        <div className="editor-main-full">
          {activeNoteId ? (
            <div className="editor-writing-area">
              {loadError && (
                <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                  ⚠ {loadError}
                </div>
              )}

              {/* Editable Title */}
              <input
                id="note-title-input"
                className="note-title-input"
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="Note title…"
                maxLength={120}
              />

              {/* Stats bar */}
              <div className="editor-stats-bar">
                <span className="stat-chip" title="Word count">
                  <span className="stat-chip-val">{wordCount}</span> words
                </span>
                <span className="stat-chip" title="Character count">
                  <span className="stat-chip-val">{charCount}</span> chars
                </span>
              </div>

              {/* Main Textarea */}
              <textarea
                ref={textareaRef}
                id="note-editor-textarea"
                className="editor-textarea"
                placeholder={`Start writing your note…\n\nYour note auto-saves every 2 seconds.`}
                value={content}
                onChange={handleChange}
                spellCheck={true}
                autoFocus
              />
            </div>
          ) : (
            <div className="editor-empty-state">
              <div className="editor-empty-icon">📝</div>
              <h2>Welcome to VI Notes</h2>
              <p>Create a new note to get started</p>
              <button className="btn btn-primary" onClick={createNewNote}>
                <span>+ Create Note</span>
                <span className="btn-shimmer"></span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
