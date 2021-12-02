const express = require('express');
const router = express.Router();
const user_DAL = require('../data/users');
const path = require('path');

router.get('/', async (req, res) => {
    if (req.session.user){
        return res.redirect('/restaurants')
    }

    res.render('forms/SignupForm', {title: "Signup", page_function: "Sign up for an account NOW"})
});

router.post('/', async (req, res) => {
    const form = req.body

    if(!form.username){
        res.status(400).render('forms/SignupForm', {title: "Signup", page_function: "Sign up for an account NOW", error: "Username invalid!"})    
        return
    }

    if(!form.password || form.password.includes(' ') || form.password.length<6){
        res.status(400).render('forms/SignupForm', {title: "Signup", page_function: "Sign up for an account NOW", error: "Password cannot contain spaces and must be at least 6 character in length!"})    
        return
    }

    if(!form.streetAddress){
        res.status(400).render('forms/SignupForm', {title: "Signup", page_function: "Sign up for an account NOW", error: "Street Address invalid!"})    
        return
    }

    if(!form.city){
        res.status(400).render('forms/SignupForm', {title: "Signup", page_function: "Sign up for an account NOW", error: "City invalid!"})    
        return
    }

    if(!form.state){
        res.status(400).render('forms/SignupForm', {title: "Signup", page_function: "Sign up for an account NOW", error: "State invalid!"})    
        return
    }

    if(!form.zip){
        res.status(400).render('forms/SignupForm', {title: "Signup", page_function: "Sign up for an account NOW", error: "Zip invalid!"})    
        return
    }

    if(!form.email){
        res.status(400).render('forms/SignupForm', {title: "Signup", page_function: "Sign up for an account NOW", error: "Email invalid!"})    
        return
    }

    if(!form.phone){
        res.status(400).render('forms/SignupForm', {title: "Signup", page_function: "Sign up for an account NOW", error: "Phone invalid!"})    
        return
    }

    if(!form.accountType){
        res.status(400).render('forms/SignupForm', {title: "Signup", page_function: "Sign up for an account NOW", error: "Accoun Type invalid!"})    
        return
    }

    try{
        await user_DAL.createUser(form.username, 
            form.password, 
            form.streetAddress, 
            form.city, 
            form.state, 
            form.zip, 
            form.email, 
            form.phone, 
            form.accountType)
    }
    catch(e){
        res.status(400).render('forms/SignupForm', {title: "Signup", page_function: "Sign up for an account NOW", error: e})
        return
    }
    
    res.redirect('/login')
    return
});

module.exports = router;