const { NODE_ENV } = process.env;
const fs = require("fs")
const router = require('express').Router();
const { Logger, retrieveLogs } = require('../utilities/logger');

try {
    router
        .get('/', async (request, response, next) => {
                            
            response.send(await retrieveLogs(request.query));         
        
        })
        
} catch (e) {
    const currentRoute = '[Route Error] /logs';
    if (NODE_ENV !== 'DEVELOPMENT') {
        Logger.error(`${currentRoute}: ${e.message}`);
    } else {
        console.log(`${currentRoute}: ${e.message}`);
    }
} finally {
    module.exports = router;
}
