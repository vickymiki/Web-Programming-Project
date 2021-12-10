const managerSeed = require('./seedManagers');
const userSeed = require('./seedUsers');
const restaurantSeed = require('./seedRestaurants');
const foodSeed = require('./seedFoodItems');
const reviewSeed = require('./seedReviews');
const connection = require('../config/mongoConnection');

console.log("Working on seeding your database...");

const allCollections = [managerSeed, userSeed, restaurantSeed, foodSeed, reviewSeed];

const main = async () =>{
    
    //Await because of potential dependencies (i.e. restaurant need to exist before adding food_items)
    for (const collection of allCollections) {
        await collection.seed()
  }
  const db = await connection();
  await db.serverConfig.close();

  console.log("Your database has been seeded!");
}

main().catch((e) => {
  console.log(e);
  }
)