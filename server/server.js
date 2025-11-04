// server/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- DEFINE ROUTES ---
// This tells the app to use the files we just created
app.use('/api/members', require('./routes/members'));
app.use('/api/events', require('./routes/events'));

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});