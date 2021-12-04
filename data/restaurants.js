const mongoCollections = require('../config/mongoCollections');
const ObjectId = require('mongodb').ObjectId;
const user_DAL = require('./users');
const manager_DAL = require('../data/managers');
const restaurants = mongoCollections.restaurants;

async function validateParameters(name, address, city, state, zip, priceRange, foodTypes, email, phone, managerUsername){
    //TODO add validation

    //There is allowed to be multiple restaurants with the same name, but not with the same address
    if(await checkIfAddressExists(address, city, state, zip)) throw 'A restaurant with that address already exists'

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
        reviews: [],
        managerUsername})
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

async function addRestaurant(name, address, city, state, zip, priceRange, foodTypes, email, phone, managerUsername){
    let restaurantObj = await validateParameters(name, address, city, state, zip, priceRange, foodTypes, email, phone, managerUsername)
    
    const restaurantCollection = await restaurants()
    const insert = await restaurantCollection.insertOne(restaurantObj)

    if ( insert.insertedCount === 0 ) throw "Restaurant insert failed"
    
    restaurantId = insert.insertedId.toString()
    await manager_DAL.addRestaurantToManager(restaurantId, managerUsername)
    return {restaurantInserted: true}
}

async function checkIfAddressExists(address, city, state, zip){
    const restaurantCollection = await restaurants()
    const restQuery = await restaurantCollection.findOne({streetAddress: address, city, state, zip})
    if ( restQuery === null ){
        return false
    }else{
        return true
    }
}

//TODO restaurant names aren't guarenteed to be unique, might want to remove as it's misleading
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

async function getRestaurantsManagedByUser(username){
    if(!await manager_DAL.isManager(username)){
        return []
    }

    const restaurantCollection = await restaurants()
    let restQuery = await restaurantCollection.find({managerUsername: username}).toArray();
    restQuery.forEach(x => {
        x._id = x._id.toString()
        x.menuItems.forEach(y => {
            y._id = y._id.toString()
        })
    })
    return restQuery
}

async function removeRestaurant(restaurant_id){
    restaurant_id = validateObjectId(restaurant_id)
    const restaurantCollection = await restaurants()
    let deleteRest = await restaurantCollection.deleteOne({_id: restaurant_id})
    if (deleteRest.deletedCount === 0) throw `Failed to delete restaurant with id: ${id}`
    return {restaurantDeleted: true}
}

async function addFood_Item(restaurant_id, foodItem){
    // TODO
    //foodObj = validateFoodObject(foodItems)
    restaurant_id = validateObjectId(restaurant_id)
    const restaurantCollection = await restaurants()
    foodItem._id = ObjectId()
    let update = await restaurantCollection.updateOne({_id: restaurant_id}, {$push: {menuItems: foodItem}})
    if(update.matchedCount === 0) throw `Failed to add food item: ${item}`    

    return {restaurantFoodUpdated: true}
}

module.exports = {addRestaurant, getRestaurantIdFromName, addFood_Item, getAllResaurants, getRestaurantFromId, getRestaurantsManagedByUser}