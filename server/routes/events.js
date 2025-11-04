// server/routes/events.js (FINAL CORRECTED VERSION)

const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Member = require('../models/Member');

// @route   GET api/events
// @desc    Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      // CORRECTED: This now populates the FULL member object, not just name and cni.
      .populate('participants.memberId') 
      .sort({ date: -1 });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/events
// @desc    Create an event
router.post('/', async (req, res) => {
  const { name } = req.body;
  try {
    const newEvent = new Event({
      name,
      date: new Date(), // Using a Date object directly is cleaner
      participants: []
    });
    const event = await newEvent.save();
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/events/:id/participants
// @desc    Add a participant to an event
router.post('/:id/participants', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });

        const isAlreadyParticipant = event.participants.some(p => p.memberId.toString() === req.body.memberId);
        if (isAlreadyParticipant) {
            return res.status(400).json({ msg: 'Member is already a participant' });
        }
        
        event.participants.push({ memberId: req.body.memberId, status: 'unmarked', points: 0 });
        await event.save();
        
        // CORRECTED: Populate the full member object after updating
        const populatedEvent = await event.populate('participants.memberId');
        res.json(populatedEvent);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   DELETE api/events/:id/participants/:member_id
// @desc    Remove a participant from an event
router.delete('/:id/participants/:member_id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });
        
        event.participants = event.participants.filter(p => p.memberId.toString() !== req.params.member_id);
        
        await event.save();

        // CORRECTED: Populate the full member object after updating
        const populatedEvent = await event.populate('participants.memberId');
        res.json(populatedEvent);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   PUT api/events/:id/participants/:member_id
// @desc    Update a participant's status and points
router.put('/:id/participants/:member_id', async (req, res) => {
    const { status, points } = req.body;
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });

        const participant = event.participants.find(p => p.memberId.toString() === req.params.member_id);
        if (!participant) return res.status(404).json({ msg: 'Participant not found' });

        if (status) participant.status = status;
        if (points !== undefined) participant.points = points;

        await event.save();
        
        // CORRECTED: Populate the full member object after updating
        const populatedEvent = await event.populate('participants.memberId');
        res.json(populatedEvent);
    } catch (err)
 {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;