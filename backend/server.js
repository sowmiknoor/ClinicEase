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
app.use("/api/medications", require("./routes/medicationRoutes"));
app.use("/api/visits", require("./routes/visitRoutes"));
app.use("/api/consultations", require("./routes/consultationRoutes"));
app.use("/api/prescriptions", require("./routes/prescriptionRoutes"));
app.use("/api/labtests", require("./routes/labTestRoutes"));
app.use("/api/records", require("./routes/recordRoutes"));
app.use("/api/billing", require("./routes/invoiceRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

// New comprehensive routes
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/medical-records", require("./routes/medicalRecordRoutes"));
app.use("/api/lab-tests-new", require("./routes/labTestNewRoutes"));
app.use("/api/messages-new", require("./routes/messageNewRoutes"));
app.use("/api/medications-new", require("./routes/medicationNewRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/home-visits", require("./routes/homeVisitRoutes"));

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

// Connect MongoDB with retry logic and start server
const PORT = process.env.PORT || 5001;
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/clinic-ease';

let server;

const connectWithRetry = async (retryIntervalMs = 5000) => {
  while (true) {
    try {
      await mongoose.connect(MONGO);
      console.log('MongoDB connected');
      // Start server only once
      if (!server) {
        server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
      }
      break;
    } catch (err) {
      console.error(`MongoDB connection error: ${err && err.message ? err.message : err}`);
      console.log(`Retrying MongoDB connection in ${retryIntervalMs / 1000}s...`);
      // Wait and retry
      await new Promise((res) => setTimeout(res, retryIntervalMs));
    }
  }
};

connectWithRetry();

// Graceful shutdown
const shutdown = async (signal) => {
  try {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    if (server) {
      server.close(() => console.log('HTTP server closed'));
    }
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

