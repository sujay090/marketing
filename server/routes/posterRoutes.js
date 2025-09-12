import express from 'express';
import { upload, handleMulterError } from '../middlewares/s3Upload.js';
import {
  uploadPoster,
  generatePostersForCustomerByCategory,
  downloadPoster,
  getAllPosters,
  getPosterById,
  deletePoster
} from '../controllers/posterController.js';
import { verifyAdminToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Upload poster template
router.post('/upload', verifyAdminToken, upload.single('posters'), handleMulterError, uploadPoster);

// Generate customized posters for customers
router.post('/generate', verifyAdminToken, generatePostersForCustomerByCategory);

// Get all posters for user
router.get('/', verifyAdminToken, getAllPosters);

// Get single poster by ID
router.get('/:id', verifyAdminToken, getPosterById);

// Download generated poster
router.get('/download/:id', downloadPoster);

// Delete poster
router.delete('/:id', verifyAdminToken, deletePoster);

export default router;
