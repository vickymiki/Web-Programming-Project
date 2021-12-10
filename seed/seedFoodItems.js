const restaurants_DAL = require('../data/restaurants');
const ObjectId = require('mongodb').ObjectId;
async function seed(){
    
  let id1 = await restaurants_DAL.getRestaurantIdFromName("Bob's Burgers");
    
  let item1_1 = {itemName: "Bob the Burger", price: "8.99", isBurger: true, customizableComponents: ["Bread-top", "seeds", "lettuce", "bacon", "cheese", "meat", "bread-bottom"], imageName: "burger" };
  await restaurants_DAL.addFood_Item(id1, item1_1);
  let item2_1 = { itemName: "Salad", price: "7.99", isBurger: false, customizableComponents: ["ranch", "italian", "croutons", "tomato", "onion"], imageName: "salad" };
  await restaurants_DAL.addFood_Item(id1, item2_1);
  let item3_1 = { itemName: "Water", price: "3.99", isBurger: false, customizableComponents: [], imageName: "water" };
  await restaurants_DAL.addFood_Item(id1, item3_1);
    
  let id2 = await restaurants_DAL.getRestaurantIdFromName("Street Taco");

  let item1_2 = { itemName: "Tacos", price: "8.99", isBurger: false, customizableComponents: ["lettue", "cheese", "tomato", "sour cream", "salsa"], imageName: "taco" };
  await restaurants_DAL.addFood_Item(id2, item1_2);
  let item2_2 = { itemName: "Chips and Salsa", price: "3.99", isBurger: false, customizableComponents: ["mild", "medium", "hot"], imageName: "chips" };
  await restaurants_DAL.addFood_Item(id2, item2_2);
  let item3_2 = { itemName: "Churros", price: "5.99", isBurger: false, customizableComponents: ["extra sauce"], imageName: "churro" };
  await restaurants_DAL.addFood_Item(id2, item3_2);
  let item4_2 = { itemName: "Coke", price: "3.99", isBurger: false, customizableComponents: [], imageName: "coke" };
  await restaurants_DAL.addFood_Item(id2, item4_2);

  let id3 = await restaurants_DAL.getRestaurantIdFromName("The Breakfast Barn");

  let item1_3 = { itemName: "Pancakes", price: "6.99", isBurger: false, customizableComponents: ["syrup", "butter", "chocolate chips"], imageName: "pancake" };
  await restaurants_DAL.addFood_Item(id3, item1_3);
  let item2_3 = { itemName: "Waffles", price: "6.99", isBurger: false, customizableComponents: ["syrup", "butter", "chocolate chips"], imageName: "waffle" };
  await restaurants_DAL.addFood_Item(id3, item2_3);
  let item3_3 = { itemName: "Eggs and Bacon", price: "7.99", isBurger: false, customizableComponents: ["side of toast"], imageName: "eggs" };
  await restaurants_DAL.addFood_Item(id3, item3_3);
  let item4_3 = { itemName: "Orange Juice", price: "3.99", isBurger: false, customizableComponents: [], imageName: "oj" };
  await restaurants_DAL.addFood_Item(id3, item4_3);

  let id4 = await restaurants_DAL.getRestaurantIdFromName("Asian Cuisine");

  let item1_4 = { itemName: "Sushi Roll", price: "9.99", isBurger: false, customizableComponents: ["salmon", "tuna", "crab", "avacado", "soy sauce", "wasabi"], imageName: "sushi" };
  await restaurants_DAL.addFood_Item(id4, item1_4);
  let item2_4 = { itemName: "Fried Rice", price: "8.99", isBurger: false, customizableComponents: ["chicke", "pork", "beef"], imageName: "rice" };
  await restaurants_DAL.addFood_Item(id4, item2_4);
  let item3_4 = { itemName: "Water", price: "3.99", isBurger: false, customizableComponents: [], imageName: "water" };
  await restaurants_DAL.addFood_Item(id4, item3_4);

    console.log("Menu items have been created...")
}

if (require.main === module) {
    seed();
}

module.exports = {
    seed
  };