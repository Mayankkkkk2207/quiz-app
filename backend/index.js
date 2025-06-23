require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/quizapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Routes
const quizzesRouter = require('./routes/quizzes');
app.use('/api/quizzes', quizzesRouter);
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);
const assignmentsRouter = require('./routes/assignments');
app.use('/assignments', assignmentsRouter);

// Root route
app.get('/', (req, res) => {
  res.send('Quiz App Backend Running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 