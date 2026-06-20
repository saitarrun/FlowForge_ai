#!/usr/bin/env node

/**
 * Uninstall SDLC Workflow Plugin
 * Removes the agents, skills, and commands that install-local.js copied
 * into ~/.claude/. Only the plugin's own files are removed.
 */

const fs = require('fs');
const path = require('path');

const PLUGIN_DIR = path.join(__dirname, '..');
const CLAUDE_HOME = path.join(process.env.HOME || process.env.USERPROFILE, '.claude');

console.log('🧹 Uninstalling FlowForge_AI Plugin...\n');

function removePath(target, label) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
    console.log(`✓ Removed ${label}`);
  } else {
    console.log(`• Skipped ${label} (not installed)`);
  }
}

// Agents and commands live in their own plugin subdirectory.
removePath(path.join(CLAUDE_HOME, 'agents', 'flowforge_ai'), 'agents/flowforge_ai');
removePath(path.join(CLAUDE_HOME, 'commands', 'flowforge_ai'), 'commands/flowforge_ai');

// Skills are copied individually into ~/.claude/skills; remove only ours.
const skillsSrc = path.join(PLUGIN_DIR, 'skills');
if (fs.existsSync(skillsSrc)) {
  fs.readdirSync(skillsSrc)
    .filter((entry) => fs.statSync(path.join(skillsSrc, entry)).isDirectory())
    .forEach((skill) => {
      removePath(path.join(CLAUDE_HOME, 'skills', skill), `skills/${skill}`);
    });
}

console.log('\n✅ FlowForge_AI plugin uninstalled.');
console.log('Restart Claude Code to deactivate the plugin.');
