const {db} = require('../../db')

const convertCartPidToId = async (cartPid) => {
    const getCartId = await db.query(`select "id" from "carts" where "pid"=$1;`,[cartPid])
    const [{id}] = getCartId.rows
    return id
}

const getCartItems = async (cartId) => {
    const getItems = await db.query(`select * from "cartItems" as ci join "products" as p on ci."productId"=p."id" join "images" as i on i."productId"=p."id" where "cartId"=$1 and "type"=$2;`,[cartId,'thumbnail'])
    const getItemsResult = getItems.rows
    return getItemsResult
}

const getCartTotals = async (cartId) => {
    
    const getTotals = await db.query(`select sum("cost") as "totalCost", sum("quantity") as "totalQuantity" from "cartItems" as ci join "products" as p on ci."productId"=p."id" where "cartId"=$1;`,[cartId])
    return getTotals.rows[0]
}

module.exports = { convertCartPidToId, getCartItems, getCartTotals }

