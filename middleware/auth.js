const jwt = require('jwt-simple');
const { jwtSecret } = require('../config/jwt');
const ApiError = require('../lib/api_error');
const db = require('../db');

module.exports = async (req, res, next) => {
  // Get token from request headers, header name should be "access-token"
  const cartToken = req.headers['x-cart-token'];
  console.log("TCL: cartToken", cartToken)
  try {
    
    //console.log('cartToken', cartToken);
    
    // next() if no access-token
   if (!cartToken || cartToken.indexOf('Object') > -1){
        next();
        return;
   }

    // Use jwt to decode the token

    
      console.log ('auth decode triggered')
    const decodedToken = jwt.decode(cartToken, jwtSecret);
    
    const {cartId} = decodedToken;

    res.locals.activeCartId = cartId;


    // Go to the next thing...
    next();
  } catch (error) {
    next(error);
  }
};
