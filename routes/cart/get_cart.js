const {db} = require('../../db')
const { convertCartPidToId, getCartItems, getCartTotals} = require('./get_cart_items.js')

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
        

        if(res.locals.userId){
           
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
            //get cart Items
            const getUserCartIdItems = await getCartItems(userCartId)
            const getUserCartIdItemsResult = getUserCartIdItems.rows
            //get cart totals
            const getCartTotals = await getCartTotals(userCartId)
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
            if(res.locals.cartTokenPid){
                console.log("res.locals.cartTokenPid", res.locals.cartTokenPid)
                console.log('cart token triggered')
            //convert cart pid to id
            const cartId = await convertCartPidToId(res.locals.cartTokenPid)
            console.log("cartId", cartId)
        
            if(!cartId){

                res.status(404).send(
                    {
                        "cartId": null,
                        "message": "No active cart"
                    }
                )
                return
            }
            res.locals.cartId = cartId
            //get cart items
            const getItemsResult  = await getCartItems(res.locals.cartId)
            
            //get cart totals
            const getTotalsResult  = await getCartTotals(res.locals.cartId)
            
            const authCartItems = getItemsResult.map( items => {
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
                        "cost": parseInt(getTotalsResult.totalCost),
                        "items": parseInt(getTotalsResult.totalQuantity)
                    }
            })
        }
    }
    catch(err){
        next(err)
    }
}