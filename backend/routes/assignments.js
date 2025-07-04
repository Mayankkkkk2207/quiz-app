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
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    if (new Date() > new Date(assignment.deadline)) {
      return res.status(400).json({ error: 'Deadline has passed' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }
    // Check for existing submission by this student for this assignment
    const existing = await AssignmentSubmission.findOne({ assignmentId: assignment._id, 'student.userId': req.user.id });
    if (existing) {
      return res.status(400).json({ error: 'You have already submitted this assignment.' });
    }
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
    if (!res.ok) {
      let errMsg = 'Failed to submit assignment';
      try {
        const errData = await res.json();
        errMsg = errData.error || errMsg;
      } catch (jsonErr) {
        // Not JSON, keep default message
      }
      throw new Error(errMsg);
    }
    hideModal('submit-assignment-modal');
    // Add a small delay before reloading the page
    setTimeout(() => {
      location.reload();
    }, 300);
  } catch (err) {
    // Optionally log the error for debugging, but don't show an alert to the user
    console.error('Assignment submission error:', err);
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

// Edit assignment (teacher only)
router.put('/:id', auth, requireRole('teacher'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    if (assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own assignments.' });
    }
    const { title, description, deadline } = req.body;
    if (title) assignment.title = title;
    if (description) assignment.description = description;
    if (deadline) assignment.deadline = deadline;
    await assignment.save();
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update assignment' });
  }
});

// Delete assignment (teacher only)
router.delete('/:id', auth, requireRole('teacher'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    if (assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own assignments.' });
    }
    await AssignmentSubmission.deleteMany({ assignmentId: assignment._id });
    await assignment.deleteOne();
    res.json({ message: 'Assignment and related submissions deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

// Get the current student's submission for an assignment
router.get('/:id/mysubmission', auth, requireRole('student'), async (req, res) => {
  try {
    const submission = await AssignmentSubmission.findOne({
      assignmentId: req.params.id,
      'student.userId': req.user.id
    });
    if (!submission) return res.json(null);
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

module.exports = router; 