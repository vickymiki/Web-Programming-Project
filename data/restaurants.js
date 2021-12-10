const mongoCollections = require('../config/mongoCollections');
const ObjectId = require('mongodb').ObjectId;
const user_DAL = require('./users');
const manager_DAL = require('../data/managers');
const restaurants = mongoCollections.restaurants;
const {isValidName, isValidString, isValidZip, isValidPriceRange, isValidFoodType, isValidEmail, isValidPhone} = require('../dataUtils');

function isValidRestaurantName (restName) {
    if(typeof restName !== 'string') {
        throw 'Restaurant name is not a string';
    }
    if(restName.trim() === '') {
        throw 'Restaurant name is not a valid string';
    }
}
function validateFoodObject(foodItem) {
    if(!foodItem) throw "foodItem not supplied";
    const { itemName, price, isBurger, imageName } = foodItem;
    if(!itemName || !price || !((isBurger == false) || (isBurger == true)) || !imageName) {
        throw 'All fields need to be provided';
    }
    isValidString(itemName);
    var priceRegex = /^(?!0\d)\d*(\.\d+)?$/;
    if(!priceRegex.test(price)) {
        throw 'Price is not valid';
    }
    if(typeof isBurger !== 'boolean') {
        throw 'isBurger is not a boolean value';
    }
    isValidString(imageName);
}

async function validateParameters(name, address, city, state, zip, priceRange, foodTypes, email, phone, managerUsername){
    //TODO add validation
    if(!name || !address || !city || !state || !zip || !priceRange 
        || !foodTypes || !email || !phone || !managerUsername) {
            throw "All fields need to be supplied";
        }
        isValidRestaurantName(name);
        isValidString(address);
        isValidString(city);
        isValidString(state);
        isValidZip(zip);
        isValidPriceRange(priceRange);
        isValidFoodType(foodTypes);
        isValidEmail(email);
        isValidPhone(phone);
        isValidName(managerUsername);

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
        phone: phone,
        email: email,
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
    if(!address || !city || !state || !zip) {
        throw "All fields need to be supplied";
    }
    isValidString(address);
    isValidString(city);
    isValidString(state);
    isValidZip(zip);
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
    if(!name) {
        throw 'restaurant name not supplied';
    }
    isValidRestaurantName(name);
    const restaurantCollection = await restaurants()
    const restQuery = await restaurantCollection.findOne({restaurantName: name})
    if ( restQuery === null ) throw `Failed to find restaurant with name: ${name}`

    return restQuery._id.toString()
}

async function getRestaurantFromId(id){
    if(!id) throw 'id not supplied';
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
    if(!username) {
        throw 'username not supplied';
    }
    isValidName(username);
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
    if(!restaurant_id)  throw 'restaurant_id not supplied';
    restaurant_id = validateObjectId(restaurant_id)
    const restaurantCollection = await restaurants()
    let deleteRest = await restaurantCollection.deleteOne({_id: restaurant_id})
    if (deleteRest.deletedCount === 0) throw `Failed to delete restaurant with id: ${id}`
    return {restaurantDeleted: true}
}

async function addFood_Item(restaurant_id, foodItem){
    if(!restaurant_id || !foodItem) {
        throw 'restaurant_id or foodItem not supplied';
    }
    foodObj = validateFoodObject(foodItem)
    restaurant_id = validateObjectId(restaurant_id)
    const restaurantCollection = await restaurants()
    foodItem._id = ObjectId()
    let update = await restaurantCollection.updateOne({_id: restaurant_id}, {$push: {menuItems: foodItem}})
    if(update.matchedCount === 0) throw `Failed to add food item: ${foodItem}`    

    return {restaurantFoodUpdated: true}
}

async function removeFood_Item(restaurant_id, foodItem_id){
    if(!restaurant_id || !foodItem_id) {
        throw 'restaurant_id or foodItem_id not supplied';
    }
    restaurant_id = validateObjectId(restaurant_id)
    foodItem_id = validateObjectId(foodItem_id)
    const restaurantCollection = await restaurants()
    let update = await restaurantCollection.updateOne({_id: restaurant_id}, {$pull: {menuItems: {_id: foodItem_id}}})
    if(update.matchedCount === 0) throw `Failed to remove food item: ${foodItem_id}`    

    return {restaurantFoodUpdated: true}
}

async function getFood_Item(restaurant_id, foodItem_id){
    if(!restaurant_id || !foodItem_id) {
        throw 'restaurant_id or foodItem_id not supplied';
    }
    restaurant_id = validateObjectId(restaurant_id)
    foodItem_id = validateObjectId(foodItem_id)
    const restaurantCollection = await restaurants()
    let restaurant = await restaurantCollection.findOne({_id: restaurant_id, "menuItems._id": foodItem_id})
    if(restaurant === null) throw `Failed to get food item: ${foodItem_id}`    
    let food = restaurant.menuItems.find(x => {
        return x._id.toString() === foodItem_id.toString()
    })
    food._id = food._id.toString()
    return food
}

async function replaceFood_Item(restaurant_id, foodItem_id, foodItem){
    if(!restaurant_id || !foodItem_id || !foodItem) {
        throw 'restaurant_id, foodItem_id or foodItem not supplied';
    }
    restaurant_id = validateObjectId(restaurant_id)
    foodItem_id = validateObjectId(foodItem_id)
    const restaurantCollection = await restaurants();
    const customizableComponents = foodItem.customizableComponents.split(",");
  


    let restaurant = await restaurantCollection.updateOne({_id: restaurant_id, "menuItems._id": foodItem_id}, 
        {$set: {"menuItems.$.itemName": foodItem.itemName,
                "menuItems.$.price": foodItem.price,
                "menuItems.$.isBurger": foodItem.isBurger,
                "menuItems.$.customizableComponents": customizableComponents,
                "menuItems.$.imageName": foodItem.imageName}
      })
    if(restaurant.matchedCount === 0) throw `Failed to update food item: ${foodItem_id}`    
    return true
}

async function addOrderToRestaurant(order_id, restaurant_id){
    if(!order_id || !restaurant_id) {
        throw 'order_id or restaurant_id not supplied';
    }
    restaurant_id = validateObjectId(restaurant_id)
    order_id = validateObjectId(order_id)
    const restaurantCollection = await restaurants()
    let update = await restaurantCollection.updateOne({_id: restaurant_id}, {$push: {ordersPlaced: order_id}})
    if(update.matchedCount === 0) throw `Failed to add order: ${order_id}`    

    return true
}

async function removeOrderFromRestaurant(order_id, restaurant_id){
    if(!order_id || !restaurant_id) {
        throw 'order_id or restaurant_id not supplied';
    }
    restaurant_id = validateObjectId(restaurant_id)
    order_id = validateObjectId(order_id)
    const restaurantCollection = await restaurants()
    let update = await restaurantCollection.updateOne({_id: restaurant_id}, {$pull: {ordersPlaced: order_id}})
    //No need to throw on a failed delete
    if(update.matchedCount === 0) return false   

    return true
}

module.exports = {addRestaurant, getRestaurantIdFromName, removeRestaurant, addFood_Item, 
    removeFood_Item, getFood_Item, replaceFood_Item, 
    getAllResaurants, getRestaurantFromId, getRestaurantsManagedByUser,
    addOrderToRestaurant, removeOrderFromRestaurant}
