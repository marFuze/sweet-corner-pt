const jwt = require('jwt-simple');
const { jwtSecret } = require('../config/jwt');
const ApiError = require('../lib/api_error');
const {db} = require('../db');

module.exports = async (req, res, next) => {

  const authToken = req.headers.authorization
  const cartToken = req.headers['x-cart-token'];

  try {
    //if no auth or cart token stop
    if((!authToken || authToken.indexOf('Object') > -1) && (!cartToken || cartToken.indexOf('Object') > -1)){
      
        next();
        return;
    }

    // get user id from auth token
    if(authToken) {
      const {uid} = jwt.decode(authToken, jwtSecret)
      const getUserId = await db.query(`select "id" from "users" where "pid"=$1;`,[uid])
      res.locals.userId = getUserId.rows[0].id
      next()
    }
    
    //get cart pid from cart token
    if(cartToken) {
      console.log("cartToken", cartToken)
      const {cartPid} = jwt.decode(cartToken, jwtSecret)
      res.locals.cartTokenPid = cartPid;
      console.log("res.locals.cartTokenPid", res.locals.cartTokenPid)
      res.locals.existingToken = cartToken;

    // Go to the next thing...
    next();
    }
  } catch (error) {
    next(error);
  }
};
