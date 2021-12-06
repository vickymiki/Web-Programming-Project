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

const upload = multer({ dest: '/uploads/'});

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

module.exports = router;