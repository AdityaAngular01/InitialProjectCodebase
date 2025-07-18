const router = require("../package").express.Router();
const config = require("../config");
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");

const defaultRoutes = [
    {
        path: "/auth",
        route: authRoutes
    },
    {
        path: "/user",
        route: userRoutes
    },
]

defaultRoutes.forEach((route) => {
    router.use(`/api/v1${route.path}`, route.route);
})

if (config.env === 'development') {
    defaultRoutes.forEach((route) => {
      router.use(`/api/v1/dev${route.path}`, route.route);
    });
}

if (config.env === 'test') {
    defaultRoutes.forEach((route) => {
        router.use(`/api/v1/test${route.path}`, route.route);
    });
}

module.exports = router;