const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Basic route
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Backend running' });
});

// Example router (mounted below)
const exampleRouter = require('./routes/example');
app.use('/api/example', exampleRouter);

// Connect to MongoDB and start
const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/clinic-ease';

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ ok: false, error: 'Not Found' });
});

// Central error handler
app.use((err, req, res, next) => {
  // Log the full error for server-side debugging
  console.error(err && err.stack ? err.stack : err);
  res.status(err && err.status ? err.status : 500).json({ ok: false, error: err && err.message ? err.message : 'Server Error' });
});

let server;

mongoose
  .connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
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
    // If server was not started, just disconnect mongoose
    mongoose
      .disconnect()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }

  // Force shutdown after timeout
  setTimeout(() => {
    console.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = app;
