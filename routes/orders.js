const express = require('express');
const router = express.Router();
const restaurants_DAL = require('../data/restaurants');
const orders_DAL = require('../data/orders');
const replies_DAL = require('../data/replies');
const user_DAL = require('../data/users');
const manager_DAL = require('../data/managers');
const path = require('path');
const session = require('express-session');
const fs = require('fs');
const multer = require('multer');
const ObjectId = require('mongodb').ObjectId;

const upload = multer({ dest: '../uploads/'});

router.get('/placed/:restid', async (req, res) => {
    const id = req.params.restid

    //Check that the person attempting to access this is the manager of 
    if (!req.session.user || !id || !await manager_DAL.userIsManagerOfRestaurant(req.session.user.username, id)){
      return res.status(403).redirect('/restaurants')
    }

    let restaurantOrders = await restaurants_DAL.getRestaurantFromId(id)
    restaurantOrders = restaurantOrders.ordersPlaced
    let placedOrdersArray = []
    if(restaurantOrders.length > 0){
        placedOrdersArray = await orders_DAL.getPlacedOrdersFromIds(restaurantOrders)
    }

    res.render('orders/OrdersPlacedPage', {title: "Placed Orders", page_function: "View Customer Orders!", orders: placedOrdersArray})
});

router.get('/completed/:restid', async (req, res) => {
    const id = req.params.restid

    //Check that the person attempting to access this is the manager of 
    if (!req.session.user || !id || !await manager_DAL.userIsManagerOfRestaurant(req.session.user.username, id)){
      return res.status(403).redirect('/restaurants')
    }

    let restaurantOrders = await restaurants_DAL.getRestaurantFromId(id)
    restaurantOrders = restaurantOrders.ordersPlaced
    let placedOrdersArray = []
    if(restaurantOrders.length > 0){
        placedOrdersArray = await orders_DAL.getCompletedOrdersFromIds(restaurantOrders)
    }

    res.render('orders/OrdersCompletedPage', {title: "Completed Orders", page_function: "View Completed Customer Orders!", orders: placedOrdersArray})
});

router.get('/:userid/incomplete', async (req, res) => {
    const userid = req.params.userid

    //Check that the person attempting to access this is the manager of 
    if (!req.session.user || !userid || !((await user_DAL.getUserIdByName(req.session.user.username)) === userid)){
      return res.status(403).redirect('/restaurants')
    }

    let userOrders = await orders_DAL.getAllOrdersFromUser(req.session.user.username)
    let incompleteOrders = []
    if(userOrders.length > 0){
        incompleteOrders = await orders_DAL.getIncompleteOrdersFromIds(userOrders)
    }

    res.render('user/OrdersIncompletePage', {title: "Incomplete Orders", page_function: "View Incomplete Orders!", orders: incompleteOrders, userid: userid})
});

router.get('/:userid/placed', async (req, res) => {
    const userid = req.params.userid

    //Check that the person attempting to access this is the manager of 
    if (!req.session.user || !userid || !((await user_DAL.getUserIdByName(req.session.user.username)) === userid)){
      return res.status(403).redirect('/restaurants')
    }

    let userOrders = await orders_DAL.getAllOrdersFromUser(req.session.user.username)
    let orders = []
    if(userOrders.length > 0){
        orders = await orders_DAL.getPlacedOrdersFromIds(userOrders)
    }

    res.render('user/OrdersPlacedPage', {title: "In Progress Orders", page_function: "View In Progress Orders!", orders: orders, userid: userid})
});

router.get('/:userid/completed', async (req, res) => {
    const userid = req.params.userid

    //Check that the person attempting to access this is the manager of 
    if (!req.session.user || !userid || !((await user_DAL.getUserIdByName(req.session.user.username)) === userid)){
      return res.status(403).redirect('/restaurants')
    }

    let userOrders = await orders_DAL.getAllOrdersFromUser(req.session.user.username)
    let orders = []
    if(userOrders.length > 0){
        orders = await orders_DAL.getCompletedOrdersFromIds(userOrders)
    }

    res.render('user/OrdersCompletedPage', {title: "Completed Orders", page_function: "View Completed Orders!", orders: orders, userid: userid})
});

router.get('/:userid/favorites', async (req, res) => {
    const userid = req.params.userid

    //Check that the person attempting to access this is the manager of 
    if (!req.session.user || !userid || !((await user_DAL.getUserIdByName(req.session.user.username)) === userid)){
      return res.status(403).redirect('/restaurants')
    }

    let favorites = await user_DAL.getUserProfileByName(req.session.user.username)
    favorites = favorites.favorites
    let orders = []
    if(favorites.length > 0){
        orders = await orders_DAL.getCompletedOrdersFromIds(favorites)
    }

    //TODO: check that the itemNames still exist and if they don't remove the favorite item from the user

    res.render('user/OrdersFavoritePage', {title: "Favorites", page_function: "View Your Favorites!", orders: orders, userid: userid})
});

router.post('/complete/:restid/:orderid', async (req, res) => {
    const restid = req.params.restid
    const orderid = req.params.orderid
    //Check that the person attempting to access this is the manager of 
    if (!req.session.user || !restid || !orderid ||  !await manager_DAL.userIsManagerOfRestaurant(req.session.user.username, restid)){
      return res.status(403).redirect('/restaurants')
    }

    await orders_DAL.deliveredOrder(orderid)

    res.redirect('/orders/placed/' + restid)
});

router.post('/delete/:orderid/:userid', async (req, res) => {
    const orderid = req.params.orderid
    const userid = req.params.userid
    //Check that the person attempting to access this is the manager of 
    if (!req.session.user || !orderid || !userid || !((await user_DAL.getUserIdByName(req.session.user.username)) === userid)){
      return res.status(403).redirect('/restaurants')
    }

    await orders_DAL.deleteOrder(orderid)

    res.redirect(`/orders/${userid}/incomplete`)
});

router.post('/addFavorite/:orderid/:userid', async (req, res) => {
    const orderid = req.params.orderid
    const userid = req.params.userid
    //Check that the person attempting to access this is the manager of 
    if (!req.session.user || !orderid || !userid || !((await user_DAL.getUserIdByName(req.session.user.username)) === userid)){
      return res.status(403).redirect('/restaurants')
    }

    await user_DAL.addOrderToFavorites(orderid, userid)

    res.redirect(`/orders/${userid}/favorites`)
});

router.post('/removeFavorite/:orderid/:userid', async (req, res) => {
    const orderid = req.params.orderid
    const userid = req.params.userid
    //Check that the person attempting to access this is the manager of 
    if (!req.session.user || !orderid || !userid || !((await user_DAL.getUserIdByName(req.session.user.username)) === userid)){
      return res.status(403).redirect('/restaurants')
    }

    await user_DAL.removeOrderFromFavorites(orderid, userid)

    res.redirect(`/orders/${userid}/favorites`)
});

module.exports = router;
