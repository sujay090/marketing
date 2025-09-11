import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: true,
    enum: ['offers', 'events', 'festivals', 'announcements', 'promotions'],
    index: true
  },
  subcategory: String,
  imagePath: {
    type: String,
    required: true
  },
  thumbnailPath: String,
  placeholders: [{
    key: {
      type: String,
      required: true,
      enum: ['companyName', 'whatsapp', 'website', 'email', 'address', 'custom']
    },
    label: String,
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
    }
  }],
  colors: {
    primary: String,
    secondary: String,
    accent: String,
    background: String,
    text: String
  },
  dimensions: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    aspectRatio: String
  },
  tags: [String],
  visibility: {
    type: String,
    enum: ['private', 'public', 'marketplace'],
    default: 'private'
  },
  marketplace: {
    price: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    featured: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    downloads: { type: Number, default: 0 }
  },
  usage: {
    timesUsed: { type: Number, default: 0 },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastUsed: Date
  },
  metadata: {
    fileSize: Number,
    format: String,
    colorMode: String,
    dpi: Number
  },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

// Indexes
templateSchema.index({ user: 1, category: 1 });
templateSchema.index({ visibility: 1, isActive: 1 });
templateSchema.index({ category: 1, visibility: 1 });
templateSchema.index({ tags: 1 });
templateSchema.index({ 'marketplace.featured': 1 });
templateSchema.index({ 'marketplace.rating': 1 });

export default mongoose.model('Template', templateSchema);
