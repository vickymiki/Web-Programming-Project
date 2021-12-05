const express = require('express');
const router = express.Router();
const restaurants_DAL = require('../data/restaurants');
const reviews_DAL = require('../data/reviews');
const replies_DAL = require('../data/replies');
const user_DAL = require('../data/users');
const manager_DAL = require('../data/managers');
const path = require('path');
const session = require('express-session');
const fs = require('fs');
const multer = require('multer');

const upload = multer({ dest: '/uploads/'});

router.get('/', async (req, res) => {
    const allResaurants = await restaurants_DAL.getAllResaurants()
    res.render('restaurant/RestaurantsPage', {title: "Restaurants", page_function: "View available restaurants!", restaurantArray: allResaurants})
});

router.get('/create', async (req, res) => {
  if (!(req.session.user && req.session.user.accountType === 'manager')){
      return res.status(403).redirect('/restaurants')
  }
  
  res.render('restaurant/CreateRestaurantPage', {title: "Create Restaurant", page_function: "Create a restaurant!"})
});

router.get('/:id', async (req, res) => {
    const id = req.params.id
    const restaurant = await restaurants_DAL.getRestaurantFromId(id)
    res.render('restaurant/RestaurantPage', {title: "Restaurant", page_function: `View food at ${restaurant.restaurantName}`, restaurant: restaurant})
});

router.get('/:id/reviews', async (req, res) => {
  const id = req.params.id
  let restaunt = null;
  let reviewData = null;
  try {
    restaurant = await restaurants_DAL.getRestaurantFromId(id);
  } catch (e) {
    res.render('error/error', { error: e, title: "Error", page_function: "Error Display" });
  }
  try {
    reviewData = await reviews_DAL.getAllByRestuarant(id);
  } catch (e) {
    res.render('error/error', { error: e, title: "Error", page_function: "Error Display" });
  }
  
  //Get userId and manager status from session cookie
  //TODO should make this a middleware function
  let userId = null;
  let isManager = null;
  if (!req.session.user) {
    res.redirect('/login', 404, { title: "Login", page_function: "Log into an account NOW", error: "Need to log in" })
    return
  } else {
    if (req.session.user.accountType == "manager") {
      isManager = true;
      userId = await manager_DAL.getManagerIdByName(req.session.user.username);
    }
    else {
      isManager = false;
      userId = await user_DAL.getUserIdByName(req.session.user.username);
    }
  }

  if (reviewData.length == 0) {
    res.render('restaurant/NoReviewsPage', { title: "Reviews", page_function: `View reviews for ${restaurant.restaurantName}`, restaurantId: id, loggedUserId: userId, loggedIsManager: isManager });
  } else {
    res.render('restaurant/ReviewsPage', { title: "Reviews", page_function: `View reviews for ${restaurant.restaurantName}`, reviewData: reviewData, restaurantId: id, loggedUserId: userId, loggedIsManager: isManager });
  }
});

router.get('/menu/edit/:id', async (req, res) => {
  
  const id = req.params.id

  //Check that the person attempting to access this is the manager of 
  if (!req.session.user || !id || !await manager_DAL.userIsManagerOfRestaurant(req.session.user.username, id)){
    return res.status(403).redirect('/restaurants')
  }

  //Get restaurant menu items, then display page with form for creating a new item,
  // and list existing items with remove/edit options
  const restaurant = await restaurants_DAL.getRestaurantFromId(id)
  res.render('restaurant/MenuEditPage', {title: "Edit Menu", page_function: `Edit menu for ${restaurant.restaurantName}`, restaurant: restaurant})
});

router.post('/menu/add/:id', async (req, res) => {
  const id = req.params.id
  
  //Check that the person attempting to access this is the manager of 
  if (!req.session.user || !id || !await manager_DAL.userIsManagerOfRestaurant(req.session.user.username, id)){
    return res.status(403).redirect('/restaurants')
  }

  const form = req.body
  const restaurant = await restaurants_DAL.getRestaurantFromId(id)

  if(!form.foodname){
    res.render('restaurant/MenuEditPage', {title: "Edit Menu", page_function: `Edit menu for ${restaurant.restaurantName}`, restaurant: restaurant, error: "Food name not provided!"})
    return
  }

  if(!form.price){
    res.render('restaurant/MenuEditPage', {title: "Edit Menu", page_function: `Edit menu for ${restaurant.restaurantName}`, restaurant: restaurant, error: "Price not provided!"})
    return
  }

  if(!form.customType){
    res.render('restaurant/MenuEditPage', {title: "Edit Menu", page_function: `Edit menu for ${restaurant.restaurantName}`, restaurant: restaurant, error: "Custom type not provided!"})
    return
  }

  if(!form.customOptionArray){
    //It's ok for custom items to not be provided
    form.customOptionArray = []
  }

  try{
      isBurger = form.customType === "superburger"
      if(isBurger) form.customOptionArray = ["Bread-top" , "seeds" , "lettuce" , "bacon" , "cheese" , "meat" , "bread-bottom"]
      await restaurants_DAL.addFood_Item(restaurant._id, {foodname: form.foodname, price: form.price, isBurger, customizableComponents: form.customOptionArray})
  }
  catch(e){
      res.status(400).render('restaurant/MenuEditPage', {title: "Edit Menu", page_function: `Edit menu for ${restaurant.restaurantName}`, restaurant: restaurant, error: e})
      return
  }
  
  res.redirect('/restaurants/menu/edit/' + restaurant._id)
  return
});

