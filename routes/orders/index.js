const express = require('express');
const router = express.Router();

router.get('/', async (req, res, next) => {
    const authToken = req.headers.authorization

    try{
    if(authToken){
        //decode auth token and get user pid, convert to user id
        const decodedTokenData = jwt.decode(authToken,jwtSecret)
        const {uid} = decodedTokenData
        const getUserId = await db.query(`select "id" from "users" where "pid"=$1;`,[uid])
        const userId = getUserId.rows[0].id

        const getOrders = await db.query(`select * from "orders" where "userId"=$1;`,[userId])

        const ordersResult = getOrders.rows[0]
        console.log("TCL: ordersResult", ordersResult)
        
        res.send({message: 'from get all orders'});
    }
}

    catch(err){
        next(err)
    }
})


router.get('/:order_id', (req, res, next) => {
    const authToken = req.headers.authorization

    try{
    if(authToken){
        //decode auth token and get user pid, convert to user id
        const decodedTokenData = jwt.decode(authToken,jwtSecret)
        const {uid} = decodedTokenData
        const getUserId = await db.query(`select "id" from "users" where "pid"=$1;`,[uid])
        const userId = getUserId.rows[0].id
    }
}
catch(err){
    next(err)
}
})

router.post('/', (req, res, next) => {
    const authToken = req.headers.authorization

    try{
    if(authToken){
        //decode auth token and get user pid, convert to user id
        const decodedTokenData = jwt.decode(authToken,jwtSecret)
        const {uid} = decodedTokenData
        const getUserId = await db.query(`select "id" from "users" where "pid"=$1;`,[uid])
        const userId = getUserId.rows[0].id
    }
}
    catch(err){
        next(err)
    }
})

module.exports = router;