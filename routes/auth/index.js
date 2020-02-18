const express = require('express');
const router = express.Router();
const {db} = require('../../db');
const jwt = require('jwt-simple');
const { jwtSecret } = require('../../config/jwt');
const {generate} = require('../../lib/hash');

router.post('/create-account', async (req, res, next) => {
    const { email, firstName, lastName, password } = req.body;
    const passwordHash = await generate(password);

    try {  
    const addedUser = await db.query(`insert into "users" ("firstName","lastName","email","password") values ($1,$2,$3,$4) RETURNING pid`,
    [firstName, lastName, email, passwordHash]);

    const { rows: newUserPid } = addedUser;
    const [{pid}] = newUserPid;
    const token = jwt.encode({uid: pid}, jwtSecret)

            res.send({
                "token": token,
                "user": {
                    "name": `${firstName} ${lastName}`,
                    "email": email,
                    "pid": pid
                }});
            }
    catch(err) {
        next(err);
    }
});


router.post('/create-account', async (req, res, next) => {
    try {

    }

    catch(err){
        next(err);
    }

});

module.exports = router;