const express = require('express');
const router = express.Router();
const user_DAL = require('../data/users');
const path = require('path');

router.get('/', async (req, res) => {
    if (req.session.user){
        //TODO decide where to redirect if user is logged in
        //return res.redirect('/restaurants')
    }

    res.render('forms/SignupForm', {title: "Signup", page_function: "Sign up for an account NOW"})
});

router.post('/', async (req, res) => {
    //TODO process signup form
});

module.exports = router;