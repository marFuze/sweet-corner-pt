const express = require('express');

function ApplyRoutes(app){
    
    app.use(express.urlencoded({extended: false}));
    app.use(express.json()); 

    //const apiRouter = express.Router()
    app.use('/api/cart', require('./cart'))

    app.use('/api/products', require('./products'))

    app.use('/api/orders', require('./orders'))

    // app.use("/",(req,res) => {
    //     const Base_url
    //     const result = await fetch(url, path, req.headers)
    //     console.log(req.path);
    //     res.send(404);
    // })

    return app
}

module.exports.routes = ApplyRoutes