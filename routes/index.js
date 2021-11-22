//Add routes here as needed
const restaurantsRoutes = require('./restaurants');

const constructorMethod = (app) => {
  app.use('/restaurants', restaurantsRoutes);

  app.use('*', (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;
