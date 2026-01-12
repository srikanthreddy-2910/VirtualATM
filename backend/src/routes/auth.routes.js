const router = require("express").Router();
const authController = require("../controllers/auth.controller");

router.post("/change-pin", authController.changePin);

module.exports = router;
