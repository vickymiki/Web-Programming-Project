
# CS546_Group1

## Welcome to our final project for CS546 Web Programming I

### Intro

Our group created a restaurant ordering system, where users are able to place orders at their favorite restaurants, leave reviews on their experience, and leave comments and likes on others' reviews! A separate type of user account exists for managers, where they can create restaurants, add food items to their restaurants and complete orders that have been placed by customers.

### Running our Application

To run our application, complete the following steps:

* First, clone our repo
* Next, you will need to seed your database with information provided in our seedAll.js file. To run this, simply use `npm run seed`. This may take a minute or so.
* You're now ready to run the application! Start it up with `npm start` and enjoy our social online restaurnt experience!

### Core Features

* Guest Landing Page
  * Information about the store
  * Different locations of stores
  * Guest users without an account can view the landing page, but can not place orders
  * View menu/item descriptions
* Login/Signup Page
  * "Create an account" prompt
  * Set a user's defualt delivery address
* Ordering Page
  * Choose which restaurant to order from
  * Users can view menu items at a particular restaurant
  * Select menu items to order
  * Customize those items while ordering
* Cart/Checkout Page
  * Users can view/modify items in their current cart
  * Apply an optional super secret discout code
* Order Status Page
  * Users can view the status of their order (In progress/Completed)
* Admin User Page
  * List all orders that have been placed/completed and their associated information
  * Edit the status of orders at their own restaurants
  * Edit menu items at their restaurant
  * Create new items and/or new restaurants to manage and disply
  * View all of their current restaurants
* Completed Orders Page
  * List all previous orders that have been placed by a user
  * Users can add orders to their favorites to order again in the future
* Restaurants Page
  * View all restaurants
  * Display the current logged in user's username
  * Display favorite orders if any exist
* Reviews and Likes Page
  * View all reviews, replies and images posted for a particular restaurant
  * Users can uplaod their own reviews with images
  * Users can comment on others' reviews and like or dislike them
  * Users can view, edit and delete their own reviews
  * (EXTRA) Users can view a page that only lists their own reviews/comments to make editing easier

[Our repo link](https://github.com/mnoga07/CS546_Group1)
