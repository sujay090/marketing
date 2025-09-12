import Poster from '../models/Poster.js';
import Customer from '../models/Customer.js';
import Schedule from '../models/Schedule.js';
import User from '../models/User.js';

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.admin.id;

    // Get user-specific counts
    const [posters, customers, scheduled, user] = await Promise.all([
      Poster.countDocuments({ user: userId, isActive: true }),
      Customer.countDocuments({ user: userId, isActive: true }),
      Schedule.countDocuments({ user: userId }),
      User.findById(userId).select('subscription usage name')
    ]);

    // Get recent activities
    const recentPosters = await Poster.find({ user: userId, isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category createdAt imageUrl')
      .lean();

    const recentCustomers = await Customer.find({ user: userId, isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('companyName email createdAt logoUrl')
      .lean();

    const recentSchedules = await Schedule.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customerId', 'companyName')
      .select('message scheduledAt status category')
      .lean();

    // Calculate subscription usage percentages
    const subscriptionLimits = user?.subscription?.features || {};
    const usageStats = {
      customers: {
        used: customers,
        limit: subscriptionLimits.maxCustomers || 5,
        percentage: subscriptionLimits.maxCustomers ? Math.round((customers / subscriptionLimits.maxCustomers) * 100) : 0
      },
      schedules: {
        used: scheduled,
        limit: subscriptionLimits.maxSchedules || 10,
        percentage: subscriptionLimits.maxSchedules ? Math.round((scheduled / subscriptionLimits.maxSchedules) * 100) : 0
      }
    };

    res.json({ 
      counts: { posters, customers, scheduled },
      subscription: user?.subscription || { plan: 'free' },
      usage: user?.usage || { postersGenerated: 0, messagesScheduled: 0, messagesSent: 0 },
      usageStats,
      recent: {
        posters: recentPosters,
        customers: recentCustomers,
        schedules: recentSchedules
      },
      user: {
        name: user?.name || 'User',
        plan: user?.subscription?.plan || 'free'
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      message: 'Failed to load dashboard data',
      error: error.message 
    });
  }
};