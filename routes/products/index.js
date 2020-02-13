const express = require('express');
const {db} = require('../../db');
const router = express.Router();

router.get('/', async (req, res, next) => {

    const sql = `select * from "products"`;

        const resp = await db.query(sql);

        res.send(resp.rows);

});

router.get('/full', async (req, res, next) => {

    const sql = `select * from "products"`;

        const resp = await db.query(sql);

        res.send(resp.rows);

});

router.get('/:product', async (req, res, next) => {

    const { product } = req.params;

    const params = [ product ];

    const sql = `select * from "products" where "pid" = $1`;

        const resp = await db.query(sql, params);

        res.send(resp.rows);
        next(error);
        // console.log('error', error);
});

module.exports = router;