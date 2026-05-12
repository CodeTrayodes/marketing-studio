import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore, ROLES } from '../store/useAppStore';
import { useAgentStore } from '../store/useAgentStore';
import { useContentStore } from '../store/useContentStore';
import { useGateStore } from '../store/useGateStore';
import { QUARTERLY_METRICS, BU_PERFORMANCE } from '../data/performance';
import { BUSINESS_UNITS, AGENTS } from '../data/agents';
import { ActivityFeed } from '../components/ui/ActivityFeed';
import { cn, formatCurrency, qualityColor } from '../lib/utils';
import { useCountUp } from '../hooks/useCountUp';
import { useSLATimer } from '../hooks/useSLATimer';
import { motion } from 'framer-motion';
import {
  ArrowRight, TrendingUp, Clock, CheckCircle2, AlertTriangle, ChevronRight,
} from 'lucide-react';

// ─── Shared ────────────────────────────────────────────────────────────────────

const FADE_UP = {
  hidden: { opacity: 0, y: 8 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.055, duration: 0.35, ease: [0.16, 1, 0.3, 1] } }),
};

const LAYER_COLOR = { 1: '#2563EB', 2: '#16A34A', 3: '#7C3AED', 4: '#0891B2' };
const LAYER_LABEL = {
  1: 'Campaign Intelligence',
  2: 'Content Production',
  3: 'Distribution',
  4: 'Analytics & Optimisation',
};

/** Highlighted number span — bold green */
function N({ children }) {
  return <strong className="font-bold text-brand-green">{children}</strong>;
}

