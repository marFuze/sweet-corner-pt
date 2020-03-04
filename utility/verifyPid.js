const {db} = require('../db');

const verifyProductPid = async (product_id) => {

const verifyPid = await db.query(`select "pid" from "products" where "pid"=$1;`,[product_id])

const [{pid}] = verifyPid.rows
console.log("verifyProductPid -> pid", pid)
return pid
}

module.exports = { verifyProductPid }