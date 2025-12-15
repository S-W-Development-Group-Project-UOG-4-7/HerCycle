const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { addCycle, getCycles } = require("../controllers/cycleController");

router.post("/", auth, addCycle);
router.get("/", auth, getCycles);

module.exports = router;
