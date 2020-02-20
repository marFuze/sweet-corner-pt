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
            const sql = `insert into "carts" ("pid","statusId") values (uuid_generate_v4(),$1) RETURNING id, pid;`
            const {rows: tableCartIds} = await db.query(sql,[activeCartStatus]);
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
            //if active cart exists   
            //check cart id against cart table
            const sql1 = `select "pid" from "carts" where "pid"=$1;`
            const existingCart = await db.query(sql1,[activeCartId]);
            //console.log('existing cart', existingCart.rows)
            const {rows: existingCartRow} = existingCart
        
            const [{pid: existingCartPid}] = existingCartRow
            existingCartId = existingCartPid;

            //check if product exists in any cart items

            const sql3 = `select "pid" from "cartItems" where "productId"=$1`
            const existingProductCartItem = await db.query(sql3,[validProductId])
            const {rows: existingProduct} = existingProductCartItem
            //console.log("TCL: existingProduct", existingProduct.length)
       
            if(existingProduct === undefined || existingProduct.length == 0){
            //add product as cart item to cart's cartItems table
            const sql2 = `insert into "cartItems" ("productId","quantity") values ($1,$2) RETURNING *;`
            const addProductToCart = await db.query(sql2,[validProductId,quantity]);
            //console.log(addProductToCart.rows)
            }

            if(existingProduct.length > 0){
                const sql4 = `update "cartItems" set "quantity" = "quantity" + $1 where "productId"=$2 RETURNING *;`
                const updateProductCartItem = await db.query(sql4,[quantity,validProductId]);
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