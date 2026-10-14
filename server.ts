import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Initialize Gemini client on the server side
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Helper to execute Python bridge command
function runPythonBridge(command: string, args: string[] = [], stdinData?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const bridgePath = path.join(__dirname, 'backend', 'bridge.py');
    const child = spawn('python3', [bridgePath, command, ...args]);

    let stdout = '';
    let stderr = '';

    if (stdinData !== undefined) {
      child.stdin.write(typeof stdinData === 'string' ? stdinData : JSON.stringify(stdinData));
      child.stdin.end();
    }

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Python bridge error (${code}): ${stderr || stdout}`));
      }
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (err) {
        reject(new Error(`Failed to parse Python bridge output: ${stdout}\nStderr: ${stderr}`));
      }
    });
  });
}

// ----------------- API ROUTES ----------------- //

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'SkillSense AI Full-Stack Platform',
    version: '1.0.0',
    port,
    ai_configured: !!process.env.GEMINI_API_KEY,
    database: 'SQLite Connected',
    ast_engine: 'Python 3.10 CPython AST Active',
  });
});

// Student Dashboard Data
app.get('/api/dashboard', async (req, res) => {
  try {
    const studentId = (req.query.student_id as string) || 'student-alex';
    const data = await runPythonBridge('get_dashboard', [studentId]);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Submissions List
app.get('/api/submissions', async (req, res) => {
  try {
    const data = await runPythonBridge('get_submissions');
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Submission Detail
app.get('/api/submissions/:id', async (req, res) => {
  try {
    const data = await runPythonBridge('get_submission', [req.params.id]);
    if (data.error) {
      return res.status(404).json(data);
    }
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Code Submission Execution & Analysis
app.post('/api/submissions', async (req, res) => {
  try {
    const { code, problem_id, student_id, language } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Source code is required.' });
    }

    const payload = {
      code,
      problem_id: problem_id || 'prob-even-sum',
      student_id: student_id || 'student-alex',
      language: language || 'python3',
    };

    const result = await runPythonBridge('submit_code', [], payload);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Live Code Analysis without persisting
app.post('/api/analysis/live', async (req, res) => {
  try {
    const { code } = req.body;
    const result = await runPythonBridge('live_analyze', [], { code: code || '' });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Skills and Radar Telemetry
app.get('/api/skills', async (req, res) => {
  try {
    const studentId = (req.query.student_id as string) || 'student-alex';
    const data = await runPythonBridge('get_skills', [studentId]);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Weakness Vectors
app.get('/api/weaknesses', async (req, res) => {
  try {
    const studentId = (req.query.student_id as string) || 'student-alex';
    const data = await runPythonBridge('get_skills', [studentId]);
    res.json({
      critical_weaknesses: data.critical_weaknesses,
      developing: data.developing,
      recurring_patterns: data.recurring_patterns,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Recommendations Queue
app.get('/api/recommendations', async (req, res) => {
  try {
    const studentId = (req.query.student_id as string) || 'student-alex';
    const data = await runPythonBridge('get_recommendations', [studentId]);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Complete Recommendation
app.post('/api/recommendations/:id/complete', async (req, res) => {
  try {
    const data = await runPythonBridge('complete_recommendation', [req.params.id]);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Problems List
app.get('/api/problems', async (req, res) => {
  try {
    const data = await runPythonBridge('get_problems');
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Progress History
app.get('/api/progress', async (req, res) => {
  try {
    const studentId = (req.query.student_id as string) || 'student-alex';
    const data = await runPythonBridge('get_progress', [studentId]);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Socratic AI Feedback
app.get('/api/feedback', async (req, res) => {
  try {
    const studentId = (req.query.student_id as string) || 'student-alex';
    const data = await runPythonBridge('get_feedback', [studentId]);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Generate AI Feedback via Gemini or Rule-based fallback
app.post('/api/feedback/generate', async (req, res) => {
  try {
    const { code, issue_description, concept, student_name } = req.body;

    if (ai) {
      try {
        const prompt = `You are the SkillSense Socratic Tutor. A student (${student_name || 'Alex'}) submitted Python code with an error.
Concept: ${concept || 'Loops & Iteration'}
Issue: ${issue_description || 'Off-by-one boundary error in range(len(numbers) + 1)'}
Student Code:
\`\`\`python
${code || 'for i in range(len(numbers) + 1): total += numbers[i]'}
\`\`\`

Generate a comprehensive pedagogical feedback JSON response matching this schema:
{
  "title": string,
  "concept": string,
  "what_went_wrong": string (detailed plain English diagnosis),
  "why_it_happened": string (explain the underlying cognitive misconception such as zero-based indexing vs cardinal counting),
  "mental_rules": [
    {"rule": string, "description": string}
  ],
  "side_by_side": {
    "flawed": string,
    "pythonic": string
  },
  "socratic_question": {
    "question": string,
    "options": [string, string, string],
    "correct_index": number (0-indexed),
    "explanation": string
  },
  "is_ai_generated": true
}`;

        const geminiRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = geminiRes.text;
        if (text) {
          const parsed = JSON.parse(text);
          return res.json({ feedback: parsed });
        }
      } catch (geminiError: any) {
        console.warn('Gemini generation fallback triggered:', geminiError.message);
      }
    }

    // Deterministic Rule-Based Fallback
    const fallbackData = await runPythonBridge('get_feedback', ['student-alex']);
    res.json({
      ...fallbackData,
      note: 'Rule-based educational feedback engine active.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mount Vite middleware in development
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`SkillSense AI server running on http://0.0.0.0:${port}`);
  });
}

startServer();
