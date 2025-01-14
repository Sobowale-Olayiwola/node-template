/**
 * This module handles the globalization of all objects.
 * This ensures they are properly instantiated into the Global namespace.
 * @module UTILITY:CustomGlobalization
 */

const { NODE_ENV } = process.env;

const mongoose = require('mongoose');

const sendEmail = require('./mailing/sendEmail');
const Controller = require('../controllers/index');
const { CustomControllerError, CustomValidationError } = require('./customErrors');
const { hashObject, verifyObject, generateToken, verifyToken } = require('./encryption');

/**
 * This handles the globalization of all the mongoose models.
 * This ensures they are properly instantiated into the Global namespace.
 *
 */
const models = mongoose.modelNames();
const recordsToInsert = [];
for (let i = 0; i < models.length; i+=1) {
    global[models[i] + 'Controller'] = new Controller(models[i]);
    if (models[i].indexOf('Counter') === -1) {
        const counterRecords = {
            _id: `${models[i].toLowerCase()}Id`,
            sequence: 0,
        };
        recordsToInsert.push(counterRecords);
    }
}

CounterController.model
    .insertMany(recordsToInsert, { ordered: false })
    .then(() => {
        console.log('Data inserted');
    })
    .catch((e) => {
        Logger.error(`[DB Error: ] ${e.message}`);
    });

/**
 * Custom Error Object globalization
 */
global.CustomValidationError = CustomValidationError;
global.CustomControllerError = CustomControllerError;

/**
 * Encryption object globalization
 */
global.hashObject = hashObject;
global.verifyObject = verifyObject;
global.generateToken = generateToken;
global.verifyToken = verifyToken;

/**
 * Globalizing sendEmail
 */
global.sendEmail = sendEmail;

/**
 * Globalizing application environment verification
 */
global.verifyDevelopmentEnvironment = NODE_ENV === 'development' ? true : false;
global.verifyProductionEnvironment = NODE_ENV === 'production' ? true : false;
