import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Course from './models/Course.js';
import User from './models/User.js';
import Note from './models/Note.js';
import Message from './models/Message.js';
import ModificationLog from './models/ModificationLog.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = 'hercycle_secret_key_123';

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hercycle')
  .then(() => {
    console.log('MongoDB Connected');
    seedAdmin(); // Create Admin if not exists
  })
  .catch(err => console.error(err));

// --- ADMIN SEEDING ---
const seedAdmin = async () => {
  const adminEmail = 'admin@hercycle.com'; // Changed to avoid conflict
  try {
    const exists = await User.findOne({ email: adminEmail });
    if (!exists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt); // Changed password
      await User.create({
        name: 'Platform Admin',
        email: adminEmail,
        password: hashedPassword,
        dob: new Date('1990-01-01'),
        role: 'admin',
        profilePic: ''
      });
      console.log('Admin account created successfully.');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};

// --- AUTH ROUTES ---

// 1. REGISTER
app.post('/api/register', async (req, res) => {
  const { name, email, password, dob } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Default role is 'student'
  const user = new User({ name, email, password: hashedPassword, dob });
  await user.save();

  res.json({ message: 'Student registered successfully' });
});

// 2. LOGIN (Unified for Student & Lecturer)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);

    // SEND COMPLETE USER DATA
    res.json({
      token,
      role: user.role,
      name: user.name,
      email: user.email,
      dob: user.dob,
      id: user._id,
      completedCourses: user.completedCourses,
      profilePic: user.profilePic
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- USER MANAGEMENT ROUTES ---

// 1. GET ALL STUDENTS
app.get('/api/users', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).populate('completedCourses', 'title');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. DELETE USER
app.delete('/api/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. UPDATE USER PROFILE (Name & Picture)
app.put('/api/users/:id', async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. MARK COURSE COMPLETE
app.post('/api/users/:userId/complete', async (req, res) => {
  const { userId } = req.params;
  const { courseId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.completedCourses.includes(courseId)) {
      user.completedCourses.push(courseId);
      await user.save();
    }

    res.json({ message: 'Progress saved', completedCourses: user.completedCourses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- COURSE ROUTES ---

// 1. GET ALL COURSES
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. CREATE COURSE
app.post('/api/courses', async (req, res) => {
  try {
    const newCourse = new Course(req.body);
    await newCourse.save();
    res.json(newCourse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. UPDATE COURSE
app.put('/api/courses/:id', async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCourse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. DELETE COURSE
app.delete('/api/courses/:id', async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- NOTE ROUTES ---

// 1. GET ALL NOTES FOR A USER
app.get('/api/notes/:userId', async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.params.userId }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. CREATE NOTE
app.post('/api/notes', async (req, res) => {
  try {
    const newNote = new Note(req.body);
    await newNote.save();
    res.json(newNote);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. UPDATE NOTE
app.put('/api/notes/:id', async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. DELETE NOTE
app.delete('/api/notes/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- ADMIN ROUTES ---

// 1. CREATE LECTURER ACCOUNT (Admin Only)
app.post('/api/admin/create-lecturer', async (req, res) => {
  try {
    const { name, email, password, dob } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already in use' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create lecturer
    const lecturer = await User.create({
      name,
      email,
      password: hashedPassword,
      dob: dob || new Date('1990-01-01'),
      role: 'lecturer',
      profilePic: ''
    });

    res.json({
      message: 'Lecturer account created successfully',
      lecturer: {
        id: lecturer._id,
        name: lecturer.name,
        email: lecturer.email,
        role: lecturer.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET PLATFORM ANALYTICS (Admin Only)
app.get('/api/admin/analytics', async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalLecturers = await User.countDocuments({ role: 'lecturer' });
    const totalCourses = await Course.countDocuments();
    const totalUsers = await User.countDocuments();

    res.json({
      totalStudents,
      totalLecturers,
      totalCourses,
      totalUsers
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. GET STUDENTS PROGRESS (Admin Only)
app.get('/api/admin/students-progress', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .populate('completedCourses', 'title')
      .sort({ createdAt: -1 });

    const totalCourses = await Course.countDocuments();

    const studentsWithProgress = students.map(student => {
      const completedCount = student.completedCourses.length;
      const progressPercentage = totalCourses > 0
        ? Math.round((completedCount / totalCourses) * 100)
        : 0;

      return {
        id: student._id,
        name: student.name,
        email: student.email,
        dob: student.dob,
        profilePic: student.profilePic,
        completedCourses: student.completedCourses,
        completedCount,
        totalCourses,
        progressPercentage,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt
      };
    });

    res.json(studentsWithProgress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. GET LECTURERS LIST (Admin Only)
app.get('/api/admin/lecturers', async (req, res) => {
  try {
    const lecturers = await User.find({ role: 'lecturer' })
      .sort({ createdAt: -1 });

    const lecturersWithStats = await Promise.all(lecturers.map(async (lecturer) => {
      const coursesCreated = await Course.countDocuments({ instructor: lecturer.name });

      return {
        id: lecturer._id,
        name: lecturer.name,
        email: lecturer.email,
        dob: lecturer.dob,
        profilePic: lecturer.profilePic,
        coursesCreated,
        createdAt: lecturer.createdAt,
        updatedAt: lecturer.updatedAt
      };
    }));

    res.json(lecturersWithStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- MESSAGE/CHAT ROUTES ---

// 1. SEND MESSAGE
app.post('/api/messages', async (req, res) => {
  try {
    const { senderId, senderRole, recipientId, message } = req.body;

    // Validate inputs
    if (!senderId || !recipientId || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get recipient role
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const newMessage = await Message.create({
      senderId,
      senderRole,
      recipientId,
      recipientRole: recipient.role,
      message,
      read: false
    });

    res.json(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET MESSAGES FOR A USER (Conversation view)
app.get('/api/messages/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all messages where user is sender or recipient
    const messages = await Message.find({
      $or: [
        { senderId: userId },
        { recipientId: userId }
      ]
    })
      .populate('senderId', 'name email role')
      .populate('recipientId', 'name email role')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. GET UNREAD MESSAGE COUNT
app.get('/api/messages/unread-count/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await Message.countDocuments({
      recipientId: userId,
      read: false
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. MARK MESSAGE AS READ
app.put('/api/messages/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findByIdAndUpdate(
      messageId,
      { read: true },
      { new: true }
    );
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. MARK ALL MESSAGES AS READ (for a conversation)
app.put('/api/messages/read-all/:userId/:otherUserId', async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    await Message.updateMany(
      {
        senderId: otherUserId,
        recipientId: userId,
        read: false
      },
      { read: true }
    );
    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- MODIFICATION LOG ROUTES ---

// 1. CREATE MODIFICATION LOG (Internal helper, but exposed for flexibility)
app.post('/api/modification-logs', async (req, res) => {
  try {
    const { courseId, courseTitle, modifiedBy, modifierName, modifierRole, action, reason, changes, originalCreator, originalCreatorName } = req.body;

    if (!courseTitle || !modifiedBy || !modifierRole || !action || !reason) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (reason.length < 10) {
      return res.status(400).json({ message: 'Reason must be at least 10 characters' });
    }

    const log = await ModificationLog.create({
      courseId,
      courseTitle,
      modifiedBy,
      modifierName,
      modifierRole,
      action,
      reason,
      changes,
      originalCreator,
      originalCreatorName,
      notificationSent: true
    });

    res.json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET ALL MODIFICATION LOGS (Admin only)
app.get('/api/modification-logs', async (req, res) => {
  try {
    const logs = await ModificationLog.find()
      .populate('modifiedBy', 'name email role')
      .populate('originalCreator', 'name email role')
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. GET MODIFICATION LOGS FOR A SPECIFIC USER (notifications)
app.get('/api/modification-logs/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get logs where this user's courses were modified by someone else
    const logs = await ModificationLog.find({
      originalCreator: userId,
      modifiedBy: { $ne: userId } // Not modified by themselves
    })
      .populate('modifiedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. GET UNREAD NOTIFICATION COUNT
app.get('/api/modification-logs/unread-count/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await ModificationLog.countDocuments({
      originalCreator: userId,
      modifiedBy: { $ne: userId },
      notificationRead: false
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. MARK NOTIFICATION AS READ
app.put('/api/modification-logs/:logId/read', async (req, res) => {
  try {
    const { logId } = req.params;
    const log = await ModificationLog.findByIdAndUpdate(
      logId,
      { notificationRead: true },
      { new: true }
    );
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- ENHANCED COURSE ROUTES ---

// ADMIN EDIT ANY COURSE (with reason and notification)
app.put('/api/courses/:id/admin-edit', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, modifiedBy, modifierName, modifierRole, ...updates } = req.body;

    if (!reason || reason.length < 10) {
      return res.status(400).json({ message: 'Reason must be at least 10 characters' });
    }

    // Get original course
    const originalCourse = await Course.findById(id).populate('createdBy', 'name email');
    if (!originalCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Track what changed
    const changes = {};
    Object.keys(updates).forEach(key => {
      if (JSON.stringify(originalCourse[key]) !== JSON.stringify(updates[key])) {
        changes[key] = {
          from: originalCourse[key],
          to: updates[key]
        };
      }
    });

    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      {
        ...updates,
        lastModifiedBy: modifiedBy
      },
      { new: true }
    );

    // Create modification log
    const log = await ModificationLog.create({
      courseId: id,
      courseTitle: originalCourse.title,
      modifiedBy,
      modifierName,
      modifierRole,
      action: 'edit',
      reason,
      changes,
      originalCreator: originalCourse.createdBy?._id,
      originalCreatorName: originalCourse.createdBy?.name,
      notificationSent: true
    });

    // Add to course modification history
    await Course.findByIdAndUpdate(id, {
      $push: { modificationHistory: log._id }
    });

    res.json({
      course: updatedCourse,
      log,
      message: 'Course updated successfully. Creator has been notified.'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADMIN DELETE ANY COURSE (with reason and notification)
app.delete('/api/courses/:id/admin-delete', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, modifiedBy, modifierName, modifierRole } = req.body;

    if (!reason || reason.length < 10) {
      return res.status(400).json({ message: 'Reason must be at least 10 characters' });
    }

    // Get course data before deletion
    const course = await Course.findById(id).populate('createdBy', 'name email');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Create modification log (before deletion)
    const log = await ModificationLog.create({
      courseId: id,
      courseTitle: course.title,
      modifiedBy,
      modifierName,
      modifierRole,
      action: 'delete',
      reason,
      changes: { deletedCourse: course }, // Archive full course data
      originalCreator: course.createdBy?._id,
      originalCreatorName: course.createdBy?.name,
      notificationSent: true
    });

    // Delete the course
    await Course.findByIdAndDelete(id);

    res.json({
      message: 'Course deleted successfully. Creator has been notified.',
      log
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- HISTORY & REPORTS ROUTES ---

// 1. GET COMPREHENSIVE HISTORY (Admin only)
app.get('/api/admin/history', async (req, res) => {
  try {
    const [users, courses, modifications] = await Promise.all([
      User.find().sort({ createdAt: -1 }),
      Course.find().populate('createdBy', 'name email').sort({ createdAt: -1 }),
      ModificationLog.find()
        .populate('modifiedBy', 'name email role')
        .populate('originalCreator', 'name email role')
        .sort({ createdAt: -1 })
    ]);

    res.json({
      users,
      courses,
      modifications,
      summary: {
        totalUsers: users.length,
        totalCourses: courses.length,
        totalModifications: modifications.length,
        generatedAt: new Date()
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET EXPORT DATA (structured for PDF)
app.get('/api/admin/export-data', async (req, res) => {
  try {
    const { type } = req.query; // 'students', 'courses', 'modifications', 'full'

    let data = {};

    if (type === 'students' || type === 'full') {
      const students = await User.find({ role: 'student' })
        .populate('completedCourses', 'title')
        .sort({ name: 1 });

      const totalCourses = await Course.countDocuments();

      data.students = students.map(s => ({
        name: s.name,
        email: s.email,
        completedCourses: s.completedCourses.length,
        totalCourses,
        progress: totalCourses > 0 ? Math.round((s.completedCourses.length / totalCourses) * 100) : 0,
        joinedDate: s.createdAt
      }));
    }

    if (type === 'courses' || type === 'full') {
      const courses = await Course.find()
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });

      data.courses = courses.map(c => ({
        title: c.title,
        instructor: c.instructor,
        creator: c.createdBy?.name || 'Unknown',
        topic: c.topic,
        lessonsCount: c.lessons?.length || 0,
        quizCount: c.quiz?.length || 0,
        createdAt: c.createdAt
      }));
    }

    if (type === 'modifications' || type === 'full') {
      const modifications = await ModificationLog.find()
        .populate('modifiedBy', 'name')
        .populate('originalCreator', 'name')
        .sort({ createdAt: -1 });

      data.modifications = modifications.map(m => ({
        courseTitle: m.courseTitle,
        action: m.action,
        modifiedBy: m.modifierName,
        originalCreator: m.originalCreatorName,
        reason: m.reason,
        date: m.createdAt
      }));
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));