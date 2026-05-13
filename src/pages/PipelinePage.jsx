import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Background, Controls,
  Handle, Position, MarkerType,
  useNodesState, useEdgesState,
} from 'reactflow';
import { useAgentStore } from '../store/useAgentStore';
import { useAppStore, ROLES } from '../store/useAppStore';
import { useGateStore } from '../store/useGateStore';
import { useContentStore } from '../store/useContentStore';
import { AGENTS } from '../data/agents';
import { cn } from '../lib/utils';
import { useSLATimer } from '../hooks/useSLATimer';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Clock, Database, Cpu, CheckCircle, CheckCircle2,
  Lock, AlertTriangle, Users, ChevronRight,
} from 'lucide-react';

// ─── Layer config ─────────────────────────────────────────────────────────────

const LAYER_COLORS = {
  1: { hex: '#2563EB', label: 'Campaign Intelligence' },
  2: { hex: '#16A34A', label: 'Content Production' },
  3: { hex: '#7C3AED', label: 'Distribution' },
  4: { hex: '#0891B2', label: 'Analytics & Optimisation' },
};

const STATUS_DOT = {
  running:   'bg-brand-green animate-pulse',
  idle:      'bg-gray-400',
  queued:    'bg-blue-400',
  completed: 'bg-blue-500',
  error:     'bg-red-500 animate-pulse',
};

// ─── AgentNode ────────────────────────────────────────────────────────────────

function AgentNode({ data }) {
  const { agent, state, isSelected } = data;
  const status = state?.status || 'idle';
  const lc = LAYER_COLORS[agent.layer];

  return (
    <div
      className={cn(
        'bg-white dark:bg-dark-card rounded shadow-card transition-all duration-200 select-none',
        'border border-border dark:border-dark-border',
        isSelected && 'ring-2 ring-offset-1 shadow-lg',
      )}
      style={{
        width: 180,
        borderLeft: `3px solid ${lc.hex}`,
        '--tw-ring-color': lc.hex,
      }}
    >
      {/* Top row */}
      <div className="flex items-center gap-1.5 px-2.5 pt-2.5 pb-1">
        <div
          className="w-5 h-5 rounded-[4px] flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0"
          style={{ backgroundColor: lc.hex }}
        >
          {agent.code}
        </div>
        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0 ml-auto', STATUS_DOT[status] || 'bg-gray-400')} />
      </div>

      {/* Name + role */}
      <div className="px-2.5 pb-2.5">
        <p className="text-[12px] font-medium text-ink dark:text-white leading-tight mb-0.5">{agent.name}</p>
        <p className="text-[10px] text-ink-muted dark:text-gray-400 leading-snug line-clamp-2">
          {state?.currentTask || agent.description}
        </p>

        {/* Progress bar if running */}
        {status === 'running' && (
          <div className="mt-1.5">
            <div className="flex justify-between mb-0.5">
              <span className="text-[8px] text-ink-faint dark:text-gray-500">Progress</span>
              <span className="text-[8px] font-mono text-brand-green">{Math.round(state?.progress || 0)}%</span>
            </div>
            <div className="w-full h-px bg-border dark:bg-dark-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${state?.progress || 0}%`, backgroundColor: lc.hex }}
              />
            </div>
          </div>
        )}

        {/* Bottom row stats */}
        <div className="flex items-center gap-2 mt-1.5">
          {(state?.runsSinceStart ?? 0) > 0 && (
            <span className="text-[8px] text-ink-faint dark:text-gray-500 font-mono">
              {state.runsSinceStart}× runs
            </span>
          )}
          {(state?.tokensUsed ?? 0) > 0 && (
            <span className="text-[8px] text-ink-faint dark:text-gray-500 font-mono">
              {(state.tokensUsed / 1000).toFixed(0)}k tok
            </span>
          )}
        </div>
      </div>

      <Handle type="target" position={Position.Left}
        style={{ background: lc.hex, width: 7, height: 7, border: '2px solid white', left: -1 }} />
      <Handle type="source" position={Position.Right}
        style={{ background: lc.hex, width: 7, height: 7, border: '2px solid white', right: -1 }} />
    </div>
  );
}

