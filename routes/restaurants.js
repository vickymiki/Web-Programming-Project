const express = require('express');
const router = express.Router();
const restaurants_DAL = require('../data/restaurants');
const reviews_DAL = require('../data/reviews');
const replies_DAL = require('../data/replies');
const path = require('path');

router.get('/', async (req, res) => {
    if (req.session.user){
        return res.redirect('/private')
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
  const restaurant = await restaurants_DAL.getRestaurantFromId(id);
  const reviewData = await reviews_DAL.getAllByRestuarant(id);
  res.render('restaurant/ReviewsPage', { title: "Reviews", page_function: `View reviews for ${restaurant.restaurantName}`, reviewData: reviewData });
});

router.post('/:id/reviews', async (req, res) => {
  if (req.body.like) {
    try {
      await reviews_DAL.addLike(req.body.like);
      res.redirect(`/restaurants/${req.params.id}/reviews`);
    } catch (e) {
      res.status(500);
      res.render('error/error', { error: e, title: "Error", page_function: "Error Display" });
    }
  } else if (req.body.remove_like) {
    try {
      await reviews_DAL.removeLike(req.body.remove_like);
      res.redirect(`/restaurants/${req.params.id}/reviews`);
    } catch (e) {
      res.status(500);
      res.render('error/error', { error: e , title: "Error", page_function: "Error Display"});
    }
  } else if (req.body.dislike) {
    try {
      await reviews_DAL.addDislike(req.body.dislike);
      res.redirect(`/restaurants/${req.params.id}/reviews`);
    } catch (e) {
      res.status(500);
      res.render('error/error', { error: e , title: "Error", page_function: "Error Display"});
    }
  } else if (req.body.remove_dislike) {
    try {
      await reviews_DAL.removeDislike(req.body.remove_dislike);
      res.redirect(`/restaurants/${req.params.id}/reviews`);
    } catch (e) {
      res.status(500);
      res.render('error/error', { error: e , title: "Error", page_function: "Error Display"});
    }
  } else {
    res.status(500);
    res.render('error/error', { error: "Internal Error" , title: "Error", page_function: "Error Display"});
  }
});

module.exports = router;