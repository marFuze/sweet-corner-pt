const express = require('express');
const router = express.Router();

router.get('/', async (req, res, next) => {

    const sql = `select * from "products"`;

        const resp = await db.query(sql);

        res.send(resp.rows);

});

module.exports = router;