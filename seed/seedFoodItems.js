const restaurants_DAL = require('../data/restaurants');

async function seed(){
    console.log("Starting restaurant seed...")
    let restaurantId = await restaurants_DAL.getRestaurantIdFromName('mcdonalds')
    await restaurants_DAL.addFood_Items(restaurantId, ['food1', 'food2', 'food3'])
    console.log("Completed restaurant seed...")
}

if (require.main === module) {
    seed();
}

module.exports = {
    seed
  };