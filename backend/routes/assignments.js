const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const { auth, requireRole } = require('../middleware/auth');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/assignments'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Create assignment (teacher only)
router.post('/', auth, requireRole('teacher'), async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    if (!title || !description || !deadline) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const assignment = new Assignment({
      title,
      description,
      deadline,
      createdBy: req.user.id
    });
    await assignment.save();
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// List all assignments (all users)
router.get('/', auth, async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Submit assignment (student, file upload)
router.post('/:id/submit', auth, requireRole('student'), upload.single('file'), async (req, res) => {
  try {
    console.log('--- Assignment submit route hit ---');
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      console.log('Assignment not found');
      return res.status(404).json({ error: 'Assignment not found' });
    }
    if (new Date() > new Date(assignment.deadline)) {
      console.log('Deadline passed');
      return res.status(400).json({ error: 'Deadline has passed' });
    }
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'File is required' });
    }
    console.log('User:', req.user);
    const submission = new AssignmentSubmission({
      assignmentId: assignment._id,
      student: {
        username: req.user.username,
        email: req.user.email,
        userId: req.user.id
      },
      fileUrl: `/uploads/assignments/${req.file.filename}`
    });
    await submission.save();
    console.log('Submission saved');
    res.status(201).json(submission);
  } catch (err) {
    console.error('Error in assignment submit:', err);
    res.status(500).json({ error: 'Failed to submit assignment', details: err.message });
  }
});

// View submissions for an assignment (teacher only)
router.get('/:id/submissions', auth, requireRole('teacher'), async (req, res) => {
  try {
    const submissions = await AssignmentSubmission.find({ assignmentId: req.params.id });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Add feedback to a submission (teacher only)
router.post('/submission/:submissionId/feedback', auth, requireRole('teacher'), async (req, res) => {
  try {
    const { feedback } = req.body;
    if (!feedback) {
      return res.status(400).json({ error: 'Feedback is required' });
    }
    const submission = await AssignmentSubmission.findByIdAndUpdate(
      req.params.submissionId,
      { feedback },
      { new: true }
    );
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add feedback' });
  }
});

module.exports = router; 