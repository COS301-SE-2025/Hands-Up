import { spawn } from 'child_process';

export async function processImage(req, res) {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).send('No files uploaded.');
    }
    const frames = files.map(file => file.buffer);

    const pythonProcess = spawn('python', ['../../ai_model/words_model/translateWordsScript.py']);

    const numFrames = Buffer.alloc(4);
    numFrames.writeUInt32LE(frames.length, 0);
    pythonProcess.stdin.write(numFrames);

    for (const frame of frames) {
      const length = Buffer.alloc(4);
      length.writeUInt32LE(frame.length, 0);
      pythonProcess.stdin.write(length);
      pythonProcess.stdin.write(frame);
    }

    pythonProcess.stdin.end(); 

    let output = '';
    pythonProcess.stdout.on('data', data => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', err => {
      console.error("Python stderr:", err.toString());
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python process exited with code ${code}`);
        if (!res.headersSent) {
          return res.status(500).send(`Prediction failed: Python script exited with error code ${code}`);
        }
        return; 
      }

      try {
        const parsed = JSON.parse(output.trim()); 
        if (!res.headersSent) {
          res.json(parsed);
        }
      } catch (jsonError) {
        console.error("Failed to parse JSON from Python script:", jsonError);
        console.error("Raw Python output:", output);
        if (!res.headersSent) {
          res.status(500).send('Failed to parse prediction result from Python.');
        }
      }
    });

    pythonProcess.on('error', (err) => {
      console.error("Failed to start Python process:", err);
      if (!res.headersSent) {
        res.status(500).send('Failed to start prediction service.');
      }
    });

  } catch (err) {
    console.error("Error in processImage:", err);
    if (!res.headersSent) {
      res.status(500).send('Prediction failed');
    }
  }
}

