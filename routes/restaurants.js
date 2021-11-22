const express = require('express');
const router = express.Router();
const restaurants_DAL = require('../data/restaurants');
const path = require('path');

router.get('/', async (req, res) => {
    if (req.session.user){
        return res.redirect('/private')
    }
    
    res.render('restaurant/RestaurantsPage', {title: "Restaurants", page_function: "View available restaurants!"})
});

module.exports = router;