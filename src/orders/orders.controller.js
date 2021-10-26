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
        message: `Order id not found: ${dishId}`
    });
}

function bodyHasValidProperty(request, response, next) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = request.body;
    //console.log(Array.isArray(dishes), "****request body inside validProperty****")
    //console.log(dishes)
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
  //console.log(dishes, "**this is the dishes inside the bodyhasValidProp**")
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
  }

function routeMatch (req, res, next) {
  const { orderId } = req.params;
  const id = req.body.data.id;
  if( orderId == id){
    return next()
  }
  next({
    status: 400,
    message: `Order id does not match route id. Dish: ${id}, Route: ${orderId}`
  })
}

// CRUD functions
function list (req, res) {
    res.send({data: orders})
}
function read (req, res) {
    res.json({ data: res.locals.order})
}
function create2 (req, res, next) {
    //console.log("inside the create")
    /*const newId = nextId();
    const { data : {
        deliverTo,
        mobileNumber,
        status,
        dishes
    } } = req.body;
    console.log(data, "---this is the data inside the createOrder")
    const newOrder = {
        deliverTo,
        mobileNumber,
        status,
        dishes,
        "id": newId
    }*/
    res.sendStatus(201).json({})
}

// Exports
module.exports = {
    list,
    read: [orderExists, read],
    create: [bodyHasValidProperty, create2],
    update: [orderExists, routeMatch]

}