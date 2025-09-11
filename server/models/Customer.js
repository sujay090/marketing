import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true,
      index: true
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    logoUrl: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
      trim: true
    },
    whatsapp: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{10,15}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid WhatsApp number!`,
      },
      index: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      pincode: String
    },
    businessInfo: {
      industry: String,
      businessType: {
        type: String,
        enum: ['retail', 'service', 'manufacturing', 'restaurant', 'healthcare', 'education', 'other'],
        default: 'other'
      },
      establishedYear: Number,
      description: String
    },
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String
    },
    preferences: {
      preferredCategories: [{
        type: String,
        enum: ['offers', 'events', 'festivals', 'announcements', 'promotions']
      }],
      messagingFrequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'custom'],
        default: 'weekly'
      },
      bestTimeToSend: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '18:00' }
      }
    },
    tags: [String], // For customer segmentation
    isActive: { type: Boolean, default: true },
    notes: String, // Internal notes about the customer
    lastContactDate: Date,
    totalPosters: { type: Number, default: 0 },
    totalMessages: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
customerSchema.index({ user: 1, companyName: 1 });
customerSchema.index({ user: 1, isActive: 1 });
customerSchema.index({ user: 1, 'businessInfo.industry': 1 });
customerSchema.index({ tags: 1 });

export default mongoose.model("Customer", customerSchema);
