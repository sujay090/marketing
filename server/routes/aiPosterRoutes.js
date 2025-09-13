import express from 'express';
import {
    generateAIPoster,
    getAIPromptSuggestions,
    enhancePosterWithAI,
    acceptAIPoster,
    rejectAIPoster,
    getPendingAIPosters,
    getGalleryPosters,
    deleteAIPoster,
    editAIPoster,
    getAIPosterById
} from '../controllers/aiPosterController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// AI Poster Generation Routes
router.post('/generate', generateAIPoster);
router.get('/suggestions', getAIPromptSuggestions);
router.post('/enhance', enhancePosterWithAI);

// AI Poster Management Routes
router.get('/pending', getPendingAIPosters);
router.get('/gallery', getGalleryPosters);
router.get('/:posterId', getAIPosterById);
router.put('/:posterId', editAIPoster);
router.put('/:posterId/accept', acceptAIPoster);
router.put('/:posterId/reject', rejectAIPoster);
router.delete('/:posterId', deleteAIPoster);

export default router;