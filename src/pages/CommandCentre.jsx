import { useAgentStore } from '../store/useAgentStore';
import { useGateStore } from '../store/useGateStore';
import { useContentStore } from '../store/useContentStore';
import { useAppStore, ROLES } from '../store/useAppStore';
import { QUARTERLY_METRICS, BU_PERFORMANCE } from '../data/performance';
import { MetricCard } from '../components/ui/MetricCard';
import { StatusBadge, AgentStatusBadge, LayerBadge } from '../components/ui/StatusBadge';
import { SLATimer, SLAProgressBar } from '../components/ui/SLATimer';
import { ActivityFeed } from '../components/ui/ActivityFeed';
import { QualityScore, QualityBar } from '../components/ui/QualityScore';
import { ProgressRing } from '../components/ui/ProgressRing';
import { AGENTS, BUSINESS_UNITS } from '../data/agents';
import { cn, formatCurrency, formatPercent, qualityColor } from '../lib/utils';
import { useCountUp } from '../hooks/useCountUp';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Clock, AlertCircle, Zap, TrendingUp, Users, FileText } from 'lucide-react';

const FADE_UP = {
  hidden: { opacity: 0, y: 12 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] } }),
};

function KPIRow() {
  const role = useAppStore((s) => s.role);
  const publishedCount = useContentStore((s) => s.assets.filter((a) => a.status === 'published').length);
  const pendingGateCount = useContentStore((s) => s.assets.filter((a) => ['gate-2-pending', 'gate-3-pending'].includes(a.status)).length);
  const assetsCount = useCountUp(publishedCount, 1200);
  const qualityCount = useCountUp(QUARTERLY_METRICS.qualityAverage, 1000, 1);
  const roiCount = useCountUp(QUARTERLY_METRICS.roiMultiple, 1000, 1);
  const pipelineCount = useCountUp(QUARTERLY_METRICS.pipelineInfluenced / 1000, 1000, 0);

  const showROI = role === ROLES.MARKETING_HEAD || role === ROLES.AI_COE;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <motion.div custom={0} variants={FADE_UP} initial="hidden" animate="show">
        <MetricCard
          label="Assets Published"
          value={assetsCount}
          subValue={`/ ${QUARTERLY_METRICS.assetsTarget}`}
          trend={12.4}
          trendLabel="+12.4%"
          explanation="Completed content pieces live across all channels this quarter"
        >
          <div className="mt-2 w-full h-1 bg-border dark:bg-dark-border rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-green rounded-full transition-all duration-1000"
              style={{ width: `${(publishedCount / QUARTERLY_METRICS.assetsTarget) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-ink-faint dark:text-gray-500 mt-1">
            {Math.round((publishedCount / QUARTERLY_METRICS.assetsTarget) * 100)}% of quarterly target
          </p>
        </MetricCard>
      </motion.div>

      <motion.div custom={1} variants={FADE_UP} initial="hidden" animate="show">
        <MetricCard
          label="Avg Quality Score"
          value={qualityCount}
          subValue="/100"
          trend={2.1}
          trendLabel="+2.1 pts"
          explanation="Mean quality across all QA-reviewed assets — brand, SEO, GEO, AI detection"
          accent
        />
      </motion.div>

      {showROI && (
        <motion.div custom={2} variants={FADE_UP} initial="hidden" animate="show">
          <MetricCard
            label="Labour Value Saved"
            value={formatCurrency(QUARTERLY_METRICS.laborValueSaved)}
            subValue={`${roiCount}× ROI`}
            trend={18.3}
            trendLabel={`${roiCount}× ROI`}
            explanation={`${formatCurrency(QUARTERLY_METRICS.laborValueSaved)} vs ${formatCurrency(QUARTERLY_METRICS.platformCost)} platform cost — net ${formatCurrency(QUARTERLY_METRICS.netROI)} this quarter`}
          />
        </motion.div>
      )}

      {showROI && (
        <motion.div custom={3} variants={FADE_UP} initial="hidden" animate="show">
          <MetricCard
            label="Pipeline Influenced"
            value={`£${pipelineCount}k`}
            subValue="attributed"
            trend={8.7}
            trendLabel="+8.7%"
            explanation="Deals in CRM directly touched by published content assets this quarter"
          />
        </motion.div>
      )}

      {!showROI && (
        <motion.div custom={2} variants={FADE_UP} initial="hidden" animate="show">
          <MetricCard
            label="Pending Approval"
            value={pendingGateCount}
            subValue="assets"
            explanation="Assets waiting at Gate 2 or Gate 3 for human review"
          />
        </motion.div>
      )}

      {!showROI && (
        <motion.div custom={3} variants={FADE_UP} initial="hidden" animate="show">
          <MetricCard
            label="On-Time Delivery"
            value={`${QUARTERLY_METRICS.onTimeDelivery}%`}
            trend={1.8}
            trendLabel="+1.8%"
            explanation="Percentage of assets delivered within their SLA window this quarter"
            accent
          />
        </motion.div>
      )}
    </div>
  );
}

function AgentStatusGrid() {
  const agentStates = useAgentStore((s) => s.agentStates);
  const role = useAppStore((s) => s.role);
  const showInternals = useAppStore((s) => s.canSee('showAgentInternals'));

  const runningAgents = AGENTS.filter((a) => agentStates[a.id]?.status === 'running');
  const allCounts = {
    running: AGENTS.filter((a) => agentStates[a.id]?.status === 'running').length,
    completed: AGENTS.filter((a) => agentStates[a.id]?.status === 'completed').length,
    idle: AGENTS.filter((a) => ['idle', 'queued'].includes(agentStates[a.id]?.status)).length,
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-ink dark:text-white">Agent Status</h3>
          <p className="text-xs text-ink-muted dark:text-gray-400 mt-0.5">13 agents across 4 layers</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-ink-muted dark:text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
            {allCounts.running} running
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-agent-idle" />
            {allCounts.idle} idle
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {allCounts.completed} done
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {AGENTS.map((agent, i) => {
          const state = agentStates[agent.id] || {};
          const status = state.status || 'idle';
          const progress = state.progress || 0;

          return (
            <motion.div
              key={agent.id}
              custom={i}
              variants={FADE_UP}
              initial="hidden"
              animate="show"
              className="flex items-center gap-3 py-1.5"
            >
              <div className={cn(
                'w-7 h-7 rounded-[6px] flex items-center justify-center text-[10px] font-mono font-bold text-white flex-shrink-0',
                agent.layer === 1 ? 'bg-blue-500' :
                agent.layer === 2 ? 'bg-brand-green' :
                agent.layer === 3 ? 'bg-violet-600' : 'bg-cyan-600'
              )}>
                {agent.code}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-medium text-ink dark:text-white truncate">{agent.name}</span>
                  <AgentStatusBadge status={status} className="flex-shrink-0 ml-2" />
                </div>
                {status === 'running' && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-border dark:bg-dark-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-green rounded-full transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono-nums text-ink-faint dark:text-gray-500 w-8 text-right">
                      {Math.round(progress)}%
                    </span>
                  </div>
                )}
                {status !== 'running' && state.currentTask && (
                  <p className="text-[10px] text-ink-faint dark:text-gray-500 truncate">{state.currentTask}</p>
                )}
                {showInternals && state.tokensUsed > 0 && (
                  <p className="text-[10px] text-ink-faint dark:text-gray-500 font-mono-nums">
                    {(state.tokensUsed / 1000).toFixed(1)}k tokens
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-border dark:border-dark-border">
        <Link to="/pipeline" className="flex items-center justify-between text-xs text-brand-green font-medium hover:opacity-80 transition-opacity">
          <span>View full pipeline</span>
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

function GatesSummary() {
  const gates = useGateStore((s) => s.gates);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-ink dark:text-white">Approval Gates</h3>
          <p className="text-xs text-ink-muted dark:text-gray-400 mt-0.5">4 gates · SLA monitoring</p>
        </div>
        <Link to="/gates" className="text-xs text-brand-green font-medium hover:opacity-80 flex items-center gap-1">
          Manage <ArrowRight size={12} />
        </Link>
      </div>

      <div className="space-y-3">
        {gates.map((gate) => {
          const pct = gate.itemsCount > 0 ? (gate.itemsApproved / gate.itemsCount) * 100 : 0;
          const statusColors = {
            active: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
            pending: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
            completed: 'text-brand-green bg-brand-green-light dark:bg-green-900/20',
            blocked: 'text-red-600 bg-red-50 dark:bg-red-900/20',
          };

          return (
            <div key={gate.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn('badge text-xs', statusColors[gate.status])}>
                    Gate {gate.number}
                  </span>
                  <span className="text-xs font-medium text-ink dark:text-white">{gate.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono-nums text-ink-muted dark:text-gray-400">
                    {gate.itemsApproved}/{gate.itemsCount}
                  </span>
                  {gate.status === 'active' && (
                    <SLATimer deadline={gate.slaDeadline} slaHours={gate.slaHours} compact />
                  )}
                </div>
              </div>
              <div className="w-full h-1 bg-border dark:bg-dark-border rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-700',
                    gate.status === 'completed' ? 'bg-brand-green' :
                    gate.status === 'active' ? 'bg-amber-400' : 'bg-blue-400'
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BUOutputGrid() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-ink dark:text-white">Output by Business Unit</h3>
          <p className="text-xs text-ink-muted dark:text-gray-400 mt-0.5">62 assets target per BU</p>
        </div>
      </div>
      <div className="space-y-3">
        {BU_PERFORMANCE.map((bu) => (
          <div key={bu.buId}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-ink dark:text-white">{bu.buName}</span>
              <div className="flex items-center gap-2">
                <span className={cn('text-xs font-mono-nums font-semibold', qualityColor(bu.qualityAvg))}>
                  {bu.qualityAvg}
                </span>
                <span className="text-xs font-mono-nums text-ink-muted dark:text-gray-400">
                  {bu.assetsPublished}/{bu.assetsTarget}
                </span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-border dark:bg-dark-border rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-green rounded-full transition-all duration-700"
                style={{ width: `${(bu.assetsPublished / bu.assetsTarget) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CommandCentre() {
  const role = useAppStore((s) => s.role);
  const systemHealth = useAgentStore((s) => s.systemHealth);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* KPI row */}
      <KPIRow />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent status — 1 col */}
        <AgentStatusGrid />

        {/* Middle col — gates + BU output */}
        <div className="space-y-6">
          <GatesSummary />
          <BUOutputGrid />
        </div>

        {/* Activity feed — 1 col */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-ink dark:text-white">Live Activity</h3>
              <p className="text-xs text-ink-muted dark:text-gray-400 mt-0.5">Real-time agent events</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
              <span className="text-[10px] text-brand-green font-medium">Live</span>
            </div>
          </div>
          <ActivityFeed maxItems={12} />
        </div>
      </div>

      {/* AI Panel — explainer */}
      <div className="ai-panel rounded-card p-4 flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-brand-green flex items-center justify-center flex-shrink-0 mt-0.5">
          <Zap size={12} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-brand-green-dark dark:text-green-400">How this platform works</p>
          <p className="text-xs text-ink-muted dark:text-gray-400 mt-1 leading-relaxed max-w-2xl">
            The Campaign Lead provides inputs once per quarter. Every subsequent step is executed automatically by
            13 AI agents across 4 layers. Humans participate only at 4 defined approval gates — Strategy Approval (48h),
            Content Review (24h), Final Approval (24h), and Publish Confirmation (4h). The platform produces 310 assets
            per quarter across 5 Business Units, with full quality scoring on every draft.
          </p>
        </div>
      </div>
    </div>
  );
}
