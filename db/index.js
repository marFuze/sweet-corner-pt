const db = require('../config/db');
const { Pool } = require('pg');

const pool = new Pool(db);

module.exports.db = pool;
