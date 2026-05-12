import { useState, useMemo } from 'react';
import { useAppStore, ROLES } from '../store/useAppStore';
import { useContentStore } from '../store/useContentStore';
import {
  QUARTERLY_METRICS, BU_PERFORMANCE, WEEKLY_TREND,
  CHANNEL_BREAKDOWN, LABOUR_VALUE_BREAKDOWN,
} from '../data/performance';
import { cn, formatCurrency, qualityColor, timeAgo } from '../lib/utils';
import { useCountUp } from '../hooks/useCountUp';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, TrendingUp, Info } from 'lucide-react';

const FADE_UP = {
  hidden: { opacity: 0, y: 8 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] } }),
};

// ─── Shared helpers ───────────────────────────────────────────────────────────

function SectionHeader({ children }) {
  return <p className="text-[10px] font-semibold text-ink-faint dark:text-gray-500 uppercase tracking-widest mb-3">{children}</p>;
}

function MetricTile({ label, value, sub, accent, explanation, i = 0 }) {
  return (
    <motion.div custom={i} variants={FADE_UP} initial="hidden" animate="show" className="card p-4">
      <p className="text-[10px] font-medium text-ink-muted dark:text-gray-400 uppercase tracking-wider leading-none mb-2">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className={cn('text-lg font-semibold font-mono-nums', accent ? 'text-brand-green' : 'text-ink dark:text-white')}>{value}</span>
        {sub && <span className="text-[10px] text-ink-muted dark:text-gray-400">{sub}</span>}
      </div>
      {explanation && <p className="text-[9px] text-ink-faint dark:text-gray-500 mt-1.5 leading-relaxed">{explanation}</p>}
    </motion.div>
  );
}

function CssBar({ pct, color = '#16A34A', height = 1 }) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, backgroundColor: 'var(--color-border, #E5E7EB)' }}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }} />
    </div>
  );
}

// ─── ROI Hero ─────────────────────────────────────────────────────────────────

function ROIHeroCard() {
  const laborVal = useCountUp(QUARTERLY_METRICS.laborValueSaved, 1600, 0);
  const computeCost = useCountUp(QUARTERLY_METRICS.platformCost, 1000, 0);
  const roiMult = useCountUp(QUARTERLY_METRICS.roiMultiple, 1400, 1);
  const perAsset = Math.round(QUARTERLY_METRICS.laborValueSaved / QUARTERLY_METRICS.assetsProduced);

  return (
    <div className="roi-hero">
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-green-700 dark:text-green-400 mb-1">Agency Cost Avoided This Quarter</p>
        <p className="text-[32px] font-bold text-brand-green leading-none font-mono-nums">{formatCurrency(laborVal)}</p>
        <p className="text-[11px] text-ink-muted dark:text-green-200/70 mt-3 leading-relaxed max-w-xl">
          Your AI content system spent{' '}
          <strong className="text-ink dark:text-green-100">{formatCurrency(computeCost)}</strong> in compute this quarter.
          At {formatCurrency(perAsset)} per asset versus external agency rates, that is a{' '}
          <strong className="text-brand-green">{roiMult}×</strong> return on every pound invested in AI content production.
        </p>
      </div>
      <div className="flex flex-col items-center flex-shrink-0 pr-2">
        <p className="text-[48px] font-bold text-brand-green leading-none font-mono-nums">{roiMult}×</p>
        <p className="text-[9px] font-semibold text-green-700 dark:text-green-400 mt-1 text-center uppercase tracking-wider">ROI Multiple</p>
      </div>
    </div>
  );
}

// ─── 4 Metric row ─────────────────────────────────────────────────────────────

