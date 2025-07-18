const {
    cors,
    express
} = require("./package");
const { allowedOrigins, httpCodes } =require("./config")
const app = express();
const routes = require("./routes");
const {
    errorConverter,
    errorHandler
} = require("./middlewares/error.middleware");
const successResponse = require("./middlewares/successResponse.middleware");
const { ApiError } = require("./utils");

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json());

// Success Response
app.use(successResponse);
app.use("/", routes);


// Send back a 404 error for any unknown api request
app.use((req, res, next) => {
    next(new ApiError(httpCodes.NOT_FOUND, 'Not found'));
});

// Convert error to ApiError, if request was rejected or it throws an error
app.use(errorConverter);

// Handle the error
app.use(errorHandler);

module.exports = app;