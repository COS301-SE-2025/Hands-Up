import fs from 'fs';
import axios from 'axios'; 
import FormData from 'form-data'; 

// --- Configuration for Flask Server ---
const FLASK_BASE_URL = 'http://localhost:6000'; 

/**
 * Clean up uploaded file (still needed on Node.js side if using Multer)
 * @param {string} filePath - Path to the file to clean up
 */
export function cleanupFile(filePath) {
    try {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(` Cleaned up file: ${filePath}`);
        }
    } catch (cleanupError) {
        console.warn(` Could not clean up file: ${cleanupError.message}`);
    }
}

/**
 * Test endpoint controller to verify Python Flask server connectivity
 */
export const testPython = async (res) => {
    try {
        console.log(` Testing Flask server at: ${FLASK_BASE_URL}/health`);
        const response = await axios.get(`${FLASK_BASE_URL}/health`, { timeout: 5000 }); 

        return res.json({
            success: true,
            message: 'Flask AI server is reachable and healthy',
            flaskStatus: response.data
        });

    } catch (error) {
        console.error(' Flask server test failed:', error.message);
        let errorMessage = 'Failed to connect to Flask AI server.';
        if (error.code === 'ECONNREFUSED') {
            errorMessage = 'Flask AI server is not running or not accessible. Make sure your Flask app is started.';
        } else if (error.code === 'ETIMEDOUT') {
            errorMessage = 'Connection to Flask AI server timed out.';
        }
        return res.status(500).json({
            error: errorMessage,
            details: error.message,
            success: false
        });
    }
};

/**
 * Image and Video processing controller (single endpoint for both)
 * @param {object} req - The request object. Expects an array of image files as `frames`.
 * @param {object} res - The response object.
 * @param {string} mode - The mode for the model ('fingerspelling' or 'words').
 */
export const processSignOrVideo = async (req, res, mode) => {
    console.log(`Processing in '${mode}' mode.`);

    const files = req.files;
    if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files provided', success: false });
    }

    try {
        const formData = new FormData();

        // Append the mode to the form data
        formData.append('mode', mode);

        // Append all received files to the form data
        files.forEach(file => {
            // Multer's memory storage provides the file as a buffer
            formData.append('frames', file.buffer, {
                filename: file.originalname,
                contentType: file.mimetype,
            });
        });

        // Add min_confidence if you want to pass it
        if (req.body.min_confidence) {
            formData.append('min_confidence', req.body.min_confidence);
        }

        console.log(`Sending frames to Flask for processing: ${FLASK_BASE_URL}/sign/process-sign`);
        const pythonResponse = await axios.post(`${FLASK_BASE_URL}/sign/process-sign`, formData, {
            headers: formData.getHeaders(),
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
            timeout: 180000 // A longer timeout for video processing
        });

        console.log(`AI processing result from Flask:`, pythonResponse.data);
        return res.json(pythonResponse.data);

    } catch (error) {
        console.error('AI processing error:', error.message);
        let errorMessage = 'Error processing with AI server.';
        if (error.response) {
            console.error('Flask response data:', error.response.data);
            console.error('Flask response status:', error.response.status);
            errorMessage = error.response.data.error || 'AI server returned an error.';
            return res.status(error.response.status).json({
                error: errorMessage,
                details: error.response.data.details || error.message,
                success: false
            });
        } else if (error.request) {
            console.error('No response from Flask server:', error.request);
            errorMessage = 'No response from AI server. It might be down or timed out.';
            return res.status(504).json({
                error: errorMessage,
                details: error.message,
                success: false
            });
        } else {
            console.error('Axios request setup error:', error.message);
            return res.status(500).json({
                error: 'Failed to send request to AI server.',
                details: error.message,
                success: false
            });
        }
    }
};

/**
 * Health check controller (remains the same)
 */
export const healthCheck = (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        message: "Node.js backend is healthy. AI processing handled by a separate Flask server."
    });
};

// These two functions are now placeholders, as processSignOrVideo replaces their functionality.
export const processSign = async (req, res) => {
    console.log('Using consolidated processSignOrVideo for processSign route.');
    req.files = [req.file]; // Wrap single file in an array for the new function
    processSignOrVideo(req, res, 'fingerspelling');
};

export const processVideo = async (req, res) => {
    console.log('Using consolidated processSignOrVideo for processVideo route.');
    // The front-end needs to be updated to send frames for words, not a single video file.
    return res.status(501).json({ error: "Video processing is now frame-based. Please update the client." });
};