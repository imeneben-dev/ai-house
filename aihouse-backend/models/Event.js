const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },
  topic: { type: String, required: true },
  audience: { type: String, required: true },
  department: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  mode: { type: String, required: true },
  seats: { type: Number, required: true },
  desc: { type: String, required: true },
  instructor: { type: String, required: true },
  status: { type: String, default: 'upcoming' },
  resources: { type: Array, default: [] },

  attendees: [{
    userId: { type: String, required: true },
    name: String,
    email: String,
    department: String,
    registeredAt: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Event', eventSchema);