function MetricsRow() {
  const laborVal = useCountUp(QUARTERLY_METRICS.laborValueSaved, 1400, 0);
  const computeCost = useCountUp(QUARTERLY_METRICS.platformCost, 900, 0);
  const netSaving = useCountUp(QUARTERLY_METRICS.netROI, 1400, 0);
  const hoursAuto = useCountUp(Math.round(QUARTERLY_METRICS.laborValueSaved / 95), 1200, 0);

  const tiles = [
    {
      label: 'Labour Cost Avoided',
      value: formatCurrency(laborVal),
      accent: true,
      explanation: `Based on ${QUARTERLY_METRICS.assetsProduced} assets × avg £500 equivalent agency rate per asset`,
      i: 0,
    },
    {
      label: 'AI Compute Cost',
      value: formatCurrency(computeCost),
      explanation: 'Platform and model API costs across all 13 agents this quarter',
      i: 1,
    },
    {
      label: 'Net Saving',
      value: formatCurrency(netSaving),
      accent: true,
      explanation: 'Labour cost avoided minus AI compute — the true bottom-line gain',
      i: 2,
    },
    {
      label: 'Hours Automated',
      value: `${hoursAuto.toLocaleString()}h`,
      accent: true,
      explanation: 'Equivalent human content production hours replaced by the AI system',
      i: 3,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {tiles.map(t => <MetricTile key={t.label} {...t} />)}
    </div>
  );
}

// ─── Quarterly Projection ─────────────────────────────────────────────────────

function ProjectionCard() {
  const pace = Math.round(QUARTERLY_METRICS.assetsProduced / 9);
  const projected = QUARTERLY_METRICS.assetsProduced + pace * 4;
  const perAssetValue = Math.round(QUARTERLY_METRICS.laborValueSaved / QUARTERLY_METRICS.assetsProduced);
  const projectedValue = projected * perAssetValue;
  const annualSaving = projectedValue * 4;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold text-ink dark:text-white">Quarterly Projection</p>
        <span className="text-[9px] text-ink-faint dark:text-gray-500">at current {pace} assets/week pace</span>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {[
          { label: 'Projected Assets', value: projected.toLocaleString(), note: `${QUARTERLY_METRICS.assetsProduced} produced + ${pace * 4} remaining` },
          { label: 'Projected Cost Avoided', value: formatCurrency(projectedValue), note: `${formatCurrency(perAssetValue)} per asset` },
          { label: 'Projected Annual Saving', value: formatCurrency(annualSaving), note: '4 quarters at this rate' },
        ].map(({ label, value, note }) => (
          <div key={label}>
            <p className="text-[9px] text-ink-faint dark:text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-[18px] font-semibold font-mono-nums text-ink dark:text-white">{value}</p>
            <p className="text-[9px] text-ink-faint dark:text-gray-500 mt-0.5">{note}</p>
          </div>
        ))}
      </div>
      <p className="text-[9px] text-ink-faint dark:text-gray-500 mt-3 italic border-t border-border dark:border-dark-border pt-2">
        Assumes current production rate continues. Actual results depend on gate approval cadence and agent availability.
      </p>
    </div>
  );
}

// ─── Content Performance Table ────────────────────────────────────────────────

