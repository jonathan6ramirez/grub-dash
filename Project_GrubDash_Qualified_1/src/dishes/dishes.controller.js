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
    else if (!price || price <= 0 || typeof(price) !== "number") {
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
    else {
         return next()
    }
    
  }

function routeMatch (req, res, next) {
  const { dishId } = req.params;
  const id = req.body.data.id;
  if( dishId == id){
    return next()
  }
  else if (!id || id == null){
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

function update (req, res) {
    const dish = res.locals.dish;
    const ogName = dish.name;
    const ogDescription = dish.description;
    const ogPrice = dish.price;
    const ogImage_url = dish.image_url;
    const { data: { name, description, price, image_url } = {} } = req.body;
    if (ogName !== name || ogDescription !== description || ogPrice !== price || ogImage_url !== image_url) {
            dish.name = name;
            dish.description = description;
            dish.price = price;
            dish.image_url = image_url;
    }
    res.json({ data: dish})
}

function create (req, res) {
    const { data: { name, description, price, image_url} } = req.body;
    const newId = nextId(); 
    const newDish = {
      "id": newId,
      "name": name,
      "description": description,
      "price": price,
      "image_url": image_url
    }
    dishes.push(newDish)
    res.status(201).json({ data: newDish})
}

// Exports
module.exports = {
    list,
    read: [dishExists, read],
    create: [bodyHasValidProperty, create],
    update: [dishExists, routeMatch, bodyHasValidProperty, update],
}