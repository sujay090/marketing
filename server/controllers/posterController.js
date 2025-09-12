import fs from "fs";
import path from "path";
import sharp from "sharp";
import Poster from "../models/Poster.js";
import GeneratedPoster from "../models/GeneratedPoster.js";
import Customer from "../models/Customer.js";
import User from "../models/User.js";
import Template from "../models/Template.js";
import { uploadToS3, generateS3Key, S3_CONFIG, getS3PublicUrl } from "../config/s3.js";
import { getCloudFrontUrl, invalidatePosterCache } from "../services/cloudfrontService.js";

// Utility to ensure directory exists
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// @desc    Upload poster with placeholders
// @route   POST /api/posters/upload
// @access  Private
export const uploadPoster = async (req, res) => {
  try {
    const { category, placeholders, title, description, tags, isPrivate, isTemplate, templatePrice } = req.body;
    
    if (!category || !req.file) {
      return res.status(400).json({ 
        message: "Missing required fields: category and image file" 
      });
    }

    // Parse placeholders JSON string to array, fallback to empty array
    let parsedPlaceholders;
    try {
      parsedPlaceholders = JSON.parse(placeholders || "[]");
    } catch (error) {
      console.error("Error parsing placeholders:", error);
      parsedPlaceholders = [];
    }
    
    // Handle both S3 and local storage
    let posterImagePath, posterImageUrl, imageBuffer;
    
    if (process.env.STORAGE_TYPE === 'local') {
      posterImagePath = req.file.path;
      posterImageUrl = `${process.env.SERVER_URL || 'http://localhost:5000'}/${posterImagePath.replace(/\\/g, '/')}`;
      console.log(`📁 Original poster saved locally at: ${posterImagePath}`);
    } else {
      // S3 storage
      posterImagePath = req.file.key;
      posterImageUrl = req.file.location;
      console.log(`☁️ Original poster saved to S3 at: ${posterImageUrl}`);
    }

    // Get image metadata - handle both local and S3
    let imageMeta;
    if (process.env.STORAGE_TYPE === 'local') {
      imageMeta = await sharp(posterImagePath).metadata();
    } else {
      // For S3, we need to download the image buffer first
      const AWS = await import('aws-sdk');
      const s3 = new AWS.S3();
      const s3Object = await s3.getObject({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: posterImagePath
      }).promise();
      imageBuffer = s3Object.Body;
      imageMeta = await sharp(imageBuffer).metadata();
    }

    // Create SVG overlay with all placeholders in their positions/styles
    const svgOverlay = `
      <svg width="${imageMeta.width}" height="${imageMeta.height}" xmlns="http://www.w3.org/2000/svg">
        ${parsedPlaceholders.map((ph) => {
          const style = ph.style || {};
          const fontFamily = style.fontFamily || "Arial";
          const fontSize = parseInt(style.fontSize) || 24;
          const color = style.color || "#000000";
          const fontWeight = style.fontWeight || "normal";

          // Escape text content for safety (basic)
          const text = String(ph.text || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

          return `<text x="${ph.x}" y="${ph.y}" font-family="${fontFamily}" font-size="${fontSize}" fill="${color}" font-weight="${fontWeight}">${""}</text>`;
        }).join("")}
      </svg>
    `;

    // Composite original image with SVG overlay
    let finalImageBuffer;
    if (process.env.STORAGE_TYPE === 'local') {
      finalImageBuffer = await sharp(posterImagePath)
        .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
        .toBuffer();
    } else {
      // Use the downloaded buffer for S3
      finalImageBuffer = await sharp(imageBuffer)
        .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
        .toBuffer();
    }

    // Save processed image
    let processedImagePath, processedImageUrl;
    
    if (process.env.STORAGE_TYPE === 'local') {
      // Local storage
      const outputFolder = path.join("uploads", "processed");
      ensureDirExists(outputFolder);
      const processedFileName = `${category}-${Date.now()}-processed.png`;
      const outputFilePath = path.join(outputFolder, processedFileName);
      
      await sharp(finalImageBuffer).toFile(outputFilePath);
      processedImagePath = outputFilePath;
      processedImageUrl = `${process.env.SERVER_URL || 'http://localhost:5000'}/${outputFilePath.replace(/\\/g, '/')}`;
      console.log(`✅ Processed poster saved locally at: ${outputFilePath}`);
    } else {
      // S3 storage
      const processedKey = generateS3Key(S3_CONFIG.folders.processed, `${category}-processed.png`, req.admin.id);
      const s3Result = await uploadToS3(finalImageBuffer, processedKey, 'image/png');
      
      if (!s3Result.success) {
        throw new Error(`Failed to upload processed image to S3: ${s3Result.error}`);
      }
      
      processedImagePath = s3Result.key;
      processedImageUrl = s3Result.url;
      console.log(`☁️ Processed poster saved to S3 at: ${processedImageUrl}`);
    }

    // Parse tags if provided
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        parsedTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
      }
    }

    // Save poster record in DB
    const posterData = {
      user: req.admin.id,
      category,
      title: title || `${category.charAt(0).toUpperCase() + category.slice(1)} Poster`,
      description: description || "",
      originalImagePath: posterImagePath, // S3 key or local path
      originalImageUrl: posterImageUrl, // Full URL
      finalImagePath: processedImagePath, // S3 key or local path
      finalImageUrl: processedImageUrl, // Full URL
      placeholders: parsedPlaceholders,
      tags: parsedTags,
      isActive: true,
      isPrivate: isPrivate === 'true' || isPrivate === true,
      storageType: process.env.STORAGE_TYPE || 's3',
      metadata: {
        width: imageMeta.width,
        height: imageMeta.height,
        format: imageMeta.format,
        size: req.file.size,
        originalName: req.file.originalname,
        fileKey: process.env.STORAGE_TYPE === 's3' ? posterImagePath : null,
        processedKey: process.env.STORAGE_TYPE === 's3' ? processedImagePath : null
      }
    };

    const poster = await Poster.create(posterData);

    // If it's a template, create template record
    if (isTemplate === 'true' || isTemplate === true) {
      await Template.create({
        poster: poster._id,
        creator: req.admin.id,
        title: title || `${category} Template`,
        description: description || "",
        category,
        tags: parsedTags,
        pricing: {
          price: parseFloat(templatePrice) || 0,
          currency: 'USD'
        },
        preview: {
          url: `${process.env.SERVER_URL}/uploads/processed/${path.basename(outputFilePath)}`,
          thumbnailUrl: `${process.env.SERVER_URL}/uploads/processed/${path.basename(outputFilePath)}`
        }
      });
    }

    res.status(201).json({ 
      message: "Poster uploaded and processed successfully", 
      poster: {
        ...poster.toObject(),
        imageUrl: processedImageUrl,
        originalUrl: posterImageUrl,
        thumbnailUrl: processedImageUrl
      }
    });
  } catch (error) {
    console.error("Upload poster error:", error);
    res.status(500).json({ 
      message: "Server error during upload", 
      error: error.message 
    });
  }
};

