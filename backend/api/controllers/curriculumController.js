import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LANDMARKS_DIR = path.join(__dirname, '../data/curriculum/landmarks');
console.log('CurriculumController loaded, looking for landmarks in:', LANDMARKS_DIR);

class CurriculumController {

  static async getLandmarks(req, res) {
    try {
      const { letter } = req.params;
      if (!letter) {
        return res.status(400).json({
          success: false,
          message: 'Letter/word parameter is required'
        });
      }

      if (!fs.existsSync(LANDMARKS_DIR)) {
        return res.status(404).json({
          success: false,
          message: 'Landmarks directory not found',
          checkedPath: LANDMARKS_DIR
        });
      }

      const possibleFilenames = [
        `${letter.toLowerCase()}.json`,
        `${letter.toUpperCase()}.json`,
        `${letter}.json`
      ];

      let landmarkData = null;
      let foundFilename = null;

      for (const filename of possibleFilenames) {
        const filePath = path.join(LANDMARKS_DIR, filename);
        if (fs.existsSync(filePath)) {
          try {
            landmarkData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            foundFilename = filename;
            break;
          } catch (err) {
            console.error('Error parsing JSON:', err);
          }
        }
      }

      if (!landmarkData) {
        const availableFiles = fs.existsSync(LANDMARKS_DIR) 
          ? fs.readdirSync(LANDMARKS_DIR).filter(f => f.endsWith('.json')) 
          : [];
        return res.status(404).json({
          success: false,
          message: `No landmarks found for "${letter}". Available files: ${availableFiles.join(', ')}`,
          availableFiles
        });
      }

      res.json({
        success: true,
        letter,
        filename: foundFilename,
        landmarks: landmarkData,
        count: Array.isArray(landmarkData) 
          ? landmarkData.length 
          : (landmarkData.frames ? landmarkData.frames.length : 1),
        directory: LANDMARKS_DIR
      });

    } catch (error) {
      console.error('Error in getLandmarks:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching landmarks',
        error: error.message
      });
    }
  }

  static async listLandmarks(req, res) {
    try {
      if (!fs.existsSync(LANDMARKS_DIR)) {
        return res.status(404).json({
          success: false,
          message: 'Landmarks directory not found',
          checkedPath: LANDMARKS_DIR
        });
      }

      const files = fs.readdirSync(LANDMARKS_DIR)
        .filter(f => f.endsWith('.json'))
        .map(file => {
          const stats = fs.statSync(path.join(LANDMARKS_DIR, file));
          return {
            name: path.parse(file).name,
            filename: file,
            size: stats.size,
            modified: stats.mtime
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

      res.json({
        success: true,
        total: files.length,
        landmarks: files,
        directory: LANDMARKS_DIR
      });

    } catch (error) {
      console.error('Error listing landmarks:', error);
      res.status(500).json({
        success: false,
        message: 'Error listing landmarks',
        error: error.message
      });
    }
  }

  static async getCurriculumStructure(req, res) {
    try {
      if (!fs.existsSync(LANDMARKS_DIR)) {
        return res.status(404).json({
          success: false,
          message: 'Landmarks directory not found',
          checkedPath: LANDMARKS_DIR
        });
      }

      const jsonFiles = fs.readdirSync(LANDMARKS_DIR).filter(f => f.endsWith('.json'));
      const landmarks = jsonFiles.map(f => path.parse(f).name).sort();

      res.json({
        success: true,
        structure: {
          landmarks,
          total: landmarks.length,
          directory: LANDMARKS_DIR
        }
      });

    } catch (error) {
      console.error('Error getting curriculum structure:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching curriculum structure',
        error: error.message
      });
    }
  }

  static async healthCheck(req, res) {
    try {
      const exists = fs.existsSync(LANDMARKS_DIR);
      const files = exists ? fs.readdirSync(LANDMARKS_DIR).filter(f => f.endsWith('.json')) : [];
      res.json({
        success: true,
        message: 'Curriculum API is working',
        timestamp: new Date().toISOString(),
        landmarksDir: LANDMARKS_DIR,
        exists,
        landmarkFilesFound: files.length,
        files
      });
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({
        success: false,
        message: 'Health check failed',
        error: error.message
      });
    }
  }

}

export default CurriculumController;
