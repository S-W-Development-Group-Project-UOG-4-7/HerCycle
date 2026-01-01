import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import Module from '../models/Module.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('completedModules', 'title moduleNumber icon');

    const totalModules = await Module.countDocuments({ isActive: true });
    const completedCount = user.completedModules.length;
    const completionPercentage = totalModules > 0
      ? Math.round((completedCount / totalModules) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        user: {
          ...user.toObject(),
          stats: {
            completionPercentage,
            totalModules,
            completedModules: completedCount,
          },
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message },
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { email, gender } = req.body;

    const user = await User.findById(req.user._id);

    if (email !== undefined) user.email = email;
    if (gender !== undefined) user.gender = gender;

    await user.save();

    res.json({
      success: true,
      data: { user: { ...user.toObject(), password: undefined } },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message },
    });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const totalModules = await Module.countDocuments({ isActive: true });
    const completedCount = user.completedModules.length;

    res.json({
      success: true,
      data: {
        totalPoints: user.totalPoints,
        currentLevel: user.currentLevel,
        badges: user.badges,
        completedModules: completedCount,
        totalModules,
        currentStreak: user.currentStreak,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message },
    });
  }
};

export const getUserModuleProgress = async (req, res) => {
  try {
    const modules = await Module.find({ isActive: true }).sort({ moduleNumber: 1 });
    const userProgress = await UserProgress.find({ userId: req.user._id });

    const progressMap = {};
    userProgress.forEach(p => {
      progressMap[p.moduleId.toString()] = p;
    });

    const modulesWithProgress = modules.map(module => ({
      moduleId: module._id,
      moduleNumber: module.moduleNumber,
      title: module.title,
      icon: module.icon,
      category: module.category,
      progress: progressMap[module._id.toString()] || { status: 'not-started' },
    }));

    const totalModules = modules.length;
    const completedModules = userProgress.filter(p => p.status === 'completed').length;
    const overallCompletion = totalModules > 0
      ? Math.round((completedModules / totalModules) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        moduleProgress: modulesWithProgress,
        overallCompletion,
        totalModules,
        completedModules,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message },
    });
  }
};
