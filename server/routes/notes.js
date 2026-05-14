const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const noteController = require('../controllers/noteController');

// @route   GET /api/notes
// @desc    List all notes for the current user
// @access  Private
router.get('/', authMiddleware, noteController.getNotes);

// @route   POST /api/notes/create
// @desc    Create a new empty note
// @access  Private
router.post('/create', authMiddleware, noteController.createNote);

// @route   GET /api/notes/:id
// @desc    Get a single note by ID
// @access  Private
router.get('/:id', authMiddleware, noteController.getNote);

// @route   PUT /api/notes/:id
// @desc    Save / update a note by ID
// @access  Private
router.put('/:id', authMiddleware, noteController.saveNote);

// @route   DELETE /api/notes/:id
// @desc    Delete a note
// @access  Private
router.delete('/:id', authMiddleware, noteController.deleteNote);

module.exports = router;
