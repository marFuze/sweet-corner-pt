const {db} = require('../db');

 const convertCartPidToId = async (cartPid) => {
    const getCartId = await db.query(`select "id" from "carts" where "pid"=$1;`,[cartPid])
    console.log("convertCartPidToId -> getCartId ", getCartId )
    const [{id}] = getCartId.rows
    return id
}

const convertProductPidToId = async (productPid) => {
    const getProductId = await db.query(`select "id" from "products" where "pid"=$1;`,[productPid])
    const [{id}] = getProductId.rows
    return id
}

module.exports = {convertCartPidToId, convertProductPidToId}