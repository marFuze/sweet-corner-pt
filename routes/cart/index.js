const express = require('express');
const router = express.Router();
const {db} = require('../../db');
const jwt = require('jwt-simple');
const { jwtSecret } = require('../../config/jwt');
const auth = require('../../middleware/auth');

router.post('/items/:product_id', auth, async (req, res, next) => {

   const cart = req.headers['cart-token'];

    try {
        if (!cart){

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
                   "cart-token": token 
                })
        }
        {
           console.log ('cart id was found')
            res.send({ message:'cart id was found'})
        }
    }
    catch(err) {
      
        next(err);
    }
});

module.exports = router;