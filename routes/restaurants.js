const express = require('express');
const router = express.Router();
const restaurants_DAL = require('../data/restaurants');
const reviews_DAL = require('../data/reviews');
const replies_DAL = require('../data/replies');
const path = require('path');

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
  
  //TODO
  //Get the userId value from cookie
  const userId = null;
  //Get the isManager value from cookie
  //maybe create a new specific input thats hidden and specific to each type of request
  const isManager = null;

  if (reviewData.length == 0) {
    res.render('restaurant/NoReviewsPage', { title: "Reviews", page_function: `View reviews for ${restaurant.restaurantName}`, restaurantId: id, userId: userId, isManager: isManager });
  } else {
    res.render('restaurant/ReviewsPage', { title: "Reviews", page_function: `View reviews for ${restaurant.restaurantName}`, reviewData: reviewData, restaurantId: id, userId: userId, isManager: isManager });
  }
});

router.post('/:id/reviews', async (req, res) => {
  //console.log(req.body.like);
  if (req.body.postType == "add_like") {
    try {
      await reviews_DAL.addLike(req.body.likeId);
      res.redirect(`/restaurants/${req.params.id}/reviews`);
    } catch (e) {
      res.status(500);
      res.render('error/error', { error: e, title: "Error", page_function: "Error Display" });
    }
  } else if (req.body.postType == "remove_like") {
    try {
      await reviews_DAL.removeLike(req.body.removeLikeId);
      res.redirect(`/restaurants/${req.params.id}/reviews`);
    } catch (e) {
      res.status(500);
      res.render('error/error', { error: e , title: "Error", page_function: "Error Display"});
    }
  } else if (req.body.postType == "add_dislike") {
    try {
      await reviews_DAL.addDislike(req.body.dislikeId);
      res.redirect(`/restaurants/${req.params.id}/reviews`);
    } catch (e) {
      res.status(500);
      res.render('error/error', { error: e , title: "Error", page_function: "Error Display"});
    }
  } else if (req.body.postType == "remove_dislike") {
    try {
      await reviews_DAL.removeDislike(req.body.removeDislikeId);
      res.redirect(`/restaurants/${req.params.id}/reviews`);
    } catch (e) {
      res.status(500);
      res.render('error/error', { error: e , title: "Error", page_function: "Error Display"});
    }
  } else if (req.body.postType == "new_review") {
    //TODO
    console.log("New review");
    res.redirect(`/restaurants/${req.params.id}/reviews`)
  } else if (req.body.postType == "new_reply") {
    //TODO
    console.log("New Reply");
    res.redirect(`/restaurants/${req.params.id}/reviews`)
  } else {
    res.status(500);
    res.render('error/error', { error: "Internal Error" , title: "Error", page_function: "Error Display"});
  }
});

router.post('/create', async (req, res) => {
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
      res.status(400).render('restaurant/CreateRestaurantPage', {title: "Create Restaurant", page_function: "Create a restaurant!", error: "Accoun Type invalid!"})    
      return
  }

  if(!form.foodTypes){
    res.status(400).render('restaurant/CreateRestaurantPage', {title: "Create Restaurant", page_function: "Create a restaurant!", error: "Accoun Type invalid!"})    
    return
  }


  try{
      await restaurants_DAL.addRestaurant(form.name,
          form.streetAddress, 
          form.city, 
          form.state, 
          form.zip, 
          form.priceRange,
          form.foodTypes,
          form.email,
          form.phone)
  }
  catch(e){
      res.status(400).render('restaurant/CreateRestaurantPage', {title: "Create Restaurant", page_function: "Create a restaurant!", error: e})
      return
  }
  
  res.redirect('/profile')
  return
});

module.exports = router;