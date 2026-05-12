import { useAppStore, ROLES } from '../store/useAppStore';
import {
  QUARTERLY_METRICS, BU_PERFORMANCE, WEEKLY_TREND,
  CHANNEL_BREAKDOWN, LABOUR_VALUE_BREAKDOWN,
} from '../data/performance';
import { MetricCard } from '../components/ui/MetricCard';
import { cn, formatCurrency, qualityColor } from '../lib/utils';
import { useCountUp } from '../hooks/useCountUp';
import { motion } from 'framer-motion';

const FADE_UP = {
  hidden: { opacity: 0, y: 8 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] } }),
};

function SparkLine({ data, color = '#16A34A', height = 32 }) {
  if (!data || data.length < 2) return null;
  const vals = data.map((d) => d.assets);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const w = 100;
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
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.7}
      />
      {pts.map((pt, i) => {
        const [x, y] = pt.split(',').map(Number);
        return <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 2.5 : 1.5} fill={color} />;
      })}
    </svg>
  );
}

function SectionHeader({ children }) {
  return (
    <p className="text-[10px] font-semibold text-ink-faint dark:text-gray-500 uppercase tracking-widest mb-3">{children}</p>
  );
}

function ROISection() {
  const laborVal = useCountUp(QUARTERLY_METRICS.laborValueSaved, 1400, 0);
  const platformCost = useCountUp(QUARTERLY_METRICS.platformCost, 1000, 0);
  const netROI = useCountUp(QUARTERLY_METRICS.netROI, 1400, 0);
  const multiple = useCountUp(QUARTERLY_METRICS.roiMultiple, 1000, 1);

  return (
    <div className="space-y-3">
      <SectionHeader>Return on Investment</SectionHeader>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Labour Value Saved', value: formatCurrency(laborVal), accent: true, i: 0, child: <SparkLine data={WEEKLY_TREND} /> },
          { label: 'Platform Cost', value: formatCurrency(platformCost), i: 1 },
          { label: 'Net ROI', value: formatCurrency(netROI), accent: true, i: 2 },
          { label: 'ROI Multiple', value: `${multiple}×`, accent: true, i: 3 },
        ].map(({ label, value, accent, i, child }) => (
          <motion.div key={label} custom={i} variants={FADE_UP} initial="hidden" animate="show">
            <MetricCard label={label} value={value} accent={accent}>
              {child && <div className="mt-1.5">{child}</div>}
            </MetricCard>
          </motion.div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-border dark:border-dark-border">
          <p className="text-[11px] font-semibold text-ink dark:text-white">Labour Value Breakdown</p>
          <p className="text-[10px] text-ink-muted dark:text-gray-400 mt-0.5">Equivalent human production at market rates</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-muted dark:bg-dark-card">
              <tr>
                {['Role', 'Rate/h', 'Hrs/Asset', 'Assets', 'Total Hrs', 'Value'].map((h) => (
                  <th key={h} className="text-left px-3 py-2 text-[9px] text-ink-faint dark:text-gray-500 uppercase tracking-wider font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-dark-border">
              {LABOUR_VALUE_BREAKDOWN.map((row) => (
                <tr key={row.role} className="hover:bg-surface-muted dark:hover:bg-dark-card/40">
                  <td className="px-3 py-2 text-[10px] font-medium text-ink dark:text-white">{row.role}</td>
                  <td className="px-3 py-2 text-[10px] font-mono-nums text-ink-muted dark:text-gray-400">£{row.rate}</td>
                  <td className="px-3 py-2 text-[10px] font-mono-nums text-ink-muted dark:text-gray-400">{row.hoursPerAsset}</td>
                  <td className="px-3 py-2 text-[10px] font-mono-nums text-ink-muted dark:text-gray-400">{row.assetCount}</td>
                  <td className="px-3 py-2 text-[10px] font-mono-nums text-ink-muted dark:text-gray-400">{row.totalHours.toLocaleString()}</td>
                  <td className="px-3 py-2 text-[10px] font-mono-nums font-semibold text-brand-green">{formatCurrency(row.totalValue)}</td>
                </tr>
              ))}
              <tr className="bg-surface-muted dark:bg-dark-card border-t border-border dark:border-dark-border">
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
    </div>
  );
}

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
          <motion.div key={label} custom={i} variants={FADE_UP} initial="hidden" animate="show">
            <MetricCard label={label} value={value} subValue={sub} accent={accent} />
          </motion.div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-border dark:border-dark-border">
          <p className="text-[11px] font-semibold text-ink dark:text-white">Performance by Business Unit</p>
        </div>
        <table className="w-full">
          <thead className="bg-surface-muted dark:bg-dark-card">
            <tr>
              {['Business Unit', 'Published', 'Completion', 'Quality', 'Pipeline £', 'Sessions', 'Email Open'].map((h) => (
                <th key={h} className="text-left px-3 py-2 text-[9px] text-ink-faint dark:text-gray-500 uppercase tracking-wider font-medium whitespace-nowrap">{h}</th>
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

function ChannelSection() {
  return (
    <div className="space-y-3">
      <SectionHeader>Channel Performance</SectionHeader>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CHANNEL_BREAKDOWN.map((ch, i) => (
          <motion.div key={ch.channel} custom={i} variants={FADE_UP} initial="hidden" animate="show" className="card p-3">
            <p className="text-[10px] font-semibold text-ink dark:text-white mb-1">{ch.channel}</p>
            <p className="text-lg font-mono-nums font-semibold text-brand-green leading-none">{ch.assets}</p>
            <p className="text-[9px] text-ink-faint dark:text-gray-500 mb-2">assets published</p>
            <div className="space-y-1">
              {Object.entries(ch)
                .filter(([k]) => !['channel', 'assets'].includes(k))
                .map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-[9px] text-ink-faint dark:text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="text-[9px] font-mono-nums text-ink-muted dark:text-gray-400">
                      {typeof v === 'number' && v > 1000 ? v.toLocaleString() : v}
                      {k.includes('Rate') || k.includes('rate') ? '%' : ''}
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
    <div className="space-y-2">
      <div className="flex items-end gap-1.5 h-20">
        {WEEKLY_TREND.map((w, i) => {
          const pct = (w.assets / maxAssets) * 100;
          const isLast = i === WEEKLY_TREND.length - 1;
          return (
            <div key={w.week} className="flex-1 flex flex-col items-center gap-0.5">
              <span className="text-[8px] font-mono-nums text-ink-faint dark:text-gray-500">{isLast ? w.assets : ''}</span>
              <div className="w-full flex flex-col justify-end" style={{ height: '60px' }}>
                <div
                  className={cn('w-full rounded-t-[2px] transition-all duration-700', isLast ? 'bg-brand-green' : 'bg-brand-green/30')}
                  style={{ height: `${pct}%` }}
                />
              </div>
              <span className="text-[8px] text-ink-faint dark:text-gray-500">{w.week}</span>
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
    <div className="p-4 space-y-5 max-w-[1400px] mx-auto">

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="card p-4 lg:col-span-2">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-[10px] font-medium text-ink-muted dark:text-gray-400 uppercase tracking-wider">Pipeline Influenced</p>
              <p className="text-2xl font-mono-nums font-semibold text-ink dark:text-white mt-0.5">
                £{pipelineVal}<span className="text-sm text-ink-muted">k</span>
              </p>
            </div>
            <span className="badge bg-brand-green-light dark:bg-green-900/20 text-brand-green">+8.7% vs target</span>
          </div>
          <p className="text-[10px] text-ink-muted dark:text-gray-400 mb-3 leading-relaxed">
            Total value of CRM pipeline deals directly attributed to published content this quarter.
          </p>
          <WeeklyProgressChart />
        </div>
        <div className="space-y-3">
          <MetricCard label="Organic Traffic Growth" value={`+${QUARTERLY_METRICS.organicTrafficGrowth}%`} accent trend={QUARTERLY_METRICS.organicTrafficGrowth} />
          <MetricCard label="Email Open Rate" value={`${QUARTERLY_METRICS.emailOpenRate}%`} accent explanation="Pardot sequences (industry avg: 21.3%)" />
          <MetricCard label="LinkedIn Engagement" value={`${QUARTERLY_METRICS.linkedinEngagementRate}%`} accent explanation="Industry avg: 1.9%" />
        </div>
      </div>

      <OutputSection />
      {showROI && <ROISection />}
      <ChannelSection />

      <div className="ai-panel rounded-[10px] p-3 flex items-start gap-2">
        <div className="w-4 h-4 rounded bg-brand-green/20 flex items-center justify-center flex-shrink-0 mt-px">
          <span className="text-brand-green text-[8px] font-bold">AI</span>
        </div>
        <div>
          <p className="text-[11px] font-medium text-brand-green-dark dark:text-green-400">How performance data is collected</p>
          <p className="text-[10px] text-ink-muted dark:text-gray-400 mt-0.5 leading-relaxed max-w-3xl">
            The Performance Agent (Layer 4) runs continuously, pulling data from GA4, HubSpot, Pardot, LinkedIn API, and Salesforce.
            Reports are generated weekly and fed into the Optimisation Agent, which updates Layer 1 inputs for next quarter.
          </p>
        </div>
      </div>
    </div>
  );
}
