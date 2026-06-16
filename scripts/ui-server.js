#!/usr/bin/env node

/**
 * SDLC Dashboard HTTP Server
 * Serves agent run metrics and artifacts from .sdlc/ directory
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Parse CLI args
let projectDir = process.cwd();
let port = 4242;

for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--dir' && i + 1 < process.argv.length) {
    projectDir = path.resolve(process.argv[++i]);
  } else if (process.argv[i] === '--port' && i + 1 < process.argv.length) {
    port = parseInt(process.argv[++i], 10);
  }
}

const sdlcDir = path.join(projectDir, '.sdlc');

// Helper: list all run-* directories
function listRuns() {
  if (!fs.existsSync(sdlcDir)) {
    return [];
  }
  const entries = fs.readdirSync(sdlcDir, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && e.name.startsWith('run-'))
    .map((e) => e.name)
    .sort()
    .reverse(); // newest first
}

// Helper: get run status from collaboration-log
function getRunStatus(runDir) {
  const logFile = path.join(sdlcDir, runDir, 'collaboration-log.json');
  if (!fs.existsSync(logFile)) {
    return 'unknown';
  }
  try {
    const log = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    const agents = log.agents || {};
    const statuses = Object.values(agents).map((a) => a.status || 'waiting');

    if (statuses.some((s) => s === 'working')) {
      return 'running';
    }
    if (statuses.some((s) => s === 'blocked')) {
      return 'blocked';
    }
    if (statuses.every((s) => s === 'complete')) {
      return 'complete';
    }
    return 'waiting';
  } catch {
    return 'error';
  }
}

// Helper: extract started timestamp from run-YYYYMMDDTHHMMSS
function getRunStartTime(runDir) {
  const match = runDir.match(/run-(\d{8}T\d{6})/);
  if (!match) return null;
  const isoStr = match[1].replace('T', '');
  // Convert YYYYMMDDHHMMSS to ISO-like format for display
  const [, y, m, d, h, min, s] = isoStr.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
  return new Date(`${y}-${m}-${d}T${h}:${min}:${s}Z`).toISOString();
}

// Helper: count complete agents
function getCompletedAgents(runDir) {
  const logFile = path.join(sdlcDir, runDir, 'collaboration-log.json');
  if (!fs.existsSync(logFile)) {
    return [0, 0];
  }
  try {
    const log = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    const agents = Object.values(log.agents || {});
    const complete = agents.filter((a) => a.status === 'complete').length;
    return [complete, agents.length];
  } catch {
    return [0, 0];
  }
}

// API: GET /api/runs
function handleApiRuns(res) {
  const runs = listRuns();
  const summary = runs.map((runDir) => {
    const status = getRunStatus(runDir);
    const startedAt = getRunStartTime(runDir);
    const [completed, total] = getCompletedAgents(runDir);
    return {
      id: runDir,
      startedAt,
      status,
      agents: { completed, total },
    };
  });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(summary, null, 2));
}

// API: GET /api/runs/:runId
function handleApiRun(runId, res) {
  const runDir = path.join(sdlcDir, runId);
  if (!fs.existsSync(runDir)) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Run not found' }));
    return;
  }

  const contextFile = path.join(runDir, 'context.json');
  const logFile = path.join(runDir, 'collaboration-log.json');

  let context = null;
  let log = null;

  if (fs.existsSync(contextFile)) {
    try {
      context = JSON.parse(fs.readFileSync(contextFile, 'utf8'));
    } catch {
      /* ignore parse errors */
    }
  }

  if (fs.existsSync(logFile)) {
    try {
      log = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    } catch {
      /* ignore parse errors */
    }
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ context, log }, null, 2));
}

// API: GET /api/runs/:runId/artifacts
function handleApiArtifacts(runId, res) {
  const runDir = path.join(sdlcDir, runId);
  if (!fs.existsSync(runDir)) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Run not found' }));
    return;
  }

  try {
    const files = fs
      .readdirSync(runDir)
      .filter(
        (f) =>
          !f.startsWith('.') &&
          fs.statSync(path.join(runDir, f)).isFile() &&
          !['context.json', 'collaboration-log.json'].includes(f),
      );

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(files, null, 2));
  } catch {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to list artifacts' }));
  }
}

// API: GET /api/runs/:runId/artifacts/:file
function handleApiArtifactFile(runId, fileName, res) {
  const filePath = path.join(sdlcDir, runId, fileName);

  // Security: prevent directory traversal
  if (!filePath.startsWith(path.join(sdlcDir, runId))) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Access denied' }));
    return;
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'File not found' }));
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(content);
  } catch {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to read file' }));
  }
}

// HTTP request handler
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (pathname === '/' && req.method === 'GET') {
    const uiFile = path.join(__dirname, 'ui', 'index.html');
    if (fs.existsSync(uiFile)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(uiFile, 'utf8'));
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('UI file not found');
    }
    return;
  }

  if (pathname === '/api/runs' && req.method === 'GET') {
    handleApiRuns(res);
    return;
  }

  const apiRunMatch = pathname.match(/^\/api\/runs\/([^/]+)$/);
  if (apiRunMatch) {
    handleApiRun(apiRunMatch[1], res);
    return;
  }

  const apiArtifactsMatch = pathname.match(/^\/api\/runs\/([^/]+)\/artifacts$/);
  if (apiArtifactsMatch) {
    handleApiArtifacts(apiArtifactsMatch[1], res);
    return;
  }

  const apiArtifactFileMatch = pathname.match(/^\/api\/runs\/([^/]+)\/artifacts\/([^/]+)$/);
  if (apiArtifactFileMatch) {
    handleApiArtifactFile(apiArtifactFileMatch[1], apiArtifactFileMatch[2], res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

// Graceful shutdown handling (for process manager lifecycle)
function gracefulShutdown(signal) {
  if (process.env.SDLC_LIFECYCLE === 'managed') {
    console.log(`\n[Dashboard] Received ${signal}, shutting down gracefully...`);

    // Close connections
    server.close(() => {
      console.log('[Dashboard] Server closed');
      process.exit(0);
    });

    // Force shutdown after 5 seconds
    setTimeout(() => {
      console.warn('[Dashboard] Forcing shutdown...');
      process.exit(1);
    }, 5000);
  }
}

// Signal handlers (only active when managed by process manager)
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

server.listen(port, '127.0.0.1', () => {
  const uiUrl = `http://127.0.0.1:${port}`;
  console.log(`\n📊 SDLC Dashboard running at ${uiUrl}`);
  console.log(`📁 Scanning: ${projectDir}`);

  if (process.env.SDLC_LIFECYCLE === 'managed') {
    console.log('[Dashboard] Managed by Process Manager\n');
  } else {
    console.log(`\nPress Ctrl+C to stop.\n`);
  }
});

// Handle startup errors
server.on('error', (err) => {
  console.error(`\n❌ Dashboard error: ${err.message}`);
  process.exit(1);
});
