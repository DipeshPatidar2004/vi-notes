const Note = require('../models/Note');

// ─── Utility: compute keyword frequency from raw text ───────────────────────
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'it', 'its', 'be', 'as', 'was',
  'are', 'were', 'been', 'has', 'have', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can',
  'not', 'no', 'nor', 'so', 'yet', 'both', 'either', 'neither', 'this',
  'that', 'these', 'those', 'i', 'me', 'my', 'we', 'our', 'you', 'your',
  'he', 'she', 'him', 'her', 'they', 'them', 'their', 'what', 'which',
  'who', 'whom', 'when', 'where', 'why', 'how', 'if', 'then', 'else',
  'up', 'out', 'about', 'into', 'also', 'just', 'more', 'other', 'some'
]);

function computeKeywords(text) {
  if (!text || !text.trim()) return { keywords: {}, wordCount: 0 };

  // Extract words: lowercase, letters only, min 2 chars
  const words = text
    .toLowerCase()
    .match(/\b[a-z]{2,}\b/g) || [];

  const wordCount = words.length;
  const freq = {};

  for (const word of words) {
    if (!STOP_WORDS.has(word)) {
      freq[word] = (freq[word] || 0) + 1;
    }
  }

  return { keywords: freq, wordCount };
}

// ─── GET /api/notes ──────────────────────────────────────────────────────────
// Fetch ALL notes for the current user (list view)
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .select('title wordCount updatedAt createdAt');

    res.json(notes);
  } catch (err) {
    console.error('Get notes error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET /api/notes/:id ─────────────────────────────────────────────────────
// Fetch a single note by ID
exports.getNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({
      _id: note._id,
      title: note.title || 'Untitled Note',
      content: note.content,
      keywords: Object.fromEntries(note.keywords),
      wordCount: note.wordCount,
      updatedAt: note.updatedAt,
      createdAt: note.createdAt
    });
  } catch (err) {
    console.error('Get note error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── POST /api/notes/create ─────────────────────────────────────────────────
// Create a brand-new note
exports.createNote = async (req, res) => {
  try {
    const note = await Note.create({
      userId: req.user.id,
      title: 'Untitled Note',
      content: '',
      keywords: {},
      wordCount: 0
    });

    res.status(201).json({
      _id: note._id,
      title: note.title,
      content: note.content,
      keywords: {},
      wordCount: 0,
      updatedAt: note.updatedAt,
      createdAt: note.createdAt
    });
  } catch (err) {
    console.error('Create note error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── PUT /api/notes/:id ─────────────────────────────────────────────────────
// Update an existing note by ID
exports.saveNote = async (req, res) => {
  try {
    const { content, title } = req.body;

    if (typeof content !== 'string') {
      return res.status(400).json({ message: 'Content must be a string' });
    }

    const { keywords, wordCount } = computeKeywords(content);

    const updateFields = { content, keywords, wordCount };
    if (typeof title === 'string') {
      updateFields.title = title.trim() || 'Untitled Note';
    }

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: updateFields },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({
      _id: note._id,
      message: 'Note saved successfully',
      title: note.title,
      keywords: Object.fromEntries(note.keywords),
      wordCount: note.wordCount,
      updatedAt: note.updatedAt
    });
  } catch (err) {
    console.error('Save note error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── DELETE /api/notes/:id ──────────────────────────────────────────────────
// Delete a note by ID
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json({ message: 'Note deleted' });
  } catch (err) {
    console.error('Delete note error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
