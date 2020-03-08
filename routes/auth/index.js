const express = require('express')
const router = express.Router()
const {db} = require('../../db')
const jwt = require('jwt-simple')
const { jwtSecret } = require('../../config/jwt')
const {generate, compare} = require('../../lib/hash')
const auth = require('../../middleware/auth.js')
const validator = require("email-validator")

router.post('/create-account', auth, async (req, res, next) => {
    const { email, firstName, lastName, password } = req.body;
    const passwordHash = await generate(password);
    const passwordRegEx = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/

    try {  

    if(!validator.validate(email)){
        res.status(404).send('Invalid Email');
            return;
    }
    if(!password.match(passwordRegEx)){
        res.status(404).send('Invalid Password. Please enter a stronger password.');
            return;
    }
    
    const addedUser = await db.query(`insert into "users" ("firstName","lastName","email","password") values ($1,$2,$3,$4) RETURNING pid`,
    [firstName, lastName, email, passwordHash]);
    const { rows: newUserPid } = addedUser;
    const [{pid}] = newUserPid;
    //create token expiration date 
    //1000ms * 60sec * 60min * 24hrs * 14days
    const twoWeeksInMsec = 1000 * 60 * 60 * 24 * 14
    const expires = Date.now() + twoWeeksInMsec
    const token = jwt.encode({exp: expires, uid: pid}, jwtSecret)
        
            res.send({
                "token": token,
                "user": {
                    "name": `${firstName} ${lastName}`,
                    "email": email,
                    "pid": pid
                }});
            }
    catch(err) {next(err)}
});

router.post('/sign-in', async (req, res, next) => {
    const { email, password } = req.body;
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
    catch(err){next(err)}
});

router.get('/sign-in', async (req, res, next) => {
    const authToken = req.headers.authorization

    try {
    const decodedToken = jwt.decode(authToken, jwtSecret); 
    const uid = decodedToken.uid
    const userTokenVerification = await db.query(`select "firstName", "lastName", "email", "pid" from "users" where "pid"=$1;`,[uid])
    const {rows: userData} = userTokenVerification
    const [{ firstName, lastName, email, pid}] = userData
    
    res.send({
        "user": {
            "name": `${firstName} ${lastName}`,
            "email": email,
            "pid": pid
        }
    })
    }
    catch(err){next(err)}
})

module.exports = router;