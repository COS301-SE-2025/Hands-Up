import { Router } from 'express';
import { learningProgress, loginUser, signUpUser, getUserData, uniqueUsername, uniqueEmail, updateUserDetails, updateUserPassword } from './controllers/dbController.js';
import multer from 'multer';
import fs from 'fs';
import crypto from 'crypto';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage setup to preserve original file extension
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = crypto.randomBytes(16).toString("hex") + ext;
    cb(null, uniqueName);
  }
});

// Configure multer with file size limits and file type validation
const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log(`📁 File upload: ${file.originalname}, mimetype: ${file.mimetype}`);
    
    if (file.fieldname === 'image') {
      // Accept image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for image processing'), false);
      }
    } else if (file.fieldname === 'video') {
      // Accept video files
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only video files are allowed for video processing'), false);
      }
    } else {
      cb(new Error('Unexpected field name'), false);
    }
  }
});

const router = Router();

// Logger middleware
router.use((req, res, next) => {
  console.log(`📡 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.file) {
    console.log(`📎 File: ${req.file.originalname} (${req.file.size} bytes)`);
  }
  next();
});

// Routes
router.get("/learning/progress/:username", learningProgress);
router.put("/learning/progress/:username", learningProgress);
router.post("/auth/signup", signUpUser);
router.post("/auth/login", loginUser);
router.get("/user/:id", getUserData);
router.get("/auth/unique-username/:username", uniqueUsername);
router.get("/auth/unique-email/:email", uniqueEmail);
router.put('/user/:id/details', updateUserDetails);
router.put('/user/:id/password', updateUserPassword);

// 🔧 Enhanced function to run Python scripts with better error handling
function runPythonScript(scriptPath, args, timeout = 120000) { // 2 minute timeout
  return new Promise((resolve, reject) => {
    console.log(`🐍 Running Python script: ${scriptPath} ${args.join(' ')}`);
    
    const process = spawn('python', [scriptPath, ...args], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: timeout
    });

    let stdout = '';
    let stderr = '';
    let isResolved = false;

    // Handle stdout
    process.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      console.log(`🐍 STDOUT: ${output.trim()}`);
    });

    // Handle stderr
    process.stderr.on('data', (data) => {
      const error = data.toString();
      stderr += error;
      console.log(`🐍 STDERR: ${error.trim()}`);
    });

    // Handle process completion
    process.on('close', (code) => {
      if (isResolved) return;
      isResolved = true;
      
      console.log(`🐍 Process exited with code: ${code}`);
      
      if (code !== 0) {
        reject(new Error(`Python script failed with code ${code}. STDERR: ${stderr.trim()}`));
      } else {
        // Try to extract JSON from stdout
        const lines = stdout.trim().split('\n');
        let jsonResult = null;
        
        // Look for JSON in the last few lines
        for (let i = lines.length - 1; i >= Math.max(0, lines.length - 5); i--) {
          try {
            const line = lines[i].trim();
            if (line.startsWith('{') && line.endsWith('}')) {
              jsonResult = JSON.parse(line);
              break;
            }
          } catch (e) {
            continue;
          }
        }
        
        if (jsonResult) {
          resolve(jsonResult);
        } else {
          reject(new Error(`No valid JSON found in output. STDOUT: ${stdout.trim()}`));
        }
      }
    });

    // Handle process errors
    process.on('error', (error) => {
      if (isResolved) return;
      isResolved = true;
      console.error(`🐍 Process error: ${error.message}`);
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });

    // Handle timeout
    setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        process.kill('SIGKILL');
        reject(new Error('Python script timed out'));
      }
    }, timeout);
  });
}

// 🧪 Test endpoint to verify Python script connectivity
router.get('/test-python', async (req, res) => {
  try {
    const scriptPath = path.join(__dirname, '../../ai_model/notebook/Detection.py');
    console.log(`🧪 Testing Python script at: ${scriptPath}`);
    
    // Check if script exists
    if (!fs.existsSync(scriptPath)) {
      return res.status(404).json({ 
        error: 'Python script not found',
        path: scriptPath 
      });
    }
    
    const result = await runPythonScript(scriptPath, ['--test']);
    return res.json({
      success: true,
      result: result,
      message: 'Python script is working correctly'
    });
    
  } catch (error) {
    console.error('🧪 Python test failed:', error);
    return res.status(500).json({
      error: 'Python script test failed',
      details: error.message
    });
  }
});

// 📸 Image processing endpoint
router.post('/process-sign', upload.single('image'), async (req, res) => {
  console.log('📸 IMAGE PROCESSING ENDPOINT HIT!');
  
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  console.log(`📸 Processing image: ${req.file.filename} (${req.file.size} bytes)`);

  try {
    const scriptPath = path.join(__dirname, '../../ai_model/notebook/Detection.py');
    
    // Verify script exists
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Detection script not found at: ${scriptPath}`);
    }
    
    const args = ['--image', req.file.path];
    console.log(`📸 Running detection with args: ${args.join(' ')}`);

    const jsonResult = await runPythonScript(scriptPath, args);
    
    // Clean up uploaded file
    try {
      fs.unlinkSync(req.file.path);
      console.log(`📸 Cleaned up file: ${req.file.path}`);
    } catch (cleanupError) {
      console.warn(`📸 Could not clean up file: ${cleanupError.message}`);
    }

    // Format response according to API expectations
    const response = {
      sign: jsonResult.action || jsonResult.sign || null,
      confidence: jsonResult.confidence || 0,
      success: true
    };

    console.log(`📸 Image processing result:`, response);
    return res.json(response);

  } catch (error) {
    console.error('📸 Image processing error:', error);
    
    // Clean up uploaded file on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log(`📸 Cleaned up file after error: ${req.file.path}`);
      } catch (cleanupError) {
        console.warn(`📸 Could not clean up file after error: ${cleanupError.message}`);
      }
    }
    
    return res.status(500).json({
      error: 'Error processing image',
      details: error.message,
      success: false
    });
  }
});

