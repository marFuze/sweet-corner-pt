const {db} = require('../../db');
const jwt = require('jwt-simple');
const { jwtSecret } = require('../../config/jwt');
const {convertCartPidToId, convertProductPidToId} = require('../../utility/pid_to_id.js')
const { verifyProductPid } = require('../../utility/verifyPid.js')
const { createCart } = require('./create_cart.js')
const { insertCartItem } = require('../../utility/add_cart_item.js')
const { existingProductCartItemId } = require('../../utility/check_existing_product.js')
const { updateProductQuantity } = require('../../utility/update_product_quantity')

module.exports = async (req, res, next) => {
    const {quantity} = req.body;
    const {product_id} = req.params
    //let token = res.locals.existingToken;
    //const {res.locals.cartPid} = res.locals
    let cartPid = res.locals.cartPid
    const authToken = req.headers.authorization
    console.log("TCL: authToken", authToken)
    

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

        if (!res.locals.cartTokenPid && !authToken){
            console.log('new cart triggered')
            //add a new guest cart
            const activeCartStatus = 2;
            const newCart = await createCart(activeCartStatus)
            console.log("newCart", newCart)
            
            //save new cartId's locally
            res.locals.cartPid = newCart.pid
            res.locals.cartId = newCart.id
            console.log("res.locals.cartId", res.locals.cartId)

            //add new cart item(s)
            const newCartItem = await insertCartItem(res.locals.cartId, res.locals.productId, quantity)

            //create guest cart token
            const newCartToken = {
                cartPid: res.locals.cartPid,
                ts: Date()
            }

            token = jwt.encode(newCartToken, jwtSecret)
      
        }  else

        {
            if(authToken){
                console.log('auth token received')

                const decodedTokenData = jwt.decode(authToken,jwtSecret)
                const {uid} = decodedTokenData
                const getUserId = await db.query(`select "id" from "users" where "pid"=$1;`,[uid])
                //console.log("TCL: getUserId", getUserId)
                //console.log("TCL: getUserId", getUserId)
                const userId = getUserId.rows[0].id
                console.log("TCL: userId", userId)
                

            //check for existing user cart

            const checkForUserCarts = await db.query('select "id" from "carts" where "userId"=$1 and "statusId"=$2;',[userId, 2])
            //console.log("TCL: checkForUserCarts", checkForUserCarts)
            const userCartId = checkForUserCarts.rows[0]
            console.log("TCL: userCartId", userCartId)

            //if user cart found add product as new cartItem or add to existing cartItem

            if(res.locals.cartTokenPid){

                console.log('user cart token received')
                const userCartId = checkForUserCarts.rows[0].id
                //check for existing product_id in cartItems
            const existingProductCartItemId = await db.query(`select "id" from "cartItems" where "productId"=$1 and "cartId"=$2;`,[tableProductId,userCartId])
            const {rows: existingProduct} = existingProductCartItemId

            //add new cartItem if product_id not found
            if(existingProduct === undefined || existingProduct.length == 0){
            const addProductToCart = await db.query(`insert into "cartItems" ("cartId","productId","quantity") values ($1,$2,$3) RETURNING *;`,[userCartId,tableProductId,quantity]);
            res.locals.itemId = addProductToCart.rows[0].pid
            res.locals.added = addProdcutToCart.rows[0].createdAt
            }

            //update cartItem quantity if product_id found
            if(existingProduct.length > 0){
            const updateProductCartItem = await db.query(`update "cartItems" set "quantity" = "quantity" + $1 where "cartId"=$2 and "productId"=$3 RETURNING *;`,[quantity,userCartId,tableProductId]);
            res.locals.itemId = updateProductCartItem.rows[0].pid
            res.locals.added = updateProductCartItem.rows[0].updatedAt
                }

            }
            
            //if no existing user cart exists check for cart associated with cart token
            if(!userCartId && res.locals.cartPid) {

                console.log('no user cart id triggered')

            //check for existing cartItems with same product
            //convert res.locals.cartPid to tokenCartId
            const queriedTokenCartId = await db.query(`select "id" from "carts" where "pid"=$1;`,[res.locals.cartPid])
            const {rows: tokenCartIdResult} = queriedTokenCartId
            const [{id}] = tokenCartIdResult
            const tokenCartId = id

            //add userId to cart

            const updateCartWithUserId = await db.query(`update "carts" set "userId"=$1 where "id"=$2;`,[userId,tokenCartId])

            //check for existing product_id in cartItems
            const existingProductCartItemId = await db.query(`select "id" from "cartItems" where "productId"=$1 and "cartId"=$2;`,[tableProductId,tokenCartId])
            const {rows: existingProduct} = existingProductCartItemId

            //add new cartItem if product_id not found
            if(existingProduct === undefined || existingProduct.length == 0){
            const addProductToCart = await db.query(`insert into "cartItems" ("cartId","productId","quantity") values ($1,$2,$3) RETURNING *;`,[tokenCartId,tableProductId,quantity]);
            res.locals.itemId = addProductToCart.rows[0].pid
            res.locals.added = addProdcutToCart.rows[0].createdAt
            }

            //update cartItem quantity if product_id found
            if(existingProduct.length > 0){
            const updateProductCartItem = await db.query(`update "cartItems" set "quantity" = "quantity" + $1 where "cartId"=$2 and "productId"=$3 RETURNING *;`,[quantity,tokenCartId,tableProductId]);
            res.locals.itemId = updateProductCartItem.rows[0].pid
            res.locals.added = updateProductCartItem.rows[0].updatedAt
                }
            
            } else {
                if(!userCartId && !res.locals.cartPid) {
                    console.log("no existing user cart and no cart token")
                    const activeCartStatus = 2;  //2 is active status cart in cartstatuses table
            const {rows: tableCartIds} = await db.query(`insert into "carts" ("userId","pid","statusId") values ($1,uuid_generate_v4(),$2) RETURNING id, pid;`,[userId,activeCartStatus]);
            console.log("TCL: tableCartIds", tableCartIds)
            console.log("TCL: userId", userId)
            const [{id,pid}] = tableCartIds;
            const newCartId = id
            cartPid = pid

            const newAddedCartItem = await insertCartItem(res.locals.cartId, res.locals.productId, quantity)
            res.locals.itemId = newAddedCartItem.rows[0].pid
            res.locals.added = newAddedCartItem.rows[0].createdAt
                }

            } 

            } else {
                //no auth token but has cart token
                console.log('no auth token but has cart token')
            //get cartId from cart token cart pid
            res.locals.cartId = await convertCartPidToId(res.locals.cartTokenPid)
            console.log("res.locals.cartId", res.locals.cartId)

            //check for existing product_id in cartItems
            const existingCartItemId = await existingProductCartItemId(res.locals.productId, res.locals.cartId)
            console.log("existingCartItemId", existingCartItemId)
            
            //add new cartItem if product_id not found
            if(existingCartItemId == undefined || existingCartItemId.rows.length < 1){
            const addProductToCart = await insertCartItem(res.locals.cartId, res.locals.productId, quantity)
            
            res.locals.itemId = addProductToCart.rows[0].pid
            res.locals.added = addProdcutToCart.rows[0].createdAt
            }

            //update cartItem quantity if product_id found
            if(existingCartItemId){
            const updateProductCartItem = await updateProductQuantity(quantity,res.locals.cartId,res.locals.productId)
            console.log("updateProductCartItem", updateProductCartItem)
            res.locals.itemId = updateProductCartItem.rows[0].pid
            res.locals.added = updateProductCartItem.rows[0].updatedAt
                }
            }
        }
            res.status(200).send(
                {
                    "cartId": res.locals.cartTokenPid,
                    "cartToken": res.locals.existingToken,
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