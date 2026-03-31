require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(helmet());

// Serve frontend static files (before API routes)
app.use(express.static(path.join(__dirname, './public')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
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

// Fallback to index.html for SPA (must be after API routes)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public', 'index.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public', 'index.html'));
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 