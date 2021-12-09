//Add routes here as needed
const restaurantsRoutes = require('./restaurants');
const signupRoutes = require('./signup');
const loginRoutes = require('./login');
const logoutRoutes = require('./logout');
const profileRoutes = require('./profile');
const ordersRoutes = require('./orders');

const constructorMethod = (app) => {
  //Default page as restaurant list
  app.get('/', (req, res) => {
    res.redirect('/restaurants')
  });

  app.use('/restaurants', restaurantsRoutes);
  app.use('/signup', signupRoutes);
  app.use('/login', loginRoutes);
  app.use('/logout', logoutRoutes);
  app.use('/profile', profileRoutes);
  app.use('/orders', ordersRoutes);

  app.use('*', (req, res) => {
    res.status(404)
    res.render('error/error', {error: `${res.statusCode} Not Found`, title: "Error", page_function: "Error Display"});
  });
};

module.exports = constructorMethod;
