const {db} = require('../db')

const insertCartItem = async (cartId, productId, quantity) => {
    const insertedCartItem = await db.query(`insert into "cartItems" ("cartId","productId","quantity") values ($1,$2,$3) returning *`,[cartId,productId,quantity])
    return insertedCartItem        
}

module.exports = { insertCartItem }