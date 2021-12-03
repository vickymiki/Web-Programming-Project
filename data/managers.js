const mongoCollections = require('../config/mongoCollections');
const managers = mongoCollections.managers;
const users = mongoCollections.users;
const bcrypt = require('bcrypt');
const saltRounds = 16;
const { isValidName, isValidPassword, managerFieldChecker } = require('../dataUtils');

module.exports = {
    async createManager(userName, streetAddress, city, state, zip, 
        email, phone, password) {

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
        const managerCollection = await managers();
        const manager = await managerCollection.findOne({userName: userName});
        if(manager !== null) {
            throw `${userName} is occupied, try a different one`;
        }

        const userCollection = await users();
        const user = await userCollection.findOne({userName: userName});
        if(user !== null) {
            throw `${userName} is occupied, try a different one`;
        }
        newManager.password = await bcrypt.hash(password, saltRounds);
        newManager.managedRestaurants = []
        const insertInfo = await managerCollection.insertOne(newManager);
        if(insertInfo.insertedCount === 0)  { 
            throw 'creating new user failed'; 
        }

        return { managerInserted: true };
    },

    async checkManager(userName, password) {
        if(!userName || !password) {
            throw 'UserName or password not provided';
        }
        isValidName(userName);
        isValidPassword(password);

        userName = userName.toLowerCase();
        const managerCollection = await managers();
        const manager = await managerCollection.findOne({userName: userName});
        if(manager === null) {
            throw 'manager not found';
        }
        let result = await bcrypt.compare(password, manager.password);
        if(!result)    throw "Username and password don't mactch";
        return { authenticated: true };
  },
    async getManagerIdByName(username) {
        isValidName(managerName);
        const managerCollection = await managers();
        const manager = await managerCollection.findOne({ userName: username });
        if(manager === null) {
            throw "manager not found";
        }
        return manager._id.toString();
    }, 
    async getManagerByName(managerName) {
        isValidName(managerName);
        const managerCollection = await managers();
        const manager = await managerCollection.findOne({managerName: managerName});
        if(manager === null) {
            throw "manager not found";
        }
        manager._id = manager._id.toString();
        return manager;
    },
    async addRestaurantToManager(restaurantId, managerName){
        isValidName(managerName);
        const manager = await getManagerByName(managerName);
        if(manager === null) {
            throw "manager not found";
        }
        let restaurants = manager.restaurants;
        restaurants.push(restaurantId);

        let updateInfo = await userCollection.updateOne({managerName: managerName}, {$push: {restaurants: restaurants}});
        if(updateInfo.matchedCount === 0) throw `Failed to add restaurant to manager: ${username}.`
        return { addRestaurant: true};
    }
}
