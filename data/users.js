const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const { toObjectId, isValidName, isValidPassword, userFieldChecker } = require("../dataUtils"); 
const bcrypt = require('bcrypt');
const { use } = require('../routes/restaurants');
const saltRounds = 16;


async function createUser(userName, password, streetAddress, city, state, zip, 
    email, phone, accountType) {
    const newUser = { userName, streetAddress, city, state, zip, 
        email, phone, favorites: [], review_id: [], reply_id: [], review_feedback: {likes:[], dislikes:[]}, password, accountType };
    userFieldChecker(newUser, update = false);
    
    userName = userName.toLowerCase();
    newUser.userName = userName;
    const userCollection = await users();
    const user = await userCollection.findOne({userName: userName});
    if(user !== null) {
        throw `${userName} is occupied, try a different one`;
    }
    newUser.password = await bcrypt.hash(password, saltRounds);
    newUser.managedRestaurants = []
    const insertInfo = await userCollection.insertOne(newUser);
    if(insertInfo.insertedCount === 0)  { 
        throw 'creating new user failed'; 
    }

    return { userInserted: true };
}

async function checkUser(userName, password) {
    if(!userName || !password) {
        throw 'userName or password not provided';
    }

    isValidName(userName);
    isValidPassword(password);
    const userCollection = await users();
    userName = userName.toLowerCase();
    const user = await userCollection.findOne({userName: userName});
    if(user === null) {
        throw `user not found`;
    } 

    let result = await bcrypt.compare(password, user.password);
    if(!result)    throw "Username and password don't mactch";
    return { authenticated: true, accountType: user.accountType };

}

async function updateUserProfile(id, userName, streetAddress, city, state, zip, 
    email, phone, favorites) {
    
    const userInfos = {userName, streetAddress, city, state, zip, 
        email, phone, favorites };
    userFieldChecker(userInfos, update = true);

    const userCollection = await users();
    const user = await userCollection.findOne({_id: toObjectId(id)});
    if(user === null) {
        throw `user not found`;
    } 

    const updatedInfo = await userCollection.updateOne({_id: toObjectId(id)}, {$set: userInfos});
    if(updatedInfo.modifiedCount === 0) {
        throw 'could not update user profile successfully';
    }
    return {updated: true};
}

async function getUserProfileByName(username){
    const userCollection = await users();
    const user = await userCollection.findOne({ userName: username });
    if(user === null) throw `Unable to find user: ${username}`
    return user
}

async function getUserIdByName(username) {
    const userCollection = await users();
    const user = await userCollection.findOne({ userName: username });
    if(user === null) throw `Unable to find user: ${username}`
    return user._id
}

async function addRestaurantToManager(restaurantObjectId, username){
    //check that the user is a manager then append it to the array
    if(!await isManager(username)) throw `User is not a manager: ${username}`
    const managerId = await getUserIdByName(username)
    const userCollection = await users();
    let update = await userCollection.updateOne({_id: managerId}, {$push: {managedRestaurants: restaurantObjectId}})
    if(update.matchedCount === 0) throw `Failed to add restaurant to manager: ${username}.`
}

async function isManager(username){
    let manager = null
    try{
        //throws if user does not exist
        manager = await getUserProfileByName(username)
    }catch(e){
        return false
    }
    if(manager.accountType === 'manager'){
        return true
    }
    else{
        return false
    }
}
    

module.exports = {createUser, checkUser, updateUserProfile, getUserIdByName, addRestaurantToManager}