const mongoCollections = require('../config/mongoCollections');
const ObjectId = require('mongodb').ObjectId;
const reviews = mongoCollections.reviews;
const users = mongoCollections.users;
const managers = mongoCollections.managers;
const restaurants = mongoCollections.restaurants;

function validateParameters(name, address, city, state, zip, priceRange, foodTypes, menuItems, ordersPlaced, rating, reviews){
    //TODO add validation

    return ({restaurantName: name, 
        streetAddress: address,
        city: city,
        state: state,
        zip: zip,
        priceRange: priceRange,
        foodTypes: foodTypes,
        menuItems: menuItems,
        ordersPlaced: ordersPlaced,
        rating: rating,
        reviews: reviews})
}
async function addRestaurant(name, address, city, state, zip, priceRange, foodTypes, menuItems, ordersPlaced, rating, reviews){
    let restaurant
}