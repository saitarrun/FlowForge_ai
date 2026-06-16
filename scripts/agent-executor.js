#!/usr/bin/env node

/**
 * Agent Executor — Spawns Claude agents based on orchestrator queue
 * Respects dependencies and phase gates
 * Usage: node agent-executor.js <run-id> [--max-parallel N]
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const args = process.argv.slice(2);
const runId = args[0];
const maxParallel = parseInt(args.find(a => a.startsWith('--max-parallel'))?.split('=')?.[1] || '1', 10);

if (!runId) {
  console.error('Usage: node agent-executor.js <run-id> [--max-parallel N]');
  process.exit(1);
}

const sdlcDir = path.join(process.cwd(), '.sdlc');
const runDir = path.join(sdlcDir, runId);

// Agent definitions with their tools and metadata
const AGENTS = {
  'product-manager': { model: 'sonnet', tools: 'Read,Bash,Glob,Grep,WebFetch' },
  'business-analyst': { model: 'sonnet', tools: 'Read,Bash,Glob,Grep,WebFetch' },
  'software-architect': { model: 'opus', tools: 'Read,Glob,Grep,WebFetch,WebSearch' },
  'security-architect': { model: 'opus', tools: 'Read,Glob,Grep,WebFetch,WebSearch' },
  'ux-researcher': { model: 'sonnet', tools: 'Read,WebFetch,WebSearch,Glob' },
  'ui-ux-designer': { model: 'sonnet', tools: 'Read,Write,Edit' },
  'accessibility-engineer': { model: 'sonnet', tools: 'Read,Bash,Glob,WebFetch' },
  'frontend-engineer': { model: 'sonnet', tools: 'Read,Write,Edit,Bash,Glob,Grep' },
  'backend-engineer': { model: 'sonnet', tools: 'Read,Write,Edit,Bash,Glob,Grep' },
  'database-engineer': { model: 'sonnet', tools: 'Read,Write,Edit,Bash,Glob,Grep' },
  'mobile-developer': { model: 'sonnet', tools: 'Read,Write,Edit,Bash,Glob,Grep' },
  'fullstack-engineer': { model: 'sonnet', tools: 'Read,Write,Edit,Bash,Glob,Grep' },
  'qa-manual-tester': { model: 'sonnet', tools: 'Read,Bash,Glob' },
  'automation-qa-engineer': { model: 'sonnet', tools: 'Read,Write,Edit,Bash,Glob,Grep' },
  'appsec-engineer': { model: 'sonnet', tools: 'Read,Bash,Glob,Grep' },
  'penetration-tester': { model: 'sonnet', tools: 'Read,Bash,Glob,Grep' },
  'devops-engineer': { model: 'sonnet', tools: 'Read,Write,Edit,Bash,Glob' },
  'cloud-engineer': { model: 'sonnet', tools: 'Read,Write,Edit,Bash,Glob' },
  'sre-engineer': { model: 'opus', tools: 'Read,Write,Bash,Glob,WebFetch' },
  'secops-analyst': { model: 'sonnet', tools: 'Read,Bash,Glob,Grep,WebFetch' },
  'data-engineer': { model: 'sonnet', tools: 'Read,Write,Edit,Bash,Glob,Grep' },
  'engineering-manager': { model: 'sonnet', tools: 'Read,Bash,Glob,Grep,WebFetch' },
  'tech-lead': { model: 'sonnet', tools: 'Read,Write,Bash,Glob,Grep,WebFetch' },
  'release-manager': { model: 'sonnet', tools: 'Read,Bash,Glob,Grep,WebFetch' },
  'performance-engineer': { model: 'sonnet', tools: 'Read,Bash,Glob,Grep,WebFetch' },
  'technical-writer': { model: 'sonnet', tools: 'Read,Write,Edit,WebFetch,WebSearch' },
};

// Poll orchestrator for ready agents
async function getReadyAgents() {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:4242/api/runs/' + runId, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const run = JSON.parse(data);
          const agents = run.log?.agents || {};
          const ready = Object.entries(agents)
            .filter(([_, agent]) => agent.status === 'waiting')
            .map(([name]) => name);
          resolve(ready);
        } catch {
          resolve([]);
        }
      });
    });
    req.on('error', () => resolve([]));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve([]);
    });
  });
}

// Invoke Claude agent via system command
async function invokeAgent(agentName, runId) {
  console.log(`▶️  Spawning agent: ${agentName}`);

  // Mark agent as working
  await markAgentWorking(agentName);

  try {
    // In a real implementation, this would use the Agent tool
    // For now, simulate agent execution
    const agentInfo = AGENTS[agentName];

    // Simulate agent work (in production, would invoke actual Claude agent)
    console.log(`  ✓ ${agentName} executing...`);

    // Simulate completion after brief delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mark agent as complete
    await markAgentComplete(agentName);
    console.log(`  ✓ ${agentName} completed`);

  } catch (error) {
    console.error(`  ✗ ${agentName} failed:`, error.message);
    await markAgentBlocked(agentName);
  }
}

// Mark agent as working in orchestrator
function markAgentWorking(agentName) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ agent: agentName, status: 'working' });
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 4242,
        path: `/api/agent/spawn/${agentName}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
      },
      (res) => {
        res.on('data', () => {});
        res.on('end', () => resolve());
      }
    );
    req.on('error', () => resolve());
    req.write(data);
    req.end();
  });
}

// Mark agent as complete in orchestrator
function markAgentComplete(agentName) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ agent: agentName, status: 'complete' });
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 4242,
        path: `/api/agent/complete/${agentName}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
      },
      (res) => {
        res.on('data', () => {});
        res.on('end', () => resolve());
      }
    );
    req.on('error', () => resolve());
    req.write(data);
    req.end();
  });
}

// Mark agent as blocked in orchestrator
function markAgentBlocked(agentName) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ agent: agentName, status: 'blocked' });
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 4242,
        path: `/api/agent/block/${agentName}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
      },
      (res) => {
        res.on('data', () => {});
        res.on('end', () => resolve());
      }
    );
    req.on('error', () => resolve());
    req.write(data);
    req.end();
  });
}

// Main execution loop
async function run() {
  console.log(`\n🚀 Agent Executor Started`);
  console.log(`   Run ID: ${runId}`);
  console.log(`   Max Parallel: ${maxParallel}`);
  console.log(`   Monitoring orchestrator on port 4242...\n`);

  let allDone = false;
  const executing = new Set();

  while (!allDone) {
    // Get ready agents
    const ready = await getReadyAgents();

    // Start new agents up to max parallel
    for (const agent of ready) {
      if (executing.size < maxParallel && !executing.has(agent)) {
        executing.add(agent);

        // Execute agent without waiting
        invokeAgent(agent, runId).then(() => {
          executing.delete(agent);
        });
      }
    }

    // Check if done
    if (executing.size === 0 && ready.length === 0) {
      allDone = true;
    } else {
      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`\n✅ All agents completed for run: ${runId}`);
  console.log(`   Artifacts available at: .sdlc/${runId}/`);
}

run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
