const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select("name email role createdAt updatedAt");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update name/email if provided
    if (typeof name === "string" && name.trim()) user.name = name.trim();
    if (typeof email === "string" && email.trim()) user.email = email.trim().toLowerCase();

    // Change password (only if user provided current + new)
    const wantsPasswordChange = currentPassword || newPassword;
    if (wantsPasswordChange) {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          message: "To change password, provide currentPassword and newPassword",
        });
      }

      const ok = await bcrypt.compare(currentPassword, user.password);
      if (!ok) return res.status(400).json({ message: "Current password is incorrect" });

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      user.password = hashed;
    }

    await user.save();

    // Return safe fields only
    return res.json({
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      message: wantsPasswordChange ? "Profile updated & password changed" : "Profile updated",
    });
  } catch (err) {
    console.error(err);

    // handle duplicate email nicely
    if (err.code === 11000) {
      return res.status(400).json({ message: "That email is already in use" });
    }

    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Optional safety: require password to delete
    const { password } = req.body || {};
    if (!password) {
      return res.status(400).json({ message: "Password is required to delete account" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Password is incorrect" });

    await User.findByIdAndDelete(userId);
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
