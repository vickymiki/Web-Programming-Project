const user_DAL = require("../data/users");

async function seed() {
  await user_DAL.createUser("user1", "1 first street", "Hoboken", "New Jersey", "07030", "first@aol.com", "111-333-5555", "user1user1");
  await user_DAL.createUser("user2", "2 second street", "Memphis", "Tennessee", "77733", "second@gmail.com", "222-222-1212", "user2user2");
  await user_DAL.createUser("user3", "3 third street", "Cleveland", "Ohio", "35863", "third@gmail.com", "123-123-3213", "user3user3");

  console.log("Users have been created...");
}

if (require.main === module) {
    seed();
}

module.exports = {
    seed
  };