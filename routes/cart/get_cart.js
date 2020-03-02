const db = require('../../db')

module.exports = async (req, res, next) => {

    try {

        if(!res.locals.userId && !res.locals.cartTokenPid){

            res.status(404).send(
                {
                    "cartId": null,
                    "message": "No active cart"
                }
            )
            return
        }
        

        if(authToken){
           
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
}