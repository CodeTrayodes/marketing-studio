import { create } from 'zustand';
import { AGENTS } from '../data/agents';
import { INITIAL_ACTIVITY, NEW_ACTIVITY_TEMPLATES } from '../data/activity';
import { BUSINESS_UNITS } from '../data/agents';

const INITIAL_AGENT_STATES = {
  'agent-1a': { status: 'completed', progress: 100, currentTask: 'SWOT analysis complete — KPO Q3 planning', runsSinceStart: 5, tokensUsed: 284700 },
  'agent-1b': { status: 'running', progress: 67, currentTask: 'Building content pillar framework for Digital Transformation', runsSinceStart: 5, tokensUsed: 193400 },
  'agent-2a': { status: 'running', progress: 45, currentTask: 'Writing Email Sequence 2 — Dynamics Post-Demo', runsSinceStart: 5, tokensUsed: 421800 },
  'agent-2b': { status: 'completed', progress: 100, currentTask: 'All LinkedIn + Reddit posts complete for Q2 batch', runsSinceStart: 5, tokensUsed: 318200 },
  'agent-2c': { status: 'running', progress: 82, currentTask: 'Finalising KPO SEO Blog 4 of 5', runsSinceStart: 5, tokensUsed: 892400 },
  'agent-2d': { status: 'completed', progress: 100, currentTask: 'All podcast scripts delivered and approved', runsSinceStart: 5, tokensUsed: 284100 },
  'agent-2e': { status: 'queued', progress: 0, currentTask: 'Waiting for Strategy Agent approval before proceeding', runsSinceStart: 3, tokensUsed: 167300 },
  'agent-2g': { status: 'running', progress: 58, currentTask: 'Case Study revision — KPO Meridian Financial Group', runsSinceStart: 5, tokensUsed: 507900 },
  'agent-2h': { status: 'completed', progress: 100, currentTask: 'All repurposed assets generated for Q2 SEO blogs', runsSinceStart: 5, tokensUsed: 198400 },
  'agent-qa': { status: 'running', progress: 71, currentTask: 'Quality check batch — 14 assets in queue', runsSinceStart: 5, tokensUsed: 312700 },
  'agent-dist': { status: 'idle', progress: 0, currentTask: 'Awaiting Gate 3 approval to begin distribution', runsSinceStart: 4, tokensUsed: 87300 },
  'agent-perf': { status: 'running', progress: 33, currentTask: 'Syncing GA4 + LinkedIn data for Week 9 report', runsSinceStart: 9, tokensUsed: 241800 },
  'agent-optim': { status: 'idle', progress: 0, currentTask: 'Monitoring performance data — Q3 recommendations pending', runsSinceStart: 3, tokensUsed: 189200 },
};

let actIdCounter = 100;

function generateNewActivity() {
  const template = NEW_ACTIVITY_TEMPLATES[Math.floor(Math.random() * NEW_ACTIVITY_TEMPLATES.length)];
  const bu = BUSINESS_UNITS[Math.floor(Math.random() * BUSINESS_UNITS.length)];
  const quality = template.qualityRange
    ? Math.floor(Math.random() * (template.qualityRange[1] - template.qualityRange[0]) + template.qualityRange[0])
    : null;

  return {
    id: `act-${actIdCounter++}`,
    agentId: template.agentId,
    agentName: template.agentName,
    agentCode: template.agentCode,
    layer: template.layer,
    action: template.action,
    asset: template.assetTemplate(bu),
    bu: bu.name,
    buAbbr: bu.abbr,
    timestamp: new Date(),
    quality,
    status: template.status,
  };
}

export const useAgentStore = create((set, get) => ({
  agents: AGENTS,
  agentStates: INITIAL_AGENT_STATES,
  activityFeed: INITIAL_ACTIVITY,
  simulationRunning: true,
  totalAssetsThisSession: 247,
  systemHealth: 98.4,

  getAgentState: (id) => get().agentStates[id] || { status: 'idle', progress: 0, currentTask: 'No active task', runsSinceStart: 0, tokensUsed: 0 },

  tickSimulation: () => {
    set((state) => {
      const newStates = { ...state.agentStates };

      // Progress running agents
      Object.keys(newStates).forEach((id) => {
        const s = newStates[id];
        if (s.status === 'running') {
          const increment = Math.random() * 3 + 0.5;
          const newProgress = Math.min(s.progress + increment, 100);
          if (newProgress >= 100) {
            newStates[id] = { ...s, progress: 100, status: 'completed' };
          } else {
            newStates[id] = { ...s, progress: newProgress, tokensUsed: s.tokensUsed + Math.floor(Math.random() * 800 + 200) };
          }
        }
      });

      // Randomly restart completed agents
      const completedIds = Object.keys(newStates).filter((id) => newStates[id].status === 'completed');
      if (completedIds.length > 0 && Math.random() > 0.7) {
        const id = completedIds[Math.floor(Math.random() * completedIds.length)];
        const agent = AGENTS.find((a) => a.id === id);
        if (agent) {
          newStates[id] = {
            ...newStates[id],
            status: 'running',
            progress: 0,
            currentTask: `Processing next ${agent.name} batch`,
            runsSinceStart: newStates[id].runsSinceStart + 1,
          };
        }
      }

      // Add new activity every few ticks
      const shouldAddActivity = Math.random() > 0.6;
      const newFeed = shouldAddActivity
        ? [generateNewActivity(), ...state.activityFeed].slice(0, 50)
        : state.activityFeed;

      return {
        agentStates: newStates,
        activityFeed: newFeed,
        totalAssetsThisSession: state.totalAssetsThisSession + (shouldAddActivity ? 1 : 0),
        systemHealth: Math.min(99.9, Math.max(96.0, state.systemHealth + (Math.random() - 0.5) * 0.3)),
      };
    });
  },

  getRunningCount: () => Object.values(get().agentStates).filter((s) => s.status === 'running').length,
  getCompletedCount: () => Object.values(get().agentStates).filter((s) => s.status === 'completed').length,
  getErrorCount: () => Object.values(get().agentStates).filter((s) => s.status === 'error').length,
}));
