const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: 'participant' },
  profilePicture: { type: String, default: "" }, 

  title: { type: String, default: "Faculty Member" },
  focus: { type: String, default: "AI Applications" },
  bio: { type: String, default: "Dedicated to advancing AI literacy and research within the department." },
  isCertified: { type: Boolean, default: false },

  notifications: {
    newEvent: { type: Boolean, default: true },
    registration: { type: Boolean, default: true },
    reminders: { type: Boolean, default: true },
    repUpdates: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: false }
  }
});

module.exports = mongoose.model('User', userSchema);