import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

// Configure Multer to store in memory
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});

// @desc    Upload file and extract text
// @route   POST /api/upload
// @access  Private
const uploadFile = async (req, res) => {
    try {
        console.log("Received upload request");
        if (!req.file) {
            console.log("No file part");
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log("File details:", {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        const buffer = req.file.buffer;
        const mimetype = req.file.mimetype;
        let extractedText = "";

        if (mimetype === 'application/pdf') {
            const data = await pdf(buffer);
            extractedText = data.text;
        } else if (mimetype === 'text/plain') {
            extractedText = buffer.toString('utf8');
        } else {
            // Future: Add Image OCR here
            return res.status(400).json({ message: 'Only PDF and Text files are supported currently.' });
        }

        // Clean up text (remove excessive whitespace)
        extractedText = extractedText.replace(/\s+/g, ' ').trim();

        if (!extractedText) {
            return res.status(400).json({ message: 'Could not extract text from file.' });
        }

        res.json({
            message: 'File processed successfully',
            text: extractedText,
            filename: req.file.originalname
        });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: 'File processing failed: ' + error.message });
    }
};

export { upload, uploadFile };
