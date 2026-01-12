const express = require("express")
const router =express.Router();
const atmController = require("../controllers/atm.controller");

router.post("/card/insert", atmController.insertCard);
router.post("/card/validate", atmController.validateCard);
router.post("/session/start", atmController.startSession);
router.post("/session/end", atmController.endSession);
router.post("/card/block", atmController.blockCard);

module.exports = router;
