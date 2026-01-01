import Module from '../models/Module.js';
import UserProgress from '../models/UserProgress.js';
import User from '../models/User.js';

export const getModules = async (req, res) => {
  try {
    const { category, status } = req.query;

    let query = {};
    if (category) query.category = category;
    if (status) query.isActive = status === 'active';

    const modules = await Module.find(query).sort({ moduleNumber: 1 });

    if (req.user) {
      const userProgress = await UserProgress.find({ userId: req.user._id });
      const progressMap = {};
      userProgress.forEach(p => {
        progressMap[p.moduleId.toString()] = p.status;
      });

      const modulesWithProgress = modules.map(module => ({
        ...module.toObject(),
        userProgress: progressMap[module._id.toString()] || 'not-started',
      }));

      return res.json({
        success: true,
        data: { modules: modulesWithProgress },
      });
    }

    res.json({
      success: true,
      data: { modules },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message },
    });
  }
};

export const getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({
        success: false,
        error: { message: 'Module not found' },
      });
    }

    if (req.user) {
      const progress = await UserProgress.findOne({
        userId: req.user._id,
        moduleId: module._id,
      });

      return res.json({
        success: true,
        data: {
          module: {
            ...module.toObject(),
            userProgress: progress?.status || 'not-started',
          },
        },
      });
    }

    res.json({
      success: true,
      data: { module },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message },
    });
  }
};

export const startModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({
        success: false,
        error: { message: 'Module not found' },
      });
    }

    let progress = await UserProgress.findOne({
      userId: req.user._id,
      moduleId: module._id,
    });

    if (progress) {
      progress.lastAccessedAt = Date.now();
      if (progress.status === 'not-started') {
        progress.status = 'in-progress';
        progress.startedAt = Date.now();
      }
      await progress.save();
    } else {
      progress = await UserProgress.create({
        userId: req.user._id,
        moduleId: module._id,
        status: 'in-progress',
        startedAt: Date.now(),
      });
    }

    res.json({
      success: true,
      data: { userProgress: progress },
      message: 'Module started successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message },
    });
  }
};

export const completeModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({
        success: false,
        error: { message: 'Module not found' },
      });
    }

    let progress = await UserProgress.findOne({
      userId: req.user._id,
      moduleId: module._id,
    });

    if (!progress) {
      progress = await UserProgress.create({
        userId: req.user._id,
        moduleId: module._id,
        status: 'completed',
        startedAt: Date.now(),
        completedAt: Date.now(),
      });
    } else if (progress.status !== 'completed') {
      progress.status = 'completed';
      progress.completedAt = Date.now();
      await progress.save();
    } else {
      return res.json({
        success: true,
        data: { userProgress: progress, pointsEarned: 0 },
        message: 'Module already completed',
      });
    }

    const user = await User.findById(req.user._id);

    if (!user.completedModules.includes(module._id)) {
      user.completedModules.push(module._id);
      user.totalPoints += module.pointsValue;

      const newLevel = calculateLevel(user.totalPoints);
      user.currentLevel = newLevel;

      await user.save();

      return res.json({
        success: true,
        data: {
          userProgress: progress,
          pointsEarned: module.pointsValue,
          totalPoints: user.totalPoints,
          newLevel: newLevel,
        },
        message: `Module completed! You earned ${module.pointsValue} points!`,
      });
    }

    res.json({
      success: true,
      data: { userProgress: progress, pointsEarned: 0 },
      message: 'Module marked as complete',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message },
    });
  }
};

export const getUserProgress = async (req, res) => {
  try {
    const progress = await UserProgress.findOne({
      userId: req.user._id,
      moduleId: req.params.id,
    });

    res.json({
      success: true,
      data: { userProgress: progress || { status: 'not-started' } },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message },
    });
  }
};

function calculateLevel(points) {
  if (points < 200) return 1;
  if (points < 500) return 2;
  if (points < 1000) return 3;
  if (points < 2000) return 4;
  if (points < 3500) return 5;
  if (points < 5500) return 6;
  return 7;
}
