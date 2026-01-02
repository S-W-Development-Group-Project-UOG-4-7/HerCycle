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
import StudentDeletionLog from './models/StudentDeletionLog.js';
import BeginnerLesson from './models/BeginnerLesson.js';
import BeginnerProgress from './models/BeginnerProgress.js';
import Donor from './models/Donor.js';
import Campaign from './models/Campaign.js';
import Donation from './models/Donation.js';
import Review from './models/Review.js';
import Contact from './models/Contact.js';

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
  if (userExists) return res.status(400).json({ message: 'User already exists' }); // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = new User({
    name,
    email,
    password: hashedPassword,
    dob,
    role: 'student', // Default role for registration
    profilePic: ''
  });

  await user.save();

  console.log('✅ User registered successfully:', { name, email, role: 'student' });

  res.json({ message: 'Registration successful!' });
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

// 1. GET ALL STUDENTS (for Student Management page)
app.get('/api/users', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).populate('completedCourses', 'title');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 1b. GET ALL CONTACTS FOR MESSAGING (admin + lecturers)
app.get('/api/users/contacts', async (req, res) => {
  try {
    // Return admin and lecturers for messaging purposes
    const users = await User.find({
      role: { $in: ['admin', 'lecturer'] }
    }).select('_id name email role profilePic');

    // Map _id to id for frontend compatibility
    const usersWithId = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic
    }));

    res.json(usersWithId);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. DELETE USER (Simple deletion - used by admin)