// 2. Generate posters for customer by category replacing placeholders with customer data
export const generatePostersForCustomerByCategory = async (req, res) => {
  try {
    const { category, customerId, posterId } = req.body;
    if (!category || !customerId) {
      return res
        .status(400)
        .json({ message: "Missing category or customerId" });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Use posterId to filter if provided, otherwise get all posters in category
    const query = { category };
    if (posterId) {
      query._id = posterId;
    }
    
    const posters = await Poster.find(query).sort({ createdAt: -1 });
    if (!posters.length) {
      return res
        .status(404)
        .json({ message: posterId ? "Poster not found" : "No posters found for this category" });
    }

    const outputFolder = path.join("uploads", "generated");
    ensureDirExists(outputFolder);

    const generatedPosters = [];

    for (const poster of posters) {
      try {
        if (
          !poster.originalImagePath ||
          !fs.existsSync(poster.originalImagePath)
        ) {
          console.error(`Original image missing: ${poster.originalImagePath}`);
          continue;
        }
        if (!Array.isArray(poster.placeholders)) {
          console.error(`Invalid placeholders for poster ID: ${poster._id}`);
          continue;
        }

        const imageMeta = await sharp(poster.originalImagePath).metadata();

        // Dynamic placeholder replacement mapping
        const placeholderMap = {
          "{companyname}": customer.companyName || "",
          "{whatsapp}": customer.whatsapp || "",
          "{website}": customer.website || "",
          "{logourl}": customer.logoUrl || "",
          "{name}": customer.name || "",
          "{email}": customer.email || "",
          "{phone}": customer.phone || "",
        };
        
        // Build SVG overlay
        const svgOverlay = `
          <svg width="${imageMeta.width}" height="${
          imageMeta.height
        }" xmlns="http://www.w3.org/2000/svg">
            ${poster.placeholders
              .map((ph) => {
                let text = ph.text || "";
                console.log(ph);
                // 👇 Normalize and replace placeholder
                const lowerText = text.toLowerCase();
                if (placeholderMap[lowerText]) {
                  text = placeholderMap[lowerText];
                }

                const style = ph.style || {};
                const fontFamily = style.fontFamily || "Arial";
                const fontSize = parseInt(style.fontSize) || 24;
                const color = style.color || "#000000";
                const fontWeight = style.fontWeight || "normal";
                const fontStyle = style.fontStyle || "normal";
                const safeText = String(text)
                  .replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;");
                return `<text x="${ph.x}" y="${ph.y}" font-family="${fontFamily}" font-size="${fontSize}" fill="${color}" font-weight="${fontWeight}" font-style="${fontStyle}">${safeText}</text>`;
              })
              .join("")}
          </svg>
        `;

        const fileName = `${customer._id}_${poster._id}.png`;
        const outputPath = path.join(outputFolder, fileName);

        // 📸 Composite image
        await sharp(poster.originalImagePath)
          .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
          .png()
          .toFile(outputPath);

        // 💾 Save in DB
        const saved = await GeneratedPoster.create({
          customer: customer._id,
          category,
          originalPosterId: poster._id,
          generatedImagePath: `uploads/generated/${fileName}`,
        });

        generatedPosters.push({
          _id: saved._id,
          imageUrl: `${process.env.BASE_URL}/uploads/generated/${fileName}`,
        });
      } catch (innerErr) {
        console.error(
          `Failed generating poster ${poster._id}:`,
          innerErr.message
        );
      }
    }

    res.json({ customerId: customer._id, category, posters: generatedPosters });
  } catch (error) {
    console.error("Poster generation error:", error);
    res.status(500).json({ message: "Generate failed", error: error.message });
  }
};

// 3. Download generated poster by ID
export const downloadPoster = async (req, res) => {
  try {
    const poster = await GeneratedPoster.findById(req.params.id);
    if (!poster) return res.status(404).send("Poster not found");

    const filePath = path.join(process.cwd(), poster.generatedImagePath);
    if (!fs.existsSync(filePath)) return res.status(404).send("File not found");

    res.download(filePath);
  } catch (error) {
    console.error("Download poster error:", error);
    res.status(500).json({ error: "Download failed" });
  }
};

// @desc    Get all posters for user
// @route   GET /api/posters
// @access  Private
export const getAllPosters = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search } = req.query;
    
    const query = { 
      user: req.admin.id, 
      isActive: true 
    };
    
    // Add category filter if provided
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [posters, total] = await Promise.all([
      Poster.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Poster.countDocuments(query)
    ]);
    
    // Add full URLs to posters
    const serverURL = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
    const postersWithUrls = posters.map(poster => ({
      ...poster,
      imageUrl: `${serverURL}/${poster.finalImagePath?.replace(/\\/g, '/') || poster.originalImagePath?.replace(/\\/g, '/')}`,
      originalUrl: `${serverURL}/${poster.originalImagePath?.replace(/\\/g, '/')}`
    }));
    
    res.json({
      posters: postersWithUrls,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error("Get all posters error:", error);
    res.status(500).json({ 
      message: "Failed to fetch posters", 
      error: error.message 
    });
  }
};

