// server/models/Event.js

const mongoose = require('mongoose');

// This defines the structure for a single participant within an event
const ParticipantSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    status: {
        type: String,
        enum: ['unmarked', 'present', 'absent'],
        default: 'unmarked'
    },
    points: {
        type: Number,
        default: 0
    }
});

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  // The 'participants' field is now an array using the schema defined above
  participants: [ParticipantSchema]
});

module.exports = mongoose.model('Event', EventSchema);