app.delete('/api/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2b. LECTURER DELETE STUDENT WITH REASON (Notifies Admin)
app.delete('/api/lecturer/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, lecturerId, lecturerName } = req.body;


    // Validate reason
    if (!reason || reason.length < 10) {
      return res.status(400).json({ message: 'Reason must be at least 10 characters' });
    }

    // Get student data before deletion
    const student = await User.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.role !== 'student') {
      return res.status(400).json({ message: 'Can only delete student accounts' });
    }

    // Create deletion log for admin notification
    await StudentDeletionLog.create({
      studentId: id,
      studentName: student.name,
      studentEmail: student.email,
      deletedBy: lecturerId,
      lecturerName,
      reason,
      notificationRead: false
    });

    // Delete the student
    await User.findByIdAndDelete(id);

    res.json({
      message: 'Student removed successfully. Admin has been notified.',
      notifiedAdmin: true
    });
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

// 1. CREATE USER ACCOUNT - Lecturer or Staff (Admin Only)
app.post('/api/admin/create-user', async (req, res) => {
  try {
    const { name, email, password, dob, role } = req.body;

    // Validate role (default to lecturer for backward compatibility)
    const userRole = role || 'lecturer';
    if (!['lecturer', 'staff'].includes(userRole)) {
      return res.status(400).json({ message: 'Invalid role. Must be lecturer or staff' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already in use' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with specified role
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      dob: dob || new Date('1990-01-01'),
      role: userRole,
      profilePic: ''
    });

    res.json({
      message: `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} account created successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. STAFF STATS - Get statistics for staff dashboard
app.get('/api/staff/stats', async (req, res) => {
  try {
    // Get basic stats for staff dashboard
    const activeFundraisers = await Campaign.countDocuments({ status: 'active' }) || 0;

    const totalDonationsResult = await Donation.aggregate([
      { $match: { paymentStatus: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalDonations = totalDonationsResult[0]?.total || 0;

    const stats = {
      totalInquiries: 0, // Placeholder - add when contact model exists
      activeFundraisers,
      totalDonations,
      pendingFeedback: 0 // Placeholder - add when feedback model exists
    };

    res.json(stats);
  } catch (err) {
    console.error('Staff stats error:', err);
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

// GET ALL LECTURERS (Admin Only)
app.get('/api/admin/lecturers', async (req, res) => {
  try {
    const lecturers = await User.find({ role: 'lecturer' }).sort({ createdAt: -1 });
    const courses = await Course.find();

    const lecturersWithData = lecturers.map(lecturer => {
      const coursesCreated = courses.filter(c =>
        c.createdBy && c.createdBy.toString() === lecturer._id.toString()
      ).length;

      return {
        id: lecturer._id,
        name: lecturer.name,
        email: lecturer.email,
        dob: lecturer.dob,
        profilePic: lecturer.profilePic,
        coursesCreated,
        createdAt: lecturer.createdAt
      };
    });

    res.json(lecturersWithData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL STAFF MEMBERS (Admin Only)
app.get('/api/admin/staffs', async (req, res) => {
  try {
    const staffs = await User.find({ role: 'staff' }).sort({ createdAt: -1 });

    const staffsWithData = staffs.map(staff => ({
      id: staff._id,
      name: staff.name,
      email: staff.email,
      dob: staff.dob,
      profilePic: staff.profilePic,
      createdAt: staff.createdAt
    }));

    res.json(staffsWithData);
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
    console.error('❌ Error saving message:', err);
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
    console.error('❌ Error fetching messages:', err);
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

    // Send message notification to the course creator (lecturer)
    if (originalCourse.createdBy?._id && originalCourse.createdBy._id.toString() !== modifiedBy) {
      await Message.create({
        senderId: modifiedBy,
        senderRole: modifierRole,
        recipientId: originalCourse.createdBy._id,
        recipientRole: 'lecturer',
        message: `📝 Your course "${originalCourse.title}" has been edited by ${modifierName} (Admin).\n\nReason: ${reason}\n\nPlease review the changes in your course content.`,
        read: false
      });
    }

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

    // Send message notification to the course creator (lecturer) before deletion
    if (course.createdBy?._id && course.createdBy._id.toString() !== modifiedBy) {
      await Message.create({
        senderId: modifiedBy,
        senderRole: modifierRole,
        recipientId: course.createdBy._id,
        recipientRole: 'lecturer',
        message: `🗑️ Your course "${course.title}" has been deleted by ${modifierName} (Admin).\n\nReason: ${reason}\n\nIf you have questions about this action, please contact the administrator.`,
        read: false
      });
    }

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
    const [users, courses, modifications, studentDeletions] = await Promise.all([
      User.find().sort({ createdAt: -1 }),
      Course.find().populate('createdBy', 'name email').sort({ createdAt: -1 }),
      ModificationLog.find()
        .populate('modifiedBy', 'name email role')
        .populate('originalCreator', 'name email role')
        .sort({ createdAt: -1 }),
      StudentDeletionLog.find().sort({ createdAt: -1 })
    ]);

    res.json({
      users,
      courses,
      modifications,
      studentDeletions,
      summary: {
        totalUsers: users.length,
        totalCourses: courses.length,
        totalModifications: modifications.length,
        totalStudentDeletions: studentDeletions.length,
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

    // Include student deletions for 'deletions' or 'full' type
    if (type === 'deletions' || type === 'full') {
      const deletions = await StudentDeletionLog.find()
        .sort({ createdAt: -1 });

      data.studentDeletions = deletions.map(d => ({
        studentName: d.studentName,
        studentEmail: d.studentEmail,
        deletedBy: d.lecturerName,
        reason: d.reason,
        date: d.createdAt
      }));
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// --- STUDENT DELETION LOG ROUTES ---

// 1. GET ALL STUDENT DELETION LOGS (Admin only)
app.get('/api/student-deletion-logs/admin', async (req, res) => {
  try {
    const logs = await StudentDeletionLog.find()
      .populate('deletedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET UNREAD STUDENT DELETION COUNT (Admin)
app.get('/api/student-deletion-logs/unread-count', async (req, res) => {
  try {
    const count = await StudentDeletionLog.countDocuments({
      notificationRead: false
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. MARK STUDENT DELETION LOG AS READ
app.put('/api/student-deletion-logs/:logId/read', async (req, res) => {
  try {
    const { logId } = req.params;
    const log = await StudentDeletionLog.findByIdAndUpdate(
      logId,
      { notificationRead: true },
      { new: true }
    );
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. MARK ALL STUDENT DELETION LOGS AS READ (Admin viewing History)
app.put('/api/student-deletion-logs/mark-all-read', async (req, res) => {
  try {
    await StudentDeletionLog.updateMany(
      { notificationRead: false },
      { notificationRead: true }
    );
    res.json({ message: 'All deletion notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- BEGINNER EDUCATION PLATFORM ROUTES ---

// Achievement definitions
const ACHIEVEMENTS = [
  { id: 'first_steps', name: 'First Steps', description: 'Complete your first lesson', icon: '🌟', xpBonus: 50 },
  { id: 'on_fire_3', name: 'On Fire', description: '3-day learning streak', icon: '🔥', xpBonus: 100 },
  { id: 'unstoppable_7', name: 'Unstoppable', description: '7-day learning streak', icon: '⚡', xpBonus: 200 },
  { id: 'perfect_score', name: 'Perfect Score', description: 'Get 100% on a quiz', icon: '🎯', xpBonus: 75 },
  { id: 'category_master', name: 'Category Master', description: 'Complete all lessons in a category', icon: '📚', xpBonus: 300 },
  { id: 'level_up', name: 'Level Up', description: 'Reach a new level', icon: '🏆', xpBonus: 50 },
  { id: 'five_lessons', name: 'Getting Started', description: 'Complete 5 lessons', icon: '🎓', xpBonus: 100 },
  { id: 'ten_lessons', name: 'Knowledge Builder', description: 'Complete 10 lessons', icon: '💪', xpBonus: 200 },
  { id: 'quiz_master', name: 'Quiz Master', description: 'Pass 10 quizzes', icon: '🧠', xpBonus: 150 }
];

// 1. GET ALL BEGINNER LESSONS (published only for students, all for lecturers/admin)
app.get('/api/beginner/lessons', async (req, res) => {
  try {
    const { role, userId, category } = req.query;

    let query = {};

    // Students only see published lessons
    if (role === 'student') {
      query.isPublished = true;
    }

    // Lecturers see only their own lessons
    if (role === 'lecturer' && userId) {
      query.createdBy = userId;
    }

    // Filter by category if provided
    if (category && category !== 'All') {
      query.category = category;
    }

    const lessons = await BeginnerLesson.find(query)
      .populate('createdBy', 'name email')
      .sort({ category: 1, order: 1 });

    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET SINGLE BEGINNER LESSON
app.get('/api/beginner/lessons/:id', async (req, res) => {
  try {
    const lesson = await BeginnerLesson.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. CREATE BEGINNER LESSON (lecturer/admin)
app.post('/api/beginner/lessons', async (req, res) => {
  try {
    const lesson = new BeginnerLesson(req.body);
    await lesson.save();
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. UPDATE BEGINNER LESSON
app.put('/api/beginner/lessons/:id', async (req, res) => {
  try {
    const lesson = await BeginnerLesson.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. DELETE BEGINNER LESSON
app.delete('/api/beginner/lessons/:id', async (req, res) => {
  try {
    await BeginnerLesson.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lesson deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. GET USER PROGRESS
app.get('/api/beginner/progress/:userId', async (req, res) => {
  try {
    let progress = await BeginnerProgress.findOne({ userId: req.params.userId })
      .populate('completedLessons.lessonId', 'title category');

    // Create progress record if doesn't exist
    if (!progress) {
      progress = await BeginnerProgress.create({ userId: req.params.userId });
    }

    // Calculate level info
    const level = progress.level;
    const levelTitle = BeginnerProgress.getLevelTitle(level);
    const currentLevelXP = BeginnerProgress.getLevelThresholds()[level - 1] || 0;
    const nextLevelXP = BeginnerProgress.getXPForNextLevel(level);
    const xpInCurrentLevel = progress.totalXP - currentLevelXP;
    const xpNeededForLevel = nextLevelXP - currentLevelXP;

    res.json({
      ...progress.toObject(),
      levelTitle,
      currentLevelXP,
      nextLevelXP,
      xpInCurrentLevel,
      xpNeededForLevel,
      levelProgress: Math.min(100, Math.round((xpInCurrentLevel / xpNeededForLevel) * 100))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 7. COMPLETE A LESSON (Award XP, check achievements)
app.post('/api/beginner/complete-lesson', async (req, res) => {
  try {
    const { userId, lessonId, quizScore } = req.body;

    // Get lesson details
    const lesson = await BeginnerLesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Get or create progress
    let progress = await BeginnerProgress.findOne({ userId });
    if (!progress) {
      progress = await BeginnerProgress.create({ userId });
    }

    // Check if already completed
    const alreadyCompleted = progress.completedLessons.some(
      cl => cl.lessonId.toString() === lessonId
    );

    if (alreadyCompleted) {
      return res.json({ message: 'Already completed', progress, newAchievements: [] });
    }

    // Calculate XP (bonus for perfect score)
    let xpEarned = lesson.xpReward;
    if (quizScore === 100) {
      xpEarned += 25; // Perfect score bonus
    }

    const oldLevel = progress.level;
    const newAchievements = [];

    // Update progress
    progress.completedLessons.push({
      lessonId,
      xpEarned,
      quizScore: quizScore || 0
    });
    progress.totalXP += xpEarned;
    progress.totalLessonsCompleted += 1;

    if (quizScore >= 70) {
      progress.totalQuizzesPassed += 1;
    }
    if (quizScore === 100) {
      progress.perfectScores += 1;
    }

    // Update streak
    const today = new Date().toDateString();
    const lastActivity = progress.lastActivityDate ? new Date(progress.lastActivityDate).toDateString() : null;

    if (lastActivity !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastActivity === yesterday.toDateString()) {
        progress.currentStreak += 1;
      } else if (lastActivity !== today) {
        progress.currentStreak = 1;
      }

      if (progress.currentStreak > progress.longestStreak) {
        progress.longestStreak = progress.currentStreak;
      }
      progress.lastActivityDate = new Date();
    }

    // Calculate new level
    const newLevel = BeginnerProgress.calculateLevel(progress.totalXP);
    progress.level = newLevel;

    // Check achievements
    // First Steps
    if (progress.totalLessonsCompleted === 1 && !progress.achievements.some(a => a.id === 'first_steps')) {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'first_steps');
      progress.achievements.push({ ...achievement, unlockedAt: new Date() });
      progress.totalXP += achievement.xpBonus;
      newAchievements.push(achievement);
    }

    // Five Lessons
    if (progress.totalLessonsCompleted >= 5 && !progress.achievements.some(a => a.id === 'five_lessons')) {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'five_lessons');
      progress.achievements.push({ ...achievement, unlockedAt: new Date() });
      progress.totalXP += achievement.xpBonus;
      newAchievements.push(achievement);
    }

    // Ten Lessons
    if (progress.totalLessonsCompleted >= 10 && !progress.achievements.some(a => a.id === 'ten_lessons')) {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'ten_lessons');
      progress.achievements.push({ ...achievement, unlockedAt: new Date() });
      progress.totalXP += achievement.xpBonus;
      newAchievements.push(achievement);
    }

    // Perfect Score
    if (quizScore === 100 && !progress.achievements.some(a => a.id === 'perfect_score')) {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'perfect_score');
      progress.achievements.push({ ...achievement, unlockedAt: new Date() });
      progress.totalXP += achievement.xpBonus;
      newAchievements.push(achievement);
    }

    // Streak achievements
    if (progress.currentStreak >= 3 && !progress.achievements.some(a => a.id === 'on_fire_3')) {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'on_fire_3');
      progress.achievements.push({ ...achievement, unlockedAt: new Date() });
      progress.totalXP += achievement.xpBonus;
      newAchievements.push(achievement);
    }

    if (progress.currentStreak >= 7 && !progress.achievements.some(a => a.id === 'unstoppable_7')) {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'unstoppable_7');
      progress.achievements.push({ ...achievement, unlockedAt: new Date() });
      progress.totalXP += achievement.xpBonus;
      newAchievements.push(achievement);
    }

    // Level Up achievement
    if (newLevel > oldLevel && !progress.achievements.some(a => a.id === 'level_up')) {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'level_up');
      progress.achievements.push({ ...achievement, unlockedAt: new Date() });
      progress.totalXP += achievement.xpBonus;
      newAchievements.push(achievement);
    }

    // Quiz Master
    if (progress.totalQuizzesPassed >= 10 && !progress.achievements.some(a => a.id === 'quiz_master')) {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'quiz_master');
      progress.achievements.push({ ...achievement, unlockedAt: new Date() });
      progress.totalXP += achievement.xpBonus;
      newAchievements.push(achievement);
    }

    // Update category progress
    const categoryLessons = await BeginnerLesson.countDocuments({
      category: lesson.category,
      isPublished: true
    });
    const completedInCategory = progress.completedLessons.filter(async cl => {
      const l = await BeginnerLesson.findById(cl.lessonId);
      return l && l.category === lesson.category;
    }).length;

    progress.categoryProgress[lesson.category] = Math.round((completedInCategory / categoryLessons) * 100);

    // Recalculate level after bonus XP
    progress.level = BeginnerProgress.calculateLevel(progress.totalXP);

    await progress.save();

    res.json({
      message: 'Lesson completed!',
      xpEarned,
      totalXP: progress.totalXP,
      level: progress.level,
      levelTitle: BeginnerProgress.getLevelTitle(progress.level),
      newAchievements,
      leveledUp: newLevel > oldLevel
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 8. GET ALL ACHIEVEMENTS (available)
app.get('/api/beginner/achievements', async (req, res) => {
  try {
    res.json(ACHIEVEMENTS);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 9. GET LEADERBOARD (Top students by XP)
app.get('/api/beginner/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const leaderboard = await BeginnerProgress.find()
      .populate('userId', 'name profilePic')
      .sort({ totalXP: -1 })
      .limit(parseInt(limit));

    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      name: entry.userId?.name || 'Anonymous',
      profilePic: entry.userId?.profilePic || '',
      totalXP: entry.totalXP,
      level: entry.level,
      levelTitle: BeginnerProgress.getLevelTitle(entry.level),
      lessonsCompleted: entry.totalLessonsCompleted,
      currentStreak: entry.currentStreak
    }));

    res.json(formattedLeaderboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 10. GET CATEGORY STATS
app.get('/api/beginner/categories', async (req, res) => {
  try {
    const categories = ['Body Basics', 'Emotions & Feelings', 'Healthy Habits', 'Growing Up', 'Staying Safe'];

    const stats = await Promise.all(categories.map(async (category) => {
      const count = await BeginnerLesson.countDocuments({ category, isPublished: true });
      return { name: category, lessonCount: count };
    }));

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 11. GET LEVEL INFO
app.get('/api/beginner/levels', async (req, res) => {
  try {
    const thresholds = BeginnerProgress.getLevelThresholds();
    const titles = BeginnerProgress.getLevelTitles();

    const levels = thresholds.map((xp, index) => ({
      level: index + 1,
      xpRequired: xp,
      title: titles[index]
    }));

    res.json(levels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================
// --- FUNDRAISER SYSTEM ROUTES ---
// ============================================

// Seed sample campaigns on startup
const seedCampaigns = async () => {
  try {
    const count = await Campaign.countDocuments();
    if (count === 0) {
      await Campaign.create([
        {
          title: 'Education for All Girls',
          description: 'Help provide menstrual health education to underprivileged communities.',
          detailedInfo: 'This campaign aims to reach 10,000 young girls with essential health education, providing them with the knowledge and resources they need.',
          goalAmount: 50000,
          raisedAmount: 32500,
          endDate: new Date('2026-06-30'),
          icon: '📚',
          color: 'from-purple-500 to-pink-500',
          category: 'Education',
          trustBadges: ['verified', 'secure-payment', 'transparent'],
          impactStats: { beneficiaries: 5200, projectsCompleted: 12, regionsReached: 8 },
          totalDonors: 245
        },
        {
          title: 'Community Health Centers',
          description: 'Build health centers providing free menstrual products and consultations.',
          detailedInfo: 'We are establishing community health centers in rural areas where access to menstrual health resources is limited.',
          goalAmount: 75000,
          raisedAmount: 18750,
          endDate: new Date('2026-08-15'),
          icon: '🏥',
          color: 'from-emerald-500 to-teal-500',
          category: 'Health',
          trustBadges: ['verified', 'transparent', 'tax-deductible'],
          impactStats: { beneficiaries: 2100, projectsCompleted: 3, regionsReached: 5 },
          totalDonors: 128
        },
        {
          title: 'Emergency Relief Fund',
          description: 'Provide immediate support to women affected by natural disasters.',
          detailedInfo: 'Quick deployment of essential supplies including menstrual products, hygiene kits, and medical support.',
          goalAmount: 25000,
          raisedAmount: 21200,
          endDate: new Date('2026-03-31'),
          icon: '🆘',
          color: 'from-red-500 to-orange-500',
          category: 'Emergency',
          trustBadges: ['verified', 'secure-payment', 'matching-funds'],
          impactStats: { beneficiaries: 3500, projectsCompleted: 8, regionsReached: 4 },
          totalDonors: 412
        }
      ]);
      console.log('✅ Sample campaigns created');
    }
  } catch (error) {
    console.error('Error seeding campaigns:', error);
  }
};

// Call seed after DB connection
mongoose.connection.once('open', () => {
  seedCampaigns();
});

// --- DONOR AUTH ROUTES ---

// 1. REGISTER DONOR
app.post('/api/donors/register', async (req, res) => {
  try {
    const { name, email, password, phone, isGuestConverted } = req.body;

    // Check if donor exists
    const existingDonor = await Donor.findOne({ email });
    if (existingDonor) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create donor
    const donor = await Donor.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      isGuestConverted: isGuestConverted || false
    });

    const token = jwt.sign({ id: donor._id, type: 'donor' }, JWT_SECRET);

    res.json({
      message: 'Donor registered successfully',
      token,
      donor: {
        id: donor._id,
        name: donor.name,
        email: donor.email,
        totalDonated: donor.totalDonated
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. DONOR LOGIN
app.post('/api/donors/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const donor = await Donor.findOne({ email });
    if (!donor) {
      return res.status(400).json({ message: 'Donor not found' });
    }

    const isMatch = await bcrypt.compare(password, donor.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: donor._id, type: 'donor' }, JWT_SECRET);

    res.json({
      token,
      donor: {
        id: donor._id,
        name: donor.name,
        email: donor.email,
        phone: donor.phone,
        totalDonated: donor.totalDonated,
        receiveUpdates: donor.receiveUpdates
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. GET DONOR PROFILE
app.get('/api/donors/:id', async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id)
      .populate('donations');

    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    res.json({
      id: donor._id,
      name: donor.name,
      email: donor.email,
      phone: donor.phone,
      totalDonated: donor.totalDonated,
      donationCount: donor.donations.length,
      receiveUpdates: donor.receiveUpdates,
      createdAt: donor.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- CAMPAIGN ROUTES ---

// 1. GET ALL ACTIVE CAMPAIGNS
app.get('/api/fundraiser/campaigns', async (req, res) => {
  try {
    const campaigns = await Campaign.find({ isActive: true })
      .sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET SINGLE CAMPAIGN
app.get('/api/fundraiser/campaigns/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. CREATE CAMPAIGN (Admin only)
app.post('/api/fundraiser/campaigns', async (req, res) => {
  try {
    const campaign = await Campaign.create(req.body);
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. UPDATE CAMPAIGN
app.put('/api/fundraiser/campaigns/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// --- CONTACT ROUTES ---

// 1. SUBMIT CONTACT FORM
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create contact message
    const contact = new Contact({
      name,
      email,
      subject,
      message,
      status: 'new'
    });

    await contact.save();

    console.log('📧 New contact message from:', name, email);

    res.status(201).json({ message: 'Message sent successfully! We\'ll get back to you soon.' });
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// 2. GET ALL CONTACT MESSAGES - Admin/Staff only
app.get('/api/contact/all', async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error('Fetch contacts error:', err);
    res.status(500).json({ message: err.message });
  }
});

// 3. UPDATE CONTACT STATUS - Admin/Staff only
app.patch('/api/contact/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: 'Status updated', contact });
  } catch (err) {
    console.error('Update contact status error:', err);
    res.status(500).json({ message: err.message });
  }
});


// --- DONATION ROUTES ---

// --- REVIEW/TESTIMONIAL ROUTES ---

// 1. CREATE REVIEW - Registered users only
app.post('/api/reviews', async (req, res) => {
  try {
    const { userId, userName, userRole, rating, title, comment } = req.body;

    console.log('Review submission received:', { userId, userName, userRole, rating, title: title?.substring(0, 20) });

    // Validate required fields
    if (!userId || !userName || !userRole || !rating || !title || !comment) {
      console.log('Missing fields:', { userId: !!userId, userName: !!userName, userRole: !!userRole, rating: !!rating, title: !!title, comment: !!comment });
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Validate role
    if (!['student', 'lecturer', 'admin', 'staff'].includes(userRole)) {
      console.log('Invalid role:', userRole);
      return res.status(400).json({ message: 'Invalid user role' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already submitted a review
    const existingReview = await Review.findOne({ userId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already submitted a review' });
    }

    // Create review
    const review = new Review({
      userId,
      userName,
      userRole,
      rating,
      title,
      comment,
      isApproved: true // Auto-approve for instant display
    });

    await review.save();

    console.log('✅ Review saved successfully:', {
      id: review._id,
      userName: review.userName,
      rating: review.rating,
      isApproved: review.isApproved
    });

    res.status(201).json({
      message: 'Review submitted successfully!',
      review
    });
  } catch (err) {
    console.error('Review creation error:', err);
    res.status(500).json({ message: err.message });
  }
});

// 2. GET APPROVED REVIEWS - Public access
app.get('/api/reviews/approved', async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(20);

    console.log(`📋 Fetching approved reviews: Found ${reviews.length} reviews`);

    res.json(reviews);
  } catch (err) {
    console.error('Fetch reviews error:', err);
    res.status(500).json({ message: err.message });
  }
});

// 3. GET ALL REVIEWS - Admin only
app.get('/api/reviews/all', async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error('Fetch all reviews error:', err);
    res.status(500).json({ message: err.message });
  }
});

// 4. APPROVE REVIEW - Admin only
app.patch('/api/reviews/:id/approve', async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ message: 'Review approved successfully', review });
  } catch (err) {
    console.error('Approve review error:', err);
    res.status(500).json({ message: err.message });
  }
});

// 5. DELETE REVIEW - Admin only
app.delete('/api/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ message: err.message });
  }
});

// 6. UPDATE REVIEW - User can edit their own review
app.patch('/api/reviews/:id', async (req, res) => {
  try {
    const { userId, rating, title, comment } = req.body;

    // Find the review
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns this review
    if (review.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You can only edit your own review' });
    }

    // Update fields
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;

    await review.save();

    console.log('✏️ Review updated successfully:', review._id);

    res.json({ message: 'Review updated successfully', review });
  } catch (err) {
    console.error('Update review error:', err);
    res.status(500).json({ message: err.message });
  }
});



// 1. PROCESS DONATION (Supports both Guest and Registered Donors)
app.post('/api/fundraiser/donate', async (req, res) => {
  try {
    const { donorId, donorName, donorEmail, campaignId, amount, isAnonymous, message, isGuest } = req.body;

    // Validate campaign exists
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    let finalDonorName = donorName;
    let finalDonorEmail = donorEmail;

    // If not a guest donation, validate and get donor info
    if (!isGuest && donorId) {
      const donor = await Donor.findById(donorId);
      if (!donor) {
        return res.status(404).json({ message: 'Donor not found' });
      }
      finalDonorName = donor.name;
      finalDonorEmail = donor.email;
    } else if (!donorName || !donorEmail) {
      // For guest donations, name and email are required
      return res.status(400).json({ message: 'Guest donations require name and email' });
    }

    // Create donation record
    const donation = new Donation({
      donorId: isGuest ? null : donorId, // Null for guest donations
      donorName: finalDonorName,
      donorEmail: finalDonorEmail,
      campaignId,
      campaignTitle: campaign.title,
      amount,
      paymentStatus: 'pending',
      isAnonymous: isAnonymous || false,
      message: message || '',
      isGuest: isGuest || false
    });

    // Generate transaction reference
    donation.generateTransactionRef();
    await donation.save();

    res.json({
      message: 'Donation initiated',
      donationId: donation._id,
      transactionRef: donation.transactionRef
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. SIMULATE PAYMENT PROCESSING
app.post('/api/fundraiser/payment/:donationId', async (req, res) => {
  try {
    const { donationId } = req.params;
    const { paymentMethod } = req.body;

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Simulate payment processing (90% success rate)
    const paymentSuccess = Math.random() > 0.1;

    if (paymentSuccess) {
      donation.paymentStatus = 'success';
      donation.paymentMethod = paymentMethod || 'card';
      await donation.save();

      // Update campaign raised amount
      await Campaign.findByIdAndUpdate(donation.campaignId, {
        $inc: { raisedAmount: donation.amount, totalDonors: 1 }
      });

      // Update donor total (only for registered donors, not guests)
      if (donation.donorId) {
        await Donor.findByIdAndUpdate(donation.donorId, {
          $inc: { totalDonated: donation.amount },
          $push: { donations: donation._id }
        });
      }

      res.json({
        success: true,
        message: 'Payment successful',
        donation: {
          id: donation._id,
          receiptNumber: donation.receiptNumber,
          amount: donation.amount,
          transactionRef: donation.transactionRef
        }
      });
    } else {
      donation.paymentStatus = 'failed';
      await donation.save();

      res.json({
        success: false,
        message: 'Payment failed. Please try again.'
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. GET DONATION HISTORY FOR DONOR
app.get('/api/donors/:id/donations', async (req, res) => {
  try {
    const donations = await Donation.find({
      donorId: req.params.id,
      paymentStatus: 'success'
    })
      .populate('campaignId', 'title icon color')
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. GET RECEIPT DATA
app.get('/api/fundraiser/receipt/:donationId', async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.donationId)
      .populate('campaignId', 'title description category');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.paymentStatus !== 'success') {
      return res.status(400).json({ message: 'Receipt not available for incomplete payments' });
    }

    // Mark receipt as downloaded
    donation.receiptDownloaded = true;
    await donation.save();

    res.json({
      receiptNumber: donation.receiptNumber,
      donorName: donation.donorName,
      donorEmail: donation.donorEmail,
      campaignTitle: donation.campaignTitle,
      amount: donation.amount,
      currency: donation.currency,
      transactionRef: donation.transactionRef,
      paymentMethod: donation.paymentMethod,
      date: donation.createdAt,
      campaign: donation.campaignId
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. GET FUNDRAISER STATS
app.get('/api/fundraiser/stats', async (req, res) => {
  try {
    const totalCampaigns = await Campaign.countDocuments({ isActive: true });
    const totalDonors = await Donor.countDocuments();
    const totalDonations = await Donation.countDocuments({ paymentStatus: 'success' });

    const aggregation = await Donation.aggregate([
      { $match: { paymentStatus: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRaised = aggregation[0]?.total || 0;

    res.json({
      totalCampaigns,
      totalDonors,
      totalDonations,
      totalRaised
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. GET CAMPAIGN UPDATES
app.get('/api/fundraiser/campaigns/:id/updates', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).select('updates title');
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.json(campaign.updates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));