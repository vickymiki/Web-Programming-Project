const restaurants_DAL = require('../data/restaurants');

async function seed(){
  await restaurants_DAL.addRestaurant("Bob's Burgers", "99 Burger Lane", "Hoboken", "New Jersey", "07030", "$", ["Aerican"], "burgerbob@aol.com", "777-444-5353", "manager1");
  await restaurants_DAL.addRestaurant("Street Taco", "12 Taco Street", "Jefferson", "Minnesota", "74564", "$$$", ["Mexican"], "spicy@gmail.com", "888-456-0157", "manager2");
  await restaurants_DAL.addRestaurant("The Breakfast Barn", "123 Pancake Lane", "Maple", "Maryland", "93456", "$", ["American"], "syrup@gmail.com", "909-234-6826", "manager2");
  await restaurants_DAL.addRestaurant("Asian Cuisine", "7 Main Street", "New York", "New York", "13242", "$$", ["Asian"], "asia@gmail.com", "676-676-6767", "manager3");
  console.log("Restaurants have been created...");
}

if (require.main === module) {
    seed();
}

module.exports = {
    seed
  };