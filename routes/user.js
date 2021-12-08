const express = require('express');
const router = express.Router();
const users = require('../data/users');
const { userFieldChecker } = require('../dataUtils');

router.get('/:id', async(req, res) => {
    if(req.session.user) {
        const { username, accountType } = req.session.user;
        if(accountType === "user") {
            const user = await users.getUserProfileByName(username);
            res.render('user/UserProfile', {   
                title: username,
                page_function: "Update Profile",
                user: user
            });
        }
        return;
    }
});

router.post('/:id', async(req, res) =>{

    const username = req.session.user.username;
    const user = await users.getUserProfileByName(username);
    const userId = user._id.toString();

    const form = req.body;

    if(!form.streetAddress){
        res.status(400).render('user/UserProfile', {title: username, page_function: "Update Profile", user: user, error: "Street Address invalid!"})    
        return
    }

    if(!form.city){
        res.status(400).render('user/UserProfile', {title: username, page_function: "Update Profile", user: user, error: "City invalid!"})    
        return
    }

    if(!form.state){
        res.status(400).render('user/UserProfile', {title: username, page_function: "Update Profile", user: user, error: "State invalid!"})    
        return
    }

    if(!form.zip){
        res.status(400).render('user/UserProfile', {title: username, page_function: "Update Profile", user: user, error: "Zip invalid!"})    
        return
    }

    if(!form.email){
        res.status(400).render('user/UserProfile', {title: username, page_function: "Update Profile", user: user, error: "Email invalid!"})    
        return
    }

    if(!form.phone){
        res.status(400).render('user/UserProfile', {title: username, page_function: "Update Profile", user: user, error: "Phone invalid!"})    
        return
    }
    try{
        await users.updateUserProfile(userId, 
            form.streetAddress, 
            form.city, 
            form.state, 
            form.zip, 
            form.email, 
            form.phone);
    }
    catch(e){
        res.status(400).render('user/UserProfile', {title: form.username, user: user, error: e})
        return
    }
    res.redirect('/profile');
    return
});

module.exports = router;