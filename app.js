const express = require('express');
const app = express();
const session = require('express-session');
const configRoutes = require('./routes');
const exphbs = require('express-handlebars');
const path = require('path');
const static = express.static(__dirname + '/public');
const xss = require('xss');

app.use(express.static(__dirname + '/public/')); //Need this to access static images
app.use('/public', static);
app.use(express.json())
app.use(express.urlencoded({ extended: true }));


app.engine('handlebars', exphbs({ defaultLayout: 'main'}));
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'handlebars');

app.use(
  session({
    name: 'AuthCookie',
    secret: "RestaurantApp super secret string that nobody can know",
    saveUninitialized: true,
    resave: false
  })
);

app.use('/', (req, res, next) => {
  if(req.body){
    //Protect against xss
    for (const iterator in req.body) {
      req.body[iterator] = xss(req.body[iterator])
    }
  }
  next();
});

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});