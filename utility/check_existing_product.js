const {db} = require('../db')

//check for existing product_id in cartItems
const existingProductCartItemId = async (productId, cartId) => {
    const checkForCartItemId = await db.query(`select "id" from "cartItems" where "productId"=$1 and "cartId"=$2;`,[productId, cartId])

return checkForCartItemId
}

module.exports = { existingProductCartItemId }