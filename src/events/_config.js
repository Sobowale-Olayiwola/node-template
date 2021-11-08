const EventEmitter = require('events');

const { Logger } = require('../utilities/logger');

class AppEvent extends EventEmitter {}

const appEvent = new AppEvent();

appEvent.on('error', ({ error }) => {
    Logger.error(`[AppEvent Error] ${error}`);
});

appEvent.on('sampleEventName', ({ param }) => {
    console.log(param);
});

module.exports = appEvent;
