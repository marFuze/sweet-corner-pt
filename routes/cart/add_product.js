const {db} = require('../../db');
const jwt = require('jwt-simple');
const { jwtSecret } = require('../../config/jwt');
const {convertCartPidToId, convertProductPidToId} = require('../../utility/pid_to_id.js')
const { verifyProductPid } = require('../../utility/verifyPid.js')
const { createCart } = require('../../utility/create_cart.js')
const { insertCartItem } = require('../../utility/add_cart_item.js')
const { existingProductCartItemId } = require('../../utility/check_existing_product.js')
const { updateProductQuantity } = require('../../utility/update_product_quantity')

module.exports = async (req, res, next) => {
    const {quantity} = req.body;
    const {product_id} = req.params
    const authToken = req.headers.authorization

    try {
    
        //verify valid product pid
        const verifiedProductPid = await verifyProductPid(product_id)
        
        //confirm valid product id
        if (!verifiedProductPid) {
            res.status(404).send('Invalid Product Id');
            return;
        } else {
            const getProductDetails = await db.query(`select p."id" as "productId","cost", p."name", i."pid" as "tnId", "altText", "file", "type" from "products" as p left join "images" as i on p."id"=i."productId" where "type"='thumbnail' and p."pid"=$1;`,[verifiedProductPid])
        
            const {rows: productData} = getProductDetails
            const [{ productId, cost, name, altText, file}] = productData
            console.log("productId", productId)
            res.locals.productId = productId
            res.locals.cost = cost
            res.locals.name = name
            res.locals.altText = altText
            res.locals.file = file
        }

        //If the "X-Cart-Token" header is sent, the item will be added to the cart that belongs to that token.

        if(res.locals.cartTokenPid && !authToken) {
            console.log('cart token pid received:', res.locals.cartTokenPid)
            //convert guest cart pid and check for existing guest cart
            const guestCartId = await convertCartPidToId(res.locals.cartTokenPid)
                
                //set current cart id
            res.locals.cartId = guestCartId

                //check for existing product_id in cartItems
            const existingCartItemId = await existingProductCartItemId(res.locals.productId, res.locals.cartId)
            
                //add new cartItem if product_id not found
            if(existingCartItemId == undefined || existingCartItemId.rows.length == 0){
            const addProductToCart = await insertCartItem(res.locals.cartId, res.locals.productId, quantity)
            
                //save the new cart item id locally
            res.locals.itemId = addProductToCart.rows[0].pid
            res.locals.added = addProdcutToCart.rows[0].createdAt
            }

                //update cartItem quantity if product_id found
            if(existingCartItemId.rows.length > 0){
            const updateProductCartItem = await updateProductQuantity(quantity,res.locals.cartId,res.locals.productId)
                //console.log("updateProductCartItem", updateProductCartItem)
            res.locals.itemId = updateProductCartItem.rows[0].pid
            res.locals.added = updateProductCartItem.rows[0].updatedAt
                }
        }

        //If no headers are sent a new cart will be created and the cart token will be sent in the response. All subsequent requests should use the provided cart token if not logged in, this will ensure that all user items will be added to the same cart.
        if (!res.locals.cartTokenPid && !authToken){
            console.log('new cart triggered')
            //add a new guest cart
            const activeCartStatus = 2;
            const newCart = await createCart(activeCartStatus,null)
            console.log("newCart", newCart)
            
            //save new cartId's locally
            res.locals.cartPid = newCart.pid
            res.locals.cartId = newCart.id
            console.log("newCart.id", newCart.id)

            //add new cart item(s)
            const newCartItem = await insertCartItem(res.locals.cartId, res.locals.productId, quantity)

            //create guest cart token
            const newTokenData = {
                cartPid: res.locals.cartPid,
                ts: Date()
            }

            res.locals.newCartToken = jwt.encode(newTokenData, jwtSecret)
        }

        //If the "Authorization" header is sent, the item will be added to the users currently active cart. If the user does not have an active cart, a new cart will be created and become the active cart.

        if(authToken && !res.locals.cartTokenPid){
            //check for existing user cart
            const checkForUserCarts = await db.query('select "id" from "carts" where "userId"=$1 and "statusId"=$2;',[res.locals.userId, 2])
            console.log("checkForUserCarts", checkForUserCarts.rows[0])

            //if no user cart found
            if(checkForUserCarts.rows.length == 0){
            
                //add a new user cart
            const activeCartStatus = 2;
            const newCart = await createCart(activeCartStatus,res.locals.userId)
            
                //save new cartId's locally
            res.locals.cartPid = newCart.pid
            res.locals.cartId = newCart.id

                //add new cart item(s)
            const newCartItem = await insertCartItem(res.locals.cartId, res.locals.productId, quantity)
            }

            //if user cart found
            if(checkForUserCarts.rows.length>0){

                //set user cart id   
            const {id} = checkForUserCarts.rows[0]
            res.locals.cartId = id

                //check for existing product_id in cartItems
            const existingCartItemId = await existingProductCartItemId(res.locals.productId, res.locals.cartId)
            
                //add new cartItem if product_id not found
            if(existingCartItemId == undefined || existingCartItemId.rows.length == 0){
            const addProductToCart = await insertCartItem(res.locals.cartId, res.locals.productId, quantity)
            
                //save the new cart item id locally
            res.locals.itemId = addProductToCart.rows[0].pid
            res.locals.added = addProdcutToCart.rows[0].createdAt
            }

                //update cartItem quantity if product_id found
            if(existingCartItemId.rows.length > 0){
            const updateProductCartItem = await updateProductQuantity(quantity,res.locals.cartId,res.locals.productId)
            //console.log("updateProductCartItem", updateProductCartItem)
            res.locals.itemId = updateProductCartItem.rows[0].pid
            res.locals.added = updateProductCartItem.rows[0].updatedAt
                }
            }

        }
        
        // If both the auth and cart headers are sent, the auth header will take precedence. Once the user signs in or registers, the cart will be transferred to the user so the cart token is no longer needed and becomes invalid.

        if(authToken && res.locals.cartTokenPid) {
            console.log('authToken and cartToken received')

                //convert guest cart pid and check for existing guest cart
            const guestCartId = await convertCartPidToId(res.locals.cartTokenPid)
                
                //set current cart id
            res.locals.cartId = guestCartId

                //add userId to cart
            const updateCartWithUserId = await db.query(`update "carts" set "userId"=$1 where "id"=$2;`,[res.locals.userId,res.locals.cartId])

                //check for existing product_id in cartItems
            const existingCartItemId = await existingProductCartItemId(res.locals.productId, res.locals.cartId)
            
                //add new cartItem if product_id not found
            if(existingCartItemId == undefined || existingCartItemId.rows.length == 0){
            const addProductToCart = await insertCartItem(res.locals.cartId, res.locals.productId, quantity)
            
                //save the new cart item id locally
            res.locals.itemId = addProductToCart.rows[0].pid
            res.locals.added = addProdcutToCart.rows[0].createdAt
            }

                //update cartItem quantity if product_id found
            if(existingCartItemId.rows.length > 0){
            const updateProductCartItem = await updateProductQuantity(quantity,res.locals.cartId,res.locals.productId)
                //console.log("updateProductCartItem", updateProductCartItem)
            res.locals.itemId = updateProductCartItem.rows[0].pid
            res.locals.added = updateProductCartItem.rows[0].updatedAt
                }
        }






        // }  else

        // {
        //     if(authToken){
        //         console.log('auth token received')

        //     //check for existing user cart

        //     const checkForUserCarts = await db.query('select "id" from "carts" where "userId"=$1 and "statusId"=$2;',[res.locals.userId, 2])
        //     //console.log("checkForUserCarts", checkForUserCarts)
            

        //     //if user cart found add product as new cartItem or add to existing cartItem

        //     if(checkForUserCarts.rows.length>0){
                
        //         res.locals.cartId = checkForUserCarts.rows[0]
        //         console.log("checkForUserCarts.rows[0]", checkForUserCarts.rows[0])
        
        //     //check for existing product_id in cartItems
        //     const existingCartItemId = await existingProductCartItemId(res.locals.productId, res.locals.cartId)
        //     //console.log("existingCartItemId", existingCartItemId)

        //     //add new cartItem if product_id not found
        //     if(existingCartItemId == undefined || existingCartItemId.rows.length < 0){
        //         const addProductToCart = await insertCartItem(res.locals.cartId, res.locals.productId, quantity)
                
        //         res.locals.itemId = addProductToCart.rows[0].pid
        //         res.locals.added = addProdcutToCart.rows[0].createdAt
        //         }
    
        //         //update cartItem quantity if product_id found
        //         if(existingCartItemId){
        //         const updateProductCartItem = await updateProductQuantity(quantity,res.locals.cartId,res.locals.productId)
        //         console.log("updateProductCartItem", updateProductCartItem)
        //         res.locals.itemId = updateProductCartItem.rows[0].pid
        //         res.locals.added = updateProductCartItem.rows[0].updatedAt
        //             }

        //     }
            
        //     //if no existing user cart exists check for cart associated with cart token
        //     if(checkForUserCarts.rows.length>0 && res.locals.cartPid) {

        //         console.log('no user cart id triggered')

        //     //check for existing cartItems with same product
        //     //convert res.locals.cartPid to tokenCartId
        //     const queriedTokenCartId = await db.query(`select "id" from "carts" where "pid"=$1;`,[res.locals.cartPid])
        //     const {rows: tokenCartIdResult} = queriedTokenCartId
        //     const [{id}] = tokenCartIdResult
        //     const tokenCartId = id

        //     //add userId to cart

        //     const updateCartWithUserId = await db.query(`update "carts" set "userId"=$1 where "id"=$2;`,[userId,tokenCartId])

        //     //check for existing product_id in cartItems
        //     //check for existing product_id in cartItems
        //     const existingCartItemId = await existingProductCartItemId(res.locals.productId, res.locals.cartId)
        //     console.log("existingCartItemId", existingCartItemId)

        //     //add new cartItem if product_id not found
        //     if(existingProduct === undefined || existingProduct.length == 0){
        //     const addProductToCart = await db.query(`insert into "cartItems" ("cartId","productId","quantity") values ($1,$2,$3) RETURNING *;`,[tokenCartId,tableProductId,quantity]);
        //     res.locals.itemId = addProductToCart.rows[0].pid
        //     res.locals.added = addProdcutToCart.rows[0].createdAt
        //     }

        //     //update cartItem quantity if product_id found
        //     if(existingProduct.length > 0){
        //     const updateProductCartItem = await db.query(`update "cartItems" set "quantity" = "quantity" + $1 where "cartId"=$2 and "productId"=$3 RETURNING *;`,[quantity,tokenCartId,tableProductId]);
        //     res.locals.itemId = updateProductCartItem.rows[0].pid
        //     res.locals.added = updateProductCartItem.rows[0].updatedAt
        //         }
            
        //     } else {
        //         if(checkForUserCarts.rows.length>0 && !res.locals.cartPid) {
        //             console.log("no existing user cart and no cart token")
        //             const activeCartStatus = 2;  //2 is active status cart in cartstatuses table
        //     const {rows: tableCartIds} = await db.query(`insert into "carts" ("userId","pid","statusId") values ($1,uuid_generate_v4(),$2) RETURNING id, pid;`,[userId,activeCartStatus]);
        //     console.log("TCL: tableCartIds", tableCartIds)
        //     console.log("TCL: userId", userId)
        //     const [{id,pid}] = tableCartIds;
        //     const newCartId = id
        //     cartPid = pid

        //     const newAddedCartItem = await insertCartItem(res.locals.cartId, res.locals.productId, quantity)
        //     res.locals.itemId = newAddedCartItem.rows[0].pid
        //     res.locals.added = newAddedCartItem.rows[0].createdAt
        //         }

        //     } 

        //     } else {
        //         //no auth token but has cart token
        //         console.log('no auth token but has cart token')
        //     //get cartId from cart token cart pid
        //     res.locals.cartId = await convertCartPidToId(res.locals.cartTokenPid)
        //     console.log("res.locals.cartId", res.locals.cartId)

        //     //check for existing product_id in cartItems
        //     const existingCartItemId = await existingProductCartItemId(res.locals.productId, res.locals.cartId)
        //     console.log("existingCartItemId", existingCartItemId)
            
        //     //add new cartItem if product_id not found
        //     if(existingCartItemId == undefined || existingCartItemId.rows.length < 1){
        //     const addProductToCart = await insertCartItem(res.locals.cartId, res.locals.productId, quantity)
            
        //     res.locals.itemId = addProductToCart.rows[0].pid
        //     res.locals.added = addProdcutToCart.rows[0].createdAt
        //     }

        //     //update cartItem quantity if product_id found
        //     if(existingCartItemId){
        //     const updateProductCartItem = await updateProductQuantity(quantity,res.locals.cartId,res.locals.productId)
        //     console.log("updateProductCartItem", updateProductCartItem)
        //     res.locals.itemId = updateProductCartItem.rows[0].pid
        //     res.locals.added = updateProductCartItem.rows[0].updatedAt
        //         }
        //     }
        
            res.status(200).send(
                {
                    "cartId": res.locals.cartTokenPid,
                    "cartToken": res.locals.newCartToken,
                    "item": {
                        "added":res.locals.added,
                        "each": res.locals.cost,
                        "itemId": res.locals.itemId,
                        "name": res.locals.name,
                        "productId": verifiedProductPid,
                        "quantity": quantity,
                        "thumbnail": {
                            "altText": res.locals.altText,
                            "url": `http://api.sc.lfzprototypes.com/images/thumbnails/${res.locals.file}`
                        },
                        "total": quantity * res.locals.cost
                    },
                    "message": "added to cart",
                    "total": {
                        "cost": quantity * res.locals.cost,
                        "items": quantity
                }
        })
    }
    
    catch(err) {
        next(err);
    }
};