const express = require('express');
const router = express.Router();
const user_DAL = require('../data/users');
const manager_DAL = require('../data/managers');
const restaurants_DAL = require('../data/restaurants');
const reviews_DAL = require('../data/reviews');
const replies_DAL = require('../data/replies');
const path = require('path');
const e = require('express');
const fs = require('fs');
const multer = require('multer');

const upload = multer({ dest: '../uploads/'});

router.get('/reviews/:restId', async (req, res) => {
  
  if (!req.session.user){
        return res.redirect('/login')
  }
  let rest = await restaurants_DAL.getRestaurantFromId(req.params.restId);
  let userName = req.session.user.username;
  let restaurantId = req.params.restId;

  if (req.session.user.accountType === 'manager') {
    let isManager = true;
    let userId = await manager_DAL.getManagerIdByName(req.session.user.username);
    var myReviews = [];
    let RestReviews = null;
    let UserReviews = null;
    try {
      RestReviews = await reviews_DAL.getAllByRestaurant(restaurantId);
      UserReviews = await reviews_DAL.getAllByUser(userId, isManager);

      for (let i = 0; i < RestReviews.length; i++) {
        for (let j = 0; j < UserReviews.length; j++) {
        //stringify objects to compare them
        if (JSON.stringify(RestReviews[i]) == JSON.stringify(UserReviews[j])) myReviews.push(RestReviews[i]);
      }
    }
    res.render('user/UserReviews', { title: `${userName}'s Reviews`, page_function: "Your Reviews", isManager: true, reviews: myReviews, restaurantName: rest.restaurantName, userName: userName, restaurantId: restaurantId})
    } catch (e) {
      res.render('user/UserReviews', { title: `${userName}'s Reviews`, page_function: "Your Reviews", isManager: true, reviews: myReviews, restaurantName: rest.restaurantName, userName: userName, restaurantId: restaurantId })
    }
  }
  else if (req.session.user.accountType === 'user') {
    let isManager = false;
    let userId = await user_DAL.getUserIdByName(req.session.user.username);
    let myReviews = [];
    let RestReviews = null;
    let UserReviews = null;
    try {
      RestReviews = await reviews_DAL.getAllByRestaurant(restaurantId);
      UserReviews = await reviews_DAL.getAllByUser(userId, isManager);

      for (let i = 0; i < RestReviews.length; i++) {
      for (let j = 0; j < UserReviews.length; j++) {
        //Stringify the objects to compare them
        if (JSON.stringify(RestReviews[i]) == JSON.stringify(UserReviews[j])) myReviews.push(RestReviews[i]);
      }
    }
    res.render('user/UserReviews', { title: `${userName}'s Reviews`, page_function: "Your Reviews", isManager: false, reviews: myReviews, restaurantName: rest.restaurantName, userName: userName, restaurantId: restaurantId})
    } catch (e) {
      res.render('user/UserReviews', { title: `${userName}'s Reviews`, page_function: "Your Reviews", isManager: false, reviews: myReviews, restaurantName: rest.restaurantName, userName: userName, restaurantId: restaurantId })
    }
  }
  else {
    res.status(400).redirect('/login')
  }
});

router.get('/replies/:restId', async (req, res) => {
  if (!req.session.user){
        return res.redirect('/login')
  }
  
  let myId = req.params.restId;
  let rest = await restaurants_DAL.getRestaurantFromId(myId);
  let userName = req.session.user.username;

  if (req.session.user.accountType === 'manager') {
    let isManager = true;
    let restaurantId = req.params.restId;
    let userId = await manager_DAL.getManagerIdByName(req.session.user.username);
    var myReplies = [];
    let RestReplies = null;
    let UserReplies = null;
    try {
      RestReplies = await replies_DAL.getAllByRestaurant(restaurantId);
      UserReplies = await replies_DAL.getAllByUser(userId, isManager);

      for (let i = 0; i < RestReplies.length; i++) {
        for (let j = 0; j < UserReplies.length; j++) {
          if (JSON.stringify(RestReplies[i]) == JSON.stringify(UserReplies[j])) myReplies.push(RestReplies[i]);
        }
      }
      res.render('user/UserReplies', { title: `${userName}'s Replies`, page_function: "Your Replies", isManager: true, replies: myReplies, restaurantName: rest.restaurantName, restaurantId: myId, userName: userName })
    } catch (e) {
      res.render('user/UserReplies', { title: `${userName}'s Replies`, page_function: "Your Replies", isManager: true, replies: myReplies, restaurantName: rest.restaurantName, restaurantId: myId, userName: userName })
    }
  }
  else if (req.session.user.accountType === 'user') {
    let isManager = false;
    let restaurantId = req.params.restId;
    let userId = await user_DAL.getUserIdByName(req.session.user.username);
    var myReplies = [];
    let RestReplies = null;
    let myReviewIds = null;
    let UserReplies = null;
    try {
      let myData = await reviews_DAL.getAllRepliesByRestaurant(restaurantId);
      RestReplies = myData[0];
      myReviewIds = myData[1];
      UserReplies = await replies_DAL.getAllByUser(userId, isManager);

      for (let i = 0; i < RestReplies.length; i++) {
        for (let j = 0; j < UserReplies.length; j++) {
          if (JSON.stringify(RestReplies[i]) == JSON.stringify(UserReplies[j])) {
            RestReplies[i].reviewId = myReviewIds[i];
            myReplies.push(RestReplies[i]);
          }
        }
      }
      res.render('user/UserReplies', { title: `${userName}'s Replies`, page_function: "Your Replies", isManager: false, replies: myReplies, restaurantName: rest.restaurantName, restaurantId: myId, userName: userName })
    } catch (e) {
      res.render('user/UserReplies', { title: `${userName}'s Replies`, page_function: "Your Replies", isManager: false, replies: myReplies, restaurantName: rest.restaurantName, restaurantId: myId, userName: userName })
    }
  }
  else {
    res.status(400).redirect('/login')
  }

});

