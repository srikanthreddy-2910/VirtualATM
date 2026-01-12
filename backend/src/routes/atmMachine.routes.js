const router = require("express").Router();
const controller = require("../controllers/atmMachine.controller");

router.get("/status", controller.getStatus);
router.get("/cash", controller.getCash);
router.post("/cash/update", controller.updateCash);

module.exports = router;
