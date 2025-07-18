const app = require("./app");
const {serverConf, mongoose, port, env} = require("./config");
// const logger = require("./config/logger.config");

// logger.info(`Node Environment => ${env}`);
(async ()=>{
    await serverConf.startServer(app, port, mongoose);
})();