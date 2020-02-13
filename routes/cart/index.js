const express = require('express');
const router = express.Router();
const {db} = require('../../db');
const auth = require('../../middleware/auth');

router.get('/items/:product_id', async (req, res, next) => {
    try {

    }
    catch(err) {
      
        next(err);
    }
});

module.exports = router;