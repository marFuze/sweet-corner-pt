const express = require('express');
const router = express.Router();
const {db} = require('../../db');
const jwt = require('jwt-simple');
const { jwtSecret } = require('../../config/jwt');
const auth = require('../../middleware/auth');
const {urlImages} = require('../../utility/url_images')
const validator = require("email-validator")

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

        const getOrders = await db.query(`select "itemCount", "total", o."createdAt" as "orderCreatedAt", o."pid" as "orderPid", "name" as "orderStatusName" from "orders" as o join "orderStatuses" as os on o."statusId"=os."id" where "userId"=$1;`,[userId])

        const ordersResult = getOrders.rows
        
        const userOrders = ordersResult.map(order => {
            const { itemCount, total, orderCreatedAt, orderPid, orderStatusName } = order

            return {
                "itemCount": itemCount,
                "total": total,
                "createdAt": orderCreatedAt,
                "id": orderPid,
                "status": orderStatusName
                            }
        })
        res.send({orders: userOrders});

    }
}

    catch(err){
        next(err)
    }
})

//get order details

router.get('/:order_id', async (req, res, next) => {
    const authToken = req.headers.authorization
    const { order_id } = req.params

    try{
    if(authToken){
        //decode auth token and get user pid, convert to user id
        const decodedTokenData = jwt.decode(authToken,jwtSecret)
        const {uid} = decodedTokenData
        const getUserId = await db.query(`select "id" from "users" where "pid"=$1;`,[uid])
        const userId = getUserId.rows[0].id

        const getOrder = await db.query(`select * from "orders" where "pid"=$1 and "userId"=$2;`,[order_id,userId])
        if(getOrder.rows == undefined || getOrder.rows.length == 0){

            res.status(404).send(
                {
                    "cartId": null,
                    "message": "No active order"
                }
            )
            return
        }
        {const [{ id, itemCount, pid, total, createdAt, statusId }] = getOrder.rows

        //get order items

        const getUserOrderItems = await db.query(`select oi."pid" as "orderItemPid", quantity, cost, p."name" as "productName", p."pid" as "productPid", "altText", "type", "file" from "orderItems" as oi join "products" as p on oi."productId"=p."id" join "images" as i on i."productId"=p."id" where "orderId"=$1 and "type"=$2;`,[id,'thumbnail'])
            const getUserOrderItemsResult = getUserOrderItems.rows
        const userOrderItems = getUserOrderItemsResult.map( items => {
            const  { orderItemPid, quantity, cost, productName, productPid, altText, type, file } = items
 
            return {
    
                    "each": cost,
                    "quantity": quantity,
                    "total": cost,
                    "id": orderItemPid,
                    "product": {
                        "name": productName,
                        "id": productPid,
                        "thumbnail": {
                            "altText": altText,
                            "url": urlImages(req, type, file)
                        }, 
                    }
            }
         })

        res.send({
            "itemCount": itemCount,
            "total": total,
            "createdAt": createdAt,
            "id": pid,
            "status": "Pending",
            "items": userOrderItems
        })
    }
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

        //check for existing user cart

        const checkForUserCarts = await db.query('select "id" from "carts" where "userId"=$1 and "statusId"=$2;',[userId, 2])
        //console.log("TCL: checkForUserCarts", checkForUserCarts)
        const userCartId = checkForUserCarts.rows[0].id

        //get cart items
        const getUserCartIdItems = await db.query(`select * from "cartItems" as ci join "products" as p on ci."productId"=p."id" join "images" as i on i."productId"=p."id" where "cartId"=$1 and "type"=$2;`,[userCartId,'thumbnail'])
        const getUserCartIdItemsResult = getUserCartIdItems.rows
        //get cart totals
        const getCartTotals = await db.query(`select sum(cost) as totalCost, sum(quantity) as totalQuantity from "cartItems" as ci join "products" as p on ci."productId"=p."id" where "cartId"=$1;`,[userCartId])
        const getCartTotalsResult = getCartTotals.rows
        const [{ totalcost, totalquantity}] = getCartTotalsResult
        //console.log("TCL: totalquantity", totalquantity)
    
        //insert new user order
        const createUserOrder = await db.query(`insert into "orders" ("pid","itemCount", "total", "cartId", "guestId", "statusId","userId") values (uuid_generate_v4(),$1,$2,$3,$4,$5,$6) returning "id","pid";`,[totalquantity, totalcost, userCartId, 1, 1,userId])
        //console.log("TCL: createGuestOrder", createGuestOrder)
        const [{ id, pid }] = createUserOrder.rows
        const newOrderId = id
        const newOrderPid = pid
        res.locals.newOrderPid = newOrderPid
        res.locals.newOrderId = newOrderId
    

        const newOrderItems = getUserCartIdItemsResult.forEach (
            
            async (items) => {
                try{
            const  { pid, productId, quantity, createdAt, cost, name, altText, file } = items

            await db.query(`insert into "orderItems" ("each", "quantity", "orderId", "productId") VALUES ($1,$2,$3,$4) returning *;`,[cost, quantity, res.locals.newOrderId, productId])
        }
        catch(err){
            next(err)
        }
     })

    console.log("TCL: newOrderItems", newOrderItems)

    res.send({
        "message": "Your order has been placed",
        "id": res.locals.newOrderPid
    })
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
    res.locals.guestEmail = email
    try{

        if(!validator.validate(email)){
            res.status(402).send('Please enter a valid email address.');
                return;
        }
      
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
            const [{ totalcost, totalquantity}] = getCartTotalsResult
            //console.log("TCL: totalquantity", totalquantity)

            //create guest account if does not exist

            const checkGuestAccount = await db.query(`select "id" from "guests" where "email"=$1;`,[email])

            if(checkGuestAccount.rows.length==0){
            const createGuestAccount = await db.query(`insert into "guests" ("pid", "firstName", "lastName", "email") values (uuid_generate_v4(),$1,$2,$3) returning "id";`, [firstName, lastName, email])
            const guestId  = createGuestAccount.rows[0].id
            res.locals.guestId = guestId
            }

            if(checkGuestAccount.rows.length>0){
            const existingGuestId = checkGuestAccount.rows[0].id
            res.locals.guestId = existingGuestId
            }
        
            //insert new guest order
            const createGuestOrder = await db.query(`insert into "orders" ("pid","itemCount", "total", "cartId", "guestId", "statusId" ) values (uuid_generate_v4(),$1,$2,$3,$4,$5) returning "id","pid";`,[totalquantity, totalcost, cartTokenCartId, res.locals.guestId, 2])
            const [{ id, pid }] = createGuestOrder.rows
            const newOrderId = id
            const newOrderPid = pid
            res.locals.newOrderPid = newOrderPid
            res.locals.newOrderId = newOrderId

            const newOrderItems = getTokenCartIdItemsResult.forEach (
                
                async (items) => {
                    try{
                const  { pid, productId, quantity, createdAt, cost, name, altText, file } = items

                await db.query(`insert into "orderItems" ("each", "quantity", "orderId", "productId") VALUES ($1,$2,$3,$4) returning *;`,[cost, quantity, res.locals.newOrderId, productId])
                }
                catch(err){
                    next(err)
                }
             })
    
            res.send({
                "message": "Your order has been placed",
                "id": res.locals.newOrderPid
            })
    }
}
    catch(err){
        next(err)
    }
})

//get guest order details
//Email must be the same email the order was created with

router.get('/guest/:order_id', async (req, res, next) => { 
    const { email } = req.query
    const { order_id } = req.params
    try {

        const getOrder = await db.query(`select o."id" as "orderId", "itemCount", o."pid" as "orderPid", "total", o."createdAt"as "orderCreatedAt", "statusId"  from "orders" as o join "guests" as g on o."guestId"=g."id" where o."pid"=$1 and "email"=$2;`,[order_id, email])

        const [{ orderId, itemCount, orderPid, total, orderCreatedAt, statusId }] = getOrder.rows

        //get order items

        const getGuestOrderItems = await db.query(`select oi."pid" as "orderItemPid", quantity, cost, p."name" as "productName", p."pid" as "productPid", "altText", "type", "file" from "orderItems" as oi join "products" as p on oi."productId"=p."id" join "images" as i on i."productId"=p."id" where "orderId"=$1 and "type"=$2;`,[orderId,'thumbnail'])
            const getGuestOrderItemsResult = getGuestOrderItems.rows
        const guestOrderItems = getGuestOrderItemsResult.map( items => {
            const  { orderItemPid, quantity, cost, productName, productPid, altText, type, file } = items
 
            return {
    
                    "each": cost,
                    "quantity": quantity,
                    "total": cost,
                    "id": orderItemPid,
                    "product": {
                        "name": productName,
                        "id": productPid,
                        "thumbnail": {
                            "altText": altText,
                            "url": urlImages(req, type, file)
                        }, 
                    }
            }
         })

        res.send({
            "itemCount": itemCount,
            "total": total,
            "createdAt": orderCreatedAt,
            "id": orderPid,
            "status": "Pending",
            "items": guestOrderItems
        })

    }

    catch(err){
        next(err)
    }

    
})



module.exports = router;