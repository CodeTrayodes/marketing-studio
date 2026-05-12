import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap,
  Handle, Position, MarkerType,
  useNodesState, useEdgesState,
} from 'reactflow';
import { useAgentStore } from '../store/useAgentStore';
import { useAppStore } from '../store/useAppStore';
import { AGENTS } from '../data/agents';
import { AgentStatusBadge } from '../components/ui/StatusBadge';
import { QualityScore, QualityBreakdown } from '../components/ui/QualityScore';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, Clock, Database, CheckCircle, AlertCircle } from 'lucide-react';

const LAYER_COLORS = {
  1: { hex: '#2563EB', bg: '#EFF6FF', dark: '#1D4ED8', label: 'Campaign Intelligence' },
  2: { hex: '#16A34A', bg: '#F0FDF4', dark: '#15803D', label: 'Content Intelligence' },
  gate: { hex: '#F59E0B', bg: '#FFFBEB', dark: '#D97706', label: 'Approval Gates' },
  3: { hex: '#7C3AED', bg: '#F5F3FF', dark: '#6D28D9', label: 'Distribution' },
  4: { hex: '#0891B2', bg: '#ECFEFF', dark: '#0E7490', label: 'Analytics & Optimisation' },
};

// Custom node component
function AgentNode({ data }) {
  const { agent, state, isSelected, isDark } = data;
  const status = state?.status || 'idle';
  const progress = state?.progress || 0;
  const layerColor = LAYER_COLORS[agent.layer];

  const statusDot = {
    running: 'bg-green-400 animate-pulse',
    idle: 'bg-gray-400',
    queued: 'bg-blue-400',
    completed: 'bg-green-500',
    error: 'bg-red-500 animate-pulse',
  }[status] || 'bg-gray-400';

  return (
    <div
      className={cn(
        'rounded-[12px] border-2 transition-all duration-200 cursor-pointer select-none',
        'bg-white dark:bg-dark-card',
        isSelected ? 'shadow-lg ring-2 ring-offset-1' : 'shadow-card hover:shadow-card-hover',
      )}
      style={{
        borderColor: isSelected ? layerColor.hex : (isDark ? '#2A2A2A' : '#E5E7EB'),
        ringColor: layerColor.hex,
        minWidth: 180,
        maxWidth: 200,
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-2 rounded-t-[10px] flex items-center gap-2"
        style={{ backgroundColor: isDark ? `${layerColor.hex}22` : layerColor.bg }}
      >
        <div
          className="w-6 h-6 rounded-[5px] flex items-center justify-center text-[9px] font-mono font-bold text-white flex-shrink-0"
          style={{ backgroundColor: layerColor.hex }}
        >
          {agent.code}
        </div>
        <span className="text-[11px] font-semibold text-ink dark:text-white truncate flex-1">{agent.name}</span>
        <span className={cn('w-2 h-2 rounded-full flex-shrink-0', statusDot)} />
      </div>

      {/* Body */}
      <div className="px-3 py-2">
        {status === 'running' && (
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-ink-muted dark:text-gray-400">Progress</span>
              <span className="text-[10px] font-mono-nums text-brand-green">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1 bg-border dark:bg-dark-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${progress}%`, backgroundColor: layerColor.hex }}
              />
            </div>
          </div>
        )}
        <p className="text-[10px] text-ink-faint dark:text-gray-500 leading-tight truncate">
          {state?.currentTask || agent.description.slice(0, 60)}
        </p>
      </div>

      <Handle type="target" position={Position.Left} style={{ background: layerColor.hex, width: 8, height: 8, border: '2px solid white' }} />
      <Handle type="source" position={Position.Right} style={{ background: layerColor.hex, width: 8, height: 8, border: '2px solid white' }} />
    </div>
  );
}

function GateNode({ data }) {
  const { number, name, status, isDark } = data;
  const gateColor = LAYER_COLORS.gate;

  const statusDot = { active: 'bg-amber-400 animate-pulse', pending: 'bg-blue-400', completed: 'bg-green-500' }[status] || 'bg-gray-400';

  return (
    <div
      className="rounded-[12px] border-2 bg-white dark:bg-dark-card shadow-card"
      style={{ borderColor: gateColor.hex, minWidth: 140 }}
    >
      <div className="px-3 py-2 rounded-t-[10px]" style={{ backgroundColor: isDark ? `${gateColor.hex}22` : gateColor.bg }}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">Gate {number}</span>
          <span className={cn('w-2 h-2 rounded-full', statusDot)} />
        </div>
        <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-0.5 font-medium">{name}</p>
      </div>
      <div className="px-3 py-1.5">
        <p className="text-[10px] text-ink-faint dark:text-gray-500">
          {status === 'completed' ? 'Approved' : status === 'active' ? 'Awaiting review' : 'Not yet reached'}
        </p>
      </div>
      <Handle type="target" position={Position.Left} style={{ background: gateColor.hex, width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right} style={{ background: gateColor.hex, width: 8, height: 8 }} />
    </div>
  );
}

const nodeTypes = { agentNode: AgentNode, gateNode: GateNode };

function buildPipelineGraph(agentStates, selectedId, isDark) {
  const nodes = [];
  const edges = [];

  // Layer 1 — x=50
  const l1y = { 'agent-1a': 80, 'agent-1b': 220 };
  ['agent-1a', 'agent-1b'].forEach((id) => {
    const agent = AGENTS.find((a) => a.id === id);
    nodes.push({
      id,
      type: 'agentNode',
      position: { x: 50, y: l1y[id] },
      data: { agent, state: agentStates[id], isSelected: selectedId === id, isDark },
    });
  });

  // Gate 1 — x=320
  nodes.push({
    id: 'gate-1',
    type: 'gateNode',
    position: { x: 320, y: 145 },
    data: { number: 1, name: 'Strategy Approval', status: 'completed', isDark },
  });

  // Layer 2 — x=540, y spread
  const l2agents = ['agent-2a', 'agent-2b', 'agent-2c', 'agent-2d', 'agent-2e', 'agent-2g', 'agent-2h', 'agent-qa'];
  const l2yStart = 20;
  const l2yGap = 82;
  l2agents.forEach((id, i) => {
    const agent = AGENTS.find((a) => a.id === id);
    nodes.push({
      id,
      type: 'agentNode',
      position: { x: 540, y: l2yStart + i * l2yGap },
      data: { agent, state: agentStates[id], isSelected: selectedId === id, isDark },
    });
  });

  // Gate 2 — x=820
  nodes.push({
    id: 'gate-2',
    type: 'gateNode',
    position: { x: 820, y: 250 },
    data: { number: 2, name: 'Content Review', status: 'active', isDark },
  });

  // Gate 3 — x=1010
  nodes.push({
    id: 'gate-3',
    type: 'gateNode',
    position: { x: 1010, y: 250 },
    data: { number: 3, name: 'Final Approval', status: 'pending', isDark },
  });

  // Distribution — x=1200
  nodes.push({
    id: 'agent-dist',
    type: 'agentNode',
    position: { x: 1200, y: 230 },
    data: { agent: AGENTS.find((a) => a.id === 'agent-dist'), state: agentStates['agent-dist'], isSelected: selectedId === 'agent-dist', isDark },
  });

  // Gate 4 — x=1440
  nodes.push({
    id: 'gate-4',
    type: 'gateNode',
    position: { x: 1440, y: 250 },
    data: { number: 4, name: 'Publish Confirmation', status: 'completed', isDark },
  });

  // Layer 4 — x=1640
  const l4agents = ['agent-perf', 'agent-optim'];
  const l4y = { 'agent-perf': 190, 'agent-optim': 310 };
  l4agents.forEach((id) => {
    const agent = AGENTS.find((a) => a.id === id);
    nodes.push({
      id,
      type: 'agentNode',
      position: { x: 1640, y: l4y[id] },
      data: { agent, state: agentStates[id], isSelected: selectedId === id, isDark },
    });
  });

  const edgeStyle = (color, animated = false) => ({
    type: 'smoothstep',
    animated,
    style: { stroke: color, strokeWidth: 2, opacity: 0.7 },
    markerEnd: { type: MarkerType.ArrowClosed, color, width: 12, height: 12 },
  });

  // L1 → Gate 1
  edges.push({ id: 'e-1a-g1', source: 'agent-1a', target: 'gate-1', ...edgeStyle('#2563EB') });
  edges.push({ id: 'e-1b-g1', source: 'agent-1b', target: 'gate-1', ...edgeStyle('#2563EB') });

  // Gate 1 → all L2
  l2agents.forEach((id) => {
    edges.push({ id: `e-g1-${id}`, source: 'gate-1', target: id, ...edgeStyle('#F59E0B') });
  });

  // L2 → Gate 2
  l2agents.forEach((id) => {
    edges.push({ id: `e-${id}-g2`, source: id, target: 'gate-2', ...edgeStyle('#16A34A', agentStates[id]?.status === 'running') });
  });

  // Gate 2 → Gate 3
  edges.push({ id: 'e-g2-g3', source: 'gate-2', target: 'gate-3', ...edgeStyle('#F59E0B') });

  // Gate 3 → Distribution
  edges.push({ id: 'e-g3-dist', source: 'gate-3', target: 'agent-dist', ...edgeStyle('#7C3AED') });

  // Distribution → Gate 4
  edges.push({ id: 'e-dist-g4', source: 'agent-dist', target: 'gate-4', ...edgeStyle('#7C3AED', agentStates['agent-dist']?.status === 'running') });

  // Gate 4 → L4
  l4agents.forEach((id) => {
    edges.push({ id: `e-g4-${id}`, source: 'gate-4', target: id, ...edgeStyle('#0891B2') });
  });

  // Optimisation → Research (feedback loop, dashed)
  edges.push({
    id: 'e-optim-1a',
    source: 'agent-optim',
    target: 'agent-1a',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#0891B2', strokeWidth: 1.5, strokeDasharray: '6 4', opacity: 0.5 },
    label: 'Q3 feedback',
    labelStyle: { fontSize: 10, fill: '#6B7280' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#0891B2', width: 10, height: 10 },
  });

  return { nodes, edges };
}

function AgentDetailPanel({ agentId, onClose }) {
  const agent = AGENTS.find((a) => a.id === agentId);
  const state = useAgentStore((s) => s.agentStates[agentId]) || {};
  const showInternals = useAppStore((s) => s.canSee('showAgentInternals'));

  if (!agent) return null;
  const layerColor = LAYER_COLORS[agent.layer];

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-4 right-4 w-80 bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-card shadow-card-hover z-10 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border dark:border-dark-border flex items-center justify-between"
        style={{ backgroundColor: `${layerColor.hex}12` }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[10px] font-mono font-bold text-white"
            style={{ backgroundColor: layerColor.hex }}
          >
            {agent.code}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink dark:text-white leading-tight">{agent.name}</p>
            <p className="text-[10px] text-ink-muted dark:text-gray-400">Layer {agent.layer} · {agent.model}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-ink-muted dark:text-gray-400 hover:text-ink dark:hover:text-white">
          <X size={14} />
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
        {/* Status */}
        <div>
          <AgentStatusBadge status={state.status || 'idle'} />
          {state.status === 'running' && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-ink-muted dark:text-gray-400">Progress</span>
                <span className="text-xs font-mono-nums text-brand-green font-medium">{Math.round(state.progress || 0)}%</span>
              </div>
              <div className="w-full h-1.5 bg-border dark:bg-dark-border rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${state.progress}%`, backgroundColor: layerColor.hex }}
                />
              </div>
              <p className="text-xs text-ink-muted dark:text-gray-400 mt-1.5 leading-relaxed">{state.currentTask}</p>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint dark:text-gray-500 mb-1">What this agent does</p>
          <p className="text-xs text-ink-muted dark:text-gray-400 leading-relaxed">{agent.description}</p>
        </div>

        {/* Responsibilities */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint dark:text-gray-500 mb-2">Responsibilities</p>
          <ul className="space-y-1">
            {agent.responsibilities.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-ink-muted dark:text-gray-400">
                <CheckCircle size={10} className="text-brand-green flex-shrink-0 mt-0.5" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Outputs */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint dark:text-gray-500 mb-2">Outputs</p>
          <ul className="space-y-1">
            {agent.outputs.map((o, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-ink-muted dark:text-gray-400">
                <span className="w-1 h-1 rounded-full bg-ink-faint flex-shrink-0 mt-1.5" />
                {o}
              </li>
            ))}
          </ul>
        </div>

        {/* Runtime */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted dark:text-gray-400">
            <Clock size={12} />
            <span>Avg {agent.avgRuntime}</span>
          </div>
          {showInternals && state.tokensUsed > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-ink-muted dark:text-gray-400">
              <Database size={12} />
              <span className="font-mono-nums">{(state.tokensUsed / 1000).toFixed(1)}k tokens</span>
            </div>
          )}
          {state.runsSinceStart > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-ink-muted dark:text-gray-400">
              <Cpu size={12} />
              <span className="font-mono-nums">{state.runsSinceStart} runs</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function PipelinePage() {
  const agentStates = useAgentStore((s) => s.agentStates);
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';
  const [selectedId, setSelectedId] = useState(null);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildPipelineGraph(agentStates, selectedId, isDark),
    [agentStates, selectedId, isDark]
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Sync node data when agentStates change
  const liveNodes = useMemo(
    () => nodes.map((n) => {
      if (n.type === 'agentNode') {
        const agent = AGENTS.find((a) => a.id === n.id);
        return { ...n, data: { ...n.data, state: agentStates[n.id], isSelected: selectedId === n.id, isDark } };
      }
      return n;
    }),
    [nodes, agentStates, selectedId, isDark]
  );

  const liveEdges = useMemo(
    () => initialEdges,
    [initialEdges]
  );

  const onNodeClick = useCallback((_, node) => {
    if (node.type === 'agentNode') {
      setSelectedId((prev) => (prev === node.id ? null : node.id));
    }
  }, []);

  const runningCount = AGENTS.filter((a) => agentStates[a.id]?.status === 'running').length;

  return (
    <div className="h-full flex flex-col">
      {/* Layer legend */}
      <div className="px-6 py-3 border-b border-border dark:border-dark-border bg-white dark:bg-dark-card flex items-center gap-6 flex-shrink-0">
        {Object.entries(LAYER_COLORS).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: val.hex }} />
            <span className="text-xs text-ink-muted dark:text-gray-400">{val.label}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-4 text-xs text-ink-muted dark:text-gray-400">
          <span><span className="font-mono-nums font-medium text-brand-green">{runningCount}</span> agents running</span>
          <span className="text-ink-faint">Click any agent to inspect</span>
        </div>
      </div>

      {/* ReactFlow canvas */}
      <div className="flex-1 relative bg-surface-subtle dark:bg-dark-bg">
        <ReactFlow
          nodes={liveNodes}
          edges={liveEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15, includeHiddenNodes: false }}
          minZoom={0.3}
          maxZoom={1.5}
          defaultEdgeOptions={{ animated: false }}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            color={isDark ? '#2A2A2A' : '#E5E7EB'}
            gap={24}
            size={1}
            variant="dots"
          />
          <Controls
            showInteractive={false}
            className="bottom-4 left-4"
          />
          <MiniMap
            nodeColor={(n) => {
              if (n.type === 'gateNode') return '#F59E0B';
              const agent = AGENTS.find((a) => a.id === n.id);
              if (!agent) return '#9CA3AF';
              return LAYER_COLORS[agent.layer]?.hex || '#9CA3AF';
            }}
            maskColor={isDark ? 'rgba(10,10,10,0.7)' : 'rgba(248,249,250,0.7)'}
            className="bottom-4 right-4 rounded-card border border-border dark:border-dark-border"
            style={{ width: 160, height: 100 }}
          />
        </ReactFlow>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedId && AGENTS.find((a) => a.id === selectedId) && (
            <AgentDetailPanel
              agentId={selectedId}
              onClose={() => setSelectedId(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