// ─── GateNode (diamond) ───────────────────────────────────────────────────────

function GateSLALine({ gate }) {
  const remaining = useSLATimer(gate?.slaDeadline);
  if (gate.status === 'completed') return <p className="text-[8px] text-brand-green font-medium mt-0.5">✓ Approved</p>;
  if (gate.status === 'pending') return <p className="text-[8px] text-gray-400 mt-0.5">Awaiting Gate {gate.number - 1}</p>;
  if (!remaining) return null;
  if (remaining.overdue) return <p className="text-[8px] text-red-500 font-mono font-bold mt-0.5">OVERDUE</p>;
  return (
    <p className={cn('text-[8px] font-mono mt-0.5', remaining.total < 3600000 ? 'text-red-500' : 'text-amber-500')}>
      {remaining.hours}h {remaining.minutes}m {remaining.seconds}s
    </p>
  );
}

function GateNode({ data }) {
  const { gate, isSelected } = data;
  if (!gate) return null;

  const statusColor = {
    completed: '#16A34A',
    active:    '#F59E0B',
    pending:   '#9CA3AF',
    blocked:   '#EF4444',
  }[gate.status] || '#9CA3AF';

  const GateIcon = gate.status === 'completed' ? CheckCircle2
    : gate.status === 'active' ? Clock
    : Lock;

  return (
    <div className="flex flex-col items-center" style={{ width: 100 }}>
      {/* Target handle — left of diamond */}
      <Handle type="target" position={Position.Left}
        style={{ background: statusColor, width: 7, height: 7, border: '2px solid white', top: 28 }} />

      {/* Diamond */}
      <div
        className={cn('transition-all duration-200', isSelected && 'drop-shadow-lg')}
        style={{
          width: 56,
          height: 56,
          backgroundColor: statusColor,
          transform: 'rotate(45deg)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          opacity: gate.status === 'pending' ? 0.6 : 1,
        }}
      >
        <GateIcon
          size={18}
          color="white"
          style={{ transform: 'rotate(-45deg)' }}
        />
      </div>

      {/* Label below diamond */}
      <div className="text-center mt-2">
        <p className="text-[10px] font-medium text-ink dark:text-white">Gate {gate.number}</p>
        <p className="text-[10px] text-ink-muted dark:text-gray-400 leading-tight">{gate.name}</p>
        <GateSLALine gate={gate} />
      </div>

      {/* Source handle — right of diamond */}
      <Handle type="source" position={Position.Right}
        style={{ background: statusColor, width: 7, height: 7, border: '2px solid white', top: 28 }} />
    </div>
  );
}

const nodeTypes = { agentNode: AgentNode, gateNode: GateNode };

// ─── Graph builder ────────────────────────────────────────────────────────────

