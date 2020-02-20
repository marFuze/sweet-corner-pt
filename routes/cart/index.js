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
    let {tokenCartId} = res.locals

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
            //extract product id for use in subsequent queries
            console.log('product id is valid')
            const sql = `select "id" from "products" where "pid"=$1;`
            const translatedProductId = await db.query(sql,[verifiedProductPid])
            const {rows} = translatedProductId;
            //console.log('rows',productIDExists) 
            const [{id}] = rows;
            tableProductId = id;
        }

        if (!tokenCartId){
            const activeCartStatus = 2;  //2 is active status cart in cartstatuses table
            const {rows: tableCartIds} = await db.query(`insert into "carts" ("pid","statusId") values (uuid_generate_v4(),$1) RETURNING id, pid;`,[activeCartStatus]);
            const [{id,pid}] = tableCartIds;
            const newCartId = id
            const newCartPid = pid

            const addCartItem = await db.query(`insert into "cartItems" ("cartId","productId","quantity") values ($1,$2,$3) returning *`,[newCartId,tableProductId,quantity])
            console.log("TCL: addCartItem", addCartItem)
           
            const newCartToken = {
                cartId: newCartPid,
                ts: Date()
            }

            token = jwt.encode(cartTokenProps, jwtSecret)
            console.log("TCL: new cart token", token)
      
        }  else

        {
            //check for existing product_id in cartItems
            const existingProductCartItem = await db.query(`select "id" from "cartItems" where "productId"=$1`,[tableProductId])
            const {rows: existingProduct} = existingProductCartItem
            
            //add new cartItem if product_id not found
            if(existingProduct === undefined || existingProduct.length == 0){
            const addProductToCart = await db.query(`insert into "cartItems" ("cartId","productId","quantity") values ($1,$2) RETURNING *;`,[tokenCartId,tableProductId,quantity]);
            }

            //update cartItem quantity if product_id found
            if(existingProduct.length > 0){
                const updateProductCartItem = await db.query(`update "cartItems" set "quantity" = "quantity" + $1 where "cartId"=$2 and "productId"=$3 RETURNING *;`,[quantity,tokenCartId,tableProductId]);
                const {rows: updatedCartItem} = updateProductCartItem;  
                }
        }
            res.send(
                {
                   "message": "product added to cart",
                   "cartToken": token,
                })
        }
    
    catch(err) {
        next(err);
    }
});



module.exports = router;