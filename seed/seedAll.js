const managerSeed = require('./seedManagers');
const userSeed = require('./seedUsers');
const restaurantSeed = require('./seedRestaurants');
const foodSeed = require('./seedFoodItems');
const reviewSeed = require('./seedReviews');

console.log("Working on seeding your database...");

const allCollections = [managerSeed, userSeed, restaurantSeed, foodSeed, reviewSeed];

async function main(){
    
    //Await because of potential dependencies (i.e. restaurant need to exist before adding food_items)
    for (const collection of allCollections) {
        await collection.seed()
    }
}
main()