const express = require('express');
const router = express.Router();
const restaurants_DAL = require('../data/restaurants');
const reviews_DAL = require('../data/reviews');
const replies_DAL = require('../data/replies');
const path = require('path');

router.get('/', async (req, res) => {
    if (req.session.user){
        let x = req.session.user.accountType
        //return res.redirect('/private')
    }
    const allResaurants = await restaurants_DAL.getAllResaurants()
    res.render('restaurant/RestaurantsPage', {title: "Restaurants", page_function: "View available restaurants!", restaurantArray: allResaurants})
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

module.exports = router;