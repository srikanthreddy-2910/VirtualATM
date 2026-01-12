const router = require("express").Router();
const accountController = require("../controllers/account.controller");

router.get("/", accountController.getAccounts);
router.get("/balance", accountController.getBalance);
router.get("/limit", accountController.getLimits);
router.get("/transactions", accountController.getTransactions);

module.exports = router;
