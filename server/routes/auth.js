const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// @route   POST /api/auth/register
router.post(
  '/register',
  [
    body('name', 'Name is required').trim().notEmpty(),
    body('name', 'Name must be between 2 and 50 characters').isLength({ min: 2, max: 50 }),
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  authController.register
);

// @route   POST /api/auth/login
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password is required').notEmpty()
  ],
  authController.login
);

// @route   GET /api/auth/user
router.get('/user', authMiddleware, authController.getUser);

module.exports = router;
