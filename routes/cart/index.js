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
        
        const productsql = `select "id" from "products" where "pid"=$1;`

        const productIDExists = await db.query(productsql,[product_id])
    

        if (!productIDExists) {
            res.status(404).send('Invalid Product Id');
            return;
        }

        if (!cartTokenHeader){

//             If the "Authorization" header is sent, the item will be added to the users currently active cart. If the user does not have an active cart, a new cart will be created and become the active cart.
// If the "X-Cart-Token" header is sent, the item will be added to the cart that belongs to that token.
// If no headers are sent a new cart will be created and the cart token will be sent in the response. All subsequent requests should use the provided cart token if not logged in, this will ensure that all user items will be added to the same cart.
// If the item already exists in the currently active cart, the quantity of that item will be adjusted based on the quantity sent. Quantity defaults to 1 if not sent.
// If both the auth and cart headers are sent, the auth header will take precedence. Once the user signs in or registers, the cart will be transferred to the user so the cart token is no longer needed and becomes invalid.

            const sql = `insert into "carts" ("pid","statusId")
            values (uuid_generate_v4(),2) RETURNING ID`
            const resp = await db.query(sql);
           
            const {rows} = resp
            
            const [{id}] = rows

            cartId = id;

            const cartTokenProps = {
                cartId: cartId,
                ts: Date()
            }

            const token = jwt.encode(cartTokenProps, jwtSecret)



            res.send(
                {
                   "cart-token": token,
                   
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