/** Thin semi-circle arc progress SVG */
function ArcProgress({ pct, size = 56, sw = 3, color = '#16A34A' }) {
  const r = (size - sw * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const arc = Math.PI * r;
  const filled = arc * Math.min(1, Math.max(0, pct / 100));
  // sweep-flag=0 → counterclockwise → top half
  const d = `M ${sw} ${cy} A ${r} ${r} 0 0 0 ${size - sw} ${cy}`;
  return (
    <svg width={size} height={cy + sw} className="overflow-visible flex-shrink-0">
      <path d={d} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"
        className="text-border dark:text-dark-border" />
      <path d={d} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={arc} strokeDashoffset={arc - filled}
        style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
    </svg>
  );
}

function SectionHead({ title, sub }) {
  return (
    <div className="mb-3">
      <h2 className="text-[11px] font-semibold text-ink dark:text-white">{title}</h2>
      {sub && <p className="text-[10px] text-ink-muted dark:text-gray-400 mt-px">{sub}</p>}
    </div>
  );
}

// ─── Section 1: Executive Briefing Bar ────────────────────────────────────────

function BriefingBar({ role }) {
  const gates = useGateStore((s) => s.gates);
  const gate2 = gates.find((g) => g.id === 'gate-2');
  const remaining = useSLATimer(gate2?.slaDeadline);
  const hoursSaved = Math.round(QUARTERLY_METRICS.laborValueSaved / 95);
  const showROI = role !== ROLES.CONTENT_EDITOR;

  return (
    <div className="w-full border-b px-6 py-3 flex-shrink-0"
      style={{
        backgroundColor: 'var(--briefing-bg, #F0FDF4)',
        borderColor: 'var(--briefing-border, #BBF7D0)',
      }}>
      <style>{`
        :root { --briefing-bg:#F0FDF4; --briefing-border:#BBF7D0; }
        .dark { --briefing-bg:#052e16; --briefing-border:#166534; }
      `}</style>
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-6">
        <p className="text-[11px] text-ink dark:text-green-100 leading-relaxed flex-1">
          This quarter, your AI content system has produced{' '}
          <N>{QUARTERLY_METRICS.assetsProduced}</N> assets across{' '}
          <N>{BUSINESS_UNITS.length}</N> Business Units
          {showROI && (
            <> - saving your team an estimated <N>{hoursSaved.toLocaleString()}</N> hours,
            equivalent to <N>{formatCurrency(QUARTERLY_METRICS.laborValueSaved)}</N> in agency costs</>
          )}.
          {gate2 && remaining && !remaining.overdue && (
            <> Gate 2 is in review -{' '}
              <N>{remaining.hours}h {remaining.minutes}m</N> of your {gate2.slaHours}h SLA remaining.
            </>
          )}
          {gate2 && remaining?.overdue && (
            <> <span className="font-bold text-red-600 dark:text-red-400">Gate 2 SLA overdue.</span></>
          )}
        </p>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/60 dark:bg-green-900/30 border border-[#BBF7D0] dark:border-[#166534] flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
          <span className="text-[10px] font-semibold text-brand-green-dark dark:text-green-400 whitespace-nowrap">
            Live · Q2 2025
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Section 2: Hero Metrics (6 cards, 3×2 grid) ──────────────────────────────

function Card({ children, className }) {
  return (
    <div className={cn('card p-4 flex flex-col gap-2', className)}>{children}</div>
  );
}

function CardLabel({ children }) {
  return <p className="text-[10px] font-medium text-ink-muted dark:text-gray-400 uppercase tracking-wider leading-none">{children}</p>;
}

function CardValue({ children, className }) {
  return (
    <span className={cn('text-[18px] font-semibold font-mono-nums text-ink dark:text-white leading-none', className)}>
      {children}
    </span>
  );
}

function CardExplanation({ children }) {
  return <p className="text-[9px] text-ink-faint dark:text-gray-500 leading-relaxed">{children}</p>;
}

function HeroMetrics({ role }) {
  const assets = useContentStore((s) => s.assets);
  const gates = useGateStore((s) => s.gates);

  const avgGeoScore = useMemo(() => {
    const w = assets.filter((a) => a.qualityScores?.geo);
    return w.length ? Math.round(w.reduce((s, a) => s + a.qualityScores.geo, 0) / w.length) : 84;
  }, [assets]);

  const completionPct = Math.round((QUARTERLY_METRICS.assetsProduced / QUARTERLY_METRICS.assetsTarget) * 100);
  const dailyAssets = Math.max(1, Math.round(QUARTERLY_METRICS.assetsPublished / 65));
  const dailyValue = Math.round(QUARTERLY_METRICS.laborValueSaved / 65);

  const assetsUp = useCountUp(QUARTERLY_METRICS.assetsProduced, 1400, 0);
  const pctUp = useCountUp(completionPct, 1200, 0);
  const laborUp = useCountUp(QUARTERLY_METRICS.laborValueSaved, 1400, 0);
  const qualUp = useCountUp(QUARTERLY_METRICS.qualityAverage, 1000, 1);
  const geoUp = useCountUp(avgGeoScore, 1100, 0);

  const activeGate = gates.find((g) => g.status === 'active');
  const gateRemaining = useSLATimer(activeGate?.slaDeadline);
  const isOverdue = gateRemaining?.overdue;

  const showROI = role !== ROLES.CONTENT_EDITOR;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">

      {/* 1 — Assets Produced */}
      <motion.div custom={0} variants={FADE_UP} initial="hidden" animate="show">
        <Card>
          <CardLabel>Assets Produced This Quarter</CardLabel>
          <div className="flex items-baseline gap-1.5">
            <CardValue>{assetsUp}</CardValue>
            <span className="text-[10px] text-ink-muted dark:text-gray-400">
              of {QUARTERLY_METRICS.assetsTarget} target
            </span>
          </div>
          <div className="flex items-center gap-1 text-brand-green text-[10px]">
            <TrendingUp size={10} />
            <span>+{dailyAssets} since yesterday</span>
          </div>
          <div className="w-full h-px bg-border dark:bg-dark-border rounded-full overflow-hidden">
            <div className="h-full bg-brand-green rounded-full transition-all duration-1000"
              style={{ width: `${completionPct}%` }} />
          </div>
          <CardExplanation>
            Every piece of content your AI agents have completed and passed quality checks this quarter.
          </CardExplanation>
        </Card>
      </motion.div>

      {/* 2 — Completion Rate */}
      <motion.div custom={1} variants={FADE_UP} initial="hidden" animate="show">
        <Card>
          <CardLabel>Quarterly Target Progress</CardLabel>
          <div className="flex items-end justify-between gap-2">
            <div className="flex flex-col gap-1.5">
              <CardValue>{pctUp}%</CardValue>
              <CardExplanation>How far through the Q2 content programme you are.</CardExplanation>
            </div>
            <ArcProgress pct={completionPct} size={64} sw={4} />
          </div>
        </Card>
      </motion.div>

      {/* 3 — Agency Cost Saved */}
      {showROI ? (
        <motion.div custom={2} variants={FADE_UP} initial="hidden" animate="show">
          <Card className="bg-brand-green-light dark:bg-green-900/10 border-brand-green/20">
            <CardLabel>Agency Cost Avoided</CardLabel>
            <CardValue className="text-brand-green">{formatCurrency(laborUp)}</CardValue>
            <div className="flex items-center gap-1 text-brand-green text-[10px]">
              <TrendingUp size={10} />
              <span>+{formatCurrency(dailyValue)} today</span>
            </div>
            <p className="text-[9px] text-ink-muted dark:text-green-200/60 leading-relaxed">
              At ~{formatCurrency(Math.round(QUARTERLY_METRICS.laborValueSaved / QUARTERLY_METRICS.assetsProduced))} avg per asset vs external agency rates.
            </p>
          </Card>
        </motion.div>
      ) : (
        <motion.div custom={2} variants={FADE_UP} initial="hidden" animate="show">
          <Card>
            <CardLabel>Gate Approval Rate</CardLabel>
            <CardValue className="text-brand-green">{QUARTERLY_METRICS.gateApprovalRate}%</CardValue>
            <CardExplanation>Of submitted items approved at first pass — no revisions required.</CardExplanation>
          </Card>
        </motion.div>
      )}

      {/* 4 — Avg Quality Score */}
      <motion.div custom={3} variants={FADE_UP} initial="hidden" animate="show">
        <Card>
          <CardLabel>Average Quality Score</CardLabel>
          <div className="flex items-baseline gap-1">
            <CardValue className={qualityColor(QUARTERLY_METRICS.qualityAverage)}>{qualUp}</CardValue>
            <span className="text-[11px] text-ink-muted dark:text-gray-400">/100</span>
          </div>
          <p className="text-[10px] text-ink-faint dark:text-gray-500">SEO · Brand · GEO · AI Detection</p>
          <CardExplanation>
            Composite score across all quality dimensions checked by the Quality Gate Agent.
          </CardExplanation>
        </Card>
      </motion.div>

      {/* 5 — GEO Readiness */}
      <motion.div custom={4} variants={FADE_UP} initial="hidden" animate="show">
        <Card>
          <CardLabel>GEO Readiness Score</CardLabel>
          <div className="flex items-baseline gap-2">
            <CardValue className="text-brand-green">{geoUp}%</CardValue>
            <span className="inline-flex items-center px-1.5 py-px rounded text-[8px] font-bold tracking-wide bg-brand-green text-white leading-none">
              NEW
            </span>
          </div>
          <p className="text-[10px] text-ink-faint dark:text-gray-500">Citation potential for AI systems</p>
          <CardExplanation>
            How likely this content is to be cited by ChatGPT, Claude, Perplexity, and Gemini.
          </CardExplanation>
        </Card>
      </motion.div>

      {/* 6 — Gate Status */}
      <motion.div custom={5} variants={FADE_UP} initial="hidden" animate="show">
        <Card className={cn(isOverdue && 'border-red-400 dark:border-red-700 bg-red-50/40 dark:bg-red-900/10')}>
          <CardLabel>Current Gate</CardLabel>
          {activeGate ? (
            <>
              <div className="flex items-baseline gap-1.5">
                <CardValue className={cn(isOverdue ? 'text-red-600 dark:text-red-400' : 'text-ink dark:text-white')}>
                  Gate {activeGate.number}
                </CardValue>
                <span className="text-[10px] text-ink-muted dark:text-gray-400">of 4</span>
              </div>
              {gateRemaining && (
                isOverdue ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400">
                    <AlertTriangle size={11} /> OVERDUE
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-mono-nums">
                    <Clock size={10} />
                    {gateRemaining.hours}h {gateRemaining.minutes}m remaining
                  </span>
                )
              )}
              <CardExplanation>
                The current approval stage. All 4 gates must be passed before content publishes.
              </CardExplanation>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 text-brand-green mt-1">
                <CheckCircle2 size={14} />
                <span className="text-[11px] font-semibold">All gates passed</span>
              </div>
              <CardExplanation>Content has cleared all approval gates this quarter.</CardExplanation>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

// ─── Section 3: BU Progress Strip ─────────────────────────────────────────────

function BUProgressStrip({ selectedBU, onSelectBU }) {
  const gates = useGateStore((s) => s.gates);
  const activeGate = gates.find((g) => g.status === 'active') || gates[0];
  const gateLabel = activeGate?.status === 'active' ? 'In Review'
    : activeGate?.status === 'completed' ? 'Complete' : 'Pending';

  return (
    <div>
      <SectionHead
        title="Progress by Business Unit"
        sub="Each unit runs the same 62-asset programme this quarter"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {BU_PERFORMANCE.map((bu, i) => {
          const cfg = BUSINESS_UNITS.find((b) => b.id === bu.buId);
          const active = selectedBU === bu.buId;
          return (
            <motion.button
              key={bu.buId}
              custom={i}
              variants={FADE_UP}
              initial="hidden"
              animate="show"
              onClick={() => onSelectBU(active ? null : bu.buId)}
              className={cn(
                'card p-3 text-left transition-all duration-200 overflow-hidden relative',
                active ? 'shadow-card-hover' : 'hover:shadow-card-hover'
              )}
            >
              {active && (
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-card"
                  style={{ backgroundColor: cfg?.color }} />
              )}
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cfg?.color || '#6B7280' }} />
                <span className="text-[10px] font-semibold text-ink dark:text-white truncate">{bu.buName}</span>
              </div>
              <div className="flex items-end justify-between mb-1">
                <span className="text-[18px] font-semibold font-mono-nums text-ink dark:text-white leading-none">
                  {bu.assetsPublished}
                </span>
                <span className="text-[9px] text-ink-faint dark:text-gray-500 mb-0.5">/ 62</span>
              </div>
              <div className="w-full h-px bg-border dark:bg-dark-border rounded-full overflow-hidden mb-1.5">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${bu.completionPct}%`, backgroundColor: cfg?.color || '#16A34A' }} />
              </div>
              <p className="text-[9px] text-ink-faint dark:text-gray-500">
                Gate {activeGate?.number} · {gateLabel}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Section 4: Live Activity + Gate Quick-Action ─────────────────────────────

function GateActionCard({ gate }) {
  const navigate = useNavigate();
  const remaining = useSLATimer(gate.slaDeadline);
  const pct = gate.itemsCount > 0 ? (gate.itemsApproved / gate.itemsCount) * 100 : 0;

  return (
    <div className="card p-4 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <span className="badge bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
          Gate {gate.number}
        </span>
        <span className="text-[11px] font-semibold text-ink dark:text-white">{gate.name}</span>
      </div>

      {remaining && !remaining.overdue && (
        <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-2">
          <Clock size={10} />
          {remaining.hours}h {remaining.minutes}m remaining
          · {gate.itemsCount - gate.itemsApproved} assets awaiting
        </p>
      )}

      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-ink-muted dark:text-gray-400">
            {gate.itemsApproved} of {gate.itemsCount} reviewed
          </span>
          <span className="text-[10px] font-mono-nums text-ink-muted dark:text-gray-400">{Math.round(pct)}%</span>
        </div>
        <div className="w-full h-px bg-border dark:bg-dark-border rounded-full overflow-hidden">
          <div className="h-full bg-amber-400 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }} />
        </div>
      </div>

      <p className="text-[10px] text-ink-muted dark:text-gray-400 leading-relaxed flex-1">
        {gate.description}
      </p>

      <button
        onClick={() => navigate('/gates')}
        className="mt-3 w-full flex items-center justify-center gap-1.5 bg-brand-green text-white text-[10px] font-semibold px-3 py-2 rounded-btn hover:bg-brand-green-dark transition-colors"
      >
        Review Now <ArrowRight size={11} />
      </button>
    </div>
  );
}

function LastPublishedPreview() {
  const assets = useContentStore((s) => s.assets);
  const last = useMemo(() =>
    assets
      .filter((a) => a.status === 'published' && a.publishedAt)
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))[0],
    [assets]
  );

  if (!last) return null;

  return (
    <div className="card p-4 h-full">
      <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-faint dark:text-gray-500 mb-2">
        Last Published
      </p>
      <p className="text-[10px] font-semibold text-ink dark:text-white leading-snug mb-1.5 line-clamp-3">
        {last.title}
      </p>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="badge bg-surface-muted dark:bg-dark-border text-ink-muted dark:text-gray-400">
          {last.buAbbr}
        </span>
        <span className="badge bg-surface-muted dark:bg-dark-border text-ink-muted dark:text-gray-400">
          {last.typeName}
        </span>
        {last.qualityScores?.overall && (
          <span className={cn('text-[10px] font-mono-nums font-semibold', qualityColor(last.qualityScores.overall))}>
            {last.qualityScores.overall}/100
          </span>
        )}
      </div>
      <Link
        to="/content"
        className="mt-3 flex items-center gap-1 text-[10px] text-brand-green font-medium hover:opacity-80"
      >
        View in Content Tracker <ArrowRight size={10} />
      </Link>
    </div>
  );
}

function ActivitySection() {
  const gates = useGateStore((s) => s.gates);
  const activeGate = gates.find((g) => g.status === 'active');

  return (
    <div>
      <SectionHead title="Live Activity" sub="What the agents are doing right now" />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-3 card p-4 overflow-hidden">
          <ActivityFeed maxItems={8} />
        </div>
        <div className="lg:col-span-2">
          {activeGate ? <GateActionCard gate={activeGate} /> : <LastPublishedPreview />}
        </div>
      </div>
    </div>
  );
}

// ─── Section 5: Agent Health (role-gated) ─────────────────────────────────────

function AgentHealthSection() {
  const agentStates = useAgentStore((s) => s.agentStates);
  const feed = useAgentStore((s) => s.activityFeed);
  const navigate = useNavigate();

  const layers = [1, 2, 3, 4].map((layer) => {
    const la = AGENTS.filter((a) => a.layer === layer);
    const running = la.filter((a) => agentStates[a.id]?.status === 'running').length;
    const errors = la.filter((a) => agentStates[a.id]?.status === 'error').length;
    const last = feed.find((f) => {
      const agent = AGENTS.find((ag) => ag.id === f.agentId);
      return agent?.layer === layer;
    });
    const health = errors > 0 ? 'error' : running > 0 ? 'active' : 'idle';
    return { layer, label: LAYER_LABEL[layer], color: LAYER_COLOR[layer], count: la.length, running, errors, last, health };
  });

  return (
    <div>
      <SectionHead title="Agent Health" sub="Operational status across all 4 pipeline layers" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {layers.map((l, i) => (
          <motion.button
            key={l.layer}
            custom={i}
            variants={FADE_UP}
            initial="hidden"
            animate="show"
            onClick={() => navigate('/pipeline')}
            className="card p-3 text-left hover:shadow-card-hover transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  'w-1.5 h-1.5 rounded-full flex-shrink-0',
                  l.health === 'active' ? 'bg-brand-green animate-pulse' :
                  l.health === 'error' ? 'bg-red-500 animate-pulse' : 'bg-agent-idle'
                )} />
                <span className="text-[9px] font-semibold uppercase tracking-wider text-ink-faint dark:text-gray-500">
                  L{l.layer}
                </span>
              </div>
              <span className="text-[9px] text-ink-faint dark:text-gray-500">{l.count} agents</span>
            </div>

            <p className="text-[10px] font-semibold mb-1" style={{ color: l.color }}>
              {l.label}
            </p>

            <p className="text-[10px] text-ink-muted dark:text-gray-400">
              {l.health === 'active' ? `${l.running} active` :
               l.health === 'error' ? `${l.errors} error` : 'Idle'}
            </p>

            {l.last && (
              <p className="text-[9px] text-ink-faint dark:text-gray-500 truncate mt-1">
                {l.last.agentName} · {l.last.action}
              </p>
            )}

            <div className="flex items-center gap-1 mt-2 text-[9px] text-brand-green opacity-0 group-hover:opacity-100 transition-opacity">
              View pipeline <ChevronRight size={10} />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Content Editor: Review Queue ─────────────────────────────────────────────

function EditorReviewQueue() {
  const assets = useContentStore((s) => s.assets);
  const navigate = useNavigate();

  const queue = useMemo(
    () => assets.filter((a) => a.status === 'gate-2-pending'),
    [assets]
  );
  const preview = queue.slice(0, 5);

  return (
    <div>
      <SectionHead
        title="My Review Queue"
        sub={`${queue.length} asset${queue.length !== 1 ? 's' : ''} awaiting content review`}
      />
      <div className="card overflow-hidden">
        {queue.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 size={20} className="text-brand-green mx-auto mb-2" />
            <p className="text-[11px] font-medium text-ink-muted dark:text-gray-400">Review queue is clear</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-border dark:divide-dark-border">
              {preview.map((a) => (
                <div key={a.id} className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-surface-muted dark:hover:bg-dark-card/40">
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-ink dark:text-white truncate">{a.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="badge bg-surface-muted dark:bg-dark-border text-ink-muted dark:text-gray-400">{a.buAbbr}</span>
                      <span className="text-[9px] text-ink-faint dark:text-gray-500">{a.typeName}</span>
                    </div>
                  </div>
                  {a.qualityScores?.overall && (
                    <span className={cn('text-[10px] font-mono-nums font-semibold flex-shrink-0', qualityColor(a.qualityScores.overall))}>
                      {a.qualityScores.overall}/100
                    </span>
                  )}
                </div>
              ))}
            </div>
            {queue.length > 5 && (
              <div className="px-4 py-2 border-t border-border dark:border-dark-border">
                <button
                  onClick={() => navigate('/gates')}
                  className="text-[10px] text-brand-green font-medium flex items-center gap-1 hover:opacity-80"
                >
                  View all {queue.length} items in Gate Manager <ArrowRight size={10} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function CommandCentre() {
  const role = useAppStore((s) => s.role);
  const [selectedBU, setSelectedBU] = useState(null);

  const showMetrics = role !== ROLES.CONTENT_EDITOR;
  const showAgentHealth = role === ROLES.AI_COE || role === ROLES.CAMPAIGN_LEAD;
  const showEditorQueue = role === ROLES.CONTENT_EDITOR;

  return (
    <div className="flex flex-col min-h-full">
      <BriefingBar role={role} />

      <div className="p-4 space-y-5 max-w-[1400px] mx-auto w-full">
        {showMetrics && <HeroMetrics role={role} />}
        <BUProgressStrip selectedBU={selectedBU} onSelectBU={setSelectedBU} />
        <ActivitySection />
        {showAgentHealth && <AgentHealthSection />}
        {showEditorQueue && <EditorReviewQueue />}
      </div>
    </div>
  );
}
