const express = require("express");
const router = express.Router();

const {schemaValidator} = require("../middlewares/schemaValidator.middleware");
const { asyncHandler } = require("../middlewares/asyncHandler.middleware");
const { authController } = require("../controllers");
const { registerSchema, loginSchema } = require("../validations").auth;

router.post("/register", schemaValidator(registerSchema), asyncHandler(authController.register));
router.post("/login", schemaValidator(loginSchema), asyncHandler(authController.login));

module.exports = router;
