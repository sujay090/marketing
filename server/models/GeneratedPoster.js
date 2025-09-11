import mongoose from "mongoose";

const generatedPosterSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    customer: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Customer",
      required: true,
      index: true
    },
    originalPosterId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Poster",
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: ['offers', 'events', 'festivals', 'announcements', 'promotions'],
      index: true
    },
    generatedImagePath: {
      type: String,
      required: true
    },
    thumbnailPath: String,
    customizations: {
      appliedData: {
        companyName: String,
        whatsapp: String,
        website: String,
        email: String,
        address: String,
        custom: mongoose.Schema.Types.Mixed
      },
      styleOverrides: mongoose.Schema.Types.Mixed
    },
    generation: {
      method: {
        type: String,
        enum: ['auto', 'manual', 'bulk'],
        default: 'auto'
      },
      processingTime: Number, // in milliseconds
      quality: {
        type: String,
        enum: ['draft', 'standard', 'high'],
        default: 'standard'
      }
    },
    usage: {
      scheduled: { type: Number, default: 0 },
      sent: { type: Number, default: 0 },
      lastUsed: Date
    },
    metadata: {
      fileSize: Number,
      dimensions: {
        width: Number,
        height: Number
      },
      format: String,
      hash: String // For duplicate detection
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Indexes for efficient queries
generatedPosterSchema.index({ user: 1, customer: 1 });
generatedPosterSchema.index({ user: 1, category: 1 });
generatedPosterSchema.index({ customer: 1, originalPosterId: 1 });
generatedPosterSchema.index({ 'metadata.hash': 1 });
generatedPosterSchema.index({ isActive: 1 });

export default mongoose.model("GeneratedPoster", generatedPosterSchema);
