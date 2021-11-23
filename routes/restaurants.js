const express = require('express');
const router = express.Router();
const restaurants_DAL = require('../data/restaurants');
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

module.exports = router;