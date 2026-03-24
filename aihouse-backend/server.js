const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verifyToken = require('./middleware/auth');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

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
const Event = require('./models/Event');

app.post('/api/signup', async (req, res) => {
  try {
    const { fullName, email, department, password, role, title, focus, bio } = req.body;
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
  role: role,
  title: title || "Faculty Member",
  focus: focus || "AI Applications",
  bio: bio || "Dedicated to advancing AI literacy and research."
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
        role: user.role,
        department: user.department,
        title: user.title,
        focus: user.focus,
        bio: user.bio,
        profilePicture: user.profilePicture,
        notifications: user.notifications
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during sign in." });
  }
});

app.put('/api/user/profile', verifyToken, async (req, res) => {
  try {
    const { fullName, email } = req.body;

    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (email !== user.email) {
      const emailExists = await User.findOne({ email: email });
      if (emailExists) {
        return res.status(400).json({ message: "That email is already in use by another account." });
      }
    }

    user.fullName = fullName;
    user.email = email;

    if (user.role === 'representative') {
      if (req.body.title !== undefined) user.title = req.body.title;
      if (req.body.focus !== undefined) user.focus = req.body.focus;
      if (req.body.bio !== undefined) user.bio = req.body.bio;
    }
    
    await user.save();

    res.status(200).json({
      message: "Profile updated successfully!",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department,
        title: user.title,
        focus: user.focus,
        bio: user.bio,
        profilePicture: user.profilePicture,
        notifications: user.notifications
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating profile." });
  }
});

app.put('/api/user/password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedNewPassword;

    await user.save();

    res.status(200).json({ message: "Password updated successfully!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error changing password." });
  }
});

app.put('/api/user/notifications', verifyToken, async (req, res) => {
  try {
    const { newEvent, registration, reminders, repUpdates, newsletter } = req.body;

    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.notifications = {
      newEvent: newEvent,
      registration: registration,
      reminders: reminders,
      repUpdates: repUpdates,
      newsletter: newsletter
    };

    await user.save();

    res.status(200).json({ 
      message: "Preferences updated successfully!",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department,
        title: user.title,                  
        focus: user.focus,                  
        bio: user.bio,                      
        profilePicture: user.profilePicture,
        notifications: user.notifications
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating notifications." });
  }
});

app.put('/api/user/avatar', verifyToken, async (req, res) => {
  try {
    const { profilePicture } = req.body;

    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.profilePicture = profilePicture;
    await user.save();

    res.status(200).json({ 
      message: "Profile picture updated successfully!",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department,
        title: user.title,                  
        focus: user.focus,                  
        bio: user.bio,                      
        profilePicture: user.profilePicture,
        notifications: user.notifications
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating profile picture." });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    let events = await Event.find();

    const now = new Date();

    for (let event of events) {
      const eventDateTime = new Date(`${event.date}T${event.time}`);

      if (eventDateTime < now && event.status !== 'past') {
        event.status = 'past';
        
        await event.save(); 
      }
    }

    events = await Event.find().lean();

    const formattedEvents = events.map(event => ({
      ...event,
      id: event._id.toString()
    }));

    res.status(200).json(formattedEvents);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching events." });
  }
});

app.post('/api/events', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'representative') {
      return res.status(403).json({ message: "Access Denied. Only Representatives can create events." });
    }

    const { 
      title, type, topic, audience, department, 
      date, time, location, mode, seats, desc, instructor 
    } = req.body;

    const newEvent = await Event.create({
      title: title,
      type: type,
      topic: topic,
      audience: audience,
      department: department,
      date: date,
      time: time,
      location: location,
      mode: mode,
      seats: seats,
      desc: desc,
      instructor: instructor,
      status: 'upcoming',
      resources: []
    });

    const formattedNewEvent = {
      ...newEvent.toObject(),
      id: newEvent._id.toString() 
    };

    res.status(201).json(newEvent);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error creating event." });
  }
});

app.post('/api/events/:id/register', verifyToken, async (req, res) => {
  try {
    const eventId = req.params.id;

    const userId = req.user.id;

    const { name, email, department } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    const alreadyRegistered = event.attendees.find(attendee => attendee.userId === userId);
    if (alreadyRegistered) {
      return res.status(400).json({ message: "You are already registered for this event!" });
    }

    if (event.attendees.length >= event.seats) {
      return res.status(400).json({ message: "Sorry, this event is completely full." });
    }

    event.attendees.push({
      userId: userId,
      name: name,
      email: email,
      department: department
    });

    await event.save();

    const formattedEvent = {
      ...event.toObject(),
      id: event._id.toString()
    };

    res.status(200).json({ 
      message: "Registration successful!", 
      event: formattedEvent 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

app.get('/api/representatives', async (req, res) => {
  try {
    const reps = await User.find({ role: 'representative' }).select('-password').lean();

    const formattedReps = reps.map(rep => ({
      ...rep,
      id: rep._id.toString(),
      title: rep.title || "Faculty Member",
      focus: rep.focus || "AI Applications",
      bio: rep.bio || "Dedicated to advancing AI literacy and research within the department.",
      isCertified: rep.isCertified || false
    }));

    res.status(200).json(formattedReps);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching representatives." });
  }
});

app.put('/api/events/:id/resources', verifyToken, async (req, res) => {
  try {
    const { resources } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) return res.status(404).json({ message: "Event not found." });

    const user = await User.findById(req.user.id);
    if (event.instructor !== user.fullName) {
      return res.status(403).json({ message: "Only the instructor can upload resources." });
    }

    event.resources = resources;
    await event.save();

    const formattedEvent = { ...event.toObject(), id: event._id.toString() };
    res.status(200).json({ message: "Files uploaded!", event: formattedEvent });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error uploading files." });
  }
});

const MONGO_URI = "mongodb+srv://abdellahben965_db_user:aihouse123@cluster0.vgehfjl.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log(" Connected to MongoDB Atlas!"))
  .catch((err) => console.log(" Database connection error:", err));

const PORT = 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));