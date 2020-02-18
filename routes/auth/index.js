const express = require('express');
const router = express.Router();
const {db} = require('../../db');
const jwt = require('jwt-simple');
const { jwtSecret } = require('../../config/jwt');
const auth = require('../../middleware/auth');

router.post('/auth/create-account', auth, async (req, res, next) => {
   

    try {
       
      
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