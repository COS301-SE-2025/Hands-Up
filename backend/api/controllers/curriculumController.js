import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('CurriculumController loaded, __dirname:', __dirname);

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

      console.log(`Looking for landmarks for: "${letter}"`);
      
      const possibleFilenames = [
        `${letter.toLowerCase()}.json`,
        `${letter.toUpperCase()}.json`,
        `${letter}.json`
      ];

     
      const landmarksDir = path.join(__dirname, '../data/landmarks');
      console.log('Landmarks directory:', landmarksDir);
      
      if (!fs.existsSync(landmarksDir)) {
        console.error('Landmarks directory does not exist:', landmarksDir);
        
        const alternativePaths = [
          path.join(__dirname, '../data/curriculum/landmarks'),
          path.join(__dirname, '../../data/landmarks'),
          path.join(__dirname, '../../api/data/landmarks')
        ];
        
        let foundPath = null;
        for (const altPath of alternativePaths) {
          if (fs.existsSync(altPath)) {
            foundPath = altPath;
            console.log('Found alternative landmarks directory:', foundPath);
            break;
          }
        }
        
        if (!foundPath) {
          return res.status(404).json({
            success: false,
            message: 'Landmarks directory not found in any expected location',
            checkedPaths: [landmarksDir, ...alternativePaths]
          });
        }
        
        const finalLandmarksDir = foundPath;
      }

      const finalLandmarksDir = fs.existsSync(landmarksDir) ? landmarksDir : 
        path.join(__dirname, '../data/curriculum/landmarks');

      let landmarkData = null;
      let foundFilename = null;

      for (const filename of possibleFilenames) {
        const filePath = path.join(finalLandmarksDir, filename);
        console.log(`Checking for file: ${filePath}`);
        
        if (fs.existsSync(filePath)) {
          try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            landmarkData = JSON.parse(fileContent);
            foundFilename = filename;
            console.log(`Found landmarks in: ${filename}`);
            console.log('Landmark data type:', typeof landmarkData);
            console.log('Is array:', Array.isArray(landmarkData));
            console.log('Data keys:', Object.keys(landmarkData || {}));
            break;
          } catch (parseError) {
            console.error(`Error parsing JSON from ${filename}:`, parseError);
            continue;
          }
        }
      }

      if (!landmarkData) {
        try {
          const availableFiles = fs.readdirSync(finalLandmarksDir).filter(file => file.endsWith('.json'));
          console.log('Available JSON files:', availableFiles);
          
          return res.status(404).json({
            success: false,
            message: `No landmarks found for "${letter}". Available files: ${availableFiles.join(', ')}`,
            availableFiles: availableFiles,
            searchedPath: finalLandmarksDir,
            searchedFilenames: possibleFilenames
          });
        } catch (readError) {
          return res.status(404).json({
            success: false,
            message: `No landmarks found for "${letter}" and couldn't read directory`,
            searchedPath: finalLandmarksDir,
            error: readError.message
          });
        }
      }
      console.log('Returning landmark data structure:', {
        type: typeof landmarkData,
        isArray: Array.isArray(landmarkData),
        hasFrames: landmarkData && landmarkData.frames ? landmarkData.frames.length : 'no frames property',
        keys: Object.keys(landmarkData || {})
      });

      res.json({
        success: true,
        letter: letter,
        filename: foundFilename,
        landmarks: landmarkData,
        count: Array.isArray(landmarkData) ? landmarkData.length : 
               (landmarkData && landmarkData.frames ? landmarkData.frames.length : 1)
      });

    } catch (error) {
      console.error('Error getting landmarks:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching landmarks',
        error: error.message
      });
    }
  }

  static async getCurriculumStructure(req, res) {
    try {
      const possiblePaths = [
        path.join(__dirname, '../data/landmarks'),
        path.join(__dirname, '../data/curriculum/landmarks'),
        path.join(__dirname, '../../data/landmarks'),
        path.join(__dirname, '../../api/data/landmarks')
      ];
      
      let landmarksDir = null;
      
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          landmarksDir = possiblePath;
          break;
        }
      }
      
      if (!landmarksDir) {
        return res.status(404).json({
          success: false,
          message: 'Landmarks directory not found',
          checkedPaths: possiblePaths
        });
      }

      const files = fs.readdirSync(landmarksDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      const availableItems = jsonFiles.map(file => path.parse(file).name);

      res.json({
        success: true,
        structure: {
          landmarks: availableItems.sort(),
          total: availableItems.length,
          directory: landmarksDir
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
      const possiblePaths = [
        path.join(__dirname, '../data/landmarks'),
        path.join(__dirname, '../data/curriculum/landmarks'),
        path.join(__dirname, '../../data/landmarks'),
        path.join(__dirname, '../../api/data/landmarks')
      ];
      
      const existingPaths = possiblePaths.filter(p => fs.existsSync(p));
      
      res.json({
        success: true,
        message: 'Curriculum API is working',
        checkedPaths: possiblePaths,
        existingPaths: existingPaths,
        landmarksDirExists: existingPaths.length > 0
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Health check failed',
        error: error.message
      });
    }
  }
}

export default CurriculumController;