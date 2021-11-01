const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//middleware
function orderExists (req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find(order => order.id === orderId);
    if (foundOrder != undefined) {
        res.locals.order = foundOrder;
        return next()
    }
    next({
        status: 404,
        message: `Order id not found: ${orderId}`
    });
}
function bodyHasValidProperty(request, response, next) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = request.body;
    if (deliverTo == undefined || deliverTo.length == 0) {
        next({
            status: 400,
            message: `Order must include a deliverTo`
        })
        }
    else if (mobileNumber == undefined || mobileNumber.length == 0){
        next({
            status: 400,
            message: `Order must include a mobileNumber`
        })
    }
    else if (dishes == undefined || dishes.length == 0 || Array.isArray(dishes) == false) {
        next({
            status: 400,
            message: `Order must include at least one dish`
        })
    }
    else if (dishes.length != undefined && dishes.length != 0){
        for (let i = 0; i < dishes.length; i++) {
            if (!dishes[i].quantity || dishes[i].quantity <= 0 || typeof(dishes[i].quantity) != "number") {
                next({
                    status: 400,
                    message: `dish ${i} must have a quantity that is an integer greater than 0`
                })
            }
        }
    }
    return next()
}
function routeMatch (req, res, next) {
  const { orderId } = req.params;
  const id = req.body.data.id;
  if( orderId == id){
    return next()
  }
  else if (!id || id == undefined) {
      return next()
  }
  next({
    status: 400,
    message: `Order id does not match route id. Dish: ${id}, Route: ${orderId}`
  })
}
function checkDeleteStatus (req, res, next){
    let orderToCheck = res.locals.order;
    if (orderToCheck.status == "pending"){
        return next()
    }
    next({
        status: 400,
        message: `An order cannot be deleted unless it is pending`
    })
}
function checkUpdateBody (req, res, next) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    if (deliverTo == undefined || deliverTo.length == 0) {
        next({
            status: 400,
            message: `Order must include a deliverTo`
        })
        }
    else if (mobileNumber == undefined || mobileNumber.length == 0){
        next({
            status: 400,
            message: `Order must include a mobileNumber`
        })
    }
    else if (!status || status.length == 0){
        next({
            status: 400,
            message: `Order must have a status of pending, preparing, out-for-delivery, delivered.`
        })
    }
    else if (status == "invalid"){
        next({
            status: 400,
            message: `status is invalid.`
        })
    }
    else if (dishes == undefined || dishes.length == 0 || Array.isArray(dishes) == false) {
        next({
            status: 400,
            message: `Order must include at least one dish`
        })
    }
    else if (dishes.length != undefined && dishes.length != 0){
        for (let i = 0; i < dishes.length; i++) {
            if (!dishes[i].quantity || dishes[i].quantity <= 0 || typeof(dishes[i].quantity) != "number") {
                next({
                    status: 400,
                    message: `dish ${i} must have a quantity that is an integer greater than 0`
                })
            }
        }
    }
    return next()
}

// CRUD functions
function list (req, res) {
    res.send({data: orders})
}
function read (req, res) {
    res.json({ data: res.locals.order})
}
function create (req, res, next) {
    const newId = nextId();
    const { data : {
        deliverTo,
        mobileNumber,
        status,
        dishes
    } } = req.body;
    const newOrder = {
        deliverTo,
        mobileNumber,
        status,
        dishes,
        "id": newId
    }
    orders.push(newOrder)
    res.status(201).json({ data: newOrder})
}
function destroy (req, res) {
    const { orderId } = req.params;
    const index = orders.findIndex((order) => order.id === Number(orderId));
    const deletedOrders = orders.splice(index, 1);
    res.sendStatus(204)
}
function update (req, res) {
    const order = res.locals.order;
    const ogDeliverTo = order.deliverTo;
    const ogMobileNumber = order.mobileNumber;
    const ogStatus = order.status;
    const ogDishes = order.dishes;
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    if(ogDeliverTo !== deliverTo || ogMobileNumber !== mobileNumber || ogStatus !== status || ogDishes !== dishes){
        order.deliverTo = deliverTo;
        order.mobileNumber = mobileNumber;
        order.status = status;
        order.dishes = dishes;
    }
    res.json({ data: order})
}
// Exports
module.exports = {
    list,
    read: [orderExists, read],
    create: [bodyHasValidProperty, create],
    update: [orderExists, routeMatch, checkUpdateBody, update],
    delete: [orderExists, checkDeleteStatus, destroy],

}