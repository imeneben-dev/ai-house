const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
  events: { type: Number, default: 0 },
  departments: { type: Number, default: 0 },
  representatives: { type: Number, default: 0 },
  participants: { type: Number, default: 0 }
});

module.exports = mongoose.model('Stat', statSchema);