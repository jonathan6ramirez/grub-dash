const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

//middleware
function dishExists (req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find(dish => dish.id === dishId);
    if (foundDish) {
        res.locals.dish = foundDish;
        return next()
    }
    next({
        status: 404,
        message: `Dish id not found: ${dishId}`
    });
}

function bodyHasValidProperty(request, response, next) {
    const { data: { name, description, price, image_url } = {} } = request.body;
    if (!name || name.length == 0) {
        next({
            status: 400,
            message: `Order must include a name`
        })
        }
    else if (!description || description.length == 0){
        next({
            status: 400,
            message: `Order must include a description`
        })
    }
    else if (!price || price <= 0) {
        next({
            status: 400,
            message: `Dish must have a price that is an integer greater than 0`
        })
    }
    else if (!image_url || image_url.length == 0) {
      next({
        status: 400,
        message: `	Dish must include a image_url`
      })
    }
    
  }

function routeMatch (req, res, next) {
  const { dishId } = req.params;
  const id = req.body.data.id;
  if( dishId == id){
    return next()
  }
  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
  })
}


// CRUD functions
function list (req, res,) {
    res.send({data: dishes})
}

function read (req, res) {
    res.json({ data: res.locals.dish})
}

function update (req, res, next) {
    const dish = res.locals.dish;
    //const originalResult = flip
}

function create (req, res) {
    const { data: { name, description, price, image_url} } = req.body;
    const newDish = {
      id: nextId,
      "name": name,
      "description": description,
      "price": price,
      "image_url": image_url
    }
    res.send(201).json({ data: newDish})
}

// Exports
module.exports = {
    list,
    read: [dishExists, read],
    create: [bodyHasValidProperty, create],
    update: [dishExists, routeMatch],

}