#!/usr/bin/env node

/**
 * Dashboard Initializer
 * Called when agents start — ensures orchestrator is running and dashboard is open
 * Usage: node init-dashboard.js [--dir /path/to/project] [--port 4242]
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const ProcessManager = require('./process-manager');

let projectDir = process.cwd();
let port = process.env.SDLC_PORT || 4242;
let host = process.env.SDLC_HOST || '127.0.0.1';
let useProcessManager = process.env.SDLC_LIFECYCLE !== 'managed'; // Use manager unless we're already managed

for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--dir' && i + 1 < process.argv.length) {
    projectDir = path.resolve(process.argv[++i]);
  } else if (process.argv[i] === '--port' && i + 1 < process.argv.length) {
    port = parseInt(process.argv[++i], 10);
  }
}

// Check if orchestrator is running
function checkOrchestratorRunning() {
  return new Promise((resolve) => {
    const req = http.get(`http://${host}:${port}/api/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Start orchestrator and dashboard via process manager (LIFECYCLE-AWARE)
function startViaProcessManager() {
  return new Promise((resolve) => {
    console.log('📊 Starting SDLC Workflow via Process Manager...');
    console.log('⚠️  When this terminal closes, dashboard will also terminate\n');

    const manager = new ProcessManager(projectDir, port);

    // Start the manager
    manager.start().then(() => {
      resolve(true);
    }).catch((err) => {
      console.error('Error starting process manager:', err.message);
      resolve(false);
    });

    // Keep the process manager running
    // It will handle all lifecycle management
  });
}

// Start orchestrator in background (LEGACY - when manager not used)
function startOrchestrator() {
  return new Promise((resolve) => {
    console.log(`🚀 Starting orchestrator on ${host}:${port}...`);

    const orchestratorScript = path.join(__dirname, 'orchestrator.js');
    const child = spawn('node', [
      orchestratorScript,
      '--dir', projectDir,
      '--port', port.toString(),
    ], {
      detached: true,
      stdio: 'ignore',
      env: {
        ...process.env,
        SDLC_HOST: host,
        SDLC_PORT: port.toString(),
      },
    });

    // Detach parent process
    child.unref();

    // Wait for orchestrator to be ready
    const maxRetries = 10;
    let retries = 0;

    const checkReady = setInterval(async () => {
      retries++;
      const isRunning = await checkOrchestratorRunning();

      if (isRunning) {
        clearInterval(checkReady);
        console.log('✓ Orchestrator ready');
        resolve(true);
      } else if (retries >= maxRetries) {
        clearInterval(checkReady);
        console.warn('⚠ Orchestrator startup timeout');
        resolve(false);
      }
    }, 500);
  });
}

// Open dashboard in default browser
function openDashboard() {
  const dashboardUrl = `http://${host}:${port}`;

  // Detect OS and open browser
  const { platform } = process;
  let command;

  switch (platform) {
    case 'darwin':
      command = `open "${dashboardUrl}"`;
      break;
    case 'win32':
      command = `start "${dashboardUrl}"`;
      break;
    default:
      command = `xdg-open "${dashboardUrl}"`;
  }

  // Try to open browser silently
  const { exec } = require('child_process');
  exec(command, (err) => {
    if (!err) {
      console.log(`🌐 Dashboard opened: ${dashboardUrl}`);
    } else {
      console.log(`🔗 View dashboard at: ${dashboardUrl}`);
    }
  });
}

// Main initialization
async function init() {
  if (useProcessManager) {
    // Use new process manager for proper lifecycle management
    // This ensures dashboard terminates when orchestrator dies
    await startViaProcessManager();
  } else {
    // Legacy mode: detached processes (for backwards compatibility)
    // Check if orchestrator already running
    const isRunning = await checkOrchestratorRunning();

    if (!isRunning) {
      await startOrchestrator();
    } else {
      console.log('✓ Orchestrator already running');
    }

    // Open dashboard
    openDashboard();

    // Set environment variables for child processes
    process.env.ORCHESTRATOR_HOST = host;
    process.env.ORCHESTRATOR_PORT = port.toString();

    console.log('\n📊 Dashboard synced. Agents will report status in real-time.\n');
  }
}

init().catch((err) => {
  console.error('Error initializing dashboard:', err);
  process.exit(1);
});
