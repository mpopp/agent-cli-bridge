// server.js
import express from 'express';
import { exec } from 'child_process';
import crypto from 'crypto';
import {hostname} from 'os';

const app = express();
app.use(express.json());

// Einfache API-Key-Auth
const API_KEY = process.env.CLI_PROXY_API_KEY || crypto.randomUUID();
console.log(`🔑 API Key: ${API_KEY}`);

app.use((req, res, next) => {
  const key = req.headers['x-api-key'];
  if (key !== API_KEY) return res.status(401).json({ error: 'Unauthorized' });
  next();
});

// Hauptendpunkt: Befehl ausführen
app.post('/exec', (req, res) => {
  const { command, cwd, timeout } = req.body;

  if (!command) return res.status(400).json({ error: 'No command provided' });

  const options = {
    cwd: cwd || process.env.HOME,
    timeout: timeout || 30000,       // Default 30s Timeout
    maxBuffer: 1024 * 1024 * 10,     // 10 MB Output-Buffer
    shell: '/bin/bash',
  };

  console.log(`▶ Executing: ${command}`);

  exec(command, options, (error, stdout, stderr) => {
    res.json({
      exitCode: error ? error.code ?? 1 : 0,
      stdout: stdout.toString(),
      stderr: stderr.toString(),
    });
  });
});

// Health-Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', hostname: hostname() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`🖥️  CLI Proxy listening on http://127.0.0.1:${PORT}`);
});
