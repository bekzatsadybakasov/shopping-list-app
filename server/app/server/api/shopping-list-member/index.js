const express = require('express');
const router = express.Router();

const addMember = require('./addMember');
const removeMember = require('./removeMember');
const leave = require('./leave');

router.post('/addMember', addMember);
router.post('/removeMember', removeMember);
router.post('/leave', leave);

module.exports = router;

