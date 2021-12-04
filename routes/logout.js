const express = require('express');
const router = express.Router();
const user_DAL = require('../data/users');
const path = require('path');

router.get('/', async (req, res) => {
    req.session.destroy();
    res.redirect('login')
});

module.exports = router;