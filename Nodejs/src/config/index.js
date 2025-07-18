const {JOI, dotenv, httpStatus} = require("../package");
dotenv.config();

const envVarsSchema = JOI.object().keys({
    NODE_ENV: JOI.string().valid('production', 'development', 'test').required(),
    PORT: JOI.number().default(3000),

    CORS_ORIGINS: JOI.string().required().description("Website URLs"),
    
    MONGO_URI: JOI.string().required().description("Database URI"),

    JWT_SECRET: JOI.string().required().description("JWT Secret")
}).unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}
module.exports =  {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    allowedOrigins: envVars.CORS_ORIGINS.split(","),
    jwtSecret: envVars.JWT_SECRET,
    mongoose:{
        url: envVars.MONGO_URI,
        options: {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        }
    },
    httpCodes: httpStatus.status,
    httpStatus:httpStatus,
    serverConf: require("./server.config"),
}