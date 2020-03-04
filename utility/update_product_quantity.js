const {db} = require('../db')

//check for existing product_id in cartItems
const updateProductQuantity = async (quantity, cartId, productId) => {
    
    const updateProductCartItem = await db.query(`update "cartItems" set "quantity" = "quantity" + $1 where "cartId"=$2 and "productId"=$3 RETURNING *;`,[quantity,cartId, productId])
    console.log("updateProductQuantity -> updateProductCartItem", updateProductCartItem)
           
return updateProductCartItem
}

module.exports = { updateProductQuantity }