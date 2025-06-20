const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: { type: String, enum: ['mcq-single', 'mcq-multi', 'fill-blank'], default: 'mcq-single' },
  text: { type: String, required: true },
  options: [{ type: String }], // Only for MCQ types
  correctAnswer: { type: mongoose.Schema.Types.Mixed }, // number (index) for mcq-single, string for fill-blank
  correctAnswers: [{ type: Number }], // for mcq-multi
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  questions: [questionSchema],
  timeLimit: { type: Number }, // in minutes
  createdAt: { type: Date, default: Date.now },
  answers: [{ type: mongoose.Schema.Types.Mixed, required: true }] // for mixed types
});

module.exports = mongoose.model('Quiz', quizSchema); 