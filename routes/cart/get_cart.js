const {db} = require('../../db')
const { convertCartPidToId } = require('../../utility/pid_to_id.js')
const { getCartItems, getCartTotals} = require('./get_cart_items.js')
const {urlImages} = require('../../utility/url_images')

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
            const checkForUserCarts = await db.query(`select "id","pid" from "carts" where "userId"=$1 and "statusId"=$2;`,[res.locals.userId, 2])
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
            //get cart items
            const getItemsResult  = await getCartItems(res.locals.cartId)
            
            //get cart totals
            const getTotalsResult  = await getCartTotals(res.locals.cartId)
            
           //format and return cart items object

           const cartItems = getItemsResult.map( items => {
            const  { pid, productId, quantity, createdAt, cost, name, type, altText, file } = items
            
            return {
        
            "added": createdAt,
            "each": cost,
            "itemId": pid,
            "name": name,
            "productId": productId,
            "quantity": quantity,
            "thumbnail": {
                "altText": altText,
                "url": urlImages(req, type, file)
            },
            "total": cost * quantity
            }
            })

             res.status(200).send(
                {
                    cartId: res.locals.cartPid,
                    items: cartItems,
                     total: {
                        "cost": parseInt(getTotalsResult.totalCost),
                        "items": parseInt(getTotalsResult.totalQuantity)
                    }
            })
            
        }

            //if cart token only

            if(!res.locals.userId && res.locals.cartTokenPid){
        
            //convert cart pid to id
            const cartId = await convertCartPidToId(res.locals.cartTokenPid)
            

            if(!cartId){

                res.status(404).send(
                    {
                        "cartId": null,
                        "message": "No active cart"
                    }
                )
                return
            }

            //set for use in response object
            res.locals.cartId = cartId
            res.locals.cartPid = res.locals.cartTokenPid
            
            //get cart items
            const getItemsResult  = await getCartItems(res.locals.cartId)
            
            //get cart totals
            const getTotalsResult  = await getCartTotals(res.locals.cartId)
            
           //format and return cart items object

           const cartItems = getItemsResult.map( items => {
            const  { pid, productId, quantity, createdAt, cost, name, type, altText, file } = items
            
            return {
        
            "added": createdAt,
            "each": cost,
            "itemId": pid,
            "name": name,
            "productId": productId,
            "quantity": quantity,
            "thumbnail": {
                "altText": altText,
                "url": urlImages(req, type, file)
            },
            "total": cost * quantity
            }
            })

             res.status(200).send(
                {
                    cartId: res.locals.cartPid,
                    items: cartItems,
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

//check send both tokens