import mongoose from 'mongoose';

const CampaignSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    detailedInfo: { type: String, default: '' },

    // Funding
    goalAmount: { type: Number, required: true },
    raisedAmount: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },

    // Campaign period
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },

    // Visual
    imageUrl: { type: String, default: '' },
    icon: { type: String, default: '💝' },
    color: { type: String, default: 'from-pink-500 to-rose-500' },

    // Category
    category: {
        type: String,
        enum: ['Education', 'Health', 'Community', 'Emergency', 'Infrastructure'],
        default: 'Education'
    },

    // Trust indicators
    trustBadges: [{
        type: String,
        enum: ['verified', 'secure-payment', 'transparent', 'tax-deductible', 'matching-funds']
    }],

    // Impact tracking
    impactStats: {
        beneficiaries: { type: Number, default: 0 },
        projectsCompleted: { type: Number, default: 0 },
        regionsReached: { type: Number, default: 0 }
    },

    // Campaign updates for donors
    updates: [{
        title: { type: String },
        content: { type: String },
        createdAt: { type: Date, default: Date.now }
    }],

    // Track total donors
    totalDonors: { type: Number, default: 0 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

// Virtual to calculate progress percentage
CampaignSchema.virtual('progressPercent').get(function () {
    return Math.min(100, Math.round((this.raisedAmount / this.goalAmount) * 100));
});

// Virtual to check if campaign has ended
CampaignSchema.virtual('hasEnded').get(function () {
    return new Date() > this.endDate;
});

// Virtual to get days remaining
CampaignSchema.virtual('daysRemaining').get(function () {
    const now = new Date();
    const end = new Date(this.endDate);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
});

// Ensure virtuals are included in JSON
CampaignSchema.set('toJSON', { virtuals: true });
CampaignSchema.set('toObject', { virtuals: true });

export default mongoose.model('Campaign', CampaignSchema);
