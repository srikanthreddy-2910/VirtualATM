const router = require("express").Router();
const controller = require("../controllers/transaction.controller");

router.post("/withdraw", controller.withdraw);
router.post("/deposit", controller.deposit);
router.post("/transfer", controller.transfer);
router.get("/statement", controller.statement);

module.exports = router;
