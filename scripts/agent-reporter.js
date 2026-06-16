#!/usr/bin/env node

/**
 * Agent Reporter — Status update client for Claude agents
 * Agents call this to report their status to the orchestrator
 * Usage: node agent-reporter.js <agent-name> <status> [message]
 * Example: node agent-reporter.js product-manager working "Gathering requirements"
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

function reportStatus(agentName, status, message = '') {
  const host = process.env.ORCHESTRATOR_HOST || '127.0.0.1';
  const port = process.env.ORCHESTRATOR_PORT || 4242;

  // Map status names to endpoint paths
  const statusMap = {
    spawn: 'spawn',
    working: 'spawn', // working is same as spawn (marks as working)
    complete: 'complete',
    block: 'block',
    blocked: 'block', // alias
    fail: 'block', // alias
  };

  const endpoint = statusMap[status.toLowerCase()];
  if (!endpoint) {
    console.error(`✗ Unknown status: ${status}`);
    console.error(
      `   Valid options: spawn, working, complete, block, blocked, fail`,
    );
    process.exit(1);
  }

  const data = JSON.stringify({
    agent: agentName,
    status: status,
    message: message,
    timestamp: new Date().toISOString(),
  });

  const options = {
    hostname: host,
    port: port,
    path: `/api/agent/${endpoint}/${agentName}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✓ [${agentName}] Status: ${status}`);
          if (message) console.log(`  Message: ${message}`);
          resolve({ ok: true, status: res.statusCode });
        } else {
          console.warn(
            `✗ [${agentName}] Failed to report status: ${res.statusCode}`,
          );
          resolve({ ok: false, status: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`✗ [${agentName}] Connection error: ${error.message}`);
      console.error(
        '  (Make sure orchestrator is running: npm run orchestrator)',
      );
      resolve({ ok: false, error: error.message });
    });

    req.write(data);
    req.end();
  });
}

// CLI usage
const agentName = process.argv[2];
const status = process.argv[3];
const message = process.argv.slice(4).join(' ');

if (!agentName || !status) {
  console.log('Usage: node agent-reporter.js <agent-name> <status> [message]');
  console.log('');
  console.log('Status options: spawn | complete | block | working');
  console.log('');
  console.log('Examples:');
  console.log(
    '  node agent-reporter.js product-manager working "Gathering requirements"',
  );
  console.log('  node agent-reporter.js product-manager complete');
  console.log('  node agent-reporter.js backend-engineer block "Awaiting API schema"');
  process.exit(1);
}

reportStatus(agentName, status, message).then((result) => {
  process.exit(result.ok ? 0 : 1);
});
