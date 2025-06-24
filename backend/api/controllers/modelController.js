// Controller.js
import fs from 'fs';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Enhanced function to run Python scripts with better error handling
 * @param {string} scriptPath - Path to the Python script
 * @param {Array} args - Arguments to pass to the script
 * @param {number} timeout - Timeout in milliseconds (default: 2 minutes)
 * @returns {Promise} - Promise that resolves with the script output
 */
export function runPythonScript(scriptPath, args, timeout = 120000) {
  return new Promise((resolve, reject) => {
    console.log(` Running Python script: ${scriptPath} ${args.join(' ')}`);
    
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
      console.log(` STDOUT: ${output.trim()}`);
    });

    // Handle stderr
    process.stderr.on('data', (data) => {
      const error = data.toString();
      stderr += error;
      console.log(` STDERR: ${error.trim()}`);
    });

    // Handle process completion
    process.on('close', (code) => {
      if (isResolved) return;
      isResolved = true;
      
      console.log(` Process exited with code: ${code}`);
      
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
            console.log(e);
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
      console.error(` Process error: ${error.message}`);
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

/**
 * Clean up uploaded file
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
 * Get the path to the Detection.py script
 * @returns {string} - Path to the Detection.py script
 */
export function getDetectionScriptPath() {
  return path.join(__dirname, '../../../ai_model2/models/Detection.py');
}

/**
 * Test endpoint controller to verify Python script connectivity
 */
export const testPython = async (req, res) => {
  try {
    const scriptPath = getDetectionScriptPath();
    console.log(` Testing Python script at: ${scriptPath}`);
    
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
    console.error(' Python test failed:', error);
    return res.status(500).json({
      error: 'Python script test failed',
      details: error.message
    });
  }
};

/**
 * Image processing controller
 */
export const processSign = async (req, res) => {
  console.log(' IMAGE PROCESSING ENDPOINT HIT!');
  
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  console.log(` Processing image: ${req.file.filename} (${req.file.size} bytes)`);

  try {
    const scriptPath = getDetectionScriptPath();
    
    // Verify script exists
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Detection script not found at: ${scriptPath}`);
    }
    
    const args = ['--image', req.file.path];
    console.log(` Running detection with args: ${args.join(' ')}`);

    const jsonResult = await runPythonScript(scriptPath, args);
    
    // Clean up uploaded file
    cleanupFile(req.file.path);

    // Format response according to API expectations
    const response = {
      sign: jsonResult.action || jsonResult.sign || null,
      confidence: jsonResult.confidence || 0,
      success: true
    };

    console.log(` Image processing result:`, response);
    return res.json(response);

  } catch (error) {
    console.error(' Image processing error:', error);
    
    // Clean up uploaded file on error
    cleanupFile(req.file?.path);
    
    return res.status(500).json({
      error: 'Error processing image',
      details: error.message,
      success: false
    });
  }
};

/**
 * Video processing controller
 */
export const processVideo = async (req, res) => {
  console.log(' VIDEO PROCESSING ENDPOINT HIT!');
  
  if (!req.file) {
    return res.status(400).json({ error: 'No video file provided' });
  }

  console.log(` Processing video: ${req.file.filename} (${req.file.size} bytes)`);

  try {
    const scriptPath = getDetectionScriptPath();
    
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
    
    console.log(` Running detection with args: ${args.join(' ')}`);

    const jsonResult = await runPythonScript(scriptPath, args, 180000); // 3 minute timeout for videos
    
    // Clean up uploaded file
    cleanupFile(req.file.path);

    // Format response according to API expectations
    const response = {
      phrase: jsonResult.action || jsonResult.phrase || null,
      confidence: jsonResult.confidence || 0,
      success: true
    };

    console.log(` Video processing result:`, response);
    return res.json(response);

  } catch (error) {
    console.error(' Video processing error:', error);
    
    // Clean up uploaded file on error
    cleanupFile(req.file?.path);
    
    return res.status(500).json({
      error: 'Error processing video',
      details: error.message,
      success: false
    });
  }
};

/**
 * Health check controller
 */
export const healthCheck = (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};