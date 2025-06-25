import fs from 'fs';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

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
        const lines = stdout.trim().split('\n');
        let jsonResult = null;
        
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

    process.on('error', (error) => {
      if (isResolved) return;
      isResolved = true;
      console.error(` Process error: ${error.message}`);
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });

    setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        process.kill('SIGKILL');
        reject(new Error('Python script timed out'));
      }
    }, timeout);
  });
}