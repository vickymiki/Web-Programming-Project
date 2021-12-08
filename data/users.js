const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const managers = mongoCollections.managers;
const { toObjectId, isValidName, isValidPassword, userFieldChecker } = require("../dataUtils"); 
const bcrypt = require('bcrypt');
const ObjectId = require('mongodb').ObjectId;
//const { use } = require('../routes/restaurants');
const saltRounds = 16;

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

async function createUser(userName, streetAddress, city, state, zip, 
    email, phone, password) {
    const newUser = { userName, streetAddress, city, state, zip, 
        email, phone, password};
    userFieldChecker(newUser, update = false);
    
    newUser.review_id = [];
    newUser.reply_id = [];
    newUser.favorites = [];
    newUser.review_feedback = {
        likes: [], 
        dislikes: []
    }

    newUser.accountType = "user";
    userName = userName.toLowerCase();
    newUser.userName = userName;
    const userCollection = await users();
    const user = await userCollection.findOne({userName: userName});
    if(user !== null) {
        throw `${userName} is occupied, try a different one`;
    }

    const managerCollection = await managers();
    const manager = await managerCollection.findOne({userName: userName});
    if(manager !== null) {
        throw `${userName} is occupied, try a different one`;
    }

    newUser.password = await bcrypt.hash(password, saltRounds);
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
        return false;
    } 

    let result = await bcrypt.compare(password, user.password);
    if(!result) return false
    return true;

}

async function updateUserProfile(id, streetAddress, city, state, zip, 
    email, phone) {
    
    const userInfos = { streetAddress, city, state, zip, 
        email, phone };
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

async function getUserProfileByName(userName){
    isValidName(userName);
    const userCollection = await users();
    const user = await userCollection.findOne({ userName: userName });
    if(user === null) throw `Unable to find user: ${userName}`;
    user._id = user._id.toString();
    return user;
}

async function getUserIdByName(userName) {
    isValidName(userName);
    const userCollection = await users();
    const user = await userCollection.findOne({ userName: userName });
    if(user === null) throw `Unable to find user: ${userName}`;
    return user._id.toString();
}

async function changePassword(userId, oldPwd, newPwd) {

    const userCollection = await users();
    const user = await userCollection.findOne({userName: toObjectId(userId)});
    if(user === null)   throw `Unable to find user with id: ${userId}`;
    let result = await bcrypt.compare(oldPwd, user.password);
    if(!result)    throw "Username and password don't mactch";
    user.password = await bcrypt.hash(newPwd, saltRounds);
    const updatedInfo = await userCollection.updateOne({_id: toObjectId(id)}, {$push: {password: user.password}});
    if(updatedInfo.modifiedCount === 0) {
        throw "could not change password successfully";
    }
    return { updatePwd: true };
}

async function addOrderToFavorites(order_id, user_id){
    user_id = validateObjectId(user_id)
    order_id = validateObjectId(order_id)
    const userCollection = await users()
    let update = await userCollection.updateOne({_id: user_id}, {$push: {favorites: order_id.toString()}})
    if(update.matchedCount === 0) throw `Failed to add order: ${order_id}`    

    return true
}

async function removeOrderFromFavorites(order_id, user_id){
    user_id = validateObjectId(user_id)
    order_id = validateObjectId(order_id)
    const userCollection = await users()
    let update = await userCollection.updateOne({_id: user_id}, {$pull: {favorites: order_id.toString()}})
    if(update.matchedCount === 0) throw `Failed to remove order: ${order_id}`    

    return true
}

module.exports = {createUser, checkUser, updateUserProfile, getUserProfileByName, getUserIdByName, changePassword, addOrderToFavorites, removeOrderFromFavorites}
