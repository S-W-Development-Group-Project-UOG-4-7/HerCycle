const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  addCycle,
  getCycles,
  deleteCycleById,
  updateCycleById,
} = require("../controllers/cycleController");

router.post("/", auth, addCycle);
router.get("/", auth, getCycles);

// new
router.delete("/:id", auth, deleteCycleById);
router.put("/:id", auth, updateCycleById);

module.exports = router;
