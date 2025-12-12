const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();       // <-- create app first
app.use(cors());
app.use(express.json());

// Routes must come AFTER app creation
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/symptom-checker", require("./routes/symptomCheckerRoutes"));

// Example router
const exampleRouter = require('./routes/example');
app.use('/api/example', exampleRouter);

// Basic route
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Backend running' });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ ok: false, error: 'Not Found' });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  res.status(err && err.status ? err.status : 500).json({ ok: false, error: err && err.message ? err.message : 'Server Error' });
});

// Connect MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/clinic-ease';

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

