const mongoCollections = require('../config/mongoCollections');
const ObjectId = require('mongodb').ObjectId;
const reviews = mongoCollections.reviews;
const users = mongoCollections.users;
const managers = mongoCollections.managers;
const restaurants = mongoCollections.restaurants;

function validateParameters(name, address, city, state, zip, priceRange, foodTypes){
    //TODO add validation

    return ({restaurantName: name, 
        streetAddress: address,
        city: city,
        state: state,
        zip: zip,
        priceRange: priceRange,
        foodTypes: foodTypes,
        menuItems: [],
        ordersPlaced: [],
        rating: 0,
        reviews: []})
}

function validateObjectId(id){
    if( typeof id !== 'string' && !ObjectId.isValid(id) ) throw `id must be of type string or ObjectId: ${id}`
    if( typeof id === 'string' && id.length === id.split(' ').length - 1) throw `id as string must not be empty: ${id}`
    if( typeof id === 'string' ){
        try{
            id = ObjectId(id)    
        }catch(e){
            throw `Provided id not a valid ObjectId: ${id}`
        }
    }
    return id
}

async function addRestaurant(name, address, city, state, zip, priceRange, foodTypes){
    let restaurantObj = validateParameters(name, address, city, state, zip, priceRange, foodTypes)
    
    const restaurantCollection = await restaurants()
    const insert = await restaurantCollection.insertOne(restaurantObj)

    if ( insert.insertedCount === 0 ) throw "Restaurant insert failed"
    return {restaurantInserted: true}
}

async function getRestaurantIdFromName(name){
    const restaurantCollection = await restaurants()
    const restQuery = await restaurantCollection.findOne({restaurantName: name})
    if ( restQuery === null ) throw `Failed to find restaurant with name: ${name}`

    return restQuery._id.toString()
}

async function getRestaurantFromId(id){
    id = validateObjectId(id)
    const restaurantCollection = await restaurants()
    const restQuery = await restaurantCollection.findOne({_id: id})
    if ( restQuery === null ) throw `Failed to find restaurant with id: ${id}`

    restQuery._id = restQuery._id.toString()
    return restQuery
}

async function getAllResaurants(){
    const restaurantCollection = await restaurants()
    const restQuery = await restaurantCollection.find({}).toArray()
    restQuery.forEach(x => x._id = x._id.toString())
    return restQuery
}

async function removeRestaurant(restaurant_id){
    restaurant_id = validateObjectId(restaurant_id)
    const restaurantCollection = await restaurants()
    let deleteRest = await restaurantCollection.deleteOne({_id: restaurant_id})
    if (deleteRest.deletedCount === 0) throw `Failed to delete restaurant with id: ${id}`
    return {restaurantDeleted: true}
}

async function addFood_Items(restaurant_id, foodItems){
    // TODO
    //foodObj = validateFoodObject(foodItems)
    restaurant_id = validateObjectId(restaurant_id)
    const restaurantCollection = await restaurants()
    for (const item of foodItems) {
        let update = await restaurantCollection.updateOne({_id: restaurant_id}, {$push: {menuItems: item}})
        if(update.matchedCount === 0) throw `Failed to add food item: ${item}`    
    }

    return {restaurantFoodUpdated: true}
}

module.exports = {addRestaurant, getRestaurantIdFromName, addFood_Items, getAllResaurants, getRestaurantFromId}