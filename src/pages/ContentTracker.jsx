import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useContentStore } from '../store/useContentStore';
import { useAppStore } from '../store/useAppStore';
import { StatusBadge } from '../components/ui/StatusBadge';
import { cn, timeAgo, qualityColor } from '../lib/utils';
import { BUSINESS_UNITS, AGENTS } from '../data/agents';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronDown, ChevronUp, ArrowUpDown, ExternalLink } from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const BU_PILLS = [
  { id: 'all', abbr: 'All' },
  ...BUSINESS_UNITS.map(b => ({ id: b.id, abbr: b.abbr })),
];

const STATUS_PILLS = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'approved', label: 'Approved' },
  { value: 'staged', label: 'Staged' },
  { value: 'in-review', label: 'In Review' },
  { value: 'drafting', label: 'Drafting' },
  { value: 'queued', label: 'Queued' },
];

const STATUS_MAP = {
  published: ['published'],
  approved: ['approved'],
  staged: ['gate-3-pending'],
  'in-review': ['gate-2-pending', 'gate-3-pending', 'qa-review'],
  drafting: ['draft'],
  queued: ['qa-review'],
};

const QUALITY_PILLS = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High 85+' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'seo-blog', label: 'SEO Blog' },
  { value: 'guest-post', label: 'Guest Post' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'video-script', label: 'Video Script' },
  { value: 'case-study', label: 'Case Study' },
  { value: 'sales-enablement', label: 'Sales Enablement' },
  { value: 'email-sequence', label: 'Email Sequence' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'repurposed', label: 'Repurposed' },
];

const LAYER_HEX = { 1: '#2563EB', 2: '#16A34A', 3: '#7C3AED', 4: '#0891B2' };

// ─── Cell components ──────────────────────────────────────────────────────────

function AgentBadge({ agentId }) {
  const agent = AGENTS.find(a => a.id === agentId);
  const hex = LAYER_HEX[agent?.layer] || '#6B7280';
  return (
    <span
      className="inline-block text-[8px] font-mono font-bold px-1.5 py-px rounded"
      style={{ backgroundColor: `${hex}18`, color: hex }}
    >
      {agent?.code || agentId}
    </span>
  );
}

function QualityBadge({ score }) {
  if (score == null) return <span className="text-ink-faint dark:text-gray-600 text-[9px]">—</span>;
  const cls = score >= 85
    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
    : score >= 70
    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
  return <span className={cn('text-[9px] font-mono font-semibold px-1.5 py-px rounded-full', cls)}>{score}</span>;
}

function GeoBar({ score }) {
  if (score == null) return <span className="text-ink-faint dark:text-gray-600 text-[9px]">—</span>;
  const hex = score >= 80 ? '#16A34A' : score >= 65 ? '#D97706' : '#DC2626';
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-10 h-px bg-border dark:bg-dark-border rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: hex }} />
      </div>
      <span className="text-[9px] font-mono" style={{ color: hex }}>{score}</span>
    </div>
  );
}

