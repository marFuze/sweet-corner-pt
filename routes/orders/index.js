const express = require('express');
const router = express.Router();

//get all user's orders

router.get('/', async (req, res, next) => {
    const authToken = req.headers.authorization

    try{
    if(authToken){
        //decode auth token and get user pid, convert to user id
        const decodedTokenData = jwt.decode(authToken,jwtSecret)
        const {uid} = decodedTokenData
        const getUserId = await db.query(`select "id" from "users" where "pid"=$1;`,[uid])
        const userId = getUserId.rows[0].id

        const getOrders = await db.query(`select * from "orders" where "userId"=$1;`,[userId])

        const ordersResult = getOrders.rows[0]
        console.log("TCL: ordersResult", ordersResult)
        
        res.send({message: 'from get all orders'});
    }
}

    catch(err){
        next(err)
    }
})

//get order details

router.get('/:order_id', (req, res, next) => {
    const authToken = req.headers.authorization

    try{
    if(authToken){
        //decode auth token and get user pid, convert to user id
        const decodedTokenData = jwt.decode(authToken,jwtSecret)
        const {uid} = decodedTokenData
        const getUserId = await db.query(`select "id" from "users" where "pid"=$1;`,[uid])
        const userId = getUserId.rows[0].id
    }
}
catch(err){
    next(err)
}
})

//create new order
router.post('/', (req, res, next) => {
    const authToken = req.headers.authorization

    try{
    if(authToken){
        //decode auth token and get user pid, convert to user id
        const decodedTokenData = jwt.decode(authToken,jwtSecret)
        const {uid} = decodedTokenData
        const getUserId = await db.query(`select "id" from "users" where "pid"=$1;`,[uid])
        const userId = getUserId.rows[0].id
    }
}
    catch(err){
        next(err)
    }
})

//create new guest order

router.post('/guest', (req, res, next) => {
    const cartToken = req.headers['x-cart-token']
    try{
        if(cartToken){
            const decodedToken = jwt.decode(cartToken, jwtSecret);
            const {cartPid} = decodedToken;
            res.locals.tokenCartPid = cartPid;
            //convert cart pid to id
            const getCartTokenCart = await db.query(`select * from "carts" where "pid"=$1`,[cartPid])
            if(!getCartTokenCart){

                res.status(404).send(
                    {
                        "cartId": null,
                        "message": "No active cart"
                    }
                )
                return
            }
            const cartTokenCartId = getCartTokenCart.rows[0].id
            res.locals.cartId = cartTokenCartId
    }
}
    catch(err){
        next(err)
    }
})

//get guest order details

router.get('/guest/:order_id', (req, res, next) => {
    try{

    }
    catch(err){
        next(err)
    }
})

module.exports = router;