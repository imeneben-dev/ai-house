const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

const User = require('./models/User');

app.post('/api/signup', async (req, res) => {
  try {
    const { fullName, email, department, password, role } = req.body;
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ 
  alertText: "Oops! Someone is already using that email.",
  fix: "Try logging in instead!"
});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName: fullName,
      email: email,
      department: department,
      password: hashedPassword,
      role: role
    });

    res.status(201).json({ message: "Account created successfully!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

app.post('/api/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: "Sign in successful!",
      token: token,
      user: { 
        id: user._id, 
        fullName: user.fullName, 
        email: user.email, 
        role: user.role 
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during sign in." });
  }
});

const MONGO_URI = "mongodb+srv://abdellahben965_db_user:aihouse123@cluster0.vgehfjl.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log(" Connected to MongoDB Atlas!"))
  .catch((err) => console.log(" Database connection error:", err));

const PORT = 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));