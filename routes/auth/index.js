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

    try {

        const passwordHash = await db.query(`select "password" from "users" where "email"=$1;`,[email])
        const {rows: returnedHash} = passwordHash
        const [{password}] = returnedHash
        const hashPass = password
        console.log("TCL: hashPass", hashPass)

        
        const passwordCompare = await compare(password,hashPass)
        console.log("TCL: passwordCompare", passwordCompare)
        
        //const signInResp = await db.query(`select "pid" from "users" where "email"=$1 and "password"=$2`,[])
        res.send({message: "from sign-in"})
    }

    catch(err){
        next(err)
    }

});

module.exports = router;