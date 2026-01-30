// ========== ADMIN DASHBOARD - WEB MANAGER MANAGEMENT ==========
// CREATE WEB MANAGER
app.post('/api/admin/create-web-manager', authenticateToken, checkDatabaseReady, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const { NIC, full_name, email, password, permissions } = req.body;

        if (!NIC || !full_name || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields required' });
        }

        const User = getModel('User');
        const WebManager = getModel('WebManager');

        const existingUser = await User.findOne({ $or: [{ email }, { NIC }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const user = new User({
            NIC, full_name, email: email.toLowerCase(), password_hash,
            role: 'web_manager', isExisting: 'active', is_active: true
        });
        await user.save();

        const webManager = new WebManager({
            W_ID: `WM_${Date.now()}_${NIC}`, NIC, is_active: true,
            permissions: permissions || { posts: true, comments: true, campaigns: true, reports: true, donations: true, landing_page: true, fundraising: true }
        });
        await webManager.save();

        console.log(`✅ Web Manager created: ${email}`);
        res.status(201).json({ success: true, message: 'Web Manager created', data: { user, webManager } });
    } catch (error) {
        console.error('❌ Create web manager error:', error);
        res.status(500).json({ success: false, message: 'Failed to create web manager', error: error.message });
    }
});

// GET ALL WEB MANAGERS
app.get('/api/admin/web-managers', authenticateToken, checkDatabaseReady, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const WebManager = getModel('WebManager');
        const webManagers = await WebManager.aggregate([
            { $lookup: { from: 'users', localField: 'NIC', foreignField: 'NIC', as: 'user_info' } },
            { $unwind: { path: '$user_info', preserveNullAndEmptyArrays: true } },
            { $project: { W_ID: 1, NIC: 1, registered_at: 1, is_active: 1, permissions: 1, 'user_info.full_name': 1, 'user_info.email': 1 } },
            { $sort: { registered_at: -1 } }
        ]);

        res.json({ success: true, count: webManagers.length, data: webManagers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch web managers', error: error.message });
    }
});

// UPDATE WEB MANAGER
app.put('/api/admin/web-managers/:nic', authenticateToken, checkDatabaseReady, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
        const { permissions, is_active } = req.body;
        const WebManager = getModel('WebManager');
        const updateData = {};
        if (permissions) updateData.permissions = permissions;
        if (typeof is_active !== 'undefined') updateData.is_active = is_active;
        const webManager = await WebManager.findOneAndUpdate({ NIC: req.params.nic }, { $set: updateData }, { new: true });
        if (!webManager) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data: webManager });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Update failed', error: error.message });
    }
});

// UPDATE ADMIN PROFILE
app.put('/api/admin/profile', authenticateToken, checkDatabaseReady, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
        const { full_name, password, current_password, profile_picture } = req.body;
        const User = getModel('User');
        const user = await User.findOne({ NIC: req.user.NIC });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (full_name) user.full_name = full_name;
        if (profile_picture) user.profile_picture = profile_picture;
        if (password) {
            if (!current_password) return res.status(400).json({ success: false, message: 'Current password required' });
            const isValid = await bcrypt.compare(current_password, user.password_hash);
            if (!isValid) return res.status(401).json({ success: false, message: 'Incorrect password' });
            user.password_hash = await bcrypt.hash(password, await bcrypt.genSalt(10));
        }
        user.updated_at = new Date();
        await user.save();
        res.json({ success: true, message: 'Profile updated', data: { NIC: user.NIC, full_name: user.full_name, email: user.email, profile_picture: user.profile_picture } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Update failed', error: error.message });
    }
});

