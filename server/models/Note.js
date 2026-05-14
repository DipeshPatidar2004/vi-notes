const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true // supports multiple notes per user
    },
    title: {
      type: String,
      default: 'Untitled Note'
    },
    content: {
      type: String,
      default: ''
    },
    keywords: {
      type: Map,
      of: Number,
      default: {}
    },
    wordCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Note', NoteSchema);