function buildGraph(agentStates, gates, selected, isDark) {
  const nodes = [];
  const edges = [];

  const sel = (id) => selected?.id === id;

  const gateMap = {};
  gates.forEach((g) => { gateMap[g.id] = g; });

  const isActive = (id) => agentStates[id]?.status === 'running';
  const gateApproved = (id) => gateMap[id]?.status === 'completed';

  // ── Layer 1 ──
  nodes.push({
    id: 'agent-1a',
    type: 'agentNode',
    position: { x: 60, y: 120 },
    data: { agent: AGENTS.find(a => a.id === 'agent-1a'), state: agentStates['agent-1a'], isSelected: sel('agent-1a'), isDark },
  });
  nodes.push({
    id: 'agent-1b',
    type: 'agentNode',
    position: { x: 60, y: 310 },
    data: { agent: AGENTS.find(a => a.id === 'agent-1b'), state: agentStates['agent-1b'], isSelected: sel('agent-1b'), isDark },
  });

  // Edge: 1A → 1B
  edges.push({
    id: 'e-1a-1b',
    source: 'agent-1a',
    target: 'agent-1b',
    type: 'smoothstep',
    style: { stroke: '#2563EB', strokeWidth: 1.5, opacity: 0.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#2563EB', width: 10, height: 10 },
  });

  // ── Gate 1 ──
  nodes.push({
    id: 'gate-1',
    type: 'gateNode',
    position: { x: 315, y: 195 },
    data: { gate: gateMap['gate-1'], isSelected: sel('gate-1'), isDark },
  });

  edges.push({
    id: 'e-1a-g1', source: 'agent-1a', target: 'gate-1',
    type: 'smoothstep', animated: isActive('agent-1a'),
    style: { stroke: '#2563EB', strokeWidth: 2, opacity: 0.7 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#2563EB', width: 11, height: 11 },
  });
  edges.push({
    id: 'e-1b-g1', source: 'agent-1b', target: 'gate-1',
    type: 'smoothstep', animated: isActive('agent-1b'),
    style: { stroke: '#2563EB', strokeWidth: 2, opacity: 0.7 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#2563EB', width: 11, height: 11 },
  });

  // ── Layer 2 — 2×4 grid ──
  const L2_COL1 = ['agent-2a', 'agent-2b', 'agent-2c', 'agent-2d'];
  const L2_COL2 = ['agent-2e', 'agent-2g', 'agent-2h', 'agent-qa'];
  const l2x1 = 510;
  const l2x2 = 730;
  const l2yBase = 40;
  const l2yGap = 110;

  L2_COL1.forEach((id, i) => {
    nodes.push({
      id,
      type: 'agentNode',
      position: { x: l2x1, y: l2yBase + i * l2yGap },
      data: { agent: AGENTS.find(a => a.id === id), state: agentStates[id], isSelected: sel(id), isDark },
    });
  });
  L2_COL2.forEach((id, i) => {
    nodes.push({
      id,
      type: 'agentNode',
      position: { x: l2x2, y: l2yBase + i * l2yGap },
      data: { agent: AGENTS.find(a => a.id === id), state: agentStates[id], isSelected: sel(id), isDark },
    });
  });

  const l2all = [...L2_COL1, ...L2_COL2];
  const gate1Color = gateApproved('gate-1') ? '#16A34A' : '#F59E0B';

  l2all.forEach((id) => {
    edges.push({
      id: `e-g1-${id}`, source: 'gate-1', target: id,
      type: 'smoothstep', animated: gateApproved('gate-1'),
      style: { stroke: gate1Color, strokeWidth: 1.5, opacity: 0.6 },
      markerEnd: { type: MarkerType.ArrowClosed, color: gate1Color, width: 10, height: 10 },
    });
    edges.push({
      id: `e-${id}-g2`, source: id, target: 'gate-2',
      type: 'smoothstep', animated: isActive(id),
      style: { stroke: '#16A34A', strokeWidth: 2, opacity: isActive(id) ? 0.85 : 0.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#16A34A', width: 11, height: 11 },
    });
  });

  // ── Gate 2 ──
  nodes.push({
    id: 'gate-2',
    type: 'gateNode',
    position: { x: 970, y: 195 },
    data: { gate: gateMap['gate-2'], isSelected: sel('gate-2'), isDark },
  });

  // ── Gate 3 ──
  nodes.push({
    id: 'gate-3',
    type: 'gateNode',
    position: { x: 1130, y: 195 },
    data: { gate: gateMap['gate-3'], isSelected: sel('gate-3'), isDark },
  });

  edges.push({
    id: 'e-g2-g3', source: 'gate-2', target: 'gate-3',
    type: 'smoothstep', animated: gateApproved('gate-2'),
    style: { stroke: '#F59E0B', strokeWidth: 2, opacity: 0.7 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#F59E0B', width: 11, height: 11 },
  });

  // ── Layer 3 — Distribution ──
  nodes.push({
    id: 'agent-dist',
    type: 'agentNode',
    position: { x: 1290, y: 170 },
    data: { agent: AGENTS.find(a => a.id === 'agent-dist'), state: agentStates['agent-dist'], isSelected: sel('agent-dist'), isDark },
  });

  edges.push({
    id: 'e-g3-dist', source: 'gate-3', target: 'agent-dist',
    type: 'smoothstep', animated: gateApproved('gate-3'),
    style: { stroke: '#7C3AED', strokeWidth: 2, opacity: 0.7 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#7C3AED', width: 11, height: 11 },
  });

  // ── Gate 4 ──
  nodes.push({
    id: 'gate-4',
    type: 'gateNode',
    position: { x: 1530, y: 195 },
    data: { gate: gateMap['gate-4'], isSelected: sel('gate-4'), isDark },
  });

  edges.push({
    id: 'e-dist-g4', source: 'agent-dist', target: 'gate-4',
    type: 'smoothstep', animated: isActive('agent-dist'),
    style: { stroke: '#7C3AED', strokeWidth: 2, opacity: 0.7 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#7C3AED', width: 11, height: 11 },
  });

  // ── Layer 4 ──
  nodes.push({
    id: 'agent-perf',
    type: 'agentNode',
    position: { x: 1690, y: 120 },
    data: { agent: AGENTS.find(a => a.id === 'agent-perf'), state: agentStates['agent-perf'], isSelected: sel('agent-perf'), isDark },
  });
  nodes.push({
    id: 'agent-optim',
    type: 'agentNode',
    position: { x: 1690, y: 310 },
    data: { agent: AGENTS.find(a => a.id === 'agent-optim'), state: agentStates['agent-optim'], isSelected: sel('agent-optim'), isDark },
  });

  ['agent-perf', 'agent-optim'].forEach((id) => {
    edges.push({
      id: `e-g4-${id}`, source: 'gate-4', target: id,
      type: 'smoothstep', animated: gateApproved('gate-4'),
      style: { stroke: '#0891B2', strokeWidth: 2, opacity: 0.7 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#0891B2', width: 11, height: 11 },
    });
  });

  // ── Feedback loop: agent-optim → agent-1a ──
  edges.push({
    id: 'e-feedback',
    source: 'agent-optim',
    target: 'agent-1a',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#0891B2', strokeWidth: 1.5, strokeDasharray: '6 4', opacity: 0.45 },
    label: 'Quarterly learnings →',
    labelStyle: { fontSize: 9, fill: '#6B7280', fontFamily: 'inherit' },
    labelBgStyle: { fill: 'transparent' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#0891B2', width: 10, height: 10 },
  });

  return { nodes, edges };
}

// ─── Agent Detail Panel ────────────────────────────────────────────────────────

function AgentPanel({ agentId, onClose }) {
  const agent = AGENTS.find(a => a.id === agentId);
  const state = useAgentStore(s => s.agentStates[agentId]) || {};
  const feed = useAgentStore(s => s.activityFeed);
  const showInternals = useAppStore(s => s.canSee('showAgentInternals'));
  const lc = LAYER_COLORS[agent?.layer];

  if (!agent || !lc) return null;

  const recentActivity = feed.filter(f => f.agentId === agentId).slice(0, 3);
  const status = state.status || 'idle';

  const statusLabel = {
    running: 'Running',
    idle: 'Idle',
    queued: 'Queued',
    completed: 'Complete',
    error: 'Error',
  }[status] || 'Idle';

  const statusColor = {
    running: 'text-brand-green bg-brand-green/10',
    idle: 'text-gray-500 bg-gray-100 dark:bg-gray-800',
    queued: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    completed: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    error: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  }[status] || 'text-gray-500 bg-gray-100';

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-3 right-3 w-80 bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded shadow-card-hover z-20 overflow-hidden flex flex-col max-h-[calc(100%-24px)]"
    >
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border dark:border-dark-border flex items-center gap-2 flex-shrink-0"
        style={{ borderLeft: `3px solid ${lc.hex}` }}>
        <div className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-medium text-white flex-shrink-0"
          style={{ backgroundColor: lc.hex }}>
          {agent.code}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium text-ink dark:text-white leading-tight truncate">{agent.name}</p>
          <p className="text-[10px] text-ink-muted dark:text-gray-400">Layer {agent.layer} · {agent.model}</p>
        </div>
        <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', statusColor)}>{statusLabel}</span>
        <button onClick={onClose} className="text-ink-faint dark:text-gray-500 hover:text-ink dark:hover:text-white ml-1">
          <X size={13} />
        </button>
      </div>

      <div className="overflow-y-auto scrollbar-thin flex-1">
        <div className="p-3 space-y-3">

          {/* Progress if running */}
          {status === 'running' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-ink-muted dark:text-gray-400">{state.currentTask}</span>
                <span className="text-[9px] font-mono text-brand-green">{Math.round(state.progress || 0)}%</span>
              </div>
              <div className="w-full h-px bg-border dark:bg-dark-border rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${state.progress}%`, backgroundColor: lc.hex }} />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500 mb-1">What this agent does</p>
            <p className="text-[11px] text-ink-muted dark:text-gray-400 leading-relaxed">{agent.description}</p>
          </div>

          {/* Responsibilities */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500 mb-1.5">Responsibilities</p>
            <ul className="space-y-1">
              {agent.responsibilities.map((r, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px] text-ink-muted dark:text-gray-400">
                  <CheckCircle size={9} className="text-brand-green flex-shrink-0 mt-0.5" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Outputs */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500 mb-1.5">Outputs</p>
            <ul className="space-y-1">
              {agent.outputs.map((o, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px] text-ink-muted dark:text-gray-400">
                  <span className="w-1 h-1 rounded-full bg-ink-faint flex-shrink-0 mt-1.5" />
                  {o}
                </li>
              ))}
            </ul>
          </div>

          {/* Runtime stats */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 text-[9px] text-ink-muted dark:text-gray-400">
              <Clock size={10} />
              <span>Avg {agent.avgRuntime}</span>
            </div>
            {state.runsSinceStart > 0 && (
              <div className="flex items-center gap-1 text-[9px] text-ink-muted dark:text-gray-400">
                <Cpu size={10} />
                <span className="font-mono">{state.runsSinceStart} runs</span>
              </div>
            )}
            {showInternals && state.tokensUsed > 0 && (
              <div className="flex items-center gap-1 text-[9px] text-ink-muted dark:text-gray-400">
                <Database size={10} />
                <span className="font-mono">{(state.tokensUsed / 1000).toFixed(1)}k tokens</span>
              </div>
            )}
          </div>

          {/* COE-only telemetry */}
          {showInternals && (
            <div className="bg-surface-muted dark:bg-dark-border rounded p-2 space-y-1">
              <p className="text-[10px] font-medium text-ink-faint dark:text-gray-500 uppercase tracking-[0.08em] mb-1">Telemetry</p>
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <p className="text-[8px] text-ink-faint dark:text-gray-500">Tokens used</p>
                  <p className="text-[10px] font-mono text-ink dark:text-white">{(state.tokensUsed / 1000).toFixed(1)}k</p>
                </div>
                <div>
                  <p className="text-[8px] text-ink-faint dark:text-gray-500">Iterations</p>
                  <p className="text-[10px] font-mono text-ink dark:text-white">{state.runsSinceStart}</p>
                </div>
                <div>
                  <p className="text-[8px] text-ink-faint dark:text-gray-500">Model</p>
                  <p className="text-[10px] font-mono text-ink dark:text-white truncate">{agent.model}</p>
                </div>
                <div>
                  <p className="text-[8px] text-ink-faint dark:text-gray-500">Status</p>
                  <p className="text-[10px] font-mono text-ink dark:text-white capitalize">{status}</p>
                </div>
              </div>
            </div>
          )}

          {/* Recent activity */}
          {recentActivity.length > 0 && (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500 mb-1.5">Recent Activity</p>
              <div className="space-y-1.5">
                {recentActivity.map(item => (
                  <div key={item.id} className="flex items-start gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-brand-green flex-shrink-0 mt-1.5" />
                    <div className="min-w-0">
                      <p className="text-[9px] text-ink-muted dark:text-gray-400 leading-snug truncate">{item.asset}</p>
                      <p className="text-[8px] text-ink-faint dark:text-gray-500">{item.buAbbr} · {item.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </motion.div>
  );
}

// ─── Gate Detail Panel ────────────────────────────────────────────────────────

function GateSLALiveInPanel({ gate }) {
  const remaining = useSLATimer(gate?.slaDeadline);
  if (!remaining) return <span className="text-[10px] text-ink-faint dark:text-gray-500">—</span>;
  if (remaining.overdue) return <span className="text-[10px] font-bold text-red-500">OVERDUE</span>;
  const urgent = remaining.total < 3600000;
  return (
    <span className={cn('text-[10px] font-mono font-semibold', urgent ? 'text-red-500' : 'text-amber-500')}>
      {remaining.hours}h {remaining.minutes}m {remaining.seconds}s remaining
    </span>
  );
}

function GatePanel({ gateId, onClose }) {
  const gate = useGateStore(s => s.gates.find(g => g.id === gateId));
  const approveGateItem = useGateStore(s => s.approveGateItem);
  const approveAll = useGateStore(s => s.approveAllInGate);
  const assets = useContentStore(s => s.assets);

  if (!gate) return null;

  const pendingAssets = assets.filter(a =>
    a.status === `${gateId}-pending` || (gateId === 'gate-2' && a.status === 'gate-2-pending')
  ).slice(0, 5);

  const statusColor = {
    completed: '#16A34A',
    active:    '#F59E0B',
    pending:   '#9CA3AF',
  }[gate.status] || '#9CA3AF';

  const approvedPct = gate.itemsCount > 0 ? Math.round((gate.itemsApproved / gate.itemsCount) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-3 right-3 w-80 bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded shadow-card-hover z-20 overflow-hidden flex flex-col max-h-[calc(100%-24px)]"
    >
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border dark:border-dark-border flex items-center gap-2 flex-shrink-0"
        style={{ borderLeft: `3px solid ${statusColor}` }}>
        <div className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-medium text-white flex-shrink-0"
          style={{ backgroundColor: statusColor, transform: 'rotate(45deg)' }}>
          <span style={{ transform: 'rotate(-45deg)' }}>{gate.number}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium text-ink dark:text-white leading-tight">Gate {gate.number} — {gate.name}</p>
          <GateSLALiveInPanel gate={gate} />
        </div>
        <button onClick={onClose} className="text-ink-faint dark:text-gray-500 hover:text-ink dark:hover:text-white">
          <X size={13} />
        </button>
      </div>

      <div className="overflow-y-auto scrollbar-thin flex-1">
        <div className="p-3 space-y-3">

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-ink-muted dark:text-gray-400">{gate.itemsApproved} of {gate.itemsCount} items approved</span>
              <span className="text-[9px] font-mono font-semibold" style={{ color: statusColor }}>{approvedPct}%</span>
            </div>
            <div className="w-full h-px bg-border dark:bg-dark-border rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${approvedPct}%`, backgroundColor: statusColor }} />
            </div>
          </div>

          {/* Description */}
          <p className="text-[10px] text-ink-muted dark:text-gray-400 leading-relaxed">{gate.description}</p>

          {/* Reviewers */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500 mb-1.5">Reviewers</p>
            <div className="space-y-1.5">
              {gate.approvers.map((a, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-brand-green/15 border border-brand-green/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-[7px] font-bold text-brand-green">{a.avatar}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-ink dark:text-white leading-none">{a.name}</p>
                    <p className="text-[8px] text-ink-faint dark:text-gray-500">{a.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trigger / on-approve */}
          <div className="space-y-1.5">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500">Triggered by</p>
              <p className="text-[10px] text-ink-muted dark:text-gray-400 mt-0.5">{gate.triggers}</p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500">On approve</p>
              <p className="text-[10px] text-ink-muted dark:text-gray-400 mt-0.5">{gate.onApprove}</p>
            </div>
          </div>

          {/* Pending items */}
          {pendingAssets.length > 0 && (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500 mb-1.5">Pending Items</p>
              <div className="space-y-1">
                {pendingAssets.map(a => (
                  <div key={a.id} className="flex items-center gap-1.5 py-0.5">
                    <span className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
                    <p className="text-[9px] text-ink-muted dark:text-gray-400 truncate flex-1">{a.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked state */}
          {gate.status === 'pending' && (
            <div className="bg-surface-muted dark:bg-dark-border rounded p-2 flex items-center gap-2">
              <Lock size={11} className="text-gray-400 flex-shrink-0" />
              <p className="text-[10px] text-ink-muted dark:text-gray-400">
                Waiting for Gate {gate.number - 1} to be approved before this gate unlocks.
              </p>
            </div>
          )}

          {/* Action buttons */}
          {gate.status === 'active' && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => approveAll(gateId)}
                className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 bg-brand-green text-white rounded text-[11px] font-medium hover:bg-brand-green-dark transition-colors"
              >
                <CheckCircle2 size={11} />
                Approve All
              </button>
              <button
                onClick={() => approveGateItem(gateId)}
                className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 border border-border dark:border-dark-border rounded text-[11px] font-medium text-ink-muted dark:text-gray-400 hover:bg-surface-muted dark:hover:bg-dark-border transition-colors"
              >
                Approve One
              </button>
            </div>
          )}
          {gate.status === 'completed' && (
            <div className="flex items-center gap-1.5 py-1.5 px-2.5 bg-brand-green-light dark:bg-green-900/20 rounded">
              <CheckCircle2 size={11} className="text-brand-green" />
              <p className="text-[10px] font-medium text-brand-green-dark dark:text-green-400">Gate approved — pipeline advanced</p>
            </div>
          )}

        </div>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PipelinePage() {
  const agentStates = useAgentStore(s => s.agentStates);
  const gates = useGateStore(s => s.gates);
  const theme = useAppStore(s => s.theme);
  const isDark = theme === 'dark';

  const [selected, setSelected] = useState(null); // { id, type: 'agent' | 'gate' }

  const { nodes: initNodes, edges: initEdges } = useMemo(
    () => buildGraph(agentStates, gates, selected, isDark),
    [agentStates, gates, selected, isDark]
  );

  const [nodes, , onNodesChange] = useNodesState(initNodes);
  const [edges, , onEdgesChange] = useEdgesState(initEdges);

  const liveNodes = useMemo(() =>
    nodes.map(n => {
      if (n.type === 'agentNode') {
        const agent = AGENTS.find(a => a.id === n.id);
        return { ...n, data: { agent, state: agentStates[n.id], isSelected: selected?.id === n.id, isDark } };
      }
      if (n.type === 'gateNode') {
        const gate = gates.find(g => g.id === n.id);
        return { ...n, data: { gate, isSelected: selected?.id === n.id, isDark } };
      }
      return n;
    }),
    [nodes, agentStates, gates, selected, isDark]
  );

  const onNodeClick = useCallback((_, node) => {
    if (node.type === 'agentNode') {
      setSelected(prev => prev?.id === node.id ? null : { id: node.id, type: 'agent' });
    } else if (node.type === 'gateNode') {
      setSelected(prev => prev?.id === node.id ? null : { id: node.id, type: 'gate' });
    }
  }, []);

  const onPaneClick = useCallback(() => setSelected(null), []);

  const runningCount = AGENTS.filter(a => agentStates[a.id]?.status === 'running').length;

  return (
    <div className="h-full flex flex-col">

      {/* Top bar */}
      <div className="h-12 px-4 border-b border-border dark:border-dark-border bg-white dark:bg-dark-card flex items-center gap-6 flex-shrink-0">
       

        {/* Layer legend */}
        <div className="flex items-center gap-4 flex-1">
          {Object.entries(LAYER_COLORS).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: val.hex }} />
              <span className="text-[10px] text-ink-muted dark:text-gray-400 whitespace-nowrap">{val.label}</span>
            </div>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
            <span className="text-[11px] text-brand-green font-medium">{runningCount} running</span>
          </div>
          <span className="text-[9px] text-ink-faint dark:text-gray-500">Click any node to inspect</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative" style={{ background: isDark ? '#0F0F0F' : '#F9FAFB' }}>
        <ReactFlow
          nodes={liveNodes}
          edges={initEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.12 }}
          minZoom={0.25}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            color={isDark ? '#2A2A2A' : '#D1D5DB'}
            gap={24}
            size={1.5}
            variant="dots"
          />
          <Controls
            showInteractive={false}
            style={{ bottom: 16, left: 16 }}
          />
        </ReactFlow>

        {/* Detail panel */}
        <AnimatePresence>
          {selected?.type === 'agent' && (
            <AgentPanel key={selected.id} agentId={selected.id} onClose={() => setSelected(null)} />
          )}
          {selected?.type === 'gate' && (
            <GatePanel key={selected.id} gateId={selected.id} onClose={() => setSelected(null)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