// @desc    Get poster by ID
// @route   GET /api/posters/:id
// @access  Private
export const getPosterById = async (req, res) => {
  try {
    const poster = await Poster.findOne({
      _id: req.params.id,
      user: req.admin.id
    });
    
    if (!poster) {
      return res.status(404).json({ message: "Poster not found" });
    }
    
    const serverURL = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
    
    res.json({
      ...poster.toObject(),
      imageUrl: `${serverURL}/${poster.finalImagePath?.replace(/\\/g, '/') || poster.originalImagePath?.replace(/\\/g, '/')}`,
      originalUrl: `${serverURL}/${poster.originalImagePath?.replace(/\\/g, '/')}`
    });
  } catch (error) {
    console.error("Get poster by ID error:", error);
    res.status(500).json({ 
      message: "Failed to fetch poster", 
      error: error.message 
    });
  }
};

// @desc    Delete poster
// @route   DELETE /api/posters/:id
// @access  Private
export const deletePoster = async (req, res) => {
  try {
    const poster = await Poster.findOne({
      _id: req.params.id,
      user: req.admin.id
    });
    
    if (!poster) {
      return res.status(404).json({ message: "Poster not found" });
    }
    
    // Soft delete - mark as inactive
    poster.isActive = false;
    await poster.save();
    
    // Optional: Delete physical files (uncomment if you want hard delete)
    /*
    try {
      if (poster.originalImagePath && fs.existsSync(poster.originalImagePath)) {
        fs.unlinkSync(poster.originalImagePath);
      }
      if (poster.finalImagePath && fs.existsSync(poster.finalImagePath)) {
        fs.unlinkSync(poster.finalImagePath);
      }
    } catch (fileError) {
      console.warn("Failed to delete poster files:", fileError.message);
    }
    */
    
    res.json({ message: "Poster deleted successfully" });
  } catch (error) {
    console.error("Delete poster error:", error);
    res.status(500).json({ 
      message: "Failed to delete poster", 
      error: error.message 
    });
  }
};
