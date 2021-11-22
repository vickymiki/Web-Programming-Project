const restaurants_DAL = require('../data/restaurants');

async function seed(){
    console.log("Starting restaurant seed...")
     await restaurants_DAL.addRestaurant('mcdonalds', '123 main st', 'hoboken', 'new jersey', '11111', '$', ["Fast-food", "Burgers"])
    console.log("Completed restaurant seed...")
}

if (require.main === module) {
    seed();
}

module.exports = {
    seed
  };