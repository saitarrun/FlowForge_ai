#!/usr/bin/env node

/**
 * Process Manager for SDLC Workflow
 * Manages orchestrator and dashboard lifecycle
 * When parent process terminates, all child processes terminate
 * When child processes die, all related processes shutdown
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

class ProcessManager {
  constructor(projectDir, port = 4242) {
    this.projectDir = projectDir;
    this.port = port;
    this.orchestratorProcess = null;
    this.dashboardProcess = null;
    this.isShuttingDown = false;
    this.healthCheckInterval = null;

    // Setup signal handlers for graceful shutdown
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('SIGINT', () => this.shutdown('SIGINT'));
    process.on('exit', () => this.cleanup());

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('🚨 Uncaught Exception:', err.message);
      this.shutdown('uncaughtException');
    });
  }

  /**
   * Start orchestrator process
   */
  startOrchestrator() {
    return new Promise((resolve) => {
      console.log(`🚀 Starting Orchestrator on port ${this.port}...`);

      const orchestratorScript = path.join(__dirname, 'orchestrator.js');

      // Spawn orchestrator as child process (NOT detached)
      this.orchestratorProcess = spawn('node', [
        orchestratorScript,
        '--dir', this.projectDir,
        '--port', this.port.toString(),
      ], {
        stdio: ['ignore', 'pipe', 'pipe'], // Allow capturing output
        env: {
          ...process.env,
          SDLC_LIFECYCLE: 'managed', // Signal to orchestrator it's managed
          SDLC_PORT: this.port.toString(),
        },
      });

      // Log orchestrator output
      this.orchestratorProcess.stdout?.on('data', (data) => {
        console.log(`[Orchestrator] ${data.toString().trim()}`);
      });

      this.orchestratorProcess.stderr?.on('data', (data) => {
        console.error(`[Orchestrator Error] ${data.toString().trim()}`);
      });

      // Handle orchestrator exit
      this.orchestratorProcess.on('exit', (code, signal) => {
        console.log(`⚠️  Orchestrator exited with code ${code}, signal ${signal}`);
        this.orchestratorProcess = null;

        if (!this.isShuttingDown) {
          console.log('🛑 Orchestrator died unexpectedly. Shutting down dashboard...');
          this.shutdown('orchestrator-death');
        }
      });

      // Handle orchestrator errors
      this.orchestratorProcess.on('error', (err) => {
        console.error('❌ Failed to start orchestrator:', err.message);
        resolve(false);
      });

      // Wait for orchestrator to be ready
      this.waitForHealthCheck(resolve, 'orchestrator');
    });
  }

  /**
   * Start dashboard process
   */
  startDashboard() {
    return new Promise((resolve) => {
      console.log(`🌐 Starting Dashboard on port ${this.port}...`);

      const uiScript = path.join(__dirname, 'ui-server.js');

      // Spawn dashboard as child process (NOT detached)
      this.dashboardProcess = spawn('node', [
        uiScript,
        '--dir', this.projectDir,
        '--port', this.port.toString(),
      ], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          SDLC_LIFECYCLE: 'managed',
          SDLC_PORT: this.port.toString(),
        },
      });

      // Log dashboard output
      this.dashboardProcess.stdout?.on('data', (data) => {
        console.log(`[Dashboard] ${data.toString().trim()}`);
      });

      this.dashboardProcess.stderr?.on('data', (data) => {
        console.error(`[Dashboard Error] ${data.toString().trim()}`);
      });

      // Handle dashboard exit
      this.dashboardProcess.on('exit', (code, signal) => {
        console.log(`⚠️  Dashboard exited with code ${code}, signal ${signal}`);
        this.dashboardProcess = null;

        if (!this.isShuttingDown) {
          console.log('🛑 Dashboard died unexpectedly. Shutting down orchestrator...');
          this.shutdown('dashboard-death');
        }
      });

      // Handle dashboard errors
      this.dashboardProcess.on('error', (err) => {
        console.error('❌ Failed to start dashboard:', err.message);
        resolve(false);
      });

      // Wait for dashboard to be ready
      this.waitForHealthCheck(resolve, 'dashboard');
    });
  }

  /**
   * Wait for service health check
   */
  waitForHealthCheck(callback, service) {
    const maxRetries = 15;
    let retries = 0;

    const check = setInterval(() => {
      retries++;
      const req = http.get(`http://127.0.0.1:${this.port}/api/health`, (res) => {
        if (res.statusCode === 200) {
          clearInterval(check);
          console.log(`✓ ${service} ready`);
          callback(true);
        }
      });

      req.on('error', () => {
        if (retries >= maxRetries) {
          clearInterval(check);
          console.warn(`⚠️  ${service} startup timeout`);
          callback(false);
        }
      });

      req.setTimeout(1000, () => {
        req.destroy();
      });
    }, 500);
  }

  /**
   * Start monitoring both processes
   */
  startHealthMonitoring() {
    this.healthCheckInterval = setInterval(() => {
      if (!this.isShuttingDown) {
        // Check if orchestrator is still alive
        if (this.orchestratorProcess && this.orchestratorProcess.killed) {
          console.error('🚨 Orchestrator process killed. Initiating shutdown...');
          this.shutdown('orchestrator-killed');
        }

        // Check if dashboard is still alive
        if (this.dashboardProcess && this.dashboardProcess.killed) {
          console.error('🚨 Dashboard process killed. Initiating shutdown...');
          this.shutdown('dashboard-killed');
        }
      }
    }, 2000);
  }

  /**
   * Graceful shutdown of all processes
   */
  shutdown(reason) {
    if (this.isShuttingDown) return; // Prevent multiple shutdown attempts
    this.isShuttingDown = true;

    console.log(`\n🛑 Shutting down due to: ${reason}\n`);

    // Clear health check interval
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Kill child processes
    const killPromises = [];

    if (this.orchestratorProcess && !this.orchestratorProcess.killed) {
      console.log('⏳ Terminating Orchestrator...');
      killPromises.push(this.killProcess(this.orchestratorProcess, 'Orchestrator'));
    }

    if (this.dashboardProcess && !this.dashboardProcess.killed) {
      console.log('⏳ Terminating Dashboard...');
      killPromises.push(this.killProcess(this.dashboardProcess, 'Dashboard'));
    }

    Promise.all(killPromises).then(() => {
      console.log('✓ All processes terminated gracefully');
      process.exit(0);
    }).catch(() => {
      console.warn('⚠️  Some processes required forced termination');
      process.exit(1);
    });
  }

  /**
   * Kill a process gracefully with timeout
   */
  killProcess(childProcess, name) {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.warn(`⚠️  Force killing ${name} after graceful timeout...`);
        childProcess.kill('SIGKILL');
        resolve();
      }, 3000);

      childProcess.on('exit', () => {
        clearTimeout(timeout);
        resolve();
      });

      // Send SIGTERM first (graceful shutdown)
      childProcess.kill('SIGTERM');
    });
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Force kill any remaining processes
    if (this.orchestratorProcess && !this.orchestratorProcess.killed) {
      this.orchestratorProcess.kill('SIGKILL');
    }

    if (this.dashboardProcess && !this.dashboardProcess.killed) {
      this.dashboardProcess.kill('SIGKILL');
    }
  }

  /**
   * Start both services
   */
  async start() {
    try {
      console.log('📊 SDLC Workflow Manager Starting\n');
      console.log('═'.repeat(60));
      console.log('When this terminal closes, all services will terminate');
      console.log('Press Ctrl+C to gracefully shutdown all services');
      console.log('═'.repeat(60) + '\n');

      // Start orchestrator first
      const orchestratorOk = await this.startOrchestrator();
      if (!orchestratorOk) {
        console.error('❌ Failed to start orchestrator');
        this.shutdown('orchestrator-startup-failed');
        return;
      }

      // Start dashboard
      const dashboardOk = await this.startDashboard();
      if (!dashboardOk) {
        console.error('❌ Failed to start dashboard');
        this.shutdown('dashboard-startup-failed');
        return;
      }

      // Start health monitoring
      this.startHealthMonitoring();

      console.log('\n✨ SDLC Workflow fully initialized');
      console.log(`🌐 Dashboard: http://127.0.0.1:${this.port}`);
      console.log('\n📝 Agents will report status in real-time\n');
      console.log('═'.repeat(60) + '\n');
    } catch (err) {
      console.error('Fatal error:', err.message);
      this.shutdown('fatal-error');
    }
  }
}

// Parse command line arguments
let projectDir = process.cwd();
let port = 4242;

for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--dir' && i + 1 < process.argv.length) {
    projectDir = path.resolve(process.argv[++i]);
  } else if (process.argv[i] === '--port' && i + 1 < process.argv.length) {
    port = parseInt(process.argv[++i], 10);
  }
}

// Start the process manager
const manager = new ProcessManager(projectDir, port);
manager.start().catch((err) => {
  console.error('Failed to start process manager:', err.message);
  process.exit(1);
});

module.exports = ProcessManager;
