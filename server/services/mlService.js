import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const mlService = {
  /**
   * Executes the Python PyTorch & OpenCV AI screening pipeline on the image
   * @param {string} imagePath - Absolute path to uploaded mouth image
   * @returns {Promise<Object>}
   */
  async analyzeOralImage(imagePath) {
    if (process.env.GEMINI_API_KEY) {
      try {
        return await analyzeWithGemini(imagePath);
      } catch (error) {
        console.error('[Vision Provider] Gemini inference failed:', error.message);
        if (process.env.NODE_ENV === 'production') {
          return { success: false, error: 'The configured vision model is unavailable. Please try again later.' };
        }
      }
    }
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_LOCAL_DEMO_MODEL !== 'true') {
      return { success: false, error: 'No production vision provider configured. Set GEMINI_API_KEY before enabling screening.' };
    }
    return new Promise((resolve) => {
      const scriptPath = path.resolve(__dirname, '../ml_pipeline.py');
      const pythonCommand = process.env.PYTHON_BIN || (process.platform === 'win32' ? 'python.exe' : 'python3');
      let pythonProcess;

      try {
        pythonProcess = spawn(pythonCommand, [scriptPath, imagePath], { windowsHide: true });
      } catch (error) {
        console.error('[ML Service Spawn Error]:', error);
        return resolve({
          success: false,
          error: `Unable to start the local vision model (${error.code || 'process error'}). Configure PYTHON_BIN or run the backend with permission to launch Python.`
        });
      }

      let stdoutData = '';
      let stderrData = '';

      pythonProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      pythonProcess.on('error', (error) => {
        console.error('[ML Service Process Error]:', error);
        resolve({
          success: false,
          error: `Unable to start the local vision model (${error.code || 'process error'}). Configure PYTHON_BIN or run the backend with permission to launch Python.`
        });
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`[ML Service Error] Code ${code}:`, stderrData);
          // Return graceful fallback rather than crash
          return resolve({
            success: false,
            error: stderrData || 'Inference script execution failed.'
          });
        }

        try {
          const parsed = JSON.parse(stdoutData.trim());
          resolve(parsed);
        } catch (e) {
          console.error(`[ML Service Parse Error]:`, stdoutData);
          resolve({
            success: false,
            error: 'Failed to parse AI model output.'
          });
        }
      });
    });
  }
};

async function analyzeWithGemini(imagePath) {
  const image = await fs.readFile(imagePath);
  const mimeType = imagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const prompt = `You are an image triage assistant for oral-health screening. This is NOT a diagnosis.
Assess only visible image quality and whether a visible oral lesion warrants professional review. Never claim cancer.
Return JSON only with keys: is_oral_cavity (boolean), risk_score (integer 0-100), risk_level (Low Risk|Moderate Risk|High Risk), anatomical_zone (string), clinical_rationale (string), biomarkers (object with margin_irregularity, erythema_index, keratosis, lesion_density), confidence (number 0-1).
If this is not a clear human oral-cavity photo, set is_oral_cavity false and explain why.`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: image.toString('base64') } }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.1 }
    })
  });
  if (!response.ok) throw new Error(`Gemini HTTP ${response.status}`);
  const payload = await response.json();
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned no structured result');
  const result = JSON.parse(text);
  return { success: true, ...result, model: `${model} (Gemini)` };
}