// USER ANALYTICS
app.get('/api/admin/analytics/users', authenticateToken, checkDatabaseReady, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
        const User = getModel('User');
        const CycleProfile = getModel('CycleProfile');
        const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const [totalUsers, usersByRole, activeUsers, cycleUsers, userGrowth] = await Promise.all([
            User.countDocuments({}),
            User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
            User.countDocuments({ isExisting: 'active' }),
            CycleProfile ? CycleProfile.countDocuments({ is_active: true }) : 0,
            User.aggregate([{ $match: { created_at: { $gte: thirtyDaysAgo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }])
        ]);
        res.json({ success: true, data: { total_users: totalUsers, active_users: activeUsers, cycle_users: cycleUsers, users_by_role: usersByRole, user_growth: userGrowth } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Analytics failed', error: error.message });
    }
});

// DONATION ANALYTICS
app.get('/api/admin/analytics/donations', authenticateToken, checkDatabaseReady, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
        const CampaignDonation = getModel('CampaignDonation');
        if (!CampaignDonation) return res.json({ success: true, data: { total_donations: 0, total_amount: 0, donations_by_campaign: [], donation_trends: [] } });
        const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const [totalStats, donationsByCampaign, donationTrends] = await Promise.all([
            CampaignDonation.aggregate([{ $group: { _id: null, total_amount: { $sum: '$amount' }, total_count: { $sum: 1 } } }]),
            CampaignDonation.aggregate([{ $group: { _id: '$campaign_id', total_amount: { $sum: '$amount' }, donor_count: { $sum: 1 } } }, { $lookup: { from: 'campaigns', localField: '_id', foreignField: 'campaign_id', as: 'campaign_info' } }, { $unwind: { path: '$campaign_info', preserveNullAndEmptyArrays: true } }, { $project: { campaign_id: '$_id', campaign_title: '$campaign_info.title', total_amount: 1, donor_count: 1 } }, { $sort: { total_amount: -1 } }]),
            CampaignDonation.aggregate([{ $match: { donated_at: { $gte: thirtyDaysAgo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$donated_at' } }, amount: { $sum: '$amount' }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }])
        ]);
        res.json({ success: true, data: { total_amount: totalStats[0]?.total_amount || 0, total_donations: totalStats[0]?.total_count || 0, donations_by_campaign: donationsByCampaign, donation_trends: donationTrends } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Analytics failed', error: error.message });
    }
});

// POSTS/COMMENTS ANALYTICS
app.get('/api/admin/analytics/posts', authenticateToken, checkDatabaseReady, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
        const Post = getModel('Post');
        const Comment = getModel('Comment');
        const Report = getModel('Report');
        if (!Post || !Comment) return res.json({ success: true, data: { total_posts: 0, total_comments: 0, posts_by_status: [] } });
        const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const [totalPosts, totalComments, postsByStatus, totalReports, contentTrends] = await Promise.all([
            Post.countDocuments({}),
            Comment.countDocuments({}),
            Post.aggregate([{ $group: { _id: '$approval_status', count: { $sum: 1 } } }]),
            Report ? Report.countDocuments({ target_type: { $in: ['post', 'comment'] } }) : 0,
            Post.aggregate([{ $match: { created_at: { $gte: thirtyDaysAgo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } }, posts: { $sum: 1 } } }, { $sort: { _id: 1 } }])
        ]);
        res.json({ success: true, data: { total_posts: totalPosts, total_comments: totalComments, total_reports: totalReports, posts_by_status: postsByStatus, content_trends: contentTrends } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Analytics failed', error: error.message });
    }
});

// WARNING HISTORY
app.get('/api/admin/warnings', authenticateToken, checkDatabaseReady, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
        const Warning = getModel('Warning');
        if (!Warning) return res.json({ success: true, data: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } });
        const { severity, user_nic, is_active, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (severity) filter.severity = severity;
        if (user_nic) filter.user_nic = user_nic;
        if (typeof is_active !== 'undefined') filter.is_active = is_active === 'true';
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const warnings = await Warning.aggregate([
            { $match: filter },
            { $lookup: { from: 'users', localField: 'user_nic', foreignField: 'NIC', as: 'user_info' } },
            { $unwind: { path: '$user_info', preserveNullAndEmptyArrays: true } },
            { $project: { warning_id: 1, user_nic: 1, reason: 1, severity: 1, given_by: 1, given_at: 1, expires_at: 1, is_active: 1, 'user_info.full_name': 1, 'user_info.email': 1 } },
            { $sort: { given_at: -1 } }, { $skip: skip }, { $limit: parseInt(limit) }
        ]);
        const total = await Warning.countDocuments(filter);
        res.json({ success: true, data: warnings, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Fetch failed', error: error.message });
    }
});

// GET USERS BY ROLE
app.get('/api/admin/roles', authenticateToken, checkDatabaseReady, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
        const User = getModel('User');
        const CycleProfile = getModel('CycleProfile');
        const { role, search, page = 1, limit = 50 } = req.query;
        const filter = {};
        if (role) filter.role = role;
        if (search) filter.$or = [{ full_name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }, { NIC: { $regex: search, $options: 'i' } }];
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const users = await User.find(filter).select('NIC full_name email role isExisting gender created_at profile_picture').sort({ created_at: -1 }).skip(skip).limit(parseInt(limit));
        const usersWithCycle = await Promise.all(users.map(async (user) => {
            const cycleProfile = CycleProfile ? await CycleProfile.findOne({ NIC: user.NIC }) : null;
            return { ...user.toObject(), is_cycle_user: !!cycleProfile };
        }));
        const total = await User.countDocuments(filter);
        res.json({ success: true, data: usersWithCycle, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Fetch failed', error: error.message });
    }
});

// UPDATE USER ROLE
app.put('/api/admin/roles/:nic', authenticateToken, checkDatabaseReady, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
        const { role, isExisting } = req.body;
        const User = getModel('User');
        const updateData = { updated_at: new Date() };
        if (role) updateData.role = role;
        if (isExisting) updateData.isExisting = isExisting;
        const user = await User.findOneAndUpdate({ NIC: req.params.nic }, { $set: updateData }, { new: true });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        console.log(`✅ Role updated: ${req.params.nic} -> ${role}`);
        res.json({ success: true, message: 'Role updated', data: { NIC: user.NIC, full_name: user.full_name, email: user.email, role: user.role, isExisting: user.isExisting } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Update failed', error: error.message });
    }
});

// SUSPEND USER
app.post('/api/admin/suspend-user', authenticateToken, checkDatabaseReady, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
        const { user_nic, duration } = req.body;

        const User = getModel('User');
        const user = await User.findOne({ NIC: user_nic });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Calculate suspension end date
        const suspendUntil = new Date();
        switch (duration) {
            case '1week': suspendUntil.setDate(suspendUntil.getDate() + 7); break;
            case '3weeks': suspendUntil.setDate(suspendUntil.getDate() + 21); break;
            case '1month': suspendUntil.setMonth(suspendUntil.getMonth() + 1); break;
            case '3months': suspendUntil.setMonth(suspendUntil.getMonth() + 3); break;
            default: return res.status(400).json({ success: false, message: 'Invalid duration' });
        }

        user.isExisting = 'suspended';
        user.suspend_until = suspendUntil;
        user.updated_at = new Date();
        await user.save();

        console.log(`✅ User suspended: ${user_nic} until ${suspendUntil}`);
        res.json({ success: true, message: 'User suspended', data: { NIC: user.NIC, suspend_until: suspendUntil } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Suspension failed', error: error.message });
    }
});

// DELETE USER ACCOUNT
app.delete('/api/admin/users/:nic', authenticateToken, checkDatabaseReady, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const User = getModel('User');
        const user = await User.findOne({ NIC: req.params.nic });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (user.NIC === req.user.NIC) {
            return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
        }

        await User.deleteOne({ NIC: req.params.nic });

        console.log(`✅ User deleted by admin: ${req.params.nic}`);
        res.json({
            success: true,
            message: 'User deleted successfully',
            data: { NIC: req.params.nic, full_name: user.full_name, email: user.email }
        });
    } catch (error) {
        console.error('❌ Delete user error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
    }
});

// ADMIN-INITIATED PASSWORD RESET
app.post('/api/admin/reset-password/:nic', authenticateToken, checkDatabaseReady, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const User = getModel('User');
        const user = await User.findOne({ NIC: req.params.nic });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Generate secure random password (12 characters)
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
        let temporaryPassword = '';

        // Ensure at least one of each type
        temporaryPassword += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
        temporaryPassword += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
        temporaryPassword += '0123456789'[Math.floor(Math.random() * 10)]; // Number
        temporaryPassword += '!@#$%^&*()_+-='[Math.floor(Math.random() * 15)]; // Special char

        // Fill remaining 8 characters randomly
        for (let i = 0; i < 8; i++) {
            temporaryPassword += chars[Math.floor(Math.random() * chars.length)];
        }

        // Shuffle the password
        temporaryPassword = temporaryPassword.split('').sort(() => Math.random() - 0.5).join('');

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(temporaryPassword, salt);

        // Update user password
        user.password_hash = password_hash;
        user.updated_at = new Date();
        await user.save();

        console.log(`✅ Password reset by admin for user: ${req.params.nic}`);
        res.json({
            success: true,
            message: 'Password reset successfully',
            temporary_password: temporaryPassword,
            data: { NIC: user.NIC, full_name: user.full_name, email: user.email }
        });
    } catch (error) {
        console.error('❌ Password reset error:', error);
        res.status(500).json({ success: false, message: 'Failed to reset password', error: error.message });
    }
});

// CHECK WEB MANAGER STATUS
app.get('/api/admin/check-web-manager-status/:nic', authenticateToken, checkDatabaseReady, async (req, res) => {
    try {
        const WebManager = getModel('WebManager');
        const webManager = await WebManager.findOne({ NIC: req.params.nic });

        if (!webManager) {
            return res.json({ success: true, is_active: false, message: 'Web manager not found' });
        }

        res.json({ success: true, is_active: webManager.is_active, NIC: webManager.NIC });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Status check failed', error: error.message });
    }
});

// ========== DOCTOR MANAGEMENT ==========
// GET ALL DOCTORS
app.get('/api/admin/doctors', authenticateToken, checkDatabaseReady, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const Doctor = getModel('Doctor');
        const User = getModel('User');
        const { status, page = 1, limit = 50 } = req.query;

        // Build filter
        const filter = {};
        if (status === 'approved') {
            filter.is_approved = true;
        } else if (status === 'pending') {
            filter.is_approved = false;
        }
        // 'all' or no status - no filter

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get doctors with user info
        const doctors = await Doctor.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: 'users',
                    localField: 'NIC',
                    foreignField: 'NIC',
                    as: 'user_info'
                }
            },
            { $unwind: { path: '$user_info', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    NIC: 1,
                    specialty: 1,
                    qualifications: 1,
                    clinic_or_hospital: 1,
                    bio: 1,
                    is_approved: 1,
                    is_active: 1,
                    activated_at: 1,
                    experience_years: 1,
                    verified: 1,
                    'user_info.full_name': 1,
                    'user_info.email': 1,
                    'user_info.contact_number': 1,
                    'user_info.gender': 1,
                    'user_info.profile_picture': 1
                }
            },
            { $sort: { activated_at: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) }
        ]);

        const total = await Doctor.countDocuments(filter);

        res.json({
            success: true,
            count: doctors.length,
            total,
            data: doctors,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('❌ Get doctors error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch doctors', error: error.message });
    }
});

// UPDATE DOCTOR STATUS
app.put('/api/admin/doctors/:nic', authenticateToken, checkDatabaseReady, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const { is_active } = req.body;
        const Doctor = getModel('Doctor');

        if (typeof is_active === 'undefined') {
            return res.status(400).json({ success: false, message: 'is_active field is required' });
        }

        const doctor = await Doctor.findOneAndUpdate(
            { NIC: req.params.nic },
            { $set: { is_active } },
            { new: true }
        );

        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        console.log(`✅ Doctor status updated: ${req.params.nic} - is_active: ${is_active}`);
        res.json({ success: true, message: 'Doctor status updated successfully', data: doctor });
    } catch (error) {
        console.error('❌ Update doctor status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update doctor status', error: error.message });
    }
});

