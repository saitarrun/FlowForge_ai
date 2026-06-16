#!/usr/bin/env node

/**
 * Phase Agent Spawner
 * Spawns agents for a specific phase based on orchestrator queue
 * Usage: node spawn-phase-agents.js <phase> <run-id>
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const phase = process.argv[2];
const runId = process.argv[3];

if (!phase || !runId) {
  console.error('Usage: node spawn-phase-agents.js <phase> <run-id>');
  console.error('Phases: plan, design, dev, test, deploy, ops');
  process.exit(1);
}

// Agent assignments by phase
const PHASE_AGENTS = {
  'plan': ['product-manager', 'business-analyst', 'software-architect', 'security-architect'],
  'design': ['ux-researcher', 'ui-ux-designer', 'accessibility-engineer'],
  'dev': ['frontend-engineer', 'backend-engineer', 'database-engineer', 'mobile-developer', 'fullstack-engineer'],
  'test': ['qa-manual-tester', 'automation-qa-engineer', 'appsec-engineer', 'penetration-tester'],
  'deploy': ['devops-engineer', 'cloud-engineer', 'sre-engineer'],
  'ops': ['secops-analyst', 'data-engineer', 'engineering-manager', 'tech-lead', 'release-manager', 'performance-engineer', 'technical-writer'],
};

const agents = PHASE_AGENTS[phase];
if (!agents) {
  console.error(`Unknown phase: ${phase}`);
  process.exit(1);
}

console.log(`\n📋 Phase Agent Spawner`);
console.log(`   Phase: ${phase.toUpperCase()}`);
console.log(`   Run ID: ${runId}`);
console.log(`   Agents: ${agents.length}`);
console.log(`   Starting orchestrator coordination...\n`);

// Get orchestrator status
async function getRunStatus() {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:4242/api/runs/${runId}`, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(2000, () => { req.destroy(); resolve(null); });
  });
}

// Report agent status
async function reportAgentStatus(agentName, status) {
  return new Promise((resolve) => {
    const endpoint = status === 'working' ? 'spawn' : status === 'complete' ? 'complete' : 'block';
    const data = JSON.stringify({ agent: agentName, status, timestamp: new Date().toISOString() });

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 4242,
        path: `/api/agent/${endpoint}/${agentName}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
      },
      (res) => {
        res.on('data', () => {});
        res.on('end', () => resolve(true));
      }
    );
    req.on('error', () => resolve(false));
    req.write(data);
    req.end();
  });
}

// Main orchestration loop
async function orchestrate() {
  let completed = new Set();
  let executing = new Set();
  let allReady = false;

  while (!allReady) {
    const status = await getRunStatus();
    if (!status) {
      console.error('❌ Failed to connect to orchestrator at http://127.0.0.1:4242');
      process.exit(1);
    }

    const agentStates = status.log?.agents || {};

    // Find agents that are ready to spawn (waiting status)
    const readyToSpawn = agents.filter(agent => {
      const state = agentStates[agent];
      return state && state.status === 'waiting' && !executing.has(agent);
    });

    // Spawn ready agents
    for (const agent of readyToSpawn) {
      if (!executing.has(agent) && !completed.has(agent)) {
        executing.add(agent);
        await reportAgentStatus(agent, 'working');
        console.log(`▶️  Spawned: ${agent}`);

        // In a real implementation, this would use the Agent() tool
        // For now, simulate completion after a delay
        setTimeout(async () => {
          executing.delete(agent);
          completed.add(agent);
          await reportAgentStatus(agent, 'complete');
          console.log(`✅ Completed: ${agent}`);
        }, 2000);
      }
    }

    // Check if all agents for this phase are complete
    const phaseComplete = agents.every(agent => completed.has(agent));
    if (phaseComplete && executing.size === 0 && readyToSpawn.length === 0) {
      allReady = true;
    } else {
      // Poll every 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`\n✅ Phase ${phase.toUpperCase()} Complete!`);
  console.log(`   All ${agents.length} agents executed`);
  console.log(`   Run: ${runId}`);
  console.log(`   Artifacts: .sdlc/${runId}/\n`);
}

orchestrate().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
