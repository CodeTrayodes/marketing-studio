import { useAppStore, ROLES } from '../store/useAppStore';
import {
  QUARTERLY_METRICS, BU_PERFORMANCE, WEEKLY_TREND,
  CHANNEL_BREAKDOWN, LABOUR_VALUE_BREAKDOWN,
} from '../data/performance';
import { MetricCard } from '../components/ui/MetricCard';
import { cn, formatCurrency, formatPercent, qualityColor } from '../lib/utils';
import { useCountUp } from '../hooks/useCountUp';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Users, FileText, BarChart2, Globe, Zap } from 'lucide-react';

const FADE_UP = {
  hidden: { opacity: 0, y: 10 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] } }),
};

function SparkLine({ data, color = '#16A34A', height = 40 }) {
  if (!data || data.length < 2) return null;
  const vals = data.map((d) => d.assets);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const w = 120;
  const h = height;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.8}
      />
      {pts.map((pt, i) => {
        const [x, y] = pt.split(',').map(Number);
        return <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 3 : 2} fill={color} />;
      })}
    </svg>
  );
}

function ROISection() {
  const laborVal = useCountUp(QUARTERLY_METRICS.laborValueSaved, 1400, 0);
  const platformCost = useCountUp(QUARTERLY_METRICS.platformCost, 1000, 0);
  const netROI = useCountUp(QUARTERLY_METRICS.netROI, 1400, 0);
  const multiple = useCountUp(QUARTERLY_METRICS.roiMultiple, 1000, 1);

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-ink dark:text-white uppercase tracking-wider">
        Return on Investment
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div custom={0} variants={FADE_UP} initial="hidden" animate="show">
          <MetricCard
            label="Labour Value Saved"
            value={formatCurrency(laborVal)}
            explanation="310 assets × avg 4.2h manual effort × £95/h blended rate across roles"
            accent
          >
            <div className="mt-2 flex items-center gap-2">
              <SparkLine data={WEEKLY_TREND} />
            </div>
          </MetricCard>
        </motion.div>
        <motion.div custom={1} variants={FADE_UP} initial="hidden" animate="show">
          <MetricCard
            label="Platform Cost"
            value={formatCurrency(platformCost)}
            explanation="Quarterly platform subscription and infrastructure cost"
          />
        </motion.div>
        <motion.div custom={2} variants={FADE_UP} initial="hidden" animate="show">
          <MetricCard
            label="Net ROI"
            value={formatCurrency(netROI)}
            explanation="Labour savings minus platform cost — value delivered this quarter"
            accent
          />
        </motion.div>
        <motion.div custom={3} variants={FADE_UP} initial="hidden" animate="show">
          <MetricCard
            label="ROI Multiple"
            value={`${multiple}×`}
            explanation={`Every £1 spent on the platform returns £${multiple} in avoided labour cost`}
            accent
          />
        </motion.div>
      </div>

      {/* Labour breakdown table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-border dark:border-dark-border">
          <h3 className="text-sm font-semibold text-ink dark:text-white">Labour Value Breakdown</h3>
          <p className="text-xs text-ink-muted dark:text-gray-400 mt-0.5">
            What equivalent human production would cost at market rates
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-surface-muted dark:bg-dark-card">
              <tr>
                {['Role', 'Rate/h', 'Hours/Asset', 'Assets', 'Total Hours', 'Value'].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-ink-faint dark:text-gray-500 uppercase tracking-wider font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-dark-border">
              {LABOUR_VALUE_BREAKDOWN.map((row) => (
                <tr key={row.role} className="hover:bg-surface-muted dark:hover:bg-dark-card/40">
                  <td className="px-4 py-3 font-medium text-ink dark:text-white">{row.role}</td>
                  <td className="px-4 py-3 font-mono-nums text-ink-muted dark:text-gray-400">£{row.rate}</td>
                  <td className="px-4 py-3 font-mono-nums text-ink-muted dark:text-gray-400">{row.hoursPerAsset}</td>
                  <td className="px-4 py-3 font-mono-nums text-ink-muted dark:text-gray-400">{row.assetCount}</td>
                  <td className="px-4 py-3 font-mono-nums text-ink-muted dark:text-gray-400">{row.totalHours.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono-nums font-semibold text-brand-green">
                    {formatCurrency(row.totalValue)}
                  </td>
                </tr>
              ))}
              <tr className="bg-surface-muted dark:bg-dark-card border-t-2 border-border dark:border-dark-border">
                <td className="px-4 py-3 font-semibold text-ink dark:text-white" colSpan={4}>Total</td>
                <td className="px-4 py-3 font-mono-nums font-semibold text-ink dark:text-white">
                  {LABOUR_VALUE_BREAKDOWN.reduce((s, r) => s + r.totalHours, 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-mono-nums font-bold text-brand-green text-sm">
                  {formatCurrency(QUARTERLY_METRICS.laborValueSaved)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OutputSection() {
  const assetsPublished = useCountUp(QUARTERLY_METRICS.assetsPublished, 1000, 0);
  const qualityAvg = useCountUp(QUARTERLY_METRICS.qualityAverage, 900, 1);
  const onTime = useCountUp(QUARTERLY_METRICS.onTimeDelivery, 900, 1);
  const gateRate = useCountUp(QUARTERLY_METRICS.gateApprovalRate, 900, 1);

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-ink dark:text-white uppercase tracking-wider">Output & Quality</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Assets Published', value: assetsPublished, sub: `/ ${QUARTERLY_METRICS.assetsTarget} target`, custom: 0 },
          { label: 'Avg Quality Score', value: `${qualityAvg}`, sub: '/100', accent: true, custom: 1 },
          { label: 'On-Time Delivery', value: `${onTime}%`, accent: true, custom: 2 },
          { label: 'Gate Approval Rate', value: `${gateRate}%`, accent: true, custom: 3 },
        ].map(({ label, value, sub, accent, custom }) => (
          <motion.div key={label} custom={custom} variants={FADE_UP} initial="hidden" animate="show">
            <MetricCard label={label} value={value} subValue={sub} accent={accent} />
          </motion.div>
        ))}
      </div>

      {/* BU performance table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-border dark:border-dark-border">
          <h3 className="text-sm font-semibold text-ink dark:text-white">Performance by Business Unit</h3>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-surface-muted dark:bg-dark-card">
            <tr>
              {['Business Unit', 'Published', 'Completion', 'Quality', 'Pipeline £', 'Organic Sessions', 'Email Open'].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 text-ink-faint dark:text-gray-500 uppercase tracking-wider font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-dark-border">
            {BU_PERFORMANCE.map((bu, i) => (
              <motion.tr
                key={bu.buId}
                custom={i}
                variants={FADE_UP}
                initial="hidden"
                animate="show"
                className="hover:bg-surface-muted dark:hover:bg-dark-card/40"
              >
                <td className="px-4 py-3 font-medium text-ink dark:text-white">{bu.buName}</td>
                <td className="px-4 py-3 font-mono-nums text-ink-muted dark:text-gray-400">
                  {bu.assetsPublished}/{bu.assetsTarget}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-border dark:bg-dark-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-green rounded-full"
                        style={{ width: `${bu.completionPct}%` }}
                      />
                    </div>
                    <span className="font-mono-nums text-ink-muted dark:text-gray-400">{bu.completionPct}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('font-mono-nums font-semibold', qualityColor(bu.qualityAvg))}>
                    {bu.qualityAvg}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono-nums text-ink-muted dark:text-gray-400">
                  {formatCurrency(bu.pipelineInfluence)}
                </td>
                <td className="px-4 py-3 font-mono-nums text-ink-muted dark:text-gray-400">
                  {bu.organicSessions.toLocaleString()}
                </td>
                <td className="px-4 py-3 font-mono-nums text-ink-muted dark:text-gray-400">
                  {bu.emailOpenRate}%
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChannelSection() {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-ink dark:text-white uppercase tracking-wider">Channel Performance</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CHANNEL_BREAKDOWN.map((ch, i) => (
          <motion.div
            key={ch.channel}
            custom={i}
            variants={FADE_UP}
            initial="hidden"
            animate="show"
            className="card p-4"
          >
            <p className="text-xs font-semibold text-ink dark:text-white mb-2">{ch.channel}</p>
            <p className="text-xl font-mono-nums font-semibold text-brand-green">{ch.assets}</p>
            <p className="text-[10px] text-ink-faint dark:text-gray-500 mb-3">assets published</p>
            <div className="space-y-1.5 text-xs">
              {Object.entries(ch)
                .filter(([k]) => !['channel', 'assets'].includes(k))
                .map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-ink-faint dark:text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="font-mono-nums text-ink-muted dark:text-gray-400">
                      {typeof v === 'number' && v > 1000 ? v.toLocaleString() : v}
                      {k.includes('Rate') || k.includes('Pct') || k.includes('rate') ? '%' : ''}
                    </span>
                  </div>
                ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function WeeklyProgressChart() {
  const maxAssets = Math.max(...WEEKLY_TREND.map((w) => w.assets));
  return (
    <div className="card p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-ink dark:text-white">Assets Published — Weekly Trend</h3>
        <p className="text-xs text-ink-muted dark:text-gray-400 mt-0.5">Cumulative Q2 2025</p>
      </div>
      <div className="flex items-end gap-2 h-28">
        {WEEKLY_TREND.map((w, i) => {
          const pct = (w.assets / maxAssets) * 100;
          const isLast = i === WEEKLY_TREND.length - 1;
          return (
            <div key={w.week} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] font-mono-nums text-ink-faint dark:text-gray-500">
                {isLast ? w.assets : ''}
              </span>
              <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                <div
                  className={cn('w-full rounded-t-[3px] transition-all duration-700', isLast ? 'bg-brand-green' : 'bg-brand-green/40')}
                  style={{ height: `${pct}%` }}
                />
              </div>
              <span className="text-[9px] text-ink-faint dark:text-gray-500">{w.week}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PerformancePage() {
  const role = useAppStore((s) => s.role);
  const showROI = role !== ROLES.CONTENT_EDITOR;
  const pipelineVal = useCountUp(QUARTERLY_METRICS.pipelineInfluenced / 1000, 1200, 0);

  return (
    <div className="p-6 space-y-8 max-w-[1400px] mx-auto">
      {/* Summary KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-xs font-medium text-ink-muted dark:text-gray-400 uppercase tracking-wider">Pipeline Influenced</p>
              <p className="text-3xl font-mono-nums font-semibold text-ink dark:text-white mt-1">
                £{pipelineVal}<span className="text-lg text-ink-muted">k</span>
              </p>
            </div>
            <span className="badge bg-brand-green-light dark:bg-green-900/20 text-brand-green text-[10px]">+8.7% vs target</span>
          </div>
          <p className="text-xs text-ink-muted dark:text-gray-400 mb-4">
            Total value of CRM pipeline deals directly attributed to published content assets this quarter.
            Based on multi-touch attribution across Salesforce opportunities.
          </p>
          <WeeklyProgressChart />
        </div>
        <div className="space-y-4">
          <MetricCard
            label="Organic Traffic Growth"
            value={`+${QUARTERLY_METRICS.organicTrafficGrowth}%`}
            explanation="Quarter-on-quarter organic session growth across all BU content"
            accent
            trend={QUARTERLY_METRICS.organicTrafficGrowth}
          />
          <MetricCard
            label="Email Open Rate"
            value={`${QUARTERLY_METRICS.emailOpenRate}%`}
            explanation="Average open rate across all Pardot email sequences (industry avg: 21.3%)"
            accent
          />
          <MetricCard
            label="LinkedIn Engagement"
            value={`${QUARTERLY_METRICS.linkedinEngagementRate}%`}
            explanation="Avg engagement rate on LinkedIn posts (industry avg: 1.9%)"
            accent
          />
        </div>
      </div>

      {/* Output section */}
      <OutputSection />

      {/* ROI section — hide for content editor */}
      {showROI && <ROISection />}

      {/* Channel section */}
      <ChannelSection />

      {/* AI COE explainer */}
      <div className="ai-panel rounded-card p-4 flex items-start gap-3">
        <Zap size={16} className="text-brand-green flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-brand-green-dark dark:text-green-400">How performance data is collected</p>
          <p className="text-xs text-ink-muted dark:text-gray-400 mt-1 leading-relaxed max-w-3xl">
            The Performance Agent (Layer 4) runs continuously, pulling data from GA4 (organic traffic), HubSpot
            (pipeline attribution), Pardot (email metrics), LinkedIn API (engagement), and Salesforce (revenue correlation).
            Reports are generated weekly and fed into the Optimisation Agent, which updates Layer 1 inputs for next quarter.
          </p>
        </div>
      </div>
    </div>
  );
}
