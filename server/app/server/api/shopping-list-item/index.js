const express = require('express');
const router = express.Router();

const create = require('./create');
const update = require('./update');
const deleteItem = require('./delete');
const toggleResolved = require('./toggleResolved');

router.post('/create', create);
router.post('/update', update);
router.post('/delete', deleteItem);
router.post('/toggleResolved', toggleResolved);

module.exports = router;



