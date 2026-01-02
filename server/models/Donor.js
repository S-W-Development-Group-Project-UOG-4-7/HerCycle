import mongoose from 'mongoose';

const DonorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },

    // Track if donor was originally a guest who converted
    isGuestConverted: { type: Boolean, default: false },

    // Total amount donated across all campaigns
    totalDonated: { type: Number, default: 0 },

    // Array of donation references
    donations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Donation' }],

    // For campaign updates preferences
    receiveUpdates: { type: Boolean, default: true }
}, {
    timestamps: true
});

export default mongoose.model('Donor', DonorSchema);
