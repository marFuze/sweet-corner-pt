const express = require('express');
const router = express.Router();
const {db} = require('../../db');
const jwt = require('jwt-simple');
const { jwtSecret } = require('../../config/jwt');
const auth = require('../../middleware/auth');

//add product to cart
router.post('/items/:product_id', auth, require('./add_product'))

//get cart
router.get('/', async (req, res, next) => {
    const authToken = req.headers.authorization
    const cartToken = req.headers['x-cart-token']
    try {

        if(!authToken && !cartToken){

            res.status(404).send(
                {
                    "cartId": null,
                    "message": "No active cart"
                }
            )
            return
        }
        

        if(authToken){
            //decode auth token and get user pid, convert to user id
            const decodedTokenData = jwt.decode(authToken,jwtSecret)
            const {uid} = decodedTokenData
            const getUserId = await db.query(`select "id" from "users" where "pid"=$1;`,[uid])
            const userId = getUserId.rows[0].id
            //check for existing user cart and get related cartItems
            const checkForUserCarts = await db.query('select "id","pid" from "carts" where "userId"=$1 and "statusId"=$2;',[userId, 2])
            if(!checkForUserCarts){

                res.status(404).send(
                    {
                        "cartId": null,
                        "message": "No active cart"
                    }
                )
                return
            }
            const userCartId = checkForUserCarts.rows[0].id
            const userCartPid = checkForUserCarts.rows[0].pid
            res.locals.cartId = userCartId
            res.locals.cartPid = userCartPid
            const getUserCartIdItems = await db.query(`select * from "cartItems" as ci join "products" as p on ci."productId"=p."id" join "images" as i on i."productId"=p."id" where "cartId"=$1 and "type"=$2;`,[userCartId,'thumbnail'])
            const getUserCartIdItemsResult = getUserCartIdItems.rows
            //get cart totals
            const getCartTotals = await db.query(`select sum(cost) as totalCost, sum(quantity) as totalQuantity from "cartItems" as ci join "products" as p on ci."productId"=p."id" where "cartId"=$1;`,[userCartId])
            const getCartTotalsResult = getCartTotals.rows
            const [{ totalcost, totalquantity}] = getCartTotalsResult

            const authCartItems = getUserCartIdItemsResult.map( items => {
                const  { pid, productId, quantity, createdAt, cost, name, altText, file } = items
     
                return {
        
                        "added": createdAt,
                        "each": cost,
                        "itemId": pid,
                        "name": name,
                        "productId": productId,
                        "quantity": quantity,
                        "thumbnail": {
                            "altText": altText,
                            "url": `http://api.sc.lfzprototypes.com/images/thumbnails/${file}`
                        },
                        "total": cost * quantity
                }
             })

             res.status(200).send(
                {
                    cartId: res.locals.cartPid,
                    items: authCartItems,
                     total: {
                        cost: parseInt(totalcost),
                        items: parseInt(totalquantity)
                    }
            })
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
            //console.log("TCL: getUserCartIdItemsResult", getUserCartIdItemsResult)
            //get cart totals
            const getCartTotals = await db.query(`select sum(cost) as totalCost, sum(quantity) as totalQuantity from "cartItems" as ci join "products" as p on ci."productId"=p."id" where "cartId"=$1;`,[cartTokenCartId])
            const getCartTotalsResult = getCartTotals.rows
            const [{ totalcost, totalquantity}] = getCartTotalsResult
            //console.log("TCL: getCartTotalsResult", getCartTotalsResult)

            const authCartItems = getTokenCartIdItemsResult.map( items => {
                const  { pid, productId, quantity, createdAt, cost, name, altText, file } = items
     
                return {
        
                        "added": createdAt,
                        "each": cost,
                        "itemId": pid,
                        "name": name,
                        "productId": productId,
                        "quantity": quantity,
                        "thumbnail": {
                            "altText": altText,
                            "url": `http://api.sc.lfzprototypes.com/images/thumbnails/${file}`
                        },
                        "total": cost * quantity
                }
             })

             res.status(200).send(
                {
                    cartId: res.locals.cartPid,
                    items: authCartItems,
                     total: {
                        "cost": parseInt(totalcost),
                        "items": parseInt(totalquantity)
                    }
            })
        }
    }
    catch(err){
        next(err)
    }
})


//get cart totals

