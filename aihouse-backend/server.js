const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const Stat = require('./models/Stat');

app.get('/api/stats', async (req, res) => {
  try {
    let stats = await Stat.findOne();

    if (!stats) {
      stats = await Stat.create({ events: 24, departments: 8, representatives: 35, participants: 400 });
    }

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

app.put('/api/stats', async (req, res) => {
  try {
    const { events, departments, representatives, participants } = req.body;
    let stats = await Stat.findOne();
    
    stats.events = events;
    stats.departments = departments;
    stats.representatives = representatives;
    stats.participants = participants;
    
    await stats.save();
    res.json({ message: "Stats updated successfully!", stats });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

const MONGO_URI = "mongodb+srv://abdellahben965_db_user:ai_house123@cluster0.vgehfjl.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log(" Connected to MongoDB Atlas!"))
  .catch((err) => console.log(" Database connection error:", err));

const PORT = 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));