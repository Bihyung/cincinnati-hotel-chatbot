import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import Document from '../models/Document.js';
import embeddingService from '../services/embeddingService.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are allowed'));
    }
  }
});

// Chunk text with overlap
function chunkText(text, chunkSize = 500, overlap = 50) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  return chunks;
}

// Upload PDF endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract text
    let text;
    if (req.file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(req.file.buffer);
      text = pdfData.text;
    } else {
      text = req.file.buffer.toString('utf-8');
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Document is empty or could not be parsed' });
    }

    // Chunk the text
    const textChunks = chunkText(text);
    console.log(`[Upload] Created ${textChunks.length} chunks`);

    // Generate embeddings for all chunks
    console.log('[Upload] Generating embeddings...');
    const embeddings = await Promise.all(
      textChunks.map(chunk => embeddingService.generateEmbedding(chunk))
    );

    // Deactivate previous documents
    await Document.updateMany({ active: true }, { active: false });

    // Save new document
    const document = new Document({
      filename: req.file.originalname,
      chunks: textChunks.map((text, i) => ({
        text,
        embedding: embeddings[i]
      })),
      active: true
    });

    await document.save();

    console.log('[Upload] Document saved successfully');
    res.json({
      success: true,
      filename: req.file.originalname,
      chunks: textChunks.length
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to process document',
      details: error.message 
    });
  }
});

// Get current document status
router.get('/status', async (req, res) => {
  try {
    const document = await Document.findOne({ active: true });
    
    if (!document) {
      return res.json({ 
        hasDocument: false,
        embeddingReady: embeddingService.isReady()
      });
    }

    res.json({
      hasDocument: true,
      filename: document.filename,
      chunks: document.chunks.length,
      uploadedAt: document.uploadedAt,
      embeddingReady: embeddingService.isReady()
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ error: 'Failed to get document status' });
  }
});

export default router;
