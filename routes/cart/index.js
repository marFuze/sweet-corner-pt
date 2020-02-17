const express = require('express');
const router = express.Router();
const {db} = require('../../db');
const jwt = require('jwt-simple');
const { jwtSecret } = require('../../config/jwt');
const auth = require('../../middleware/auth');

router.post('/items/:product_id', auth, async (req, res, next) => {
    const {quantity} = req.body;
    const {product_id} = req.params;
    const cartTokenHeader = req.headers['cart-token'];

    try {
        console.log('productid',product_id)
        
        const sql = `select "pid" from "products" where "pid"=$1;`
        const productIDExists = await db.query(sql,[product_id])
        const {rows} = productIDExists;
        console.log('rows',productIDExists) 
        const [{pid}] = rows;
        const validProductId = pid;
        
        //confirm valid product id
        if (!validProductId) {
            res.status(404).send('Invalid Product Id');
            return;
        } else {
            console.log('product id is valid')
        }

        if (!cartTokenHeader){

            
            const activeCartStatus = 2;  //2 is active status cart in cartstatuses table
            const sql = `insert into "carts" ("pid","statusId") values (uuid_generate_v4(),$1) RETURNING id;`
            const newCart = await db.query(sql,[activeCartStatus]);
            const {rows} = newCart      
            const [{id}] = rows
            newCartId = id;

            const cartTokenProps = {
                cartId: newCartId,
                ts: Date()
            }

            const token = jwt.encode(cartTokenProps, jwtSecret)

            res.send(
                {
                   "message": "here is the cart token",
                    "cart-token": token,
                   "quantity": quantity
                   
                })
        }  

        if(cartTokenHeader){
            //cart id from token
            guestCartId = res.locals.activeCartId;
            //check cart id against cart table
            const sql1 = `select "id" from "carts" where "id"=$1;`
            const existingCart = await db.query(sql1,[guestCartId]);
            //console.log('existing cart', existingCart.rows)
            const {rows} = existingCart
            const [{id}] = rows;
            existingCartId = id;

            //check if product exists in any cart items

            const sql3 = `select "pid" from "cartItems" where "productId"=$1`
            const existingProductCartItem = await db.query(sql3,[validProductId])
            const {rows: existingProduct} = existingProductCartItem
            console.log("TCL: existingProduct", existingProduct.length)
       
        

            if(existingProduct === undefined || existingProduct.length == 0){
            //add product as cart item to cart's cartItems table
            const sql2 = `insert into "cartItems" ("productId","quantity") values ($1,$2) RETURNING *;`
            const addProductToCart = await db.query(sql2,[validProductId,quantity]);
            console.log(addProductToCart.rows)
            
            }

            if(existingProduct.length > 0){
            const sql4 = `update "cartItems" set "quantity" = "quantity" + $1 where "productId"=$2 RETURNING *;`
            const updateProductCartItem = await db.query(sql4,[quantity,validProductId]);
            }

            res.send(
                {
                   "message": "product added to cart",
                   "cart-token": cartTokenHeader,
                   "added quantity": quantity  
                })
        }
    }
    catch(err) {
      
        next(err);
    }
});

module.exports = router;