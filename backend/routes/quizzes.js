const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission');
const { auth } = require('../middleware/auth');

// Get all quiz submissions for the logged-in student
router.get('/my-submissions', auth, async (req, res) => {
  console.log('GET /api/quizzes/my-submissions called by', req.user && req.user.email);
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can view their submissions.' });
    }
    const submissions = await Submission.find({ 'student.email': req.user.email }).sort({ submittedAt: -1 });
    // Populate quiz title and questions for each submission
    const results = await Promise.all(submissions.map(async (sub) => {
      const quiz = await Quiz.findById(sub.quizId);
      return {
        _id: sub._id,
        quizId: sub.quizId,
        quizTitle: quiz ? quiz.title : 'Quiz',
        questions: quiz ? quiz.questions : [],
        answers: sub.answers,
        score: sub.score,
        total: sub.total,
        submittedAt: sub.submittedAt
      };
    }));
    res.json(results);
  } catch (err) {
    console.error('Error in /my-submissions:', err);
    res.status(500).json({ error: err.message });
  }
});

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
router.post('/:id/submit', auth, async (req, res) => {
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
    // Always use req.user for student info
    let student = {
      username: req.user.username,
      email: req.user.email
    };
    // Prevent multiple submissions by the same student for the same quiz
    const existingSubmission = await Submission.findOne({ quizId: quiz._id, 'student.email': student.email });
    if (existingSubmission) {
      return res.status(400).json({ error: 'You have already submitted this quiz.' });
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