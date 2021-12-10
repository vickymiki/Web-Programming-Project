const manager_DAL = require("../data/managers");

async function seed() {
  await manager_DAL.createManager("manager1", "111 maple street", "Newark", "New Jersey", "34343", "burgers@gmail.com", "678-888-4321", "manager1");
  await manager_DAL.createManager("manager2", "2 hungry street", "hungry", "Louisiana", "98765", "hungry@hippos.com", "345-234-1234", "manager2");
  await manager_DAL.createManager("manager3", "101 manager street", "flavortown", "Georgia", "76543", "flavor@gmail.com", "909-878-4545", "manager3");

  console.log("Managers have been created...");
}

if (require.main === module) {
    seed();
}

module.exports = {
    seed
  };