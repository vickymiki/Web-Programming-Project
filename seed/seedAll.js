const foodSeed = require('./seedFoodItems')
const restaurantSeed = require('./seedRestaurants')
console.log("Seeding all collections...")

const allCollections = [restaurantSeed, foodSeed]

async function main(){
    
    //Await because of potential dependencies (i.e. restaurant need to exist before adding food_items)
    for (const collection of allCollections) {
        await collection.seed()
    }
}
main()

console.log("Finished seeding all collections...")