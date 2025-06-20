const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  student: {
    username: { type: String, required: true },
    email: { type: String, required: true }
  },
  answers: [mongoose.Schema.Types.Mixed],
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema); 