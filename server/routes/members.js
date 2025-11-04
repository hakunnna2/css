// server/routes/members.js

const express = require('express');
const router = express.Router();
const Member = require('../models/Member');

// ... (GET and POST / routes) ...
router.get('/', async (req, res) => {
  try {
    const members = await Member.find().sort({ name: 1 });
    res.json(members);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/', async (req, res) => {
  const { name, cni, cne, schoolLevel, whatsapp } = req.body;
  try {
    if (cni) {
        const existingMember = await Member.findOne({ cni: cni.toLowerCase() });
        if (existingMember) {
            return res.status(400).json({ msg: 'A member with this CNI already exists.' });
        }
    }
    const newMember = new Member({ name, cni, cne, schoolLevel, whatsapp });
    const member = await newMember.save();
    res.status(201).json(member);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/members/bulk
// @desc    Add multiple members from CSV import
router.post('/bulk', async (req, res) => {
    const { members } = req.body;
    if (!members || !Array.isArray(members)) {
        return res.status(400).json({ msg: 'Request body must contain an array of members.' });
    }
    
    const formattedMembers = members.map(m => ({ ...m, cni: m.cni ? m.cni.toLowerCase() : undefined }));

    try {
        const createdMembers = await Member.insertMany(formattedMembers, { ordered: false });
        res.status(201).json(createdMembers);
    } catch (err) {
        if (err.result && err.result.nInserted > 0) {
            const insertedIds = err.result.getInsertedIds().map(doc => doc._id);
            const successfullyInserted = await Member.find({ '_id': { $in: insertedIds } });
            return res.status(201).json(successfullyInserted);
        }
        
        console.error("BULK INSERT ERROR:", err.message); // Added a label for clarity
        res.status(500).json({ msg: 'An error occurred during the bulk import process.', error: err.message });
    }
});

module.exports = router;