function SortIcon({ field, currentField, dir }) {
  if (field !== currentField) return <ArrowUpDown size={9} className="text-ink-faint opacity-40" />;
  return dir === 'asc'
    ? <ChevronUp size={9} className="text-brand-green" />
    : <ChevronDown size={9} className="text-brand-green" />;
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function AssetDetailPanel({ asset, onClose }) {
  if (!asset) return null;
  const gateLabel = {
    'gate-2-pending': 'Gate 2 — Content Review',
    'gate-3-pending': 'Gate 3 — Final Approval',
    'qa-review': 'QA Review',
    draft: 'In Drafting',
    approved: 'Approved',
    published: 'Published',
  }[asset.status] || asset.status;

  const showGateLink = ['gate-2-pending', 'gate-3-pending'].includes(asset.status);

  return (
    <motion.div
      key={asset.id}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="w-80 flex-shrink-0 bg-white dark:bg-dark-card border-l border-border dark:border-dark-border flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border dark:border-dark-border flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="badge bg-surface-muted dark:bg-dark-border text-ink-muted dark:text-gray-400">{asset.typeName}</span>
            <span className="badge bg-surface-muted dark:bg-dark-border text-ink-muted dark:text-gray-400">{asset.buAbbr}</span>
            <QualityBadge score={asset.qualityScores?.overall} />
          </div>
          <h3 className="text-[11px] font-semibold text-ink dark:text-white leading-snug">{asset.title}</h3>
        </div>
        <button onClick={onClose} className="text-ink-muted dark:text-gray-400 hover:text-ink dark:hover:text-white flex-shrink-0 mt-0.5">
          <X size={13} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3">

        {/* Quality breakdown */}
        {asset.qualityScores && (
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-faint dark:text-gray-500 mb-2">Quality Breakdown</p>
            <div className="space-y-2">
              {[
                { label: 'SEO Score', val: asset.qualityScores.seo },
                { label: 'Brand Compliance', val: asset.qualityScores.brand },
                { label: 'GEO Readiness', val: asset.qualityScores.geo },
              ].map(({ label, val }) => (
                <div key={label}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[9px] text-ink-muted dark:text-gray-400">{label}</span>
                    <span className={cn('text-[9px] font-mono font-semibold', qualityColor(val))}>{val}/100</span>
                  </div>
                  <div className="w-full h-1 bg-border dark:bg-dark-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${val}%`, backgroundColor: val >= 85 ? '#16A34A' : val >= 70 ? '#D97706' : '#DC2626' }} />
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-0.5">
                <span className="text-[9px] text-ink-muted dark:text-gray-400">AI Detection</span>
                <span className="text-[9px] font-semibold text-brand-green">PASS ✓ ({asset.qualityScores.aiDetection}%)</span>
              </div>
            </div>
          </div>
        )}

        {/* Content preview */}
        {asset.preview && (
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-faint dark:text-gray-500 mb-1.5">Content Preview</p>
            <div className="bg-surface-muted dark:bg-dark-border rounded-[6px] p-2.5">
              <p className="text-[10px] text-ink-muted dark:text-gray-400 leading-relaxed line-clamp-5">{asset.preview}</p>
            </div>
          </div>
        )}

        {/* Details */}
        <div className="space-y-1.5">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-faint dark:text-gray-500">Details</p>
          {[
            { label: 'Agent', value: asset.agentName },
            { label: 'Channel', value: asset.channel },
            { label: 'Words', value: asset.wordCount?.toLocaleString() ?? '—' },
            { label: 'Created', value: timeAgo(asset.createdAt) },
            { label: 'Published', value: asset.publishedAt ? timeAgo(asset.publishedAt) : '—' },
            { label: 'Gate Status', value: gateLabel },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-start justify-between gap-3">
              <span className="text-[9px] text-ink-faint dark:text-gray-500 flex-shrink-0">{label}</span>
              <span className="text-[9px] text-ink-muted dark:text-gray-400 text-right leading-relaxed">{value}</span>
            </div>
          ))}
        </div>

        {/* Gate manager link */}
        {showGateLink && (
          <Link to="/gates"
            className="flex items-center justify-center gap-1.5 w-full px-3 py-1.5 bg-brand-green text-white rounded-[6px] text-[10px] font-semibold hover:bg-green-700 transition-colors"
          >
            View in Gate Manager
            <ExternalLink size={10} />
          </Link>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ContentTracker() {
  const assets = useContentStore(s => s.assets);
  const { filterBU, setFilterBU, sortField, sortDir, setSort, selectedAsset, selectAsset } = useContentStore();

  const [statusFilter, setStatusFilter] = useState('all');
  const [qualityFilter, setQualityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 40;

  const todayStart = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

  const buAssets = useMemo(() =>
    filterBU === 'all' ? assets : assets.filter(a => a.buId === filterBU),
    [assets, filterBU]
  );

  const stats = useMemo(() => {
    const pub = buAssets.filter(a => a.status === 'published');
    const inReview = buAssets.filter(a => ['gate-2-pending', 'gate-3-pending', 'qa-review'].includes(a.status));
    const withQ = buAssets.filter(a => a.qualityScores?.overall);
    const withG = buAssets.filter(a => a.qualityScores?.geo);
    return {
      total: buAssets.length,
      published: pub.length,
      inReview: inReview.length,
      avgQuality: withQ.length ? Math.round(withQ.reduce((s, a) => s + a.qualityScores.overall, 0) / withQ.length) : 0,
      avgGeo: withG.length ? Math.round(withG.reduce((s, a) => s + a.qualityScores.geo, 0) / withG.length) : 0,
      publishedToday: pub.filter(a => a.publishedAt && new Date(a.publishedAt) >= todayStart).length,
    };
  }, [buAssets, todayStart]);

  const filtered = useMemo(() => {
    let r = buAssets;
    if (typeFilter !== 'all') r = r.filter(a => a.type === typeFilter);
    const sv = STATUS_MAP[statusFilter];
    if (sv) r = r.filter(a => sv.includes(a.status));
    if (qualityFilter === 'high') r = r.filter(a => (a.qualityScores?.overall ?? 0) >= 85);
    else if (qualityFilter === 'medium') r = r.filter(a => { const q = a.qualityScores?.overall ?? 0; return q >= 70 && q < 85; });
    else if (qualityFilter === 'low') r = r.filter(a => (a.qualityScores?.overall ?? 0) < 70);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(a => a.title.toLowerCase().includes(q) || a.agentName.toLowerCase().includes(q));
    }
    return [...r].sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (av instanceof Date) av = av.getTime();
      if (bv instanceof Date) bv = bv.getTime();
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [buAssets, typeFilter, statusFilter, qualityFilter, search, sortField, sortDir]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleBUChange = (id) => { setFilterBU(id); setPage(0); };
  const handleStatusChange = (v) => { setStatusFilter(v); setPage(0); };
  const handleQualityChange = (v) => { setQualityFilter(v); setPage(0); };

  const TABLE_COLS = [
    { field: 'buAbbr', label: 'BU', w: 'w-10' },
    { field: 'title', label: 'Title', w: 'min-w-[200px]' },
    { field: 'typeName', label: 'Type', w: 'w-28' },
    { field: 'agent', label: 'Agent', w: 'w-14' },
    { field: 'status', label: 'Status', w: 'w-28' },
    { field: 'quality', label: 'Quality', w: 'w-16' },
    { field: 'geo', label: 'GEO', w: 'w-24', isNew: true },
    { field: 'channel', label: 'Channel', w: 'w-28' },
    { field: 'createdAt', label: 'Updated', w: 'w-20' },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* Toolbar */}
      <div className="bg-white dark:bg-dark-card border-b border-border dark:border-dark-border px-4 py-2.5 flex-shrink-0 space-y-2">

        {/* BU pills + headline stats */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            {BU_PILLS.map(bu => (
              <button
                key={bu.id}
                onClick={() => handleBUChange(bu.id)}
                className={cn(
                  'px-2 py-1 rounded-[5px] text-[10px] font-semibold transition-colors',
                  filterBU === bu.id
                    ? 'bg-ink dark:bg-white text-white dark:text-ink'
                    : 'bg-surface-muted dark:bg-dark-border text-ink-muted dark:text-gray-400 hover:bg-border dark:hover:bg-dark-border'
                )}
              >
                {bu.abbr}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-ink-muted dark:text-gray-400">
            <span className="font-semibold text-ink dark:text-white">{stats.total}</span> assets this quarter
            {' · '}
            <span className="font-semibold text-brand-green">{stats.published}</span> published
            {' · '}
            <span className="font-semibold text-amber-500">{stats.inReview}</span> in review
          </p>
        </div>

        {/* Status pills + quality pills + type + search */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            {STATUS_PILLS.map(p => (
              <button
                key={p.value}
                onClick={() => handleStatusChange(p.value)}
                className={cn(
                  'px-2 py-0.5 rounded-full text-[9px] font-medium transition-colors whitespace-nowrap',
                  statusFilter === p.value
                    ? 'bg-ink dark:bg-white text-white dark:text-ink'
                    : 'bg-surface-muted dark:bg-dark-border text-ink-muted dark:text-gray-400 hover:bg-border'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="w-px h-3.5 bg-border dark:bg-dark-border flex-shrink-0" />

          {QUALITY_PILLS.map(p => (
            <button
              key={p.value}
              onClick={() => handleQualityChange(p.value)}
              className={cn(
                'px-2 py-0.5 rounded-full text-[9px] font-medium transition-colors whitespace-nowrap',
                qualityFilter === p.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-surface-muted dark:bg-dark-border text-ink-muted dark:text-gray-400 hover:bg-border'
              )}
            >
              {p.label}
            </button>
          ))}

          <div className="w-px h-3.5 bg-border dark:bg-dark-border flex-shrink-0" />

          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(0); }}
            className="text-[9px] bg-surface-muted dark:bg-dark-border border border-border dark:border-dark-border rounded-[5px] px-2 py-1 text-ink dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-green"
          >
            {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search..."
            className="text-[9px] bg-surface-muted dark:bg-dark-border border border-border dark:border-dark-border rounded-[5px] px-2 py-1 text-ink dark:text-white placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-brand-green w-28"
          />

          <span className="ml-auto text-[9px] text-ink-faint dark:text-gray-500">{filtered.length} shown</span>
        </div>
      </div>

      {/* Stats strip */}
      <div className="bg-surface-muted dark:bg-dark-border border-b border-border dark:border-dark-border px-4 py-1.5 flex items-center gap-6 flex-shrink-0">
        {[
          { label: 'Total', value: stats.total, color: 'text-ink dark:text-white' },
          { label: 'Avg Quality', value: `${stats.avgQuality}/100`, color: qualityColor(stats.avgQuality) },
          { label: 'Avg GEO', value: `${stats.avgGeo}/100`, color: 'text-blue-600' },
          { label: 'Published Today', value: stats.publishedToday, color: 'text-brand-green' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="text-[9px] text-ink-faint dark:text-gray-500 uppercase tracking-wider">{label}</span>
            <span className={cn('text-[11px] font-semibold font-mono-nums', color)}>{value}</span>
          </div>
        ))}
      </div>

      {/* Table + detail panel */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto scrollbar-thin">
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 bg-white dark:bg-dark-card border-b border-border dark:border-dark-border z-10">
              <tr>
                {TABLE_COLS.map(({ field, label, w, isNew }) => (
                  <th
                    key={field}
                    className={cn('text-left px-3 py-2 font-medium text-[9px] text-ink-faint dark:text-gray-500 uppercase tracking-wider cursor-pointer hover:text-ink dark:hover:text-white whitespace-nowrap', w)}
                    onClick={() => setSort(field)}
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      {isNew && (
                        <span className="text-[7px] font-bold text-blue-500 bg-blue-100 dark:bg-blue-900/30 px-1 py-px rounded-full leading-none">NEW</span>
                      )}
                      <SortIcon field={field} currentField={sortField} dir={sortDir} />
                    </div>
                  </th>
                ))}
                <th className="w-5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-dark-border">
              {paginated.map(asset => {
                const isSel = selectedAsset?.id === asset.id;
                return (
                  <tr
                    key={asset.id}
                    onClick={() => isSel ? selectAsset(null) : selectAsset(asset.id)}
                    className={cn(
                      'cursor-pointer transition-colors',
                      isSel ? 'bg-brand-green-light dark:bg-green-900/10' : 'hover:bg-surface-muted dark:hover:bg-dark-card/60'
                    )}
                  >
                    <td className="px-3 py-2">
                      <span className="font-mono text-[8px] font-bold text-ink-muted dark:text-gray-400 bg-surface-muted dark:bg-dark-border px-1 py-px rounded">
                        {asset.buAbbr}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <p className="font-medium text-[10px] text-ink dark:text-white line-clamp-2 max-w-[280px]">{asset.title}</p>
                    </td>
                    <td className="px-3 py-2 text-[9px] text-ink-muted dark:text-gray-400 whitespace-nowrap">{asset.typeName}</td>
                    <td className="px-3 py-2"><AgentBadge agentId={asset.agent} /></td>
                    <td className="px-3 py-2"><StatusBadge status={asset.status} /></td>
                    <td className="px-3 py-2"><QualityBadge score={asset.qualityScores?.overall} /></td>
                    <td className="px-3 py-2"><GeoBar score={asset.qualityScores?.geo} /></td>
                    <td className="px-3 py-2 text-[9px] text-ink-muted dark:text-gray-400 whitespace-nowrap">{asset.channel}</td>
                    <td className="px-3 py-2 text-[9px] text-ink-faint dark:text-gray-500 whitespace-nowrap">{timeAgo(asset.createdAt)}</td>
                    <td className="px-3 py-2">
                      <ChevronRight size={10} className={cn('text-ink-faint', isSel && 'text-brand-green')} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-[11px] font-medium text-ink-muted dark:text-gray-400">No assets match your filters</p>
              <p className="text-[10px] text-ink-faint dark:text-gray-500 mt-1">Try adjusting the BU or filter options above</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 py-3 border-t border-border dark:border-dark-border">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                className="btn-secondary py-1 px-3 disabled:opacity-40 disabled:cursor-not-allowed text-[10px]">
                Previous
              </button>
              <span className="text-[9px] text-ink-muted dark:text-gray-400">{page + 1} / {totalPages}</span>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
                className="btn-secondary py-1 px-3 disabled:opacity-40 disabled:cursor-not-allowed text-[10px]">
                Next
              </button>
            </div>
          )}
        </div>

        <AnimatePresence>
          {selectedAsset && (
            <AssetDetailPanel
              key={selectedAsset.id}
              asset={selectedAsset}
              onClose={() => selectAsset(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
