const {db} = require('../db');

const createCart = async (cartStatus,userId) => {
    
    const insertCart = await db.query(`insert into "carts" ("pid","statusId","userId") values (uuid_generate_v4(),$1,$2) RETURNING id, pid;`,[cartStatus,userId]);
    const [{id,pid}] = insertCart.rows
    return {id, pid}
}

module.exports = { createCart }