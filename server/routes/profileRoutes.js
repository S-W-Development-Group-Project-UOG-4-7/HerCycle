const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
  deleteProfile,
} = require("../controllers/profileController");

router.get("/", auth, getProfile);
router.put("/", auth, updateProfile);
router.post("/delete", auth, deleteProfile);

module.exports = router;
