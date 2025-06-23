const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission');
const { auth } = require('../middleware/auth');

// Create a new quiz (teacher only)
router.post('/', auth, async (req, res) => {
  if (!req.user || req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can create quizzes.' });
  }
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all quizzes
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single quiz by ID
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit answers to a quiz (save submission)
router.post('/:id/submit', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    const { answers } = req.body; // array of answers
    console.log('Received answers:', answers);
    console.log('Quiz question types:', quiz.questions.map(q => q.type));
    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      return res.status(400).json({ error: 'Invalid answers array.' });
    }
    let score = 0;
    quiz.questions.forEach((q, i) => {
      const studentAns = answers[i];
      if (q.type === 'mcq-single') {
        if (studentAns === q.correctAnswer) score++;
      } else if (q.type === 'mcq-multi') {
        // Compare arrays as sets
        if (Array.isArray(studentAns) && Array.isArray(q.correctAnswers)) {
          const a = [...studentAns].sort();
          const b = [...q.correctAnswers].sort();
          if (a.length === b.length && a.every((v, idx) => v === b[idx])) score++;
        }
      } else if (q.type === 'fill-blank') {
        if (
          studentAns != null &&
          q.correctAnswer != null &&
          String(studentAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()
        ) {
          score++;
        }
      }
    });
    // Save submission
    let student = { username: 'Anonymous', email: 'unknown' };
    // Try to get student info from token if present
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        if (decoded && decoded.role === 'student') {
          student.username = decoded.username || 'Student';
          student.email = decoded.email || 'unknown';
        }
      }
    } catch {}
    if (req.body.student) {
      student = req.body.student;
    }
    const submission = new Submission({
      quizId: quiz._id,
      student,
      answers,
      score,
      total: quiz.questions.length
    });
    await submission.save();
    console.log('Submission result:', { score, total: quiz.questions.length });
    res.json({ score, total: quiz.questions.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all submissions for a quiz (teacher only)
router.get('/:id/submissions', auth, async (req, res) => {
  if (!req.user || req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can view submissions.' });
  }
  try {
    const submissions = await Submission.find({ quizId: req.params.id });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a quiz (teacher only)
router.delete('/:id', auth, async (req, res) => {
  if (!req.user || req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can delete quizzes.' });
  }
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    // Delete all submissions for this quiz
    await Submission.deleteMany({ quizId: req.params.id });
    res.json({ message: 'Quiz and related submissions deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 