function ContentPerformanceTable() {
  const assets = useContentStore(s => s.assets);
  const published = useMemo(() => assets.filter(a => a.status === 'published').slice(0, 20), [assets]);

  return (
    <div className="space-y-3">
      <SectionHeader>Content Performance</SectionHeader>
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-border dark:border-dark-border">
          <p className="text-[11px] font-semibold text-ink dark:text-white">Published Assets</p>
          <p className="text-[10px] text-ink-muted dark:text-gray-400 mt-0.5">Quality and GEO scores are available for all published content. Attribution data connects after Salesforce and GA4 integration in Phase 2.</p>
        </div>
        <table className="w-full">
          <thead className="bg-surface-muted dark:bg-dark-card">
            <tr>
              {['Title', 'Type', 'Published', 'Quality', 'GEO Score', 'Status'].map(h => (
                <th key={h} className="text-left px-3 py-2 text-[9px] text-ink-faint dark:text-gray-500 uppercase tracking-wider font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-dark-border">
            {published.map(asset => (
              <tr key={asset.id} className="hover:bg-surface-muted dark:hover:bg-dark-card/40">
                <td className="px-3 py-2">
                  <p className="text-[10px] font-medium text-ink dark:text-white max-w-[280px] truncate">{asset.title}</p>
                </td>
                <td className="px-3 py-2 text-[9px] text-ink-muted dark:text-gray-400 whitespace-nowrap">{asset.typeName}</td>
                <td className="px-3 py-2 text-[9px] text-ink-faint dark:text-gray-500 whitespace-nowrap">
                  {asset.publishedAt ? timeAgo(asset.publishedAt) : '—'}
                </td>
                <td className="px-3 py-2">
                  <span className={cn('text-[9px] font-mono font-semibold', qualityColor(asset.qualityScores?.overall ?? 0))}>
                    {asset.qualityScores?.overall ?? '—'}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-10 h-px bg-border dark:bg-dark-border rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${asset.qualityScores?.geo ?? 0}%` }} />
                    </div>
                    <span className="text-[9px] font-mono text-blue-600 dark:text-blue-400">{asset.qualityScores?.geo ?? '—'}</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Published</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-2 bg-surface-muted dark:bg-dark-border border-t border-border dark:border-dark-border">
          <p className="text-[9px] text-ink-faint dark:text-gray-500">
            Full attribution (sessions, pipeline influence, conversions) available after Phase 2 integrations. Showing {published.length} of {assets.filter(a => a.status === 'published').length} published assets.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── GEO Performance ─────────────────────────────────────────────────────────

const GEO_TYPE_LABELS = {
  'seo-blog': 'SEO Blog',
  'guest-post': 'Guest Post',
  reddit: 'Reddit',
  linkedin: 'LinkedIn',
  podcast: 'Podcast',
  'video-script': 'Video Script',
  'case-study': 'Case Study',
  'sales-enablement': 'Sales Enablement',
  'email-sequence': 'Email Sequence',
  repurposed: 'Repurposed',
};

function WhyGEOCard() {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-surface-muted dark:hover:bg-dark-border transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-brand-green/20 flex items-center justify-center flex-shrink-0">
            <span className="text-brand-green text-[8px] font-bold">AI</span>
          </div>
          <p className="text-[11px] font-semibold text-ink dark:text-white">Why GEO matters for enterprise content</p>
        </div>
        {open ? <ChevronUp size={12} className="text-ink-muted" /> : <ChevronDown size={12} className="text-ink-muted" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border dark:border-dark-border pt-3 space-y-2">
              <p className="text-[10px] text-ink-muted dark:text-gray-400 leading-relaxed">
                In 2026, being cited by AI systems is as valuable as a page 1 Google ranking.
                GEO (Generative Engine Optimisation) readiness measures how structured, specific, and citable your content
                is to LLM retrieval systems like ChatGPT, Claude, and Perplexity.
              </p>
              <p className="text-[10px] text-ink-muted dark:text-gray-400 leading-relaxed">
                High-GEO content tends to be: well-structured with clear headings, specific (with data, names, and examples),
                original (not paraphrased), and authoritative (with clear attribution).
                Reddit threads and case studies consistently score highest because they contain first-person experience and specific data points.
              </p>
              <p className="text-[10px] text-ink-muted dark:text-gray-400 leading-relaxed">
                <strong className="text-ink dark:text-white">GEO scores above 80%</strong> indicate strong citation potential.
                We target 80+ across all content types — particularly for SEO blogs and case studies, which are most likely to appear in AI-generated answers.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GEOSection() {
  const assets = useContentStore(s => s.assets);

  const geoByType = useMemo(() => {
    const map = {};
    assets.forEach(a => {
      if (a.qualityScores?.geo) {
        const key = a.type;
        if (!map[key]) map[key] = { sum: 0, count: 0, name: GEO_TYPE_LABELS[key] || a.typeName };
        map[key].sum += a.qualityScores.geo;
        map[key].count++;
      }
    });
    return Object.entries(map)
      .map(([, v]) => ({ name: v.name, avg: Math.round(v.sum / v.count) }))
      .sort((a, b) => b.avg - a.avg);
  }, [assets]);

  return (
    <div className="space-y-3">
      <SectionHeader>GEO Readiness — AI Citation Potential</SectionHeader>
      <p className="text-[10px] text-ink-muted dark:text-gray-400 -mt-2">
        How likely your content is to be cited by AI systems like ChatGPT, Claude, and Perplexity.
      </p>

      <div className="card p-4 space-y-2.5">
        {geoByType.map(({ name, avg }) => {
          const barColor = avg >= 80 ? '#16A34A' : avg >= 65 ? '#D97706' : '#DC2626';
          return (
            <div key={name} className="flex items-center gap-3">
              <span className="text-[10px] text-ink-muted dark:text-gray-400 w-36 flex-shrink-0 text-right">{name}</span>
              <div className="flex-1">
                <CssBar pct={avg} color={barColor} height={4} />
              </div>
              <span className="text-[10px] font-mono font-semibold w-8 flex-shrink-0" style={{ color: barColor }}>{avg}%</span>
            </div>
          );
        })}
        <p className="text-[9px] text-ink-faint dark:text-gray-500 pt-2 border-t border-border dark:border-dark-border">
          GEO scores above 80% indicate strong citation potential. Reddit threads and case studies consistently score highest.
        </p>
      </div>

      <WhyGEOCard />
    </div>
  );
}

// ─── Output + BU table ────────────────────────────────────────────────────────

function OutputSection() {
  const assetsPublished = useCountUp(QUARTERLY_METRICS.assetsPublished, 1000, 0);
  const qualityAvg = useCountUp(QUARTERLY_METRICS.qualityAverage, 900, 1);
  const onTime = useCountUp(QUARTERLY_METRICS.onTimeDelivery, 900, 1);
  const gateRate = useCountUp(QUARTERLY_METRICS.gateApprovalRate, 900, 1);

  return (
    <div className="space-y-3">
      <SectionHeader>Output & Quality</SectionHeader>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Assets Published', value: assetsPublished, sub: `/ ${QUARTERLY_METRICS.assetsTarget}`, i: 0 },
          { label: 'Avg Quality Score', value: `${qualityAvg}`, sub: '/100', accent: true, i: 1 },
          { label: 'On-Time Delivery', value: `${onTime}%`, accent: true, i: 2 },
          { label: 'Gate Approval Rate', value: `${gateRate}%`, accent: true, i: 3 },
        ].map(({ label, value, sub, accent, i }) => (
          <MetricTile key={label} label={label} value={value} sub={sub} accent={accent} i={i} />
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-border dark:border-dark-border">
          <p className="text-[11px] font-semibold text-ink dark:text-white">Performance by Business Unit</p>
        </div>
        <table className="w-full">
          <thead className="bg-surface-muted dark:bg-dark-card">
            <tr>
              {['Business Unit', 'Published', 'Completion', 'Quality', 'Pipeline £', 'Sessions', 'Email Open'].map(h => (
                <th key={h} className="text-left px-3 py-2 text-[9px] text-ink-faint dark:text-gray-500 uppercase tracking-wider font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-dark-border">
            {BU_PERFORMANCE.map((bu, i) => (
              <motion.tr key={bu.buId} custom={i} variants={FADE_UP} initial="hidden" animate="show"
                className="hover:bg-surface-muted dark:hover:bg-dark-card/40">
                <td className="px-3 py-2 text-[10px] font-medium text-ink dark:text-white">{bu.buName}</td>
                <td className="px-3 py-2 text-[10px] font-mono-nums text-ink-muted dark:text-gray-400">{bu.assetsPublished}/{bu.assetsTarget}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 h-px bg-border dark:bg-dark-border rounded-full overflow-hidden">
                      <div className="h-full bg-brand-green rounded-full" style={{ width: `${bu.completionPct}%` }} />
                    </div>
                    <span className="text-[10px] font-mono-nums text-ink-muted dark:text-gray-400">{bu.completionPct}%</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className={cn('text-[10px] font-mono-nums font-semibold', qualityColor(bu.qualityAvg))}>{bu.qualityAvg}</span>
                </td>
                <td className="px-3 py-2 text-[10px] font-mono-nums text-ink-muted dark:text-gray-400">{formatCurrency(bu.pipelineInfluence)}</td>
                <td className="px-3 py-2 text-[10px] font-mono-nums text-ink-muted dark:text-gray-400">{bu.organicSessions.toLocaleString()}</td>
                <td className="px-3 py-2 text-[10px] font-mono-nums text-ink-muted dark:text-gray-400">{bu.emailOpenRate}%</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Labour value table ───────────────────────────────────────────────────────

function ROIBreakdownSection() {
  return (
    <div className="space-y-3">
      <SectionHeader>Labour Value Breakdown</SectionHeader>
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-border dark:border-dark-border">
          <p className="text-[11px] font-semibold text-ink dark:text-white">Equivalent Human Production Cost</p>
          <p className="text-[10px] text-ink-muted dark:text-gray-400 mt-0.5">At market rates for each content role</p>
        </div>
        <table className="w-full">
          <thead className="bg-surface-muted dark:bg-dark-card">
            <tr>
              {['Role', 'Rate/h', 'Hrs/Asset', 'Assets', 'Total Hrs', 'Value'].map(h => (
                <th key={h} className="text-left px-3 py-2 text-[9px] text-ink-faint dark:text-gray-500 uppercase tracking-wider font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-dark-border">
            {LABOUR_VALUE_BREAKDOWN.map(row => (
              <tr key={row.role} className="hover:bg-surface-muted dark:hover:bg-dark-card/40">
                <td className="px-3 py-2 text-[10px] font-medium text-ink dark:text-white">{row.role}</td>
                <td className="px-3 py-2 text-[10px] font-mono-nums text-ink-muted dark:text-gray-400">£{row.rate}</td>
                <td className="px-3 py-2 text-[10px] font-mono-nums text-ink-muted dark:text-gray-400">{row.hoursPerAsset}</td>
                <td className="px-3 py-2 text-[10px] font-mono-nums text-ink-muted dark:text-gray-400">{row.assetCount}</td>
                <td className="px-3 py-2 text-[10px] font-mono-nums text-ink-muted dark:text-gray-400">{row.totalHours.toLocaleString()}</td>
                <td className="px-3 py-2 text-[10px] font-mono-nums font-semibold text-brand-green">{formatCurrency(row.totalValue)}</td>
              </tr>
            ))}
            <tr className="bg-surface-muted dark:bg-dark-card border-t-2 border-border dark:border-dark-border">
              <td className="px-3 py-2 text-[10px] font-semibold text-ink dark:text-white" colSpan={4}>Total</td>
              <td className="px-3 py-2 text-[10px] font-mono-nums font-semibold text-ink dark:text-white">
                {LABOUR_VALUE_BREAKDOWN.reduce((s, r) => s + r.totalHours, 0).toLocaleString()}
              </td>
              <td className="px-3 py-2 text-[11px] font-mono-nums font-bold text-brand-green">
                {formatCurrency(QUARTERLY_METRICS.laborValueSaved)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PerformancePage() {
  const role = useAppStore(s => s.role);
  const showROI = role !== ROLES.CONTENT_EDITOR;

  return (
    <div className="p-4 space-y-5 max-w-[1400px] mx-auto">

      {/* ROI Hero */}
      {showROI && <ROIHeroCard />}

      {/* 4 metric tiles */}
      {showROI && <MetricsRow />}

      {/* Output + BU table */}
      <OutputSection />

      {/* Content performance table */}
      <ContentPerformanceTable />

      {/* Quarterly projection */}
      {showROI && <ProjectionCard />}

      {/* GEO section */}
      <GEOSection />

      {/* Labour value breakdown */}
      {showROI && <ROIBreakdownSection />}

      {/* AI explainer */}
      <div className="ai-panel rounded-[10px] p-3 flex items-start gap-2">
        <div className="w-4 h-4 rounded bg-brand-green/20 flex items-center justify-center flex-shrink-0 mt-px">
          <span className="text-brand-green text-[8px] font-bold">AI</span>
        </div>
        <div>
          <p className="text-[11px] font-medium text-brand-green-dark dark:text-green-400">How performance data is collected</p>
          <p className="text-[10px] text-ink-muted dark:text-gray-400 mt-0.5 leading-relaxed max-w-3xl">
            The Performance Agent (Layer 4) runs continuously, pulling data from GA4, HubSpot, Pardot, LinkedIn API, and Salesforce.
            Reports are generated weekly and fed into the Optimisation Agent, which updates Layer 1 inputs for next quarter.
            ROI calculations use actual agent output counts versus equivalent human production costs at market blended rates.
          </p>
        </div>
      </div>
    </div>
  );
}
