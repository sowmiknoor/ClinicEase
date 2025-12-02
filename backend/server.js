// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path'); // <-- added to serve frontend

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend'))); // <-- added line

// Basic route
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Backend running' });
});

// Existing example router
const exampleRouter = require('./routes/example');
app.use('/api/example', exampleRouter);

// NEW: Medication Reminder router
const medicationReminderRoutes = require('./routes/medicationReminderRoutes');
app.use('/api/medications', medicationReminderRoutes);

// Connect to MongoDB and start
const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/clinicDB'; // Use your DB

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ ok: false, error: 'Not Found' });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  res.status(err && err.status ? err.status : 500).json({
    ok: false,
    error: err && err.message ? err.message : 'Server Error'
  });
});

let server;

// Connect to MongoDB
mongoose
  .connect(MONGO)
  .then(() => {
    console.log('MongoDB connected successfully');
    server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('Shutting down gracefully...');
  if (server) {
    server.close(() => {
      mongoose
        .disconnect()
        .then(() => {
          console.log('MongoDB disconnected');
          process.exit(0);
        })
        .catch(() => process.exit(1));
    });
  } else {
    mongoose
      .disconnect()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }

  setTimeout(() => {
    console.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = app;
