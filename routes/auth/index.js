const express = require('express');
const router = express.Router();
const {db} = require('../../db');
const jwt = require('jwt-simple');
const { jwtSecret } = require('../../config/jwt');
const {generate, compare} = require('../../lib/hash');

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


router.post('/sign-in', async (req, res, next) => {
    const { email, password } = req.body;
    //console.log("TCL: email", email)
    const token = req.headers['x-cart-token'];

    try {

        const passwordHash = await db.query(`select "password" from "users" where "email"=$1;`,[email])
        const dbPassword = passwordHash.rows[0].password
    
        const passwordCompareResult = await compare(password,dbPassword)
       
        if(!passwordCompareResult){
            res.send(404, "Invalid username or password.")
        }
        {

        const signInResp = await db.query(`select "pid", "firstName", "lastName" from "users" where "email"=$1 and "password"=$2`,[email,dbPassword])
        const pid = signInResp.rows[0].pid
        const firstName = signInResp.rows[0].firstName
        const lastName = signInResp.rows[0].lastName
        res.send({
            "token": token,
            "user": {
                "name": `${firstName} ${lastName}`,
                "email": email,
                "pid": pid
            }
        })
    }
    }

    catch(err){
        next(err)
    }

});

module.exports = router;