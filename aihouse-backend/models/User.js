const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: 'participant' }
});

module.exports = mongoose.model('User', userSchema);