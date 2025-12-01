const express = require("express");
const router = express.Router();
const { checkSymptoms } = require("../controllers/symptomCheckerController");

router.post("/", checkSymptoms);

module.exports = router;