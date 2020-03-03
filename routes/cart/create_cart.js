const {db} = require('../../db');

const createCart = async (cartStatus) => {
    const activeCartStatus = 2  //2 is active status cart in cartstatuses table
    const insertCart = await db.query(`insert into "carts" ("pid","statusId") values (uuid_generate_v4(),$1) RETURNING id, pid;`,[cartStatus]);
    const [{id,pid}] = insertCart.rows
    return {id, pid}
}

module.exports = { createCart }