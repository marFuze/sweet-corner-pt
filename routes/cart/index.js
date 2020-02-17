const express = require('express');
const router = express.Router();
const {db} = require('../../db');
const jwt = require('jwt-simple');
const { jwtSecret } = require('../../config/jwt');
const auth = require('../../middleware/auth');

router.post('/items/:product_id', auth, async (req, res, next) => {
    const {quantity} = req.body;
    
    const {product_id} = req.params;
    let token = res.locals.existingToken;
    
    let {activeCartId} = res.locals

    let productIntegerId = null;

    try {
        const sql = `select "pid" from "products" where "pid"=$1;`
        const productIDExists = await db.query(sql,[product_id])
        const {rows} = productIDExists;
        const [{pid}] = rows;
        const validProductId = pid;
        
        //confirm valid product id
        if (!validProductId) {
            res.status(404).send('Invalid Product Id');
            return;
        } else {
            //extract product id for use in subsequent queries
            console.log('product id is valid')
            const sql = `select "id" from "products" where "pid"=$1;`
            const productIndex = await db.query(sql,[validProductId])
            const {rows} = productIndex;
            //console.log('rows',productIDExists) 
            const [{id}] = rows;
            productIntegerId = id;
        }

        if (!activeCartId){

            
            const activeCartStatus = 2;  //2 is active status cart in cartstatuses table
            const sql = `insert into "carts" ("pid","statusId") values (uuid_generate_v4(),$1) RETURNING pid;`
            const {rows: newCartPid} = await db.query(sql,[activeCartStatus]);
            const [{pid}] = newCartPid;
            //console.log("TCL: pid", pid)
           
            //console.log("TCL: newCartPID", pid)
        
            const cartTokenProps = {
                cartId: pid,
                ts: Date()
            }

            token = jwt.encode(cartTokenProps, jwtSecret)
            console.log("TCL: new cart token", token)

            //check if product exists in any cart items

            const sql3 = `select "pid" from "cartItems" where "productId"=$1`
            const existingProductCartItem = await db.query(sql3,[validProductId])
            const {rows: existingProduct} = existingProductCartItem

            if(existingProduct === undefined || existingProduct.length == 0){
            //add product as cart item to cart's cartItems table
            const sql2 = `insert into "cartItems" ("productId","quantity") values ($1,$2) RETURNING *;`
            const addProductToCart = await db.query(sql2,[validProductId,quantity]);
            const {rows: addedProduct} = addProductToCart;
            }

            if(existingProduct.length > 0){
                const sql4 = `update "cartItems" set "quantity" = "quantity" + $1 where "productId"=$2 RETURNING *;`
                const updateProductCartItem = await db.query(sql4,[quantity,validProductId]);
                const {rows: updatedCartItem} = updateProductCartItem;  
                }
      
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