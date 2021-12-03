const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const managers = mongoCollections.managers;
const { toObjectId, isValidName, isValidPassword, userFieldChecker } = require("../dataUtils"); 
const bcrypt = require('bcrypt');
const { use } = require('../routes/restaurants');
const saltRounds = 16;


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

module.exports = {createUser, checkUser, updateUserProfile, getUserProfileByName, getUserIdByName, changePassword}