router.post('/menu/delete/:restid/:foodid', async (req, res) => {
  const foodid = req.params.foodid
  const restid = req.params.restid
  const restaurant = await restaurants_DAL.getRestaurantFromId(restid)

  //Check that the person attempting to access this is the manager of 
  if (!req.session.user || !foodid || !restid || !await manager_DAL.userIsManagerOfRestaurant(req.session.user.username, restid)){
    return res.status(403).redirect('/restaurants')
  }

  try{
      await restaurants_DAL.removeFood_Item(restid, foodid)
  }
  catch(e){
      res.status(400).render('restaurant/MenuEditPage', {title: "Edit Menu", page_function: `Edit menu for ${restaurant.restaurantName}`, restaurant: restaurant, error: e})
      return
  }
  
  res.redirect('/restaurants/menu/edit/' + restid)
  return
});

router.post('/:id/reviews', async (req, res) => {
  if (req.body.postType == "add_like") {
    try {
      let isManager = null;
      let userId = null;
      if (req.session.user.accountType === "user") {
        isManager = false;
        userId = await user_DAL.getUserIdByName(req.session.user.username);
      }
      else if (req.session.user.accountType === "manager") {
        isManager = true;
        userId = await manager_DAL.getManagerIdByName(req.session.user.username);
      }
      else res.redirect(`/login`);

      let Data = await reviews_DAL.addLike(req.body.likeId, userId, isManager);
      //res.redirect(`/restaurants/${req.params.id}/reviews`);
      res.render('partials/likes', { layout: null, _id: req.body.likeId, likes: Data })
      
    } catch (e) {
      res.status(409); //status 409 is for conflict
      res.send(e);
      //res.render('error/error', { error: e, title: "Error", page_function: "Error Display" });
    }
  } else if (req.body.postType == "remove_like") {
    try {
      let isManager = null;
      let userId = null;
      if (req.session.user.accountType === "user") {
        isManager = false;
        userId = await user_DAL.getUserIdByName(req.session.user.username);
      }
      else if (req.session.user.accountType === "manager") {
        isManager = true;
        userId = await manager_DAL.getManagerIdByName(req.session.user.username);
      }
      else res.redirect(`/login`);

      let Data = await reviews_DAL.removeLike(req.body.likeId, userId, isManager);
      //res.redirect(`/restaurants/${req.params.id}/reviews`);
      res.render('partials/likes', { layout: null, _id: req.body.likeId, likes: Data })

    } catch (e) {
      res.status(409); //status 409 is for conflict
      res.send(e);
      //res.render('error/error', { error: e , title: "Error", page_function: "Error Display"});
    }
  } else if (req.body.postType == "add_dislike") {
    try {
      let isManager = null;
      let userId = null;
      if (req.session.user.accountType === "user") {
        isManager = false;
        userId = await user_DAL.getUserIdByName(req.session.user.username);
      }
      else if (req.session.user.accountType === "manager") {
        isManager = true;
        userId = await manager_DAL.getManagerIdByName(req.session.user.username);
      }
      else res.redirect(`/login`);

      let Data = await reviews_DAL.addDislike(req.body.likeId, userId, isManager);
      //res.redirect(`/restaurants/${req.params.id}/reviews`);
      res.render('partials/dislikes', { layout: null, _id: req.body.likeId, dislikes: Data })

    } catch (e) {
      res.status(409); //status 409 is for conflict
      res.send(e);
      //res.render('error/error', { error: e , title: "Error", page_function: "Error Display"});
    }
  } else if (req.body.postType == "remove_dislike") {
    try {
      let isManager = null;
      let userId = null;
      if (req.session.user.accountType === "user") {
        isManager = false;
        userId = await user_DAL.getUserIdByName(req.session.user.username);
      }
      else if (req.session.user.accountType === "manager") {
        isManager = true;
        userId = await manager_DAL.getManagerIdByName(req.session.user.username);
      }
      else res.redirect(`/login`);

     let Data = await reviews_DAL.removeDislike(req.body.likeId, userId, isManager);
      //res.redirect(`/restaurants/${req.params.id}/reviews`);
      res.render('partials/dislikes', { layout: null, _id: req.body.likeId, dislikes: Data })

    } catch (e) {
      res.status(409); //status 409 is for conflict
      res.send(e);
      //res.render('error/error', { error: e , title: "Error", page_function: "Error Display"});
    }
  }
  //No longer needed, but keeping just in case
    //TODO cleanup before submitting
  /*else if (req.body.postType == "new_review") {
    try {
      let myBool = false;
      if (req.body.isManager === 'true') myBool = true;
      await reviews_DAL.create(req.body.restaurantId, req.body.userId, req.body.review, Number(req.body.rating), myBool);
      res.redirect(`/restaurants/${req.params.id}/reviews`);
    } catch (e) {
      res.status(500);
      res.render('error/error', { error: e, title: "Error", page_function: "Error Display" });
    }
  } */else if (req.body.postType == "new_reply") {
    try {
      let myBool = null;
      let myId = null;
      if (req.session.user.accountType == "manager") {
        myBool = true;
        myId = await manager_DAL.getManagerIdByName(req.session.user.username);
      } else {
        myBool = false;
        myId = await user_DAL.getUserIdByName(req.session.user.username);
      }
      await replies_DAL.create(req.body.reviewId, myId, req.body.reply, myBool);
      res.redirect(`/restaurants/${req.params.id}/reviews`);
    } catch (e) {
      res.status(500);
      res.render('error/error', { error: e, title: "Error", page_function: "Error Display" });
    }
  } else {
    res.status(500);
    res.render('error/error', { error: "Internal Error" , title: "Error", page_function: "Error Display"});
  }
});

