const express = require('express');

function ApplyRoutes(app){
    
    app.use(express.urlencoded({extended: false}));
    //const apiRouter = express.Router()
    app.use('/api/cart', require('./cart'))

    app.use('/api/products', require('./products'))

    app.use('/api/orders', require('./orders'))

    return app
}

module.exports.routes = ApplyRoutes