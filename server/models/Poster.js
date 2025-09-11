import mongoose from 'mongoose';

const placeholderSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    enum: ['companyName', 'whatsapp', 'website', 'email', 'address', 'custom']
  },
  text: String,
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, default: 200 },
  height: { type: Number, default: 50 },
  style: {
    fontFamily: { type: String, default: 'Arial' },
    fontSize: { type: String, default: '16px' },
    color: { type: String, default: '#000000' },
    fontWeight: { type: String, default: 'normal' },
    fontStyle: { type: String, default: 'normal' },
    textAlign: { type: String, default: 'left' }
  },
  rotation: { type: Number, default: 0 },
  opacity: { type: Number, default: 1, min: 0, max: 1 }
});

const posterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: { 
    type: String, 
    required: true,
    enum: ['offers', 'events', 'festivals', 'announcements', 'promotions'],
    index: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  originalImagePath: { 
    type: String, 
    required: true 
  },
  finalImagePath: String,
  thumbnailPath: String,
  placeholders: [placeholderSchema],
  dimensions: {
    width: Number,
    height: Number,
    aspectRatio: String
  },
  tags: [String], // For better searchability
  description: String,
  isTemplate: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: false }, // For sharing templates
  usage: {
    timesUsed: { type: Number, default: 0 },
    customersUsed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }]
  },
  metadata: {
    fileSize: Number,
    format: String,
    colorMode: String
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes for efficient queries
posterSchema.index({ user: 1, category: 1 });
posterSchema.index({ user: 1, isActive: 1 });
posterSchema.index({ category: 1, isPublic: 1 });
posterSchema.index({ tags: 1 });
posterSchema.index({ isTemplate: 1 });

export default mongoose.model('Poster', posterSchema);
