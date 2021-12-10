const reviews_DAL = require('../data/reviews');
const users_DAL = require('../data/users');
const restaurants_DAL = require('../data/restaurants');

async function seed() { 

  let r_id1 = await restaurants_DAL.getRestaurantIdFromName("Bob's Burgers");
  let r_id2 = await restaurants_DAL.getRestaurantIdFromName("Street Taco");
  let r_id3 = await restaurants_DAL.getRestaurantIdFromName("The Breakfast Barn");
  let r_id4 = await restaurants_DAL.getRestaurantIdFromName("Asian Cuisine");

  let u_id1 = await users_DAL.getUserIdByName("user1");
  await reviews_DAL.create(r_id1, u_id1, "The burgers really are super!", 5, false, "no_image.jpeg");
  await reviews_DAL.create(r_id3, u_id1, "My bacon was burnt...", 2, false, "burnt");

  let u_id2 = await users_DAL.getUserIdByName("user2");
  await reviews_DAL.create(r_id1, u_id2, "Great!", 4, false, "no_image.jpeg");
  await reviews_DAL.create(r_id2, u_id2, "Tacos were just okay", 3, false, "no_image.jpeg");

  let u_id3 = await users_DAL.getUserIdByName("user3");
  await reviews_DAL.create(r_id4, u_id3, "Service could be better", 3, false, "no_image.jpeg");

  console.log("Reviews have been created...");
  console.log("Seeding completed!");
}

if (require.main === module) {
    seed();
}

module.exports = {
    seed
  };