router.get('/totals', async (req, res, next) => {
    const authToken = req.headers.authorization
    const cartToken = req.headers['x-cart-token']
    try {

        if(!authToken && !cartToken){

            res.status(404).send(
                {
                    "cartId": null,
                    "message": "No active cart"
                }
            )
            return
        }
        

        if(authToken){
            //decode auth token and get user pid, convert to user id
            const decodedTokenData = jwt.decode(authToken,jwtSecret)
            const {uid} = decodedTokenData
            const getUserId = await db.query(`select "id" from "users" where "pid"=$1;`,[uid])
            const userId = getUserId.rows[0].id
            //check for existing user cart and get related cartItems
            const checkForUserCarts = await db.query('select "id","pid" from "carts" where "userId"=$1 and "statusId"=$2;',[userId, 2])
            if(!checkForUserCarts){

                res.status(404).send(
                    {
                        "cartId": null,
                        "message": "No active cart"
                    }
                )
                return
            }
            const userCartId = checkForUserCarts.rows[0].id
            const userCartPid = checkForUserCarts.rows[0].pid
            res.locals.cartId = userCartId
            res.locals.cartPid = userCartPid
            const getUserCartIdItems = await db.query(`select * from "cartItems" as ci join "products" as p on ci."productId"=p."id" join "images" as i on i."productId"=p."id" where "cartId"=$1 and "type"=$2;`,[userCartId,'thumbnail'])
            const getUserCartIdItemsResult = getUserCartIdItems.rows
            //get cart totals
            const getCartTotals = await db.query(`select sum(cost) as totalCost, sum(quantity) as totalQuantity from "cartItems" as ci join "products" as p on ci."productId"=p."id" where "cartId"=$1;`,[userCartId])
            const getCartTotalsResult = getCartTotals.rows
            const [{ totalcost, totalquantity}] = getCartTotalsResult

             res.status(200).send(
                {
                     total: {
                        cost: parseInt(totalcost),
                        items: parseInt(totalquantity)
                    }
            })
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
            //console.log("TCL: getUserCartIdItemsResult", getUserCartIdItemsResult)
            //get cart totals
            const getCartTotals = await db.query(`select sum(cost) as totalCost, sum(quantity) as totalQuantity from "cartItems" as ci join "products" as p on ci."productId"=p."id" where "cartId"=$1;`,[cartTokenCartId])
            const getCartTotalsResult = getCartTotals.rows
            const [{ totalcost, totalquantity}] = getCartTotalsResult
           
             res.status(200).send(
                {
                     total: {
                        "cost": parseInt(totalcost),
                        "items": parseInt(totalquantity)
                    }
            })
        }
    }
    catch(err){
        next(err)
    }
})

