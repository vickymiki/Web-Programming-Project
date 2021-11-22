const express = require('express');
const router = express.Router();
const user_DAL = require('../data/users');
const manager_DAL = require('../data/managers');
const path = require('path');

router.get('/', async (req, res) => {
    if (req.session.user){
        //TODO decide where to redirect if user is logged in
        //return res.redirect('/restaurants')
    }
    
    res.render('forms/LoginForm', {title: "Login", page_function: "Log into an account NOW"})
});

router.post('/login', async (req, res) => {
    //TODO process login form
});

module.exports = router;