router.post('/:id/upload', upload.single("photo"), async (req, res) => {
  //Make the image name a timestamp, this way it will be a unique identifier
  let imgname = new Date().getTime().toString();
  const id = req.params.id;
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

    let myBool = false;
    if (req.body.isManager === 'true') myBool = true;

    await reviews_DAL.create(req.body.restaurantId, req.body.userId, req.body.review, Number(req.body.rating), myBool, imgname);
    res.redirect(`/restaurants/${req.params.id}/reviews`);

  } catch (e) {
    //TODO set status code
    res.render('error/error', { error: e, title: "Error", page_function: "Error Display" });
  }
  
});

router.post('/create', async (req, res) => {
  if (!(req.session.user && req.session.user.accountType === 'manager')){
    return res.status(403).redirect('/restaurants')
  }
  const form = req.body

  if(!form.name){
      res.status(400).render('restaurant/CreateRestaurantPage', {title: "Create Restaurant", page_function: "Create a restaurant!", error: "Name invalid!"})    
      return
  }

  if(!form.streetAddress){
      res.status(400).render('restaurant/CreateRestaurantPage', {title: "Create Restaurant", page_function: "Create a restaurant!", error: "Street Address invalid!"})    
      return
  }

  if(!form.city){
      res.status(400).render('restaurant/CreateRestaurantPage', {title: "Create Restaurant", page_function: "Create a restaurant!", error: "City invalid!"})    
      return
  }

  if(!form.state){
      res.status(400).render('restaurant/CreateRestaurantPage', {title: "Create Restaurant", page_function: "Create a restaurant!", error: "State invalid!"})    
      return
  }

  if(!form.zip){
      res.status(400).render('restaurant/CreateRestaurantPage', {title: "Create Restaurant", page_function: "Create a restaurant!", error: "Zip invalid!"})    
      return
  }

  if(!form.email){
      res.status(400).render('restaurant/CreateRestaurantPage', {title: "Create Restaurant", page_function: "Create a restaurant!", error: "Email invalid!"})    
      return
  }

  if(!form.phone){
      res.status(400).render('restaurant/CreateRestaurantPage', {title: "Create Restaurant", page_function: "Create a restaurant!", error: "Phone invalid!"})    
      return
  }

  if(!form.priceRange){
      res.status(400).render('restaurant/CreateRestaurantPage', {title: "Create Restaurant", page_function: "Create a restaurant!", error: "Price range invalid!"})    
      return
  }

  if(!(form.asian || form.american || form.italian)){
    res.status(400).render('restaurant/CreateRestaurantPage', {title: "Create Restaurant", page_function: "Create a restaurant!", error: "Food category invalid!"})    
    return
  }

  foodTypes = []
  if(form.asian) foodTypes.push("Asian")
  if(form.american) foodTypes.push("American")
  if(form.italian) foodTypes.push("Italian")

  try{
      await restaurants_DAL.addRestaurant(form.name,
          form.streetAddress, 
          form.city, 
          form.state, 
          form.zip, 
          form.priceRange,
          foodTypes,
          form.email,
          form.phone,
          req.session.user.username)
  }
  catch(e){
      res.status(400).render('restaurant/CreateRestaurantPage', {title: "Create Restaurant", page_function: "Create a restaurant!", error: e})
      return
  }
  
  res.redirect('/profile')
  return
});

module.exports = router;