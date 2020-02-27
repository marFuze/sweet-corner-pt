const express = require('express');
const router = express.Router();
const {db} = require('../../db');
const jwt = require('jwt-simple');
const { jwtSecret } = require('../../config/jwt');
const auth = require('../../middleware/auth');

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

router.get('/:order_id', async (req, res, next) => {
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
router.post('/', async (req, res, next) => {
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

router.post('/guest', async (req, res, next) => {
    const cartToken = req.headers['x-cart-token']
    const { email, firstName, lastName } = req.body
    console.log("TCL: email", email)
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
            


            //get cart items
            const getTokenCartIdItems = await db.query(`select * from "cartItems" as ci join "products" as p on ci."productId"=p."id" join "images" as i on i."productId"=p."id" where "cartId"=$1 and "type"=$2;`,[cartTokenCartId,'thumbnail'])
            const getTokenCartIdItemsResult = getTokenCartIdItems.rows
            //get cart totals
            const getCartTotals = await db.query(`select sum(cost) as totalCost, sum(quantity) as totalQuantity from "cartItems" as ci join "products" as p on ci."productId"=p."id" where "cartId"=$1;`,[cartTokenCartId])
            const getCartTotalsResult = getCartTotals.rows
            console.log("TCL: getCartTotalsResult", getCartTotalsResult)
            const [{ totalcost, totalquantity}] = getCartTotalsResult
            console.log("TCL: totalquantity", totalquantity)
        
            //insert new guest order
            const createGuestOrder = await db.query(`insert into "orders" ("pid","itemCount", "total", "cartId", "guestId", "statusId" ) values (uuid_generate_v4(),$1,$2,$3,$4,$5) returning "id";`,[totalquantity, totalcost, cartTokenCartId, 1, 1])
            console.log("TCL: createGuestOrder", createGuestOrder)
            const [{ id }] = createGuestOrder.rows
            console.log("TCL: id", id)
            const newOrderId = id

            const newOrderItems = getTokenCartIdItemsResult.forEach (
                
                async (items) => {
                    try{
                const  { pid, productId, quantity, createdAt, cost, name, altText, file } = items

                await db.query(`insert into "orderItems" ("each", "quantity", "orderId", "productId") VALUES ($1,$2,$3,$4);`,[cost, quantity, newOrderId, productId])
                }
                catch(err){
                    next(err)
                }
             })



            console.log("TCL: newOrderItems", newOrderItems)
    
            res.send({
                "message": "Your order has been placed",
                "id": newOrderId
            })
    }
}
    catch(err){
        next(err)
    }
})

//get guest order details

router.get('/guest/:order_id', async (req, res, next) => {
    try{
    }
    catch(err){
        next(err)
    }
})

module.exports = router;