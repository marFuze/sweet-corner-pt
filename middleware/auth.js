const jwt = require('jwt-simple');
const { jwtSecret } = require('../config/jwt');
const ApiError = require('../lib/api_error');
const db = require('../db');

module.exports = async (req, res, next) => {

  try {
    // Get token from request headers, header name should be "access-token"
    const cartToken = req.headers['x-cart-token'];
    console.log('cartToken', cartToken);
    
    // Throw error if no access-token
   // if (!cartToken) throw Error('no token found');

    // Use jwt to decode the token

    // if (cartToken){
    // const decodedToken = jwt.decode(cartToken, jwtSecret, 'HS512');
    
    // const {cartId} = decodedToken;

    // res.locals.activeCartId = cartId;
  //}

    // Go to the next thing...
    next();
  } catch (error) {
    next(error);
  }
};
