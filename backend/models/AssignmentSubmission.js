const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: {
    username: { type: String, required: true },
    email: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  fileUrl: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  feedback: { type: String }
});

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema); 