router.put('/items/:item_id', async (req, res, next) => {
    const authToken = req.headers.authorization
    const cartToken = req.headers['x-cart-token']
    const { item_id } = req.params
    const { quantity } = req.body
    res.locals.quantity = quantity

    try {

        if(authToken){
            //decode auth token and get user pid, convert to user id
            const decodedTokenData = jwt.decode(authToken,jwtSecret)
            const {uid} = decodedTokenData
            const getUserId = await db.query(`select "id" from "users" where "pid"=$1;`,[uid])
            const userId = getUserId.rows[0].id
            //check for existing user cart and get related cartItems
            const checkForUserCarts = await db.query('select "id","pid" from "carts" where "userId"=$1 and "statusId"=$2;',[userId, 2])
            if(!checkForUserCarts){

                res.status(404).send(
                    {
                        "cartId": null,
                        "message": "No active cart"
                    }
                )
                return
            }
            const userCartId = checkForUserCarts.rows[0].id
            const userCartPid = checkForUserCarts.rows[0].pid
            res.locals.cartId = userCartId
            res.locals.cartPid = userCartPid
            //update query
            const updateItem = await db.query(`update "cartItems" set "quantity"="quantity"+$1 where "cartId"=$2 and "pid"=$3;`,[res.locals.quantity,userCartId,item_id])
            //get updated cart item
            const getAuthCartIdItem = await db.query(`select * from "cartItems" as ci join "products" as p on ci."productId"=p."id" join "images" as i on i."productId"=p."id" where "cartId"=$1  and ci."pid"=$2 and "type"=$3;`,[userCartId, item_id,'thumbnail'])
            const getAuthCartIdItemResult = getAuthCartIdItem.rows
            const [{ updatedAt, cost, pid, name, productId, quantity, altText,file}] = getAuthCartIdItemResult

            //get cart totals
            const getCartTotals = await db.query(`select sum(cost) as totalCost, sum(quantity) as totalQuantity from "cartItems" as ci join "products" as p on ci."productId"=p."id" where "cartId"=$1 and ci."pid"=$2;`,[userCartId,item_id])
            const getCartTotalsResult = getCartTotals.rows
            const [{ totalcost, totalquantity}] = getCartTotalsResult

             res.status(200).send({
                "cartId": userCartPid,
                added: updatedAt,
                        each: cost,
                        itemId: pid,
                        name: name,
                        productId: productId,
                        quantity: quantity,
                        thumbnail: {
                            "altText": altText,
                            "url": `http://api.sc.lfzprototypes.com/images/thumbnails/${file}`
                        },
                        total: quantity,
    
                     total: {
                        "cost": parseInt(totalcost),
                        "items": parseInt(totalquantity)
                    }
                
                })
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
            //update query
            const updateItem = await db.query(`update "cartItems" set "quantity"="quantity"+$1 where "cartId"=$2 and "pid"=$3;`,[res.locals.quantity,cartTokenCartId,item_id])
            //get updated cart item
            const getCartTokenCartIdItem = await db.query(`select * from "cartItems" as ci join "products" as p on ci."productId"=p."id" join "images" as i on i."productId"=p."id" where "cartId"=$1  and ci."pid"=$2 and "type"=$3;`,[cartTokenCartId, item_id,'thumbnail'])
            const getCartTokenCartIdItemResult = getCartTokenCartIdItem.rows
            const [{ updatedAt, cost, pid, name, productId, quantity, altText,file}] = getCartTokenCartIdItemResult

            //get cart totals
            const getCartTotals = await db.query(`select sum(cost) as totalCost, sum(quantity) as totalQuantity from "cartItems" as ci join "products" as p on ci."productId"=p."id" where "cartId"=$1 and ci."pid"=$2;`,[cartTokenCartId,item_id])
            const getCartTotalsResult = getCartTotals.rows
            const [{ totalcost, totalquantity}] = getCartTotalsResult

             res.status(200).send({
                "cartId": cartPid,
                added: updatedAt,
                        each: cost,
                        itemId: pid,
                        name: name,
                        productId: productId,
                        quantity: quantity,
                        thumbnail: {
                            "altText": altText,
                            "url": `http://api.sc.lfzprototypes.com/images/thumbnails/${file}`
                        },
                        "total": quantity,
    
                     total: {
                        "cost": parseInt(totalcost),
                        "items": parseInt(totalquantity)
                    }
                
                })
        }
    

    }
    catch(err){
        next(err)
    }
})

router.delete('/items/:item_id', async (req, res, next) => {
    const authToken = req.headers.authorization
    const cartToken = req.headers['x-cart-token']
    const { item_id } = req.params
   

    try {

        if(authToken){
            //decode auth token and get user pid, convert to user id
            const decodedTokenData = jwt.decode(authToken,jwtSecret)
            const {uid} = decodedTokenData
            const getUserId = await db.query(`select "id" from "users" where "pid"=$1;`,[uid])
            const userId = getUserId.rows[0].id
            //check for existing user cart and get related cartItems
            const checkForUserCarts = await db.query('select "id","pid" from "carts" where "userId"=$1 and "statusId"=$2;',[userId, 2])
            if(!checkForUserCarts){

                res.status(404).send(
                    {
                        "cartId": null,
                        "message": "No active cart"
                    }
                )
                return
            }
            const userCartId = checkForUserCarts.rows[0].id
            const userCartPid = checkForUserCarts.rows[0].pid
            res.locals.cartId = userCartId
            res.locals.cartPid = userCartPid
            //delete query
            const deleteItem = await db.query(`delete from "cartItems" where "cartId"=$1 and "pid"=$2 returning *;`,[userCartId,item_id])
            console.log("TCL: deleteItem", deleteItem.rows[0])
            const { quantity, productId } = deleteItem.rows[0]
            //get product cost
            const getProductCost = await db.query('select "name","cost"from "products" where "id"=$1;',[productId])
            const {cost, name} = getProductCost.rows[0]
            

             res.status(200).send({
                "cartId": userCartPid,
                "message":`Removed all ${name} items from cart`,
                "total": {
                    "cost": quantity * cost,
                    "items": quantity
                }

                })
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
            //delete query
            const deleteItem = await db.query(`delete from "cartItems" where "cartId"=$1 and "pid"=$2 returning *;`,[cartTokenCartId,item_id])
            console.log("TCL: deleteItem", deleteItem.rows[0])
            const { quantity, productId } = deleteItem.rows[0]
            //get product cost
            const getProductCost = await db.query('select "name","cost"from "products" where "id"=$1;',[productId])
            const {cost, name} = getProductCost.rows[0]
            
             res.status(200).send({
                "cartId": cartPid,
                "message":`Removed all ${name} items from cart`,
                "total": {
                    "cost": quantity * cost,
                    "items": quantity
                }

                })
    }


}

    catch(err){
        next(err)
    }
})

