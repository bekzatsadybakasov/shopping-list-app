const express = require('express');
const router = express.Router();

const create = require('./create');
const get = require('./get');
const list = require('./list');
const update = require('./update');
const deleteList = require('./delete');
const archive = require('./archive');
const unarchive = require('./unarchive');

router.post('/create', create);
router.get('/get', get);
router.get('/list', list);
router.post('/update', update);
router.post('/delete', deleteList);
router.post('/archive', archive);
router.post('/unarchive', unarchive);

module.exports = router;

