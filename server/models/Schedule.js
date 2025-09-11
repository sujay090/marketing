import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  posterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poster',
  },
  generatedPosterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GeneratedPoster',
  },
  campaign: {
    name: String,
    type: {
      type: String,
      enum: ['single', 'bulk', 'recurring'],
      default: 'single'
    },
    bulkSettings: {
      customerGroups: [String], // Tags for bulk sending
      customerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }]
    }
  },
  category: {
    type: String,
    required: true,
    enum: ['offers', 'events', 'festivals', 'announcements', 'promotions'],
    index: true
  },
  // Store date and time as strings to avoid timezone parsing issues
  date: {
    type: String, // YYYY-MM-DD
    required: true,
    index: true
  },
  time: {
    type: String, // HH:mm (24h format)
    required: true
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  recurring: {
    enabled: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'weekly'
    },
    endDate: String,
    daysOfWeek: [Number], // 0-6 for Sunday-Saturday
    dayOfMonth: Number // For monthly recurring
  },
  message: {
    text: { type: String, default: 'Your marketing poster is ready! 🎨✨' },
    includeCustomText: { type: Boolean, default: false },
    customText: String
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'sent', 'failed', 'cancelled', 'paused'],
    default: 'pending',
    index: true
  },
  delivery: {
    attemptCount: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    lastAttempt: Date,
    failureReason: String,
    sentAt: Date,
    deliveryStatus: {
      type: String,
      enum: ['unknown', 'delivered', 'failed', 'read'],
      default: 'unknown'
    }
  },
  analytics: {
    opened: { type: Boolean, default: false },
    openedAt: Date,
    clicked: { type: Boolean, default: false },
    clickedAt: Date,
    responseReceived: { type: Boolean, default: false }
  },
  metadata: {
    source: { type: String, default: 'web' }, // web, api, bulk-import
    ipAddress: String,
    userAgent: String
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Compound indexes for efficient queries
scheduleSchema.index({ user: 1, status: 1 });
scheduleSchema.index({ user: 1, date: 1, time: 1 });
scheduleSchema.index({ user: 1, category: 1 });
scheduleSchema.index({ customerId: 1, status: 1 });
scheduleSchema.index({ date: 1, time: 1, status: 1 });
scheduleSchema.index({ 'campaign.type': 1 });

export default mongoose.model('Schedule', scheduleSchema);
