const {
  getUsers,
  getUserById,
  validateSession,
  createUser,
  authenticateUser,
} = require("./user.controller");
const router = require("express").Router();
const { checkToken } = require("../../auth/token_validation");

// User Routes
router.get("/validateSession", checkToken, validateSession);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/register", createUser);
router.post("/login", authenticateUser);

module.exports = router;
