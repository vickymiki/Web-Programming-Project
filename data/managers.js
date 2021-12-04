const mongoCollections = require('../config/mongoCollections');
const managers = mongoCollections.managers;
const users = mongoCollections.users;
const user_DAL = require('./users');
const restaurant_DAL = require('./restaurants');
const bcrypt = require('bcrypt');
const saltRounds = 16;
const { isValidName, isValidPassword, managerFieldChecker } = require('../dataUtils');
const { restaurants } = require('../config/mongoCollections');

async function createManager(userName, streetAddress, city, state, zip, email, phone, password) {

    let newManager = { userName, streetAddress, city, state, zip, 
        email, phone, password};

    managerFieldChecker(newManager);
    
    newManager.restaurants = [];
    newManager.review_id = [];
    newManager.reply_id = [];
    newManager.review_feedback = {
        likes: [],
        dislikes: []
    };

    newManager.accoutType = "manager";
    
    userName = userName.toLowerCase();
    newManager.userName = userName;
    
    //Check that the user doesn't already exist, throw if it does
    let userProfile = null
    let managerProfile = null
    try{
        managerProfile = await getManagerByName(userName)
    }catch(e){
        //pass
    }
    try{
        userProfile = await user_DAL.getUserProfileByName(userName)
    }catch(e){
        //pass
    }

    if(managerProfile || userProfile){
        throw `Username already exists!`
    }

    newManager.password = await bcrypt.hash(password, saltRounds);

    const managerCollection = await managers();
    const insertInfo = await managerCollection.insertOne(newManager);
    if(insertInfo.insertedCount === 0)  { 
        throw 'creating new user failed'; 
    }

    return { managerInserted: true };
}

async function checkManager(userName, password) {
    if(!userName || !password) {
        throw 'UserName or password not provided';
    }
    isValidName(userName);
    isValidPassword(password);

    userName = userName.toLowerCase();
    const managerCollection = await managers();
    const manager = await managerCollection.findOne({userName: userName});
    if(manager === null) {
        return false;
    }
    let result = await bcrypt.compare(password, manager.password);
    if(!result) return false
    return true;
}

async function getManagerIdByName(username) {
    isValidName(managerName);
    const managerCollection = await managers();
    const manager = await managerCollection.findOne({ userName: username });
    if(manager === null) {
        throw "manager not found";
    }
    return manager._id.toString();
} 

async function getManagerByName(managerName) {
    isValidName(managerName);
    const managerCollection = await managers();
    const manager = await managerCollection.findOne({userName: managerName});
    if(manager === null) {
        throw "manager not found";
    }
    manager._id = manager._id.toString();
    return manager;
}

async function addRestaurantToManager(restaurantId, managerName){
    isValidName(managerName);
    const manager = await getManagerByName(managerName);
    if(manager === null) {
        throw "manager not found";
    }
    let restaurants = manager.restaurants;
    restaurants.push(restaurantId);

    const managerCollection = await managers();
    let updateInfo = await managerCollection.updateOne({userName: managerName}, {$push: {restaurants: restaurants}});
    if(updateInfo.matchedCount === 0) throw `Failed to add restaurant to manager: ${managerName}.`
    return { addRestaurant: true};
}

async function isManager(username){
    const managerCollection = await managers();
    let find = managerCollection.findOne({userName: username})

    if(find){
        return true
    }

    return false
}

async function userIsManagerOfRestaurant(userName, restaurantId){
    let restaurant = null
    try{
        restaurant = await restaurant_DAL.getRestaurantFromId(restaurantId)
    }
    catch(e){
        return false
    }

    if(restaurant.managerUsername === userName){
        return true
    }

    return false
}

module.exports = {createManager, checkManager, getManagerIdByName, getManagerByName, addRestaurantToManager, isManager, userIsManagerOfRestaurant}
