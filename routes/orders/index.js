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
        console.log("TCL: uid", uid)
        const getUserId = await db.query(`select "id" from "users" where "pid"=$1;`,[uid])
        const userId = getUserId.rows[0].id
        console.log("TCL: userId", userId)

        const getOrders = await db.query(`select "itemCount", "total", o."createdAt" as "orderCreatedAt", o."pid" as "orderPid", "name" as "orderStatusName" from "orders" as o join "orderStatuses" as os on o."statusId"=os."id" where "userId"=$1;`,[userId])

        const ordersResult = getOrders.rows
        console.log("TCL: ordersResult", ordersResult)
        
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
        console.log("TCL: userId", userId)

        const getOrder = await db.query(`select * from "orders" where "pid"=$1 and "userId"=$2;`,[order_id,userId])
        console.log("TCL: getOrder", getOrder)
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

        const getUserOrderItems = await db.query(`select oi."pid" as "orderItemPid", quantity, cost, p."name" as "productName", p."pid" as "productPid", "altText", "file" from "orderItems" as oi join "products" as p on oi."productId"=p."id" join "images" as i on i."productId"=p."id" where "orderId"=$1 and "type"=$2;`,[id,'thumbnail'])
            const getUserOrderItemsResult = getUserOrderItems.rows
        const userOrderItems = getUserOrderItemsResult.map( items => {
            const  { orderItemPid, quantity, cost, productName, productPid, altText, file } = items
 
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
                            "url": `http://api.sc.lfzprototypes.com/images/thumbnails/${file}`
                        }, 
                    }
            }
         })

        //console.log("TCL: itemCount, pid, total, createdAt, statusId", itemCount, pid, total, createdAt, statusId)
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
        console.log("TCL: userCartId", userCartId)

        //get cart items
        const getUserCartIdItems = await db.query(`select * from "cartItems" as ci join "products" as p on ci."productId"=p."id" join "images" as i on i."productId"=p."id" where "cartId"=$1 and "type"=$2;`,[userCartId,'thumbnail'])
        const getUserCartIdItemsResult = getUserCartIdItems.rows
        //get cart totals
        const getCartTotals = await db.query(`select sum(cost) as totalCost, sum(quantity) as totalQuantity from "cartItems" as ci join "products" as p on ci."productId"=p."id" where "cartId"=$1;`,[userCartId])
        const getCartTotalsResult = getCartTotals.rows
        console.log("TCL: getCartTotalsResult", getCartTotalsResult)
        const [{ totalcost, totalquantity}] = getCartTotalsResult
        //console.log("TCL: totalquantity", totalquantity)
    
        //insert new user order
        const createUserOrder = await db.query(`insert into "orders" ("pid","itemCount", "total", "cartId", "guestId", "statusId","userId") values (uuid_generate_v4(),$1,$2,$3,$4,$5,$6) returning "id","pid";`,[totalquantity, totalcost, userCartId, 1, 1,userId])
        //console.log("TCL: createGuestOrder", createGuestOrder)
        const [{ id, pid }] = createUserOrder.rows
        console.log("TCL: id,pid", id, pid)
        const newOrderId = id
        const newOrderPid = pid
        res.locals.newOrderPid = newOrderPid
        res.locals.newOrderId = newOrderId
        console.log("TCL: res.locals.newOrderId", res.locals.newOrderId)
        console.log("TCL: res.locals.newOrderPid", res.locals.newOrderPid)

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
            console.log("TCL: cartTokenCartId", cartTokenCartId)
            res.locals.cartId = cartTokenCartId
            


            //get cart items
            const getTokenCartIdItems = await db.query(`select * from "cartItems" as ci join "products" as p on ci."productId"=p."id" join "images" as i on i."productId"=p."id" where "cartId"=$1 and "type"=$2;`,[cartTokenCartId,'thumbnail'])
            const getTokenCartIdItemsResult = getTokenCartIdItems.rows
            //get cart totals
            const getCartTotals = await db.query(`select sum(cost) as totalCost, sum(quantity) as totalQuantity from "cartItems" as ci join "products" as p on ci."productId"=p."id" where "cartId"=$1;`,[cartTokenCartId])
            const getCartTotalsResult = getCartTotals.rows
            console.log("TCL: getCartTotalsResult", getCartTotalsResult)
            const [{ totalcost, totalquantity}] = getCartTotalsResult
            //console.log("TCL: totalquantity", totalquantity)
        
            //insert new guest order
            const createGuestOrder = await db.query(`insert into "orders" ("pid","itemCount", "total", "cartId", "guestId", "statusId" ) values (uuid_generate_v4(),$1,$2,$3,$4,$5) returning "id","pid";`,[totalquantity, totalcost, cartTokenCartId, 1, 1])
            //console.log("TCL: createGuestOrder", createGuestOrder)
            const [{ id, pid }] = createGuestOrder.rows
            console.log("TCL: id,pid", id, pid)
            const newOrderId = id
            const newOrderPid = pid
            res.locals.newOrderPid = newOrderPid
            res.locals.newOrderId = newOrderId
            console.log("TCL: res.locals.newOrderId", res.locals.newOrderId)
            console.log("TCL: res.locals.newOrderPid", res.locals.newOrderPid)

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

//get guest order details

router.get('/guest/:order_id', async (req, res, next) => { 
    const { email } = req.query
    const { order_id } = req.params
    console.log("TCL: order_id", order_id)

    try {

        const getOrder = await db.query(`select * from "orders" where "pid"=$1;`,[order_id])

        const [{ id, itemCount, pid, total, createdAt, statusId }] = getOrder.rows

        //get order items

        const getGuestOrderItems = await db.query(`select oi."pid" as "orderItemPid", quantity, cost, p."name" as "productName", p."pid" as "productPid", "altText", "file" from "orderItems" as oi join "products" as p on oi."productId"=p."id" join "images" as i on i."productId"=p."id" where "orderId"=$1 and "type"=$2;`,[id,'thumbnail'])
            const getGuestOrderItemsResult = getGuestOrderItems.rows
        const guestOrderItems = getGuestOrderItemsResult.map( items => {
            const  { orderItemPid, quantity, cost, productName, productPid, altText, file } = items
 
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
                            "url": `http://api.sc.lfzprototypes.com/images/thumbnails/${file}`
                        }, 
                    }
            }
         })

        //console.log("TCL: itemCount, pid, total, createdAt, statusId", itemCount, pid, total, createdAt, statusId)
        res.send({
            "itemCount": itemCount,
            "total": total,
            "createdAt": createdAt,
            "id": pid,
            "status": "Pending",
            "items": guestOrderItems
        })

    }
    catch(err){
        next(err)
    }

    
})



module.exports = router;