import mongoose from 'mongoose';

const DonationSchema = new mongoose.Schema({
    // Donor info
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: false }, // Optional for guest donations
    donorName: { type: String, required: true }, // Stored for receipt
    donorEmail: { type: String, required: true }, // Stored for receipt

    // Guest donation flag
    isGuest: { type: Boolean, default: false }, // True if donation made without account

    // Campaign info
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    campaignTitle: { type: String, required: true }, // Stored for receipt

    // Payment details
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },

    // Payment status
    paymentStatus: {
        type: String,
        enum: ['pending', 'processing', 'success', 'failed', 'refunded'],
        default: 'pending'
    },

    // Transaction info (from payment gateway)
    transactionRef: { type: String, unique: true, sparse: true },
    paymentMethod: { type: String, default: 'card' },
    paymentGateway: { type: String, default: 'simulated' },

    // Receipt info
    receiptNumber: { type: String, unique: true },
    receiptGeneratedAt: { type: Date },
    receiptDownloaded: { type: Boolean, default: false },

    // Email status
    confirmationEmailSent: { type: Boolean, default: false },
    receiptEmailSent: { type: Boolean, default: false },

    // Anonymous donation option
    isAnonymous: { type: Boolean, default: false },

    // Optional message from donor
    message: { type: String, default: '' }
}, {
    timestamps: true
});

// Pre-save middleware to generate receipt number
DonationSchema.pre('save', function (next) {
    if (!this.receiptNumber && this.paymentStatus === 'success') {
        // Generate receipt number: HC-YYYYMMDD-XXXXX
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(10000 + Math.random() * 90000);
        this.receiptNumber = `HC-${dateStr}-${random}`;
        this.receiptGeneratedAt = new Date();
    }
    next();
});

// Generate transaction reference
DonationSchema.methods.generateTransactionRef = function () {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    this.transactionRef = `TXN-${timestamp}-${random}`.toUpperCase();
    return this.transactionRef;
};

export default mongoose.model('Donation', DonationSchema);
