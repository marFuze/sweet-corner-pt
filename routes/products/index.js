const express = require('express');
const {db} = require('../../db');
const router = express.Router();
const {urlImages} = require('../../utility/url_images')

//get all products
router.get('/', async (req, res, next) => {
    try {
        //console.log("req", req)
        const resp = await db.query(`select p."pid" as id, "caption", "cost", p."name", i."pid" as "tnId", "altText", "file", "type" from "products" as p left join "images" as i on p."id"=i."productId" where "type"='thumbnail';`);

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
                   url: urlImages(req, type, file)
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

//get a product's details
router.get('/:product', async (req, res, next) => {

    const {product} = req.params;
    try {
    
        const { rows: singleProduct } = await db.query(`select p."pid" as id, "caption", "cost", p."name", i."pid" as "tnId", "altText", "file", "type" from "products" as p left join "images" as i on p."id"=i."productId" where p."pid"=$1;`,[product]);
            const formattedSingleProduct = singleProduct.map(product => {

            const { tnId, altText, file, type, ...p} = product;
 
            return {
                ...p,
                image: {
                    id: tnId,
                    altText: altText,
                    file: file,
                    type: type,
                    url: urlImages(req, type, file)
                },
                thumbnail: {
                    id: tnId,
                    altText: altText,
                    file: file,
                    type: type,
                    url: urlImages(req, type, file)
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