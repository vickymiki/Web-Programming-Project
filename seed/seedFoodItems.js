const restaurants_DAL = require('../data/restaurants');
const { ObjectId, ObjectID } = require("bson");
async function seed(){
    console.log("Starting restaurant seed...")
    let restaurantId = await restaurants_DAL.getRestaurantIdFromName('mcdonalds')
    
    let item1 = {_id: ObjectID(), itemName: "Mcdouble", customizableComponents: ["Cheese", "Pickles", "Lettuce"], price: 3.99}
    let item2 = {_id: ObjectID(), itemName: "Coke", customizableComponents: [], price: 0.99}
    let item3 = {_id: ObjectID(), itemName: "Salad", customizableComponents: ["Ranch"], price: 2.99}

    await restaurants_DAL.addFood_Items(restaurantId, [item1,item2,item3])
    console.log("Completed restaurant seed...")
}

if (require.main === module) {
    seed();
}

module.exports = {
    seed
  };