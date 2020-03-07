require('dotenv').config();

module.exports = {
    connectionString: `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}`

    
}