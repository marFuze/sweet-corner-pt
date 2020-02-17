const express = require('express');
const {db} = require('../../db');
const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
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

    }
    catch(err) {
      
        next(err);
    }

});

// router.get('/full', async (req, res, next) => {

    

//     const sql = `select p."pid" as id, "caption", "cost", p."name", i."pid" as "tnId", "altText", "file", "type" from "products" as p left join "images" as i on p."id"=i."productId" where "type"='thumbnail';`

//         const { rows: singleProduct } = await db.query(sql);

//         const formattedProductData = singleProduct.map( product => {
//             const  { tnId, altText, file, type, ...p} = product;
 
//             return {
//                 ...p,
//                 thumbnail: {
//                     id: tnId,
//                     altText: altText,
//                     file: file,
//                     type: type,
//                     url: `http://api.sc.lfzprototypes.com/images/thumbnails/${file}`
//                 }
//             }
//          })

//         res.send(formattedProductData);

// });

router.get('/:product', async (req, res, next) => {

    const {product} = req.params;
    try {
    const sql = `select p."pid" as id, "caption", "cost", p."name", i."pid" as "tnId", "altText", "file", "type" from "products" as p left join "images" as i on p."id"=i."productId" where p."pid"=$1;`

        const { rows: singleProduct } = await db.query(sql,[product]);
            const formattedSingleProduct = singleProduct.map(product => {

            const { tnId, altText, file, type, ...p} = product;
 
            return {
                ...p,
                image: {
                    id: tnId,
                    altText: altText,
                    file: file,
                    type: "full_images",
                    url: `http://api.sc.lfzprototypes.com/images/full_images/${file}`
                },
                thumbnail: {
                    id: tnId,
                    altText: altText,
                    file: file,
                    type: "thumbnails",
                    url: `http://api.sc.lfzprototypes.com/images/thumbnails/${file}`
                }
            }
        });
            const singleProductData = formattedSingleProduct[0];
        res.send(singleProductData);
    }
    catch(err) {
      
        next(err);
    }
});

module.exports = router;