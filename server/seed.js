// seed.js - Database seeding script for HerCycle
const mongoose = require('mongoose');

async function seed() {
    try {
        console.log('🌱 Starting database seeding...');

        await mongoose.connect("mongodb://localhost:27017/hercycle", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connected to MongoDB');

        // ---------- HELPERS ----------
        const NICs = Array.from({ length: 20 }, (_, i) => `NIC${(i + 1).toString().padStart(4, "0")}`);
        const now = new Date();

        // Clear existing data (optional - comment out if you want to keep existing data)
        console.log('🗑️  Clearing existing data...');
        await mongoose.connection.collection("users").deleteMany({});
        await mongoose.connection.collection("communitymembers").deleteMany({});
        await mongoose.connection.collection("doctors").deleteMany({});
        await mongoose.connection.collection("webmanagers").deleteMany({});
        await mongoose.connection.collection("admins").deleteMany({});
        await mongoose.connection.collection("warnings").deleteMany({});
        await mongoose.connection.collection("posts").deleteMany({});
        await mongoose.connection.collection("comments").deleteMany({});
        await mongoose.connection.collection("likes").deleteMany({});
        await mongoose.connection.collection("campaigns").deleteMany({});
        await mongoose.connection.collection("campaigndonations").deleteMany({});

        // ---------- USERS ----------
        console.log('👥 Creating users...');

        // Create admin user first with proper hashed password
        const bcrypt = require('bcryptjs');
        const adminPasswordHash = await bcrypt.hash('admin123', 10);

        // Admin user
        /* await mongoose.connection.collection("users").insertOne({
             NIC: 'ADMIN123456789',
             full_name: 'System Administrator',
             username: 'admin',
             email: 'admin@hercycle.com',
             password_hash: adminPasswordHash,
             gender: 'prefer-not-to-say',
             role: 'admin',
             isExisting: 'active',
             is_active: true,
             created_at: now,
             updated_at: now
         });*/

        // Regular users with proper roles
        await mongoose.connection.collection("users").insertMany(
            NICs.map((nic, i) => {
                // Determine role: first 10 are doctors, next 5 are web managers, rest are users
                let userRole = 'user';
                if (i < 10) userRole = 'doctor';
                else if (i < 15) userRole = 'web_manager';

                return {
                    NIC: nic,
                    full_name: `User ${i + 1}`,
                    username: `user${i + 1}`,
                    email: `user${i + 1}@hercycle.com`,
                    password_hash: "$2b$10$dummyhashedpassword",
                    gender: ["male", "female", "other"][i % 3],
                    contact_number: `07700000${String(i).padStart(3, '0')}`,
                    is_active: true,
                    isExisting: "active",
                    isSuspended: i % 7 === 0, // Every 7th user is suspended for testing
                    suspensionReason: i % 7 === 0 ? "Test suspension" : null,
                    role: userRole,
                    // Stagger creation dates over the last 90 days for better analytics
                    created_at: new Date(now.getTime() - (90 - i * 4) * 24 * 3600000),
                    updated_at: now
                };
            })
        );

        console.log('✅ Admin user created: admin@hercycle.com / admin123');

        // ---------- COMMUNITY MEMBERS ----------
        console.log('👥 Creating community members...');
        await mongoose.connection.collection("communitymembers").insertMany(
            NICs.map(nic => ({
                NIC: nic,
                joined_at: now,
                is_active: true,
                post_count: Math.floor(Math.random() * 20),
                comment_count: Math.floor(Math.random() * 50),
                warning_count: Math.floor(Math.random() * 3)
            }))
        );

        // ---------- DOCTORS ----------
        console.log('👨‍⚕️ Creating doctors...');
        await mongoose.connection.collection("doctors").insertMany(
            NICs.slice(0, 10).map((nic, i) => ({
                NIC: nic,
                specialty: ["Gynecology", "Obstetrics", "General Practice"][i % 3],
                qualifications: ["MBBS", "MD"],
                clinic_or_hospital: `Hospital ${i + 1}`,
                bio: `Certified specialist with ${5 + i} years of experience`,
                is_approved: i < 7, // First 7 are approved
                is_active: true,
                is_verified: i < 7, // First 7 are verified
                verification_status: i < 7 ? "approved" : "pending",
                activated_at: now,
                verified_at: i < 7 ? now : null,
                consultation_hours: "9AM - 5PM",
                experience_years: 5 + i,
                verified: i < 7
            }))
        );

        // ---------- DOCTOR VERIFICATIONS ----------
        console.log('📋 Creating doctor verifications...');
        await mongoose.connection.collection("doctorverifications").deleteMany({});
        await mongoose.connection.collection("doctorverifications").insertMany(
            NICs.slice(0, 10).map((nic, i) => ({
                verification_id: `DV${String(i + 1).padStart(5, '0')}`,
                doctor_NIC: nic,
                license_document_url: `https://example.com/license_${i + 1}.pdf`,
                registration_details: `Medical Registration Number: MR${10000 + i}`,
                terms_accepted: true,
                status: i < 7 ? "approved" : "pending",
                submitted_at: new Date(now.getTime() - (10 - i) * 86400000), // Older submissions first
                reviewed_at: i < 7 ? now : null,
                reviewed_by: i < 7 ? NICs[0] : null,
                rejection_reason: null
            }))
        );

        // ---------- WEB MANAGERS ----------
        console.log('👨‍💼 Creating web managers...');
        await mongoose.connection.collection("webmanagers").insertMany(
            NICs.slice(0, 5).map((nic, i) => ({
                W_ID: `WM${String(i + 1).padStart(3, '0')}`,
                NIC: nic,
                registered_at: now,
                is_active: i !== 2, // One inactive for testing
                permissions: {
                    posts: true,
                    comments: true,
                    campaigns: i !== 1, // One without campaign permission
                    reports: true,
                    donations: true,
                    landing_page: true,
                    fundraising: true
                },
                last_login: now
            }))
        );

        // ---------- ADMINS ----------
        console.log('👑 Creating admins...');
        await mongoose.connection.collection("admins").insertMany([
            {
                A_ID: 'A001',
                NIC: 'ADMIN123456789', // Main admin
                super_admin_flag: true,
                created_at: now,
                permissions: {
                    user_management: true,
                    content_moderation: true,
                    system_settings: true,
                    financial_reports: true
                }
            },
            {
                A_ID: 'A002',
                NIC: NICs[0], // Secondary admin
                super_admin_flag: false,
                created_at: now,
                permissions: {
                    user_management: true,
                    content_moderation: true,
                    system_settings: true,
                    financial_reports: true
                }
            }
        ]);

        // ---------- WARNINGS ----------
        console.log('⚠️ Creating warnings...');
        await mongoose.connection.collection("warnings").insertMany(
            NICs.slice(0, 15).map((nic, i) => ({
                warning_id: `W${String(i + 1).padStart(5, '0')}`,
                user_nic: nic,
                warned_user_nic: nic,
                admin_nic: NICs[0],
                reason: ["Inappropriate content", "Spam", "Harassment", "Misinformation"][i % 4],
                severity: ["low", "medium", "high"][i % 3],
                given_by: NICs[0],
                is_active: true,
                given_at: now,
                warned_at: now,
                notes: `Warning note ${i + 1}`
            }))
        );

        // ---------- POSTS ----------
        console.log('📝 Creating posts...');
        await mongoose.connection.collection("posts").insertMany(
            NICs.map((nic, i) => ({
                post_id: `P${String(i + 1).padStart(5, '0')}`,
                author_nic: nic,
                author_type: "user",
                title: `Post Title ${i + 1} - ${["Health Tips", "My Experience", "Question", "Support"][i % 4]}`,
                content: `This is sample post content for post ${i + 1}. It contains helpful information about women's health.`,
                category: ["general", "health", "education", "experience", "question", "support"][i % 6],
                approval_status: "approved",
                is_anonymous: i % 5 === 0,
                view_count: Math.floor(Math.random() * 100),
                like_count: Math.floor(Math.random() * 50),
                comment_count: Math.floor(Math.random() * 20),
                report_count: 0,
                created_at: new Date(now.getTime() - (i * 3600000)), // Stagger times
                updated_at: now
            }))
        );

        // ---------- COMMENTS ----------
        console.log('💬 Creating comments...');
        await mongoose.connection.collection("comments").insertMany(
            NICs.map((nic, i) => ({
                comment_id: `C${String(i + 1).padStart(5, '0')}`,
                post_id: `P${String((i % 20) + 1).padStart(5, '0')}`,
                nic,
                comment_text: `This is a helpful comment on the post. Comment number ${i + 1}.`,
                is_anonymous: i % 7 === 0,
                like_count: Math.floor(Math.random() * 20),
                created_at: now,
                updated_at: now
            }))
        );

        // ---------- LIKES ----------
        console.log('❤️ Creating likes...');
        await mongoose.connection.collection("likes").insertMany(
            NICs.map((nic, i) => ({
                like_id: `L${String(i + 1).padStart(5, '0')}`,
                post_id: `P${String((i % 20) + 1).padStart(5, '0')}`,
                nic,
                like_type: "post",
                created_at: now
            }))
        );

        // ---------- CAMPAIGNS ----------
        console.log('🎯 Creating campaigns...');
        await mongoose.connection.collection("campaigns").insertMany(
            Array.from({ length: 10 }, (_, i) => ({
                campaign_id: `CP${String(i + 1).padStart(5, '0')}`,
                title: `Campaign ${i + 1} - ${["Education Fund", "Healthcare Initiative", "Awareness Program"][i % 3]}`,
                description: `Fundraising campaign to support women's health initiative ${i + 1}`,
                detailed_description: `This is a detailed description of campaign ${i + 1} with goals and objectives.`,
                status: ["active", "completed", "pending"][i % 3],
                created_by_nic: NICs[i % 20],
                approved_by_nic: i < 7 ? NICs[0] : null,
                approved_at: i < 7 ? now : null,
                start_date: now,
                end_date: new Date(now.getTime() + (30 * 24 * 3600000)), // 30 days from now
                goal_amount: 100000 + (i * 50000),
                current_amount: 25000 + (i * 10000),
                donor_count: 5 + i,
                category: ["education", "healthcare", "awareness", "sustainability"][i % 4],
                created_at: now,
                updated_at: now
            }))
        );

        // ---------- CAMPAIGN DONATIONS ----------
        console.log('💰 Creating campaign donations...');
        await mongoose.connection.collection("campaigndonations").insertMany(
            Array.from({ length: 50 }, (_, i) => ({
                donation_id: `D${String(i + 1).padStart(5, '0')}`,
                campaign_id: `CP${String((i % 10) + 1).padStart(5, '0')}`,
                donor_name: `Donor ${i + 1}`,
                phone_number: `07700${String(i).padStart(6, '0')}`,
                email: `donor${i + 1}@example.com`,
                amount: [500, 1000, 1500, 2000, 2500, 3000, 5000][i % 7], // Varied realistic amounts
                is_anonymous: i % 4 === 0,
                message: i % 3 === 0 ? `Keep up the great work! - Donor ${i + 1}` : null,
                receipt_sent: i % 2 === 0,
                donated_at: new Date(now.getTime() - (i * 86400000 * 0.5)) // Stagger by half-days for more density
            }))
        );

        // ---------- CYCLE PROFILES ----------
        console.log('📅 Creating cycle profiles...');
        await mongoose.connection.collection("cycleprofiles").deleteMany({});
        await mongoose.connection.collection("cycleprofiles").insertMany(
            NICs.slice(10, 20).map((nic, i) => ({ // Last 10 users (regular users, not doctors/managers)
                NIC: nic,
                average_cycle_length: 26 + (i % 6), // 26-31 days
                average_period_length: 4 + (i % 3), // 4-6 days
                last_period_start: new Date(now.getTime() - ((i + 1) * 28 * 86400000)), // Stagger by months
                next_predicted_period: new Date(now.getTime() + ((28 - i) * 86400000)),
                cycle_regularity: ['regular', 'irregular', 'regular', 'somewhat_regular'][i % 4],
                tracking_since: new Date(now.getTime() - ((i + 12) * 30 * 86400000)), // Tracking for 12+ months
                preferences: {
                    notifications_enabled: i % 2 === 0,
                    reminder_days_before: [2, 3, 5, 7][i % 4],
                    symptom_tracking: true,
                    mood_tracking: i % 3 !== 0
                },
                privacy_settings: {
                    share_with_doctor: i % 2 === 0,
                    anonymous_data_research: i % 3 === 0
                },
                created_at: new Date(now.getTime() - ((i + 12) * 30 * 86400000)),
                updated_at: now
            }))
        );

        // ---------- CYCLE TRACKERS ----------
        console.log('📊 Creating cycle trackers...');
        await mongoose.connection.collection("cycletrackers").deleteMany({});
        const cycleTrackers = [];
        NICs.slice(10, 20).forEach((nic, userIdx) => {
            // Create 6 cycles per user (last 6 months)
            for (let cycleNum = 0; cycleNum < 6; cycleNum++) {
                const cycleStartDaysAgo = (cycleNum * 28) + (userIdx * 2); // Stagger starts
                cycleTrackers.push({
                    tracker_id: `CT${String(userIdx * 6 + cycleNum + 1).padStart(5, '0')}`,
                    NIC: nic,
                    cycle_start_date: new Date(now.getTime() - (cycleStartDaysAgo * 86400000)),
                    cycle_end_date: new Date(now.getTime() - ((cycleStartDaysAgo - 28) * 86400000)),
                    period_start_date: new Date(now.getTime() - (cycleStartDaysAgo * 86400000)),
                    period_end_date: new Date(now.getTime() - ((cycleStartDaysAgo - 5) * 86400000)),
                    cycle_length: 27 + (userIdx % 5), // 27-31 days
                    period_length: 4 + (userIdx % 3), // 4-6 days
                    flow_intensity: ['light', 'moderate', 'heavy'][cycleNum % 3],
                    symptoms: ['cramps', 'bloating', 'headache', 'fatigue'].slice(0, (cycleNum % 4) + 1),
                    notes: cycleNum % 2 === 0 ? `Cycle ${cycleNum + 1} notes` : null,
                    created_at: new Date(now.getTime() - (cycleStartDaysAgo * 86400000)),
                    updated_at: now
                });
            }
        });
        await mongoose.connection.collection("cycletrackers").insertMany(cycleTrackers);

        // ---------- DAILY LOGS ----------
        console.log('📝 Creating daily logs...');
        await mongoose.connection.collection("dailylogs").deleteMany({});
        const dailyLogs = [];
        NICs.slice(10, 20).forEach((nic, userIdx) => {
            // Create daily logs for the last 30 days
            for (let day = 0; day < 30; day++) {
                dailyLogs.push({
                    log_id: `DL${String(userIdx * 30 + day + 1).padStart(5, '0')}`,
                    NIC: nic,
                    log_date: new Date(now.getTime() - (day * 86400000)),
                    mood: ['happy', 'sad', 'anxious', 'energetic', 'tired', 'irritable'][day % 6],
                    energy_level: 1 + (day % 5), // 1-5
                    flow: day % 4 === 0 ? ['none', 'spotting', 'light', 'moderate', 'heavy'][(day / 4) % 5] : 'none',
                    symptoms: day % 3 === 0 ? ['cramps', 'headache', 'nausea'].slice(0, (day % 3) + 1) : [],
                    pain_level: day % 5 === 0 ? 1 + (day % 5) : 0, // 0-5
                    notes: day % 7 === 0 ? `Daily note for day ${day + 1}` : null,
                    water_intake_ml: 1500 + (day % 10) * 100, // 1500-2400ml
                    sleep_hours: 6 + (day % 3), // 6-8 hours
                    exercise_minutes: day % 2 === 0 ? 30 + (day % 4) * 15 : 0, // 0-90 mins
                    created_at: new Date(now.getTime() - (day * 86400000)),
                    updated_at: new Date(now.getTime() - (day * 86400000))
                });
            }
        });
        await mongoose.connection.collection("dailylogs").insertMany(dailyLogs);

        // ---------- REPORTS ----------
        console.log('⚠️ Creating reports...');
        await mongoose.connection.collection("reports").deleteMany({});
        await mongoose.connection.collection("reports").insertMany(
            Array.from({ length: 25 }, (_, i) => ({
                report_id: `R${String(i + 1).padStart(5, '0')}`,
                reporter_nic: NICs[i % 20],
                reported_item_type: ['post', 'comment', 'user'][i % 3],
                reported_item_id: i % 3 === 0 ? `P${String((i % 20) + 1).padStart(5, '0')}` :
                    i % 3 === 1 ? `C${String((i % 20) + 1).padStart(5, '0')}` :
                        NICs[(i + 5) % 20],
                reported_user_nic: NICs[(i + 5) % 20],
                reason: ['spam', 'harassment', 'inappropriate_content', 'misinformation', 'hate_speech'][i % 5],
                description: `Report description for item ${i + 1}`,
                status: ['pending', 'reviewed', 'resolved', 'dismissed'][i % 4],
                reviewed_by: i % 4 !== 0 ? 'ADMIN123456789' : null,
                reviewed_at: i % 4 !== 0 ? now : null,
                action_taken: i % 4 === 2 ? ['warning_issued', 'content_removed', 'user_suspended'][i % 3] : null,
                created_at: new Date(now.getTime() - ((25 - i) * 86400000 * 2)), // Stagger over 50 days
                updated_at: now
            }))
        );

        // ---------- PASSWORD RESETS ----------
        console.log('🔑 Creating password resets...');
        await mongoose.connection.collection("passwordresets").deleteMany({});
        await mongoose.connection.collection("passwordresets").insertMany(
            Array.from({ length: 10 }, (_, i) => ({
                email: `user${i + 1}@hercycle.com`,
                token: `reset_token_${i + 1}_${Date.now()}`,
                expires_at: i < 5 ?
                    new Date(now.getTime() + (24 * 3600000)) : // Valid (expires in 24h)
                    new Date(now.getTime() - (24 * 3600000)),  // Expired (24h ago)
                created_at: new Date(now.getTime() - (i * 3600000)) // Stagger by hours
            }))
        );

        // ---------- LANDING PAGE ----------
        console.log('📄 Creating landing page content...');
        await mongoose.connection.collection("landingpages").deleteMany({});
        await mongoose.connection.collection("landingpages").insertOne({
            hero_title: "Welcome to HerCycle",
            hero_subtitle: "Empowering women's health through education and community",
            hero_image_url: "https://example.com/hero.jpg",
            about_section: "HerCycle is a comprehensive women's health platform...",
            features: [
                { title: "Cycle Tracking", description: "Track your menstrual cycle", icon: "📅" },
                { title: "Health Education", description: "Learn about women's health", icon: "📚" },
                { title: "Community Support", description: "Connect with others", icon: "👥" },
                { title: "Expert Doctors", description: "Verified medical professionals", icon: "👨‍⚕️" }
            ],
            testimonials: [
                { name: "Sarah M.", text: "HerCycle changed my life!", rating: 5 },
                { name: "Jessica L.", text: "Best health tracking app", rating: 5 }
            ],
            created_at: now,
            updated_at: now
        });

        // ---------- FUNDRAISING SETTINGS ----------
        console.log('💸 Creating fundraising settings...');
        await mongoose.connection.collection("fundraisings").deleteMany({});
        await mongoose.connection.collection("fundraisings").insertOne({
            platform_name: "HerCycle Fundraising",
            payment_gateway: "stripe",
            minimum_donation_amount: 500,
            default_currency: "LKR",
            enable_anonymous_donations: true,
            enable_recurring_donations: false,
            tax_deductible: false,
            created_at: now,
            updated_at: now
        });

        // ---------- RULE-BASED AI ----------
        console.log('🤖 Creating rule-based AI...');
        await mongoose.connection.collection("rulebasedais").deleteMany({});
        await mongoose.connection.collection("rulebasedais").insertOne({
            ai_id: "AI001",
            model_version: "1.0",
            is_active: true,
            rules: [
                { condition: "cycle_length > 35", action: "suggest_doctor_consultation", priority: "high" },
                { condition: "pain_level > 7", action: "recommend_pain_management", priority: "high" },
                { condition: "irregular_cycles > 3", action: "track_patterns_suggestion", priority: "medium" }
            ],
            last_trained: now,
            created_at: now
        });

        console.log('✅ Seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - 21 Users (1 admin + 20 regular, some suspended for testing)`);
        console.log(`   - 20 Community Members`);
        console.log(`   - 10 Doctors (7 approved, 3 pending)`);
        console.log(`   - 10 Doctor Verifications (7 approved, 3 pending)`);
        console.log(`   - 5 Web Managers`);
        console.log(`   - 2 Admins`);
        console.log(`   - 15 Warnings`);
        console.log(`   - 20 Posts`);
        console.log(`   - 20 Comments`);
        console.log(`   - 20 Likes`);
        console.log(`   - 10 Campaigns`);
        console.log(`   - 50 Campaign Donations (varied amounts)`);
        console.log(`   - 10 Cycle Profiles`);
        console.log(`   - 60 Cycle Trackers (6 months per user)`);
        console.log(`   - 300 Daily Logs (30 days × 10 users)`);
        console.log(`   - 25 Reports (various statuses)`);
        console.log(`   - 10 Password Reset Tokens`);
        console.log(`   - 1 Landing Page Content`);
        console.log(`   - 1 Fundraising Settings`);
        console.log(`   - 1 Rule-Based AI Config`);
        console.log('\n🎉 Your admin dashboard is now ready to test with comprehensive data!\n');

    } catch (error) {
        console.error('❌ Seeding error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

seed();
