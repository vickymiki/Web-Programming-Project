//Add routes here as needed
const restaurantsRoutes = require('./restaurants');
const signupRoutes = require('./signup');
const loginRoutes = require('./login');

const constructorMethod = (app) => {
  //Default page as restaurant list
  app.get('/', (req, res) => {
    res.redirect('/restaurants')
  });

  app.use('/restaurants', restaurantsRoutes);
  app.use('/signup', signupRoutes);
  app.use('/login', loginRoutes);

  app.use('*', (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;
