import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  type: {
    type: String,
    enum: ['single', 'bulk', 'recurring', 'drip'],
    default: 'single'
  },
  category: {
    type: String,
    required: true,
    enum: ['offers', 'events', 'festivals', 'announcements', 'promotions']
  },
  targets: {
    customerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }],
    customerGroups: [String], // Tags
    filters: {
      industry: [String],
      businessType: [String],
      location: {
        cities: [String],
        states: [String]
      },
      lastContactDays: Number // customers contacted in last X days
    }
  },
  content: {
    posterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poster' },
    message: {
      text: { type: String, default: 'Your marketing poster is ready! 🎨✨' },
      includeCustomText: { type: Boolean, default: false },
      customText: String
    },
    personalization: {
      useCustomerName: { type: Boolean, default: true },
      customFields: mongoose.Schema.Types.Mixed
    }
  },
  schedule: {
    type: {
      type: String,
      enum: ['immediate', 'scheduled', 'recurring', 'drip'],
      default: 'immediate'
    },
    startDate: String,
    startTime: String,
    endDate: String,
    timezone: { type: String, default: 'Asia/Kolkata' },
    recurring: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly']
      },
      interval: { type: Number, default: 1 },
      daysOfWeek: [Number],
      dayOfMonth: Number
    },
    drip: {
      sequence: [{
        delay: Number, // days after previous message
        posterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poster' },
        message: String
      }]
    }
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft',
    index: true
  },
  stats: {
    totalTargets: { type: Number, default: 0 },
    messagesScheduled: { type: Number, default: 0 },
    messagesSent: { type: Number, default: 0 },
    messagesFailed: { type: Number, default: 0 },
    deliveryRate: { type: Number, default: 0 },
    openRate: { type: Number, default: 0 },
    responseRate: { type: Number, default: 0 }
  },
  budget: {
    estimated: Number,
    actual: Number,
    currency: { type: String, default: 'INR' }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes
campaignSchema.index({ user: 1, status: 1 });
campaignSchema.index({ user: 1, type: 1 });
campaignSchema.index({ user: 1, category: 1 });
campaignSchema.index({ 'schedule.startDate': 1 });

export default mongoose.model('Campaign', campaignSchema);
