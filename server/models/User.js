import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profile: {
    avatar: String,
    phone: String,
    company: String,
    bio: String
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium'],
      default: 'free'
    },
    expiresAt: Date,
    features: {
      maxCustomers: { type: Number, default: 5 },
      maxSchedules: { type: Number, default: 10 },
      bulkOperations: { type: Boolean, default: false },
      customBranding: { type: Boolean, default: false }
    }
  },
  settings: {
    timezone: { type: String, default: 'Asia/Kolkata' },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: true }
    },
    theme: { type: String, default: 'light' }
  },
  usage: {
    postersGenerated: { type: Number, default: 0 },
    messagesScheduled: { type: Number, default: 0 },
    messagesSent: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: true },
  lastLogin: Date
}, { timestamps: true });

// Add indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ 'subscription.plan': 1 });

export default mongoose.model('User', userSchema);
