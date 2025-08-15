import fs from 'fs';
import axios from 'axios'; // You'll need to install axios: npm install axios
import FormData from 'form-data'; // You'll need to install form-data: npm install form-data


// --- Configuration for Flask Server ---
const FLASK_BASE_URL = 'https://tmkdt-handsup-model.hf.space'; // IMPORTANT: Change this to your Flask server's URL
// If Flask is running on a different machine or port, update this.
// For production, this should be an environment variable.

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
export const testPython = async ( res) => {
    try {
        console.log(` Testing Flask server at: ${FLASK_BASE_URL}/health`);
        const response = await axios.get(`${FLASK_BASE_URL}/health`, { timeout: 5000 }); // 5 second timeout

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
 * Image processing controller
 */
export const processSign = async (req, res) => {
    console.log(' IMAGE PROCESSING ENDPOINT HIT!');

    if (!req.file) {
        return res.status(400).json({ error: 'No image file provided', success: false });
    }

    console.log(` Processing image: ${req.file.filename} (${req.file.size} bytes)`);
    const filePath = req.file.path; // Multer saves the file to this path

    try {
        const formData = new FormData();
        formData.append('image', fs.createReadStream(filePath), {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        // Add min_confidence if you want to pass it for image processing as well
        if (req.body.min_confidence) {
            formData.append('min_confidence', req.body.min_confidence);
        }

        console.log(` Sending image to Flask for processing: ${FLASK_BASE_URL}/process-image`);
        const pythonResponse = await axios.post(`${FLASK_BASE_URL}/process-image`, formData, {
            headers: formData.getHeaders(),
            maxBodyLength: Infinity, // Important for large files
            maxContentLength: Infinity, // Important for large files
            timeout: 60000 // 60 second timeout for image processing
        });

        // Clean up uploaded file on Node.js side
        cleanupFile(filePath);

        // Flask response is expected to be in the format: { sign: "...", confidence: ..., success: true/false }
        console.log(` Image processing result from Flask:`, pythonResponse.data);
        return res.json(pythonResponse.data); // Forward Flask's response directly

    } catch (error) {
        console.error(' Image processing error:', error.message);

        // Clean up uploaded file on error
        cleanupFile(filePath);

        let errorMessage = 'Error processing image with AI server.';
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error(' Flask response data:', error.response.data);
            console.error(' Flask response status:', error.response.status);
            errorMessage = error.response.data.error || 'AI server returned an error.';
            return res.status(error.response.status).json({
                error: errorMessage,
                details: error.response.data.details || error.message,
                success: false
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error(' No response from Flask server:', error.request);
            errorMessage = 'No response from AI server. It might be down or timed out.';
            return res.status(504).json({ // Gateway Timeout
                error: errorMessage,
                details: error.message,
                success: false
            });
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error(' Axios request setup error:', error.message);
            return res.status(500).json({
                error: 'Failed to send request to AI server.',
                details: error.message,
                success: false
            });
        }
    }
};

/**
 * Video processing controller
 */
export const processVideo = async (req, res) => {
    console.log(' VIDEO PROCESSING ENDPOINT HIT!');

    // Multer places the file buffer in req.file.buffer when using memoryStorage()
    if (!req.file || !req.file.buffer) {
        return res.status(400).json({ error: 'No video file provided or file buffer missing', success: false });
    }

    console.log(` Processing video: ${req.file.originalname} (${req.file.size} bytes)`);
    // const filePath = req.file.path; // This will be undefined with memoryStorage()

    try {
        const formData = new FormData();
        // Append the file buffer directly to FormData
        // Use req.file.originalname for the filename in FormData
        // Use req.file.mimetype for the content type
        formData.append('video', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        // Add minimum confidence if provided by the client
        if (req.body.min_confidence) {
            const minConf = parseFloat(req.body.min_confidence);
            if (!isNaN(minConf) && minConf >= 0 && minConf <= 1) {
                formData.append('min_confidence', minConf.toString());
            }
        }

        console.log(` Sending video to Flask for processing: ${FLASK_BASE_URL}/process-video`);

        // Ensure you have an instance of the 'form-data' library if using Node.js,
        // as the native FormData in Node.js might not have getHeaders() directly.
        // Axios typically handles FormData correctly, but if getHeaders() is an issue,
        // you might need a wrapper like 'form-data'.
        const pythonResponse = await axios.post(`${FLASK_BASE_URL}/process-video`, formData, {
            headers: formData.getHeaders(), // This line assumes 'form-data' package or a compatible environment
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
            timeout: 180000 // 3 minute timeout for video processing
        });

        // No need to cleanupFile as it was never written to disk
        // cleanupFile(filePath);

        // Flask response is expected to be in the format: { phrase: "...", confidence: ..., success: true/false }
        console.log(` Video processing result from Flask:`, pythonResponse.data);
        return res.json(pythonResponse.data); // Forward Flask's response directly

    } catch (error) {
        console.error(' Video processing error:', error.message);

        // No need to cleanupFile on error either
        // cleanupFile(filePath);

        let errorMessage = 'Error processing video with AI server.';
        if (error.response) {
            console.error(' Flask response data:', error.response.data);
            console.error(' Flask response status:', error.response.status);
            errorMessage = error.response.data.error || 'AI server returned an error.';
            return res.status(error.response.status).json({
                error: errorMessage,
                details: error.response.data.details || error.message,
                success: false
            });
        } else if (error.request) {
            console.error(' No response from Flask server:', error.request);
            errorMessage = 'No response from AI server. It might be down or timed out.';
            return res.status(504).json({ // Gateway Timeout
                error: errorMessage,
                details: error.message,
                success: false
            });
        } else {
            console.error(' Axios request setup error:', error.message);
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
        // Add a note about Flask if you want
        message: "Node.js backend is healthy. AI processing handled by a separate Flask server."
    });
};