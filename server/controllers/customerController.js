import Customer from "../models/Customer.js";
import User from "../models/User.js";
import fs from "fs";
import path from "path";

const serverURL = process.env.SERVER_URL || "http://localhost:5000";

// @desc    Add new customer
// @route   POST /api/customers/add
// @access  Private
export const addCustomer = async (req, res) => {
  try {
    const {
      companyName,
      website,
      whatsapp,
      email,
      address,
      businessInfo,
      socialMedia,
      preferences,
      tags,
      notes
    } = req.body;

    // Check subscription limits
    const user = await User.findById(req.admin.id);
    const customerCount = await Customer.countDocuments({ 
      user: req.admin.id, 
      isActive: true 
    });
    
    if (customerCount >= user.subscription.features.maxCustomers) {
      return res.status(403).json({ 
        message: `Customer limit reached. Upgrade your plan to add more customers.`,
        currentLimit: user.subscription.features.maxCustomers
      });
    }

    // Check if customer already exists for this user
    const existingCustomer = await Customer.findOne({
      user: req.admin.id,
      $or: [
        { companyName: companyName.trim() },
        { whatsapp },
        { email: email?.toLowerCase() }
      ]
    });

    if (existingCustomer) {
      return res.status(400).json({
        message: "Customer already exists with this company name, WhatsApp, or email"
      });
    }

    const customerData = {
      user: req.admin.id,
      companyName: companyName.trim(),
      website: website?.trim() || "",
      whatsapp,
      email: email?.toLowerCase().trim() || "",
      isActive: true
    };

    // Handle logo upload
    if (req.file) {
      customerData.logoUrl = `${serverURL}/uploads/${req.file.filename}`;
    }

    // Parse and add optional fields
    if (address) {
      try {
        customerData.address = typeof address === 'string' ? JSON.parse(address) : address;
      } catch (e) {
        console.error("Error parsing address:", e);
      }
    }

    if (businessInfo) {
      try {
        customerData.businessInfo = typeof businessInfo === 'string' ? JSON.parse(businessInfo) : businessInfo;
      } catch (e) {
        console.error("Error parsing businessInfo:", e);
      }
    }

    if (socialMedia) {
      try {
        customerData.socialMedia = typeof socialMedia === 'string' ? JSON.parse(socialMedia) : socialMedia;
      } catch (e) {
        console.error("Error parsing socialMedia:", e);
      }
    }

    if (preferences) {
      try {
        customerData.preferences = typeof preferences === 'string' ? JSON.parse(preferences) : preferences;
      } catch (e) {
        console.error("Error parsing preferences:", e);
      }
    }

    if (tags) {
      try {
        customerData.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        customerData.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
      }
    }

    if (notes) {
      customerData.notes = notes.trim();
    }

    const customer = await Customer.create(customerData);

    res.status(201).json({
      message: "Customer added successfully",
      customer
    });
  } catch (error) {
    console.error("Add customer error:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// @desc    Get all customers for user
// @route   GET /api/customers/
// @access  Private
export const getAllCustomers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      industry,
      businessType,
      tags,
      sortBy = 'companyName',
      sortOrder = 'asc'
    } = req.query;

    const query = { 
      user: req.admin.id, 
      isActive: true 
    };

    // Add search functionality
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { whatsapp: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by industry
    if (industry) {
      query['businessInfo.industry'] = industry;
    }

    // Filter by business type
    if (businessType) {
      query['businessInfo.businessType'] = businessType;
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    const customers = await Customer.find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalCount = await Customer.countDocuments(query);

    res.json({
      customers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: parseInt(page) * parseInt(limit) < totalCount,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error("Get customers error:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
export const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      user: req.admin.id,
      isActive: true
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    console.error("Get customer error:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// @desc    Update customer
// @route   PUT /api/customers/edit/:id
// @access  Private
export const editCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      user: req.admin.id
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const {
      companyName,
      website,
      whatsapp,
      email,
      address,
      businessInfo,
      socialMedia,
      preferences,
      tags,
      notes,
      isActive
    } = req.body;

    // Update basic fields
    if (companyName) customer.companyName = companyName.trim();
    if (website !== undefined) customer.website = website.trim();
    if (whatsapp) customer.whatsapp = whatsapp;
    if (email !== undefined) customer.email = email.toLowerCase().trim();
    if (notes !== undefined) customer.notes = notes.trim();
    if (isActive !== undefined) customer.isActive = isActive;

    // Handle logo upload
    if (req.file) {
      // Delete old logo if exists
      if (customer.logoUrl) {
        const oldFile = customer.logoUrl.split("/uploads/")[1];
        const filePath = path.join("uploads", oldFile);
        fs.unlink(filePath, (err) => {
          if (err) console.warn("Old logo delete failed:", err.message);
        });
      }
      customer.logoUrl = `${serverURL}/uploads/${req.file.filename}`;
    }

    // Update complex fields
    if (address) {
      try {
        customer.address = typeof address === 'string' ? JSON.parse(address) : address;
      } catch (e) {
        console.error("Error parsing address:", e);
      }
    }

    if (businessInfo) {
      try {
        customer.businessInfo = typeof businessInfo === 'string' ? JSON.parse(businessInfo) : businessInfo;
      } catch (e) {
        console.error("Error parsing businessInfo:", e);
      }
    }

    if (socialMedia) {
      try {
        customer.socialMedia = typeof socialMedia === 'string' ? JSON.parse(socialMedia) : socialMedia;
      } catch (e) {
        console.error("Error parsing socialMedia:", e);
      }
    }

    if (preferences) {
      try {
        customer.preferences = typeof preferences === 'string' ? JSON.parse(preferences) : preferences;
      } catch (e) {
        console.error("Error parsing preferences:", e);
      }
    }

    if (tags) {
      try {
        customer.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        customer.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
      }
    }

    await customer.save();

    res.json({
      message: "Customer updated successfully",
      customer
    });
  } catch (error) {
    console.error("Update customer error:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// @desc    Delete customer (soft delete)
// @route   DELETE /api/customers/:id
// @access  Private
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      user: req.admin.id
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Soft delete
    customer.isActive = false;
    await customer.save();

    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Delete customer error:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// @desc    Bulk import customers
// @route   POST /api/customers/bulk-import
// @access  Private
export const bulkImportCustomers = async (req, res) => {
  try {
    const user = await User.findById(req.admin.id);
    
    if (!user.subscription.features.bulkOperations) {
      return res.status(403).json({
        message: "Bulk operations not available in your current plan"
      });
    }

    const { customers } = req.body;
    
    if (!Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({ message: "No customers provided" });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < customers.length; i++) {
      try {
        const customerData = {
          ...customers[i],
          user: req.admin.id,
          companyName: customers[i].companyName?.trim(),
          email: customers[i].email?.toLowerCase().trim(),
          isActive: true
        };

        await Customer.create(customerData);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: error.message
        });
      }
    }

    res.json({
      message: "Bulk import completed",
      results
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// @desc    Get customer statistics
// @route   GET /api/customers/stats
// @access  Private
export const getCustomerStats = async (req, res) => {
  try {
    const stats = await Customer.aggregate([
      { $match: { user: req.admin.id, isActive: true } },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          industriesCount: { $addToSet: "$businessInfo.industry" },
          businessTypesCount: { $addToSet: "$businessInfo.businessType" },
          avgPostersGenerated: { $avg: "$totalPosters" },
          avgMessagesPerCustomer: { $avg: "$totalMessages" }
        }
      }
    ]);

    const recentCustomers = await Customer.countDocuments({
      user: req.admin.id,
      isActive: true,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const topIndustries = await Customer.aggregate([
      { $match: { user: req.admin.id, isActive: true } },
      { $group: { _id: "$businessInfo.industry", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      stats: stats[0] || {
        totalCustomers: 0,
        industriesCount: [],
        businessTypesCount: [],
        avgPostersGenerated: 0,
        avgMessagesPerCustomer: 0
      },
      recentCustomers,
      topIndustries
    });
  } catch (error) {
    console.error("Get customer stats error:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};