router.get('/', async (req, res) => {
    if (!req.session.user){
        return res.redirect('/login')
    }

    if(req.session.user.accountType === 'manager'){
        const restaurants = await restaurants_DAL.getRestaurantsManagedByUser(req.session.user.username)
        res.render('user/UserPage', {title: "Profile", page_function: "Your Profile", isManager: true, restaurants})
    }
    else if(req.session.user.accountType === 'user'){
        let userId = await user_DAL.getUserIdByName(req.session.user.username);
        let user = await user_DAL.getUserProfileByName(req.session.user.username);
        res.render('user/UserPage', {title: "Profile", page_function: "Your Profile", userId, user: user})
    }
    else{
        res.status(400).redirect('/login')
    }
    
});

router.post('/reviews/:restId/remove', async (req, res) => {
  if (!req.session.user){
        return res.redirect('/login')
    }
  let reviewId = req.body.reviewId;
  let restaurantId = req.body.restaurantId

  try {
    await reviews_DAL.remove(reviewId);
  } catch (e) {
     res.render('error/error', { error: e, title: "Error", page_function: "Error Display" });
  }

  res.redirect(`/profile/reviews/${restaurantId}`);
});

router.post('/reviews/:restId/edit', upload.single("photo"), async (req, res) => {
  if (!req.session.user){
        return res.redirect('/login')
    }
  let imgname = new Date().getTime().toString();
  let restaurantId = req.params.restId;

  try {
    if (!req.file) imgname = "no_image.jpeg";
    else {
      const tempPath = req.file.path;
      const targetPath = path.join(__dirname, `../public/images/${imgname}`);

      if (path.extname(req.file.originalname).toLowerCase() === ".png" ||
        path.extname(req.file.originalname).toLowerCase() === ".jpg" ||
        path.extname(req.file.originalname).toLowerCase() === ".jpeg") {
        fs.rename(tempPath, targetPath, err => {
          if (err) res.render('error/error', { error: "Internal Error", title: "Error", page_function: "Error Display" });
        })
      } else {
        res.status(403);
        res.render('error/error', { error: "Only png or jpg/jpeg allowed", title: "Error", page_function: "Error Display" });
        return;
      }
    }

    await reviews_DAL.editReview(req.body.reviewId, restaurantId, req.body.review, Number(req.body.rating), imgname);
    res.redirect(`/profile/reviews/${restaurantId}`);
  } catch (e) {
    res.render('error/error', { error: e, title: "Error", page_function: "Error Display" });
  }
});

router.post('/replies/:restId/remove', async (req, res) => {
  if (!req.session.user){
        return res.redirect('/login')
    }
  let replyId = req.body.replyId;
  let restaurantId = req.body.restaurantId
  let reviewId = req.body.reviewId

  try {
    await replies_DAL.remove(reviewId, replyId);
  } catch (e) {
     res.render('error/error', { error: e, title: "Error", page_function: "Error Display" });
  }

  res.redirect(`/profile/replies/${restaurantId}`);
});

router.post('/replies/:restId/edit', async (req, res) => {
  if (!req.session.user){
        return res.redirect('/login')
    }
  let replyId = req.body.replyId;
  let restaurantId = req.body.restaurantId;
  let reviewId = req.body.reviewId;
  let reply = req.body.reply;

  try {
    await replies_DAL.editReply(reviewId, replyId, reply);
  } catch (e) {
     res.render('error/error', { error: e, title: "Error", page_function: "Error Display" });
  }

  res.redirect(`/profile/replies/${restaurantId}`);
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
