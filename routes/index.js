const express = require('express');

function ApplyRoutes(app){
    
    app.use(express.urlencoded({extended: false}));
    app.use(express.json()); 

    app.use('/api/auth/', require('./auth'))

    app.use('/api/cart', require('./cart'))

    app.use('/api/products', require('./products'))

    app.use('/api/orders', require('./orders'))

    app.use('/images', require('./images'))

    return app
}

module.exports.routes = ApplyRoutes