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
    console.log("TCL: tokenCartPid", tokenCartPid)
    
    

    let productId = null;

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
            console.log('product id is valid')
            const translatedProductId = await db.query(`select "id" from "products" where "pid"=$1;`,[verifiedProductPid])
            const {rows} = translatedProductId;
            //console.log('rows',productIDExists) 
            const [{id}] = rows;
            tableProductId = id;

            const getProductDetails = await db.query(`select "cost", p."name", i."pid" as "tnId", "altText", "file", "type" from "products" as p left join "images" as i on p."id"=i."productId" where "type"='thumbnail' and p."pid"=$1;`,[verifiedProductPid])
            const [{rows: productData}] = getProductDetails
            const { cost, name, altText, file} = productData
        }

        if (!tokenCartPid){
            const activeCartStatus = 2;  //2 is active status cart in cartstatuses table
            const {rows: tableCartIds} = await db.query(`insert into "carts" ("pid","statusId") values (uuid_generate_v4(),$1) RETURNING id, pid;`,[activeCartStatus]);
            const [{id,pid}] = tableCartIds;
            const newCartId = id
            cartPid = pid

            const addedCartItem = await db.query(`insert into "cartItems" ("cartId","productId","quantity") values ($1,$2,$3) returning *`,[newCartId,tableProductId,quantity])
            
           
            const newCartToken = {
                cartPid: cartPid,
                ts: Date()
            }

            token = jwt.encode(newCartToken, jwtSecret)
            console.log("TCL: new cart token", token)
      
        }  else

        {
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
            const [{rows: cartItemData}] = addProductToCart
            const { pid } = cartItemData
            const getCartItemDetails = await db.query(`select "pid" as "itemId", "createdAt" as "added" from "cartItems" where "pid"=$1;`,[pid])
            const [{rows: getCartItemData}] = getCartItemDetails
            const { itemId, added } = getCartItemData
            res.locals.itemId = itemId
            res.locals.added = added
            }

            //update cartItem quantity if product_id found
            if(existingProduct.length > 0){
            const updateProductCartItem = await db.query(`update "cartItems" set "quantity" = "quantity" + $1 where "cartId"=$2 and "productId"=$3 RETURNING *;`,[quantity,tokenCartId,tableProductId]);
            const {rows: updatedCartItem} = updateProductCartItem;  
                }
        }
            res.status(200).send(
                {
                    "cartId": cartPid,
                    "cartToken": token,
                    "item": {
                        "added":res.locals.added,
                        "each": cost,
                        "itemId": res.locals.itemId,
                        "name": name,
                        "productId": verifiedProductPid,
                        "quantity": quantity,
                        "thumbnail": {
                            "altText": altText,
                            "url": `http://api.sc.lfzprototypes.com/images/thumbnails/${file}]`
                        },
                        "total": quantity * cost
                    },
                    "message": "added to cart",
                    "total": {
                        "cost": quantity * cost,
                        "items": quantity
                }
        })
    }
    
    catch(err) {
        next(err);
    }
});



module.exports = router;