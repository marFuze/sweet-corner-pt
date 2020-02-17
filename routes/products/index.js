const express = require('express');
const {db} = require('../../db');
const router = express.Router();

router.get('/', async (req, res, next) => {

    const sql = `select p."pid" as id, "caption", "cost", p."name", i."pid" as "tnId", "altText", "file", "type" from "products" as p left join "images" as i on p."id"=i."productId" where "type"='thumbnail';`;

        const resp = await db.query(sql);

        const { rows: productList } = resp

        const formattedProductsList = productList.map( product => {
           const  { tnId, altText, file, type, ...p} = product;

           return {
               ...p,
               thumbnail: {
                   id: tnId,
                   altText: altText,
                   file: file,
                   type: type,
                   url: `http://api.sc.lfzprototypes.com/images/thumbnails/${file}`
               }
           }
        })

        res.send({
            products: formattedProductsList
        });

});

router.get('/full', async (req, res, next) => {

    const sql = `select * from "products"`;

        const resp = await db.query(sql);

        return productList = {
            products: 'test'
        }

        res.send(productList);

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