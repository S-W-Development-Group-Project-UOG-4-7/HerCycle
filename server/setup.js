// setup.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Added for password hashing

async function setupDatabase() {
  try {
    console.log('🚀 Starting MongoDB database setup...');
    
    // Check which models already exist
    const existingModels = mongoose.modelNames();
    console.log('📋 Existing models:', existingModels);
    
    // ========== CORE USER SCHEMAS ==========
    
    // Only create User model if it doesn't exist
    if (!existingModels.includes('User')) {
      console.log('👤 Creating User model...');
      const userSchema = new mongoose.Schema({
        NIC: {
          type: String,
          required: true,
          unique: true,
          trim: true
        },
        full_name: {
          type: String,
          required: true
        },
        username: {
          type: String,
          unique: true,
          sparse: true
        },
        email: {
          type: String,
          required: true,
          unique: true,
          lowercase: true,
          trim: true
        },
        password_hash: {
          type: String,
          required: true
        },
        gender: {
          type: String,
          enum: ['male', 'female', 'other', 'prefer-not-to-say']
        },
        date_of_birth: {
          type: Date
        },
        contact_number: {
          type: String
        },
        profile_picture: {
          type: String,
          default: ''
        },
        is_active: {
          type: Boolean,
          default: true
        },
        isExisting: {
          type: String,
          enum: ['active', 'pending', 'suspended', 'deleted'],
          default: 'pending'
        },
        role: {
          type: String,
          enum: ['user', 'doctor', 'web_manager', 'admin'],
          default: 'user'
        },
        created_at: {
          type: Date,
          default: Date.now
        },
        updated_at: {
          type: Date,
          default: Date.now
        }
      });
      
      mongoose.model('User', userSchema);
      console.log('✅ User model created');
    } else {
      console.log('ℹ️  User model already exists');
    }

    // Only create CommunityMember model if it doesn't exist
    if (!existingModels.includes('CommunityMember')) {
      console.log('👥 Creating CommunityMember model...');
      const communityMemberSchema = new mongoose.Schema({
        NIC: {
          type: String,
          required: true,
          unique: true,
          ref: 'User'
        },
        joined_at: {
          type: Date,
          default: Date.now
        },
        is_active: {
          type: Boolean,
          default: true
        },
        post_count: {
          type: Number,
          default: 0
        },
        comment_count: {
          type: Number,
          default: 0
        },
        warning_count: {
          type: Number,
          default: 0
        }
      });
      
      mongoose.model('CommunityMember', communityMemberSchema);
      console.log('✅ CommunityMember model created');
    } else {
      console.log('ℹ️  CommunityMember model already exists');
    }

    // Only create Doctor model if it doesn't exist
    if (!existingModels.includes('Doctor')) {
      console.log('👩‍⚕️ Creating Doctor model...');
      const doctorSchema = new mongoose.Schema({
        NIC: {
          type: String,
          required: true,
          unique: true,
          ref: 'User'
        },
        specialty: {
          type: String,
          required: true
        },
        qualifications: {
          type: [String],
          default: []
        },
        clinic_or_hospital: {
          type: String
        },
        bio: {
          type: String
        },
        is_approved: {
          type: Boolean,
          default: false
        },
        activated_at: {
          type: Date
        },
        consultation_hours: {
          type: String
        },
        experience_years: {
          type: Number,
          default: 0
        },
        verified: {
          type: Boolean,
          default: false
        }
      });
      
      mongoose.model('Doctor', doctorSchema);
      console.log('✅ Doctor model created');
    } else {
      console.log('ℹ️  Doctor model already exists');
    }

    // Only create WebManager model if it doesn't exist
    if (!existingModels.includes('WebManager')) {
      console.log('👨‍💼 Creating WebManager model...');
      const webManagerSchema = new mongoose.Schema({
        W_ID: {
          type: String,
          required: true,
          unique: true
        },
        NIC: {
          type: String,
          required: true,
          unique: true,
          ref: 'User'
        },
        registered_at: {
          type: Date,
          default: Date.now
        },
        is_active: {
          type: Boolean,
          default: true
        },
        permissions: {
          posts: { type: Boolean, default: true },
          comments: { type: Boolean, default: true },
          campaigns: { type: Boolean, default: true },
          reports: { type: Boolean, default: true },
          donations: { type: Boolean, default: true },
          landing_page: { type: Boolean, default: true },
          fundraising: { type: Boolean, default: true }
        },
        last_login: {
          type: Date
        }
      });
      
      mongoose.model('WebManager', webManagerSchema);
      console.log('✅ WebManager model created');
    } else {
      console.log('ℹ️  WebManager model already exists');
    }

    // Only create Admin model if it doesn't exist
    if (!existingModels.includes('Admin')) {
      console.log('👑 Creating Admin model...');
      const adminSchema = new mongoose.Schema({
        A_ID: {
          type: String,
          required: true,
          unique: true
        },
        NIC: {
          type: String,
          required: true,
          unique: true,
          ref: 'User'
        },
        super_admin_flag: {
          type: Boolean,
          default: false
        },
        created_at: {
          type: Date,
          default: Date.now
        },
        permissions: {
          user_management: { type: Boolean, default: true },
          content_moderation: { type: Boolean, default: true },
          system_settings: { type: Boolean, default: true },
          financial_reports: { type: Boolean, default: true }
        }
      });
      
      mongoose.model('Admin', adminSchema);
      console.log('✅ Admin model created');
    } else {
      console.log('ℹ️  Admin model already exists');
    }

    // ========== VERIFICATION & MODERATION ==========
    
    // Only create DoctorVerification model if it doesn't exist
    if (!existingModels.includes('DoctorVerification')) {
      console.log('📋 Creating DoctorVerification model...');
      const doctorVerificationSchema = new mongoose.Schema({
        verification_id: {
          type: String,
          required: true,
          unique: true
        },
        doctor_NIC: {
          type: String,
          required: true,
          ref: 'Doctor'
        },
        license_document_url: {
          type: String,
          required: true
        },
        registration_details: {
          type: String
        },
        terms_accepted: {
          type: Boolean,
          default: false
        },
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected', 'under_review'],
          default: 'pending'
        },
        submitted_at: {
          type: Date,
          default: Date.now
        },
        reviewed_at: {
          type: Date
        },
        reviewed_by: {
          type: String,
          ref: 'Admin'
        },
        rejection_reason: {
          type: String
        }
      });
      
      mongoose.model('DoctorVerification', doctorVerificationSchema);
      console.log('✅ DoctorVerification model created');
    } else {
      console.log('ℹ️  DoctorVerification model already exists');
    }

    // Only create Report model if it doesn't exist
    if (!existingModels.includes('Report')) {
      console.log('⚠️ Creating Report model...');
      const reportSchema = new mongoose.Schema({
        report_id: {
          type: String,
          required: true,
          unique: true
        },
        target_type: {
          type: String,
          enum: ['post', 'comment', 'user', 'doctor', 'campaign'],
          required: true
        },
        target_id: {
          type: String,
          required: true
        },
        reporter_nic: {
          type: String,
          required: true,
          ref: 'User'
        },
        reason: {
          type: String,
          required: true
        },
        description: {
          type: String
        },
        status: {
          type: String,
          enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
          default: 'pending'
        },
        priority: {
          type: String,
          enum: ['low', 'medium', 'high', 'critical'],
          default: 'medium'
        },
        reviewed_by: {
          type: String,
          ref: 'WebManager'
        },
        reviewed_at: {
          type: Date
        },
        action_taken: {
          type: String
        },
        created_at: {
          type: Date,
          default: Date.now
        }
      });
      
      mongoose.model('Report', reportSchema);
      console.log('✅ Report model created');
    } else {
      console.log('ℹ️  Report model already exists');
    }

    // Only create Warning model if it doesn't exist
    if (!existingModels.includes('Warning')) {
      console.log('🚨 Creating Warning model...');
      const warningSchema = new mongoose.Schema({
        warning_id: {
          type: String,
          required: true,
          unique: true
        },
        user_nic: {
          type: String,
          required: true,
          ref: 'User'
        },
        post_id: {
          type: String,
          ref: 'Post'
        },
        comment_id: {
          type: String,
          ref: 'Comment'
        },
        reason: {
          type: String,
          required: true
        },
        severity: {
          type: String,
          enum: ['low', 'medium', 'high'],
          default: 'medium'
        },
        given_by: {
          type: String,
          required: true,
          ref: 'Admin'
        },
        expires_at: {
          type: Date
        },
        is_active: {
          type: Boolean,
          default: true
        },
        given_at: {
          type: Date,
          default: Date.now
        },
        notes: {
          type: String
        }
      });
      
      mongoose.model('Warning', warningSchema);
      console.log('✅ Warning model created');
    } else {
      console.log('ℹ️  Warning model already exists');
    }

    // ========== CONTENT & COMMUNITY ==========
    
    // Only create Post model if it doesn't exist
    if (!existingModels.includes('Post')) {
      console.log('📝 Creating Post model...');
      const postSchema = new mongoose.Schema({
        post_id: {
          type: String,
          required: true,
          unique: true
        },
        author_nic: {
          type: String,
          required: true,
          ref: 'User'
        },
        author_type: {
          type: String,
          enum: ['user', 'doctor', 'web_manager'],
          default: 'user'
        },
        title: {
          type: String,
          required: true,
          maxlength: 200
        },
        content: {
          type: String,
          required: true
        },
        media_url: {
          type: String
        },
        media_type: {
          type: String,
          enum: ['image', 'video', 'document', 'none'],
          default: 'none'
        },
        category: {
          type: String,
          enum: ['general', 'health', 'education', 'experience', 'question', 'support'],
          default: 'general'
        },
        tags: {
          type: [String],
          default: []
        },
        approval_status: {
          type: String,
          enum: ['pending', 'approved', 'rejected', 'flagged'],
          default: 'pending'
        },
        is_anonymous: {
          type: Boolean,
          default: false
        },
        allow_comments: {
          type: Boolean,
          default: true
        },
        view_count: {
          type: Number,
          default: 0
        },
        like_count: {
          type: Number,
          default: 0
        },
        comment_count: {
          type: Number,
          default: 0
        },
        report_count: {
          type: Number,
          default: 0
        },
        created_at: {
          type: Date,
          default: Date.now
        },
        updated_at: {
          type: Date,
          default: Date.now
        },
        approved_at: {
          type: Date
        },
        approved_by: {
          type: String,
          ref: 'WebManager'
        },
        rejection_reason: {
          type: String
        }
      });
      
      mongoose.model('Post', postSchema);
      console.log('✅ Post model created');
    } else {
      console.log('ℹ️  Post model already exists');
    }

    // Only create Comment model if it doesn't exist
    if (!existingModels.includes('Comment')) {
      console.log('💬 Creating Comment model...');
      const commentSchema = new mongoose.Schema({
        comment_id: {
          type: String,
          required: true,
          unique: true
        },
        post_id: {
          type: String,
          required: true,
          ref: 'Post'
        },
        nic: {
          type: String,
          required: true,
          ref: 'User'
        },
        comment_text: {
          type: String,
          required: true
        },
        parent_comment_id: {
          type: String,
          ref: 'Comment'
        },
        is_anonymous: {
          type: Boolean,
          default: false
        },
        like_count: {
          type: Number,
          default: 0
        },
        report_count: {
          type: Number,
          default: 0
        },
        is_edited: {
          type: Boolean,
          default: false
        },
        edited_at: {
          type: Date
        },
        created_at: {
          type: Date,
          default: Date.now
        },
        updated_at: {
          type: Date,
          default: Date.now
        }
      });
      
      mongoose.model('Comment', commentSchema);
      console.log('✅ Comment model created');
    } else {
      console.log('ℹ️  Comment model already exists');
    }

    // Only create Like model if it doesn't exist
    if (!existingModels.includes('Like')) {
      console.log('❤️ Creating Like model...');
      const likeSchema = new mongoose.Schema({
        like_id: {
          type: String,
          required: true,
          unique: true
        },
        post_id: {
          type: String,
          ref: 'Post'
        },
        comment_id: {
          type: String,
          ref: 'Comment'
        },
        article_id: {
          type: String
        },
        nic: {
          type: String,
          required: true,
          ref: 'User'
        },
        like_type: {
          type: String,
          enum: ['post', 'comment', 'article', 'article_comment'],
          required: true
        },
        created_at: {
          type: Date,
          default: Date.now
        }
      });

      mongoose.model('Like', likeSchema);
      console.log('✅ Like model created');
    } else {
      console.log('ℹ️  Like model already exists');
    }

    // Only create ArticleComment model if it doesn't exist
    if (!existingModels.includes('ArticleComment')) {
      console.log('💬 Creating ArticleComment model...');
      const articleCommentSchema = new mongoose.Schema({
        article_id: {
          type: String,
          required: true
        },
        author_nic: {
          type: String,
          required: true,
          ref: 'User'
        },
        author_role: {
          type: String,
          enum: ['user', 'doctor', 'web_manager', 'admin'],
          default: 'user'
        },
        text: {
          type: String,
          required: true
        },
        parent_comment_id: {
          type: String,
          default: null
        },
        like_count: {
          type: Number,
          default: 0
        },
        is_deleted: {
          type: Boolean,
          default: false
        },
        created_at: {
          type: Date,
          default: Date.now
        },
        updated_at: {
          type: Date,
          default: Date.now
        }
      });

      mongoose.model('ArticleComment', articleCommentSchema);
      console.log('✅ ArticleComment model created');
    } else {
      console.log('ℹ️  ArticleComment model already exists');
    }

    // ========== CYCLE TRACKING ==========
    
    // Only create CycleProfile model if it doesn't exist
    if (!existingModels.includes('CycleProfile')) {
      console.log('📅 Creating CycleProfile model...');
      const cycleProfileSchema = new mongoose.Schema({
        NIC: {
          type: String,
          required: true,
          unique: true,
          ref: 'User'
        },
        activated_at: {
          type: Date,
          default: Date.now
        },
        is_active: {
          type: Boolean,
          default: true
        },
        is_anonymized: {
          type: Boolean,
          default: false
        },
        cycle_length: {
          type: Number,
          default: 28
        },
        period_length: {
          type: Number,
          default: 5
        },
        last_period_start: {
          type: Date
        },
        next_period_predicted: {
          type: Date
        },
        ovulation_predicted: {
          type: Date
        },
        tracking_preferences: {
          symptoms: { type: Boolean, default: true },
          mood: { type: Boolean, default: true },
          flow: { type: Boolean, default: true },
          pain: { type: Boolean, default: true },
          notes: { type: Boolean, default: true }
        },
        privacy_settings: {
          share_with_doctor: { type: Boolean, default: false },
          anonymize_data: { type: Boolean, default: true }
        }
      });
      
      mongoose.model('CycleProfile', cycleProfileSchema);
      console.log('✅ CycleProfile model created');
    } else {
      console.log('ℹ️  CycleProfile model already exists');
    }

    // Only create CycleTracker model if it doesn't exist
    if (!existingModels.includes('CycleTracker')) {
      console.log('📊 Creating CycleTracker model...');
      const cycleTrackerSchema = new mongoose.Schema({
        tracker_id: {
          type: String,
          required: true,
          unique: true
        },
        NIC: {
          type: String,
          required: true,
          ref: 'CycleProfile'
        },
        period_start_date: {
          type: Date,
          required: true
        },
        period_end_date: {
          type: Date,
          required: true
        },
        cycle_length_days: {
          type: Number
        },
        period_length_days: {
          type: Number
        },
        notes: {
          type: String
        },
        symptoms: {
          type: [String],
          default: []
        },
        mood: {
          type: String,
          enum: ['happy', 'sad', 'energetic', 'tired', 'anxious', 'calm', 'irritable']
        },
        flow_level: {
          type: String,
          enum: ['light', 'medium', 'heavy', 'spotting']
        },
        pain_level: {
          type: Number,
          min: 0,
          max: 10
        },
        created_at: {
          type: Date,
          default: Date.now
        },
        updated_at: {
          type: Date,
          default: Date.now
        }
      });
      
      mongoose.model('CycleTracker', cycleTrackerSchema);
      console.log('✅ CycleTracker model created');
    } else {
      console.log('ℹ️  CycleTracker model already exists');
    }

    // Only create DailyLog model if it doesn't exist
    if (!existingModels.includes('DailyLog')) {
      console.log('📖 Creating DailyLog model...');
      const dailyLogSchema = new mongoose.Schema({
        NIC: {
          type: String,
          required: true,
          ref: 'CycleProfile'
        },
        date: {
          type: Date,
          required: true
        },
        flow: {
          type: String,
          enum: ['none', 'light', 'medium', 'heavy', 'spotting']
        },
        mood: {
          type: String,
          enum: ['happy', 'sad', 'energetic', 'tired', 'anxious', 'calm', 'irritable', 'neutral']
        },
        notes: {
          type: String
        },
        pain_level: {
          type: Number,
          min: 0,
          max: 10
        },
        symptoms: {
          type: [String],
          default: []
        },
        medication_taken: {
          type: Boolean,
          default: false
        },
        medication_notes: {
          type: String
        },
        sexual_activity: {
          type: Boolean,
          default: false
        },
        contraception_used: {
          type: Boolean,
          default: false
        },
        sleep_hours: {
          type: Number,
          min: 0,
          max: 24
        },
        energy_level: {
          type: Number,
          min: 1,
          max: 10
        },
        created_at: {
          type: Date,
          default: Date.now
        },
        updated_at: {
          type: Date,
          default: Date.now
        },
        __v: {
          type: Number,
          default: 0
        }
      });
      
      mongoose.model('DailyLog', dailyLogSchema);
      console.log('✅ DailyLog model created');
    } else {
      console.log('ℹ️  DailyLog model already exists');
    }

    // ========== FUNDRAISING & DONATIONS ==========
    
    // Only create Campaign model if it doesn't exist
    if (!existingModels.includes('Campaign')) {
      console.log('🎯 Creating Campaign model...');
      const campaignSchema = new mongoose.Schema({
        campaign_id: {
          type: String,
          required: true,
          unique: true
        },
        title: {
          type: String,
          required: true
        },
        description: {
          type: String,
          required: true
        },
        detailed_description: {
          type: String
        },
        status: {
          type: String,
          enum: ['draft', 'pending', 'active', 'completed', 'cancelled'],
          default: 'draft'
        },
        created_by_nic: {
          type: String,
          required: true,
          ref: 'User'
        },
        approved_by_nic: {
          type: String,
          ref: 'Admin'
        },
        approved_at: {
          type: Date
        },
        start_date: {
          type: Date
        },
        end_date: {
          type: Date
        },
        goal_amount: {
          type: Number,
          required: true
        },
        current_amount: {
          type: Number,
          default: 0
        },
        donor_count: {
          type: Number,
          default: 0
        },
        category: {
          type: String,
          enum: ['education', 'healthcare', 'awareness', 'sustainability', 'emergency', 'research']
        },
        featured_image: {
          type: String
        },
        gallery_images: {
          type: [String],
          default: []
        },
        updates: [{
          title: String,
          content: String,
          date: { type: Date, default: Date.now },
          media_url: String
        }],
        tags: {
          type: [String],
          default: []
        },
        created_at: {
          type: Date,
          default: Date.now
        },
        updated_at: {
          type: Date,
          default: Date.now
        }
      });
      
      mongoose.model('Campaign', campaignSchema);
      console.log('✅ Campaign model created');
    } else {
      console.log('ℹ️  Campaign model already exists');
    }

    // Only create CampaignDonation model if it doesn't exist
    if (!existingModels.includes('CampaignDonation')) {
      console.log('💰 Creating CampaignDonation model...');
      const campaignDonationSchema = new mongoose.Schema({
        donation_id: {
          type: String,
          required: true,
          unique: true
        },
        campaign_id: {
          type: String,
          required: true,
          ref: 'Campaign'
        },
        donor_name: {
          type: String,
          required: true
        },
        phone_number: {
          type: String
        },
        email: {
          type: String,
          lowercase: true,
          trim: true
        },
        address: {
          type: String
        },
        amount: {
          type: Number,
          required: true
        },
        payment_intent_id: {
          type: String,
          ref: 'Donation' // Reference to payment donation
        },
        is_anonymous: {
          type: Boolean,
          default: false
        },
        message: {
          type: String
        },
        receipt_sent: {
          type: Boolean,
          default: false
        },
        tax_certificate_eligible: {
          type: Boolean,
          default: true
        },
        donated_at: {
          type: Date,
          default: Date.now
        }
      });
      
      mongoose.model('CampaignDonation', campaignDonationSchema);
      console.log('✅ CampaignDonation model created');
    } else {
      console.log('ℹ️  CampaignDonation model already exists');
    }

    // ========== RULE BASED AI ==========
    
    // Only create RuleBasedAI model if it doesn't exist
    if (!existingModels.includes('RuleBasedAI')) {
      console.log('🤖 Creating RuleBasedAI model...');
      const ruleBasedAiSchema = new mongoose.Schema({
        ai_id: {
          type: String,
          required: true,
          unique: true
        },
        description: {
          type: String,
          required: true
        },
        rules: [{
          rule_id: String,
          pattern: String,
          action: String,
          severity: String,
          enabled: { type: Boolean, default: true }
        }],
        scan_count: {
          type: Number,
          default: 0
        },
        flag_count: {
          type: Number,
          default: 0
        },
        last_scan: {
          type: Date
        },
        created_at: {
          type: Date,
          default: Date.now
        },
        updated_at: {
          type: Date,
          default: Date.now
        }
      });
      
      mongoose.model('RuleBasedAI', ruleBasedAiSchema);
      console.log('✅ RuleBasedAI model created');
    } else {
      console.log('ℹ️  RuleBasedAI model already exists');
    }

    console.log('✅ All MongoDB models checked/created successfully!');
    
    // ========== CREATE INDEXES ==========
    
    console.log('📊 Creating indexes for better performance...');
    
    // Get references to the models
    const User = mongoose.model('User');
    const Post = mongoose.model('Post');
    const Comment = mongoose.model('Comment');
    const Campaign = mongoose.model('Campaign');
    const CycleProfile = mongoose.model('CycleProfile');
    const CycleTracker = mongoose.model('CycleTracker');
    const DailyLog = mongoose.model('DailyLog');
    const Report = mongoose.model('Report');
    const DoctorVerification = mongoose.model('DoctorVerification');
    
    try {
      // User indexes
      await User.collection.createIndex({ NIC: 1 }, { unique: true });
      await User.collection.createIndex({ email: 1 }, { unique: true });
      await User.collection.createIndex({ username: 1 }, { unique: true, sparse: true });
      await User.collection.createIndex({ isExisting: 1 });
      await User.collection.createIndex({ created_at: -1 });
      console.log('✅ User indexes created');
    } catch (indexError) {
      console.log('⚠️  User indexes already exist or error:', indexError.message);
    }
    
    try {
      // Post indexes
      await Post.collection.createIndex({ post_id: 1 }, { unique: true });
      await Post.collection.createIndex({ author_nic: 1 });
      await Post.collection.createIndex({ approval_status: 1 });
      await Post.collection.createIndex({ created_at: -1 });
      await Post.collection.createIndex({ category: 1 });
      await Post.collection.createIndex({ tags: 1 });
      console.log('✅ Post indexes created');
    } catch (indexError) {
      console.log('⚠️  Post indexes already exist or error:', indexError.message);
    }
    
    try {
      // Comment indexes
      await Comment.collection.createIndex({ comment_id: 1 }, { unique: true });
      await Comment.collection.createIndex({ post_id: 1 });
      await Comment.collection.createIndex({ nic: 1 });
      await Comment.collection.createIndex({ created_at: -1 });
      console.log('✅ Comment indexes created');
    } catch (indexError) {
      console.log('⚠️  Comment indexes already exist or error:', indexError.message);
    }
    
    try {
      // Campaign indexes
      await Campaign.collection.createIndex({ campaign_id: 1 }, { unique: true });
      await Campaign.collection.createIndex({ status: 1 });
      await Campaign.collection.createIndex({ created_by_nic: 1 });
      await Campaign.collection.createIndex({ created_at: -1 });
      await Campaign.collection.createIndex({ category: 1 });
      console.log('✅ Campaign indexes created');
    } catch (indexError) {
      console.log('⚠️  Campaign indexes already exist or error:', indexError.message);
    }
    
    try {
      // Cycle tracking indexes
      await CycleProfile.collection.createIndex({ NIC: 1 }, { unique: true });
      await CycleTracker.collection.createIndex({ tracker_id: 1 }, { unique: true });
      await CycleTracker.collection.createIndex({ NIC: 1 });
      await CycleTracker.collection.createIndex({ period_start_date: -1 });
      await DailyLog.collection.createIndex({ NIC: 1, date: 1 }, { unique: true });
      console.log('✅ Cycle tracking indexes created');
    } catch (indexError) {
      console.log('⚠️  Cycle tracking indexes already exist or error:', indexError.message);
    }
    
    try {
      // Report indexes
      await Report.collection.createIndex({ report_id: 1 }, { unique: true });
      await Report.collection.createIndex({ target_type: 1, target_id: 1 });
      await Report.collection.createIndex({ reporter_nic: 1 });
      await Report.collection.createIndex({ status: 1 });
      await Report.collection.createIndex({ created_at: -1 });
      console.log('✅ Report indexes created');
    } catch (indexError) {
      console.log('⚠️  Report indexes already exist or error:', indexError.message);
    }
    
    try {
      // Doctor verification indexes
      await DoctorVerification.collection.createIndex({ verification_id: 1 }, { unique: true });
      await DoctorVerification.collection.createIndex({ doctor_NIC: 1 });
      await DoctorVerification.collection.createIndex({ status: 1 });
      console.log('✅ Doctor verification indexes created');
    } catch (indexError) {
      console.log('⚠️  Doctor verification indexes already exist or error:', indexError.message);
    }
    
    console.log('✅ All indexes checked/created successfully!');
    
    // ========== CREATE DEFAULT ADMIN USER ==========
    
    console.log('👑 Creating default admin user...');
    
    try {
      const User = mongoose.model('User');
      const Admin = mongoose.model('Admin');
      
      // Hash password properly
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash('admin123', salt);
      
      // Check if admin user exists - fixed query
      let adminUser = await User.findOne({ 
        $or: [
          { email: 'admin@hercycle.com' },
          { NIC: 'ADMIN123456789' }
        ] 
      });
      
      if (!adminUser) {
        // Create admin user
        adminUser = new User({
          NIC: 'ADMIN123456789',
          full_name: 'System Administrator',
          username: 'admin',
          email: 'admin@hercycle.com',
          password_hash: password_hash,
          gender: 'prefer-not-to-say',
          role: 'admin',
          isExisting: 'active',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        });
        
        await adminUser.save();
        console.log('✅ Admin user created successfully');
      } else {
        // Update existing admin user with proper password hash
        adminUser.password_hash = password_hash;
        adminUser.role = 'admin';
        adminUser.isExisting = 'active';
        adminUser.full_name = adminUser.full_name || 'System Administrator';
        adminUser.NIC = adminUser.NIC || 'ADMIN123456789';
        await adminUser.save();
        console.log('✅ Existing admin user updated with proper password hash');
      }
      
      // Check if admin record exists
      const adminExists = await Admin.findOne({ A_ID: 'ADMIN001' });
      if (!adminExists) {
        // Create admin record
        const adminRecord = new Admin({
          A_ID: 'ADMIN001',
          NIC: 'ADMIN123456789', // Match the User NIC
          super_admin_flag: true,
          permissions: {
            user_management: true,
            content_moderation: true,
            system_settings: true,
            financial_reports: true
          },
          created_at: new Date()
        });
        
        await adminRecord.save();
        console.log('✅ Admin record created successfully');
      } else {
        console.log('ℹ️  Admin record already exists');
      }
      
      console.log('✅ Default admin user created/updated:');
      console.log('   Email: admin@hercycle.com');
      console.log('   Password: admin123');
      console.log('   NIC: ADMIN123456789');
      
    } catch (adminError) {
      console.log('⚠️  Could not create/update admin user:', adminError.message);
      console.error('Admin creation error details:', adminError);
    }
    
    // ========== CREATE TEST USER ==========
    
    console.log('👤 Creating test user...');
    
    try {
      const User = mongoose.model('User');
      const CommunityMember = mongoose.model('CommunityMember');
      
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash('test123', salt);
      
      let testUser = await User.findOne({ 
        $or: [
          { email: 'test@test.com' },
          { NIC: 'TEST123456789' }
        ] 
      });
      
      if (!testUser) {
        testUser = new User({
          NIC: 'TEST123456789',
          full_name: 'Test User',
          email: 'test@test.com',
          password_hash: password_hash,
          gender: 'female',
          role: 'user',
          isExisting: 'active',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        });
        
        await testUser.save();
        
        // Create community member record
        const communityMember = new CommunityMember({
          NIC: 'TEST123456789',
          joined_at: new Date(),
          is_active: true
        });
        
        await communityMember.save();
        
        console.log('✅ Test user created successfully: test@test.com / test123');
      } else {
        console.log('ℹ️  Test user already exists');
      }
      
    } catch (testError) {
      console.log('⚠️  Could not create test user:', testError.message);
    }
    
    // ========== CREATE DEFAULT RULE BASED AI ==========
    
    console.log('🤖 Creating default Rule-Based AI configuration...');
    
    try {
      const RuleBasedAI = mongoose.model('RuleBasedAI');
      const aiExists = await RuleBasedAI.findOne();
      if (!aiExists) {
        const defaultAI = new RuleBasedAI({
          ai_id: 'RB_AI_001',
          description: 'Rule-based AI for scanning posts and comments for inappropriate content',
          rules: [
            {
              rule_id: 'RULE_001',
              pattern: 'hate speech|racist|sexist|discriminatory',
              action: 'flag_for_review',
              severity: 'high',
              enabled: true
            },
            {
              rule_id: 'RULE_002',
              pattern: 'spam|advertisement|promotion',
              action: 'auto_moderate',
              severity: 'medium',
              enabled: true
            }, 
            {
              rule_id: 'RULE_003',
              pattern: 'medical advice without verification',
              action: 'flag_for_review',
              severity: 'high',
              enabled: true
            },
            {
              rule_id: 'RULE_004',
              pattern: 'personal contact information',
              action: 'auto_remove',
              severity: 'medium',
              enabled: true
            }
          ]
        });
        
        await defaultAI.save();
        console.log('✅ Default Rule-Based AI configuration created');
      } else {
        console.log('ℹ️  Rule-Based AI configuration already exists');
      }
    } catch (aiError) {
      console.log('⚠️  Could not create AI configuration:', aiError.message);
    }
    
    console.log('='.repeat(60));
    console.log('🎉 DATABASE SETUP COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📊 Collections Created/Checked:');
    console.log('   ✅ Users');
    console.log('   ✅ CommunityMembers');
    console.log('   ✅ Doctors');
    console.log('   ✅ WebManagers');
    console.log('   ✅ Admins');
    console.log('   ✅ DoctorVerifications');
    console.log('   ✅ Reports');
    console.log('   ✅ Warnings');
    console.log('   ✅ Posts');
    console.log('   ✅ Comments');
    console.log('   ✅ Likes');
    console.log('   ✅ CycleProfiles');
    console.log('   ✅ CycleTrackers');
    console.log('   ✅ DailyLogs');
    console.log('   ✅ Campaigns');
    console.log('   ✅ CampaignDonations');
    console.log('   ✅ RuleBasedAI');
    console.log('\n🔑 Default Admin Credentials:');
    console.log('   Email: admin@hercycle.com');
    console.log('   Password: admin123');
    console.log('   Role: Admin');
    console.log('\n👤 Test User Credentials:');
    console.log('   Email: test@test.com');
    console.log('   Password: test123');
    console.log('   Role: User');
    console.log('\n💡 Check MongoDB Compass to see all collections created.');
    console.log('='.repeat(60));
    
    return {
      success: true,
      message: 'Database setup completed successfully!',
      collections: [
        'User', 'CommunityMember', 'Doctor', 'WebManager', 'Admin',
        'DoctorVerification', 'Report', 'Warning', 'Post', 'Comment', 'Like',
        'CycleProfile', 'CycleTracker', 'DailyLog', 'Campaign', 'CampaignDonation',
        'RuleBasedAI'
      ]
    };
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return {
      success: false,
      message: `Database setup failed: ${error.message}`,
      error: error
    };
  }
}

module.exports = { setupDatabase };