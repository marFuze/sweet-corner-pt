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
        
        const sql = `select "id" from "products" where "pid"=$1;`
        const productIDExists = await db.query(sql,[product_id])
        const {rows} = productIDExists; 
        const [{id}] = rows;
        const validProductId = id;
        
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

            guestCartId = res.locals.activeCartId;

            const sql1 = `select "id" from "carts" where "id"=$1;`
            const existingCart = await db.query(sql1,[guestCartId]);
            //console.log('existing cart', existingCart.rows)
            const {rows} = existingCart
            const [{id}] = rows;
            existingCartId = id;

            const sql2 = `insert into "cartItems" ("productId","quantity") values ($1,$2) RETURNING *;`
            const addProductToCart = await db.query(sql2,[validProductId,quantity]);


            res.send(
                {
                   "message": "product added to cart" + addProductToCart,
            
                   
                })
        }
            // const sql = `select "id" from "cartItems" where "id"=$1 and "productId"=$2;`
            // const cartItemExists = await db.query(sql,[cartId,product_id]);
            
            // res.send({ message:'cart id was found', cartItemExists})
        
    }
    catch(err) {
      
        next(err);
    }
});

module.exports = router;