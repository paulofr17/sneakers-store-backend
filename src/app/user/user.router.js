const router = require("express").Router();
const { checkToken } = require("../../lib/auth");
const userController = require("./user.controller");

// User Routes
router.get("/validateSession", checkToken, userController.validateSession);
router.get("/email", userController.getUserByEmail);
router.get("/:id", userController.getUserById);
router.get("/", userController.getUsers);
router.post("/register", userController.createUser);
router.post("/credentialsLogin", userController.authenticateCredentialsUser);
router.post("/googleLogin", userController.authenticateGoogleUser);

module.exports = router;