router.delete('/', async (req, res, next) => {
    const authToken = req.headers.authorization
    const cartToken = req.headers['x-cart-token']
    
    try {

        if(authToken){
            //decode auth token and get user pid, convert to user id
            const decodedTokenData = jwt.decode(authToken,jwtSecret)
            const {uid} = decodedTokenData
            const getUserId = await db.query(`select "id" from "users" where "pid"=$1;`,[uid])
            const userId = getUserId.rows[0].id
            //check for existing user cart and get related cartItems
            const checkForUserCarts = await db.query('select "id","pid" from "carts" where "userId"=$1 and "statusId"=$2;',[userId, 2])
            if(!checkForUserCarts){

                res.status(404).send(
                    {
                        "cartId": null,
                        "message": "No active cart"
                    }
                )
                return
            }
            const userCartId = checkForUserCarts.rows[0].id
            const userCartPid = checkForUserCarts.rows[0].pid
            res.locals.cartId = userCartId
            res.locals.cartPid = userCartPid
            //delete cart
            const deleteCart = await db.query(`delete from "carts" where "id"=$1 returning *;`,[userCartId])
            console.log("TCL: deleteCart", deleteCart.rows[0])
            const { pid } = deleteCart.rows[0]
            //delete cart items
            const deleteCartItems = await db.query(`delete from "cartItems" where "cartId"=$1 returning *;`[userCartId])
            console.log('deleteCartItems:', deleteCartItems)
            

             res.status(200).send({
                "message":`Cart deleted`,
                "deletedId": pid
                })
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
            //delete cart
            const deleteCart = await db.query(`delete from "carts" where "id"=$1 returning *;`,[cartTokenCartId])
            console.log("TCL: deleteCart", deleteCart.rows[0])
            const { pid } = deleteCart.rows[0]
            //delete cart items

            const deleteCartItems = await db.query(`delete from "cartItems" where "cartId"=$1 returning *;`[cartTokenCartId])
            console.log('deleteCartItems:', deleteCartItems)

             res.status(200).send({
                "message":`Cart deleted`,
                "deletedId": pid
                })
            }
    }

    catch(err){
        next(err)
    }
})

router.delete('/:cart_id', async (req, res, next) => {
    const authToken = req.headers.authorization
    const requestedCartForDeletion = req.params.cart_d 
    
    try {

        if(authToken){
            //decode auth token and get user pid, convert to user id
            const decodedTokenData = jwt.decode(authToken,jwtSecret)
            const {uid} = decodedTokenData
            const getUserId = await db.query(`select "id" from "users" where "pid"=$1;`,[uid])
            const userId = getUserId.rows[0].id
            //check for existing user cart and get related cartItems
            const checkForUserCarts = await db.query('select "id","pid" from "carts" where "userId"=$1 and "pid"=$2;',[userId, requestedCartForDeletion])
            if(!checkForUserCarts){

                res.status(404).send(
                    {
                        "cartId": null,
                        "message": "No active cart"
                    }
                )
                return
            }
            const userCartId = checkForUserCarts.rows[0].id
            const userCartPid = checkForUserCarts.rows[0].pid
            res.locals.cartId = userCartId
            res.locals.cartPid = userCartPid
            //delete cart
            const deleteCart = await db.query(`delete from "carts" where "id"=$1 returning *;`,[userCartId])
            console.log("TCL: deleteCart", deleteCart.rows[0])
            const { pid } = deleteCart.rows[0]

            //delete cart items

            const deleteCartItems = await db.query(`delete from "cartItems" where "cartId"=$1 returning *;`[userCartId])
            console.log('deleteCartItems:', deleteCartItems)

             res.status(200).send({
                "message":`Cart deleted`,
                "deletedId": pid
                })
            }
       
            
            
    }

    catch(err){
        next(err)
    }
})




module.exports = router;