// 🎞️ Video processing endpoint
router.post('/process-video', upload.single('video'), async (req, res) => {
  console.log('🎥 VIDEO PROCESSING ENDPOINT HIT!');
  
  if (!req.file) {
    return res.status(400).json({ error: 'No video file provided' });
  }

  console.log(`🎥 Processing video: ${req.file.filename} (${req.file.size} bytes)`);

  try {
    const scriptPath = path.join(__dirname, '../../ai_model/notebook/Detection.py');
    
    // Verify script exists
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Detection script not found at: ${scriptPath}`);
    }
    
    const args = ['--video', req.file.path];
    
    // Add minimum confidence if provided
    if (req.body.min_confidence) {
      const minConf = parseFloat(req.body.min_confidence);
      if (!isNaN(minConf) && minConf >= 0 && minConf <= 1) {
        args.push('--min_confidence', minConf.toString());
      }
    }
    
    console.log(`🎥 Running detection with args: ${args.join(' ')}`);

    const jsonResult = await runPythonScript(scriptPath, args, 180000); // 3 minute timeout for videos
    
    // Clean up uploaded file
    try {
      fs.unlinkSync(req.file.path);
      console.log(`🎥 Cleaned up file: ${req.file.path}`);
    } catch (cleanupError) {
      console.warn(`🎥 Could not clean up file: ${cleanupError.message}`);
    }

    // Format response according to API expectations
    const response = {
      phrase: jsonResult.action || jsonResult.phrase || null,
      confidence: jsonResult.confidence || 0,
      success: true
    };

    console.log(`🎥 Video processing result:`, response);
    return res.json(response);

  } catch (error) {
    console.error('🎥 Video processing error:', error);
    
    // Clean up uploaded file on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log(`🎥 Cleaned up file after error: ${req.file.path}`);
      } catch (cleanupError) {
        console.warn(`🎥 Could not clean up file after error: ${cleanupError.message}`);
      }
    }
    
    return res.status(500).json({
      error: 'Error processing video',
      details: error.message,
      success: false
    });
  }
});

// 🔍 Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware for multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        details: 'Maximum file size is 50MB'
      });
    }
    return res.status(400).json({
      error: 'File upload error',
      details: error.message
    });
  }
  
  if (error.message.includes('Only image files') || error.message.includes('Only video files')) {
    return res.status(400).json({
      error: 'Invalid file type',
      details: error.message
    });
  }
  
  next(error);
});

export default router;