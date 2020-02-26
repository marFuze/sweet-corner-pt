const dotenv = require('dotenv').config()
const express = require('express');

const { routes } = require('./routes');
//const logger = require('.middleware/default_logger');

const baseApp = express();

//baseApp.use('/', logger);

const PORT = process.env.PORT || 9000;
const app = routes(baseApp);


app.listen(PORT, () => {
    console.log('Server listening on PORT:', PORT);
  });