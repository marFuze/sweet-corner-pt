const express = require('express');
const router = express.Router();
const {db} = require('../../db');
const jwt = require('jwt-simple');
const { jwtSecret } = require('../../config/jwt');
const auth = require('../../middleware/auth');

router.post('/items/:product_id', auth, async (req, res, next) => {
    const {quantity} = req.body;
    const {product_id} = req.params
    const urlProductPId = product_id
    let token = res.locals.existingToken;
    const {tokenCartPid} = res.locals
    let cartPid = tokenCartPid
    const authToken = req.headers.authorization
    console.log("TCL: authToken", authToken)
    

    try {
        const sql = `select "pid" from "products" where "pid"=$1;`
        const verifyProductPid = await db.query(sql,[urlProductPId])
        const {rows} = verifyProductPid;
        const [{pid}] = rows;
        const verifiedProductPid = pid;
        
        //confirm valid product id
        if (!verifiedProductPid) {
            res.status(404).send('Invalid Product Id');
            return;
        } else {
            //get product id from product pid
            const translatedProductId = await db.query(`select "id" from "products" where "pid"=$1;`,[verifiedProductPid])
            const {rows} = translatedProductId;
            //console.log('rows',productIDExists) 
            const [{id}] = rows;
            tableProductId = id;

            const getProductDetails = await db.query(`select "cost", p."name", i."pid" as "tnId", "altText", "file", "type" from "products" as p left join "images" as i on p."id"=i."productId" where "type"='thumbnail' and p."pid"=$1;`,[verifiedProductPid])
                
            const {rows: productData} = getProductDetails
            //console.log("TCL: productData", productData)
            const [{ cost, name, altText, file}] = productData
            res.locals.cost = cost
            res.locals.name = name
            res.locals.altText = altText
            res.locals.file = file
        }

        if (!tokenCartPid && !authToken){
            const activeCartStatus = 2;  //2 is active status cart in cartstatuses table
            const {rows: tableCartIds} = await db.query(`insert into "carts" ("pid","statusId") values (uuid_generate_v4(),$1) RETURNING id, pid;`,[activeCartStatus]);
            const [{id,pid}] = tableCartIds;
            const newCartId = id
            cartPid = pid

            const newAddedCartItem = await db.query(`insert into "cartItems" ("cartId","productId","quantity") values ($1,$2,$3) returning *`,[newCartId,tableProductId,quantity])
            res.locals.itemId = newAddedCartItem.rows[0].pid
            res.locals.added = newAddedCartItem.rows[0].createdAt
                      
            const newCartToken = {
                cartPid: cartPid,
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
                const userId = getUserId.rows[0].uid

            //create new cart if no cart exists

            const checkForUserCarts = await db.query('select "id" from "carts" where "userId"=$1 and "statusId"=$2;',[userId, 2])
            const cartId = checkForUserCarts.rows[0]
            
            //if no existing user cart exists create new cart and add cartItem
            if(!cartId) {
            const activeCartStatus = 2;  //2 is active status cart in cartstatuses table
            const {rows: tableCartIds} = await db.query(`insert into "carts" ("userId","pid","statusId") values ($1,uuid_generate_v4(),$2) RETURNING id, pid;`,[activeCartStatus]);
            const [{id,pid}] = tableCartIds;
            const newCartId = id
            cartPid = pid
            //add cartItem
            const newAddedCartItem = await db.query(`insert into "cartItems" ("cartId","productId","quantity") values ($1,$2,$3) returning *`,[newCartId,tableProductId,quantity])
            res.locals.itemId = newAddedCartItem.rows[0].pid
            res.locals.added = newAddedCartItem.rows[0].createdAt
            } else {
                if(cartId) {
                    //check for existing cartItems with same product
                    const existingUserProductCartItem = await db.query(``)

                }
            }

        
            
                      
                
            // //convert tokenCartPid to tokenCartId
            // const queriedTokenCartId = await db.query(`select "id" from "carts" where "pid"=$1;`,[tokenCartPid])
            // const {rows: tokenCartIdResult} = queriedTokenCartId
            // const [{id}] = tokenCartIdResult
            // const tokenCartId = id

            // //check for existing product_id in cartItems
            // const existingProductCartItemId = await db.query(`select "id" from "cartItems" where "productId"=$1 and "cartId"=$2;`,[tableProductId,tokenCartId])
            // const {rows: existingProduct} = existingProductCartItemId
            
            // //add new cartItem if product_id not found
            // if(existingProduct === undefined || existingProduct.length == 0){
            // const addProductToCart = await db.query(`insert into "cartItems" ("cartId","productId","quantity") values ($1,$2,$3) RETURNING *;`,[tokenCartId,tableProductId,quantity]);
            // res.locals.itemId = addProductToCart.rows[0].pid
            // res.locals.added = addProdcutToCart.rows[0].createdAt
            // }

            // //update cartItem quantity if product_id found
            // if(existingProduct.length > 0){
            // const updateProductCartItem = await db.query(`update "cartItems" set "quantity" = "quantity" + $1 where "cartId"=$2 and "productId"=$3 RETURNING *;`,[quantity,tokenCartId,tableProductId]);
            // res.locals.itemId = updateProductCartItem.rows[0].pid
            // res.locals.added = updateProductCartItem.rows[0].updatedAt
            //     }
                


            } else {

            //convert tokenCartPid to tokenCartId
            const queriedTokenCartId = await db.query(`select "id" from "carts" where "pid"=$1;`,[tokenCartPid])
            const {rows: tokenCartIdResult} = queriedTokenCartId
            const [{id}] = tokenCartIdResult
            const tokenCartId = id

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
            }
        }
            res.status(200).send(
                {
                    "cartId": cartPid,
                    "cartToken": token,
                    "item": {
                        "added":res.locals.added,
                        "each": res.locals.cost,
                        "itemId": res.locals.itemId,
                        "name": res.locals.name,
                        "productId": verifiedProductPid,
                        "quantity": quantity,
                        "thumbnail": {
                            "altText": res.locals.altText,
                            "url": `http://api.sc.lfzprototypes.com/images/thumbnails/${res.locals.file}]`
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
});


router.get('/', async (req, res, next) => {
    try {
        const authToken = req.headers.authorization
        const cartToken = req.headers['x-cart-token']

        if(authToken){
            const decodedTokenData = jwt.decode(authToken, jwtSecret)
        }
    }
    catch(err){
        next(err)
    }
})



module.exports = router;