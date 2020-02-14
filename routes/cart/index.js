const express = require('express');
const router = express.Router();
const {db} = require('../../db');
const jwt = require('jwt-simple');
const { jwtSecret } = require('../../config/jwt');
const auth = require('../../middleware/auth');

router.post('/items/:product_id', async (req, res, next) => {

    let { cart } = req;

    try {
        if (!cart){

            const sql = `insert into "carts" ("pid","statusId")
            values (uuid_generate_v4(),2) RETURNING ID`
            const resp = await db.query(sql);
           
            const {rows} = resp
            
            const [{id}] = rows
            console.log(id)

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
    }
    catch(err) {
      
        next(err);
    }
});

module.exports = router;