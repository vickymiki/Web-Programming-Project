const express = require('express');
const router = express.Router();
const user_DAL = require('../data/users');
const path = require('path');

router.get('/', async (req, res) => {
    if (req.session.user){
        //TODO decide where to redirect if user is logged in
        //return res.redirect('/restaurants')
    }
    
    res.render('forms/LoginForm', {title: "Login", page_function: "Log into an account NOW"})
});

router.post('/', async (req, res) => {
    //TODO process login form
    const loginForm = req.body
    if (!loginForm.username 
        || loginForm.username.includes(' ') 
        || !loginForm.username.match(/^[0-9a-zA-Z]+$/) 
        || loginForm.username.length < 4){

        res.status(400).render('/login', {title: "Login", page_function: "Log into an account NOW", error: "Username invalid!"})    
        return
    }
    if (!loginForm.password || loginForm.password.includes(' ') || loginForm.password.length<6){
        res.status(400).render('/login', {title: "Login", page_function: "Log into an account NOW", error: "Password invalid!"})    
        return
    }

    let dbResponse = null
    try{
        dbResponse = await user_DAL.checkUser(loginForm.username, loginForm.password)
    }
    catch(e){
        res.status(400).render('login', {title: "Login", page_function: "Log into an account NOW", error: e})
        return
    }

    if(dbResponse && dbResponse.authenticated){
        req.session.user = { username: loginForm.username, accountType: dbResponse.accountType };
        res.redirect('/restaurants')
        return
    }
    else{
        res.status(500).render('/login', {title: "Login", page_function: "Log into an account NOW", error: 'Internal Server Error'})
    }
});

module.exports = router;