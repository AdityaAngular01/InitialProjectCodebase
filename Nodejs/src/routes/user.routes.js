const express = require("express");
const router = express.Router();

const {schemaValidator} = require("../middlewares/schemaValidator.middleware");
const { asyncHandler } = require("../middlewares/asyncHandler.middleware");
const { userController } = require("../controller");
const authenticate = require("../middlewares/authenticate.middleware");
const checkPermission = require("../middlewares/checkPermission.middleware");


router.use(authenticate);
router
    .get("/", checkPermission("read_user"), asyncHandler(userController.queryUsers))
    .get("/info", asyncHandler(userController.userInfo))
    .get("/all", checkPermission("read_user"), asyncHandler(userController.getAllUsers));


router.patch("/:userId/update/:update", asyncHandler(userController.update));

router.put("/:userId/info", asyncHandler(userController.updateUser));

module.exports = router;