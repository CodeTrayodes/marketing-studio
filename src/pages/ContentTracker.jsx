import { useState } from 'react';
import { useContentStore } from '../store/useContentStore';
import { useAppStore, ROLES } from '../store/useAppStore';
import { StatusBadge } from '../components/ui/StatusBadge';
import { QualityScore, QualityBreakdown, QualityBar } from '../components/ui/QualityScore';
import { cn, timeAgo, STATUS_CONFIG } from '../lib/utils';
import { BUSINESS_UNITS } from '../data/agents';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, ChevronUp, ChevronDown, X, ExternalLink,
  FileText, ArrowUpDown, ChevronRight,
} from 'lucide-react';

const CONTENT_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'seo-blog', label: 'SEO Blog' },
  { value: 'guest-post', label: 'Guest Post' },
  { value: 'linkedin', label: 'LinkedIn Post' },
  { value: 'reddit', label: 'Reddit Post' },
  { value: 'podcast', label: 'Podcast Script' },
  { value: 'video-script', label: 'Video Script' },
  { value: 'case-study', label: 'Case Study' },
  { value: 'sales-enablement', label: 'Sales Enablement' },
  { value: 'email-sequence', label: 'Email Sequence' },
  { value: 'webinar', label: 'Webinar Script' },
  { value: 'repurposed', label: 'Repurposed Asset' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'qa-review', label: 'QA Review' },
  { value: 'gate-2-pending', label: 'Gate 2 Pending' },
  { value: 'gate-3-pending', label: 'Gate 3 Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'published', label: 'Published' },
  { value: 'error', label: 'Error' },
];

function StatsBar({ stats }) {
  const items = [
    { label: 'Total Assets', value: stats.total, color: 'text-ink dark:text-white' },
    { label: 'Published', value: stats.published, color: 'text-brand-green' },
    { label: 'In Progress', value: stats.inProgress, color: 'text-blue-600' },
    { label: 'Pending Gate', value: stats.pendingGate, color: 'text-amber-600' },
    { label: 'Avg Quality', value: `${stats.avgQuality}/100`, color: 'text-brand-green' },
  ];

  return (
    <div className="flex items-center gap-6 flex-wrap">
      {items.map((item) => (
        <div key={item.label}>
          <p className="text-[10px] text-ink-faint dark:text-gray-500 uppercase tracking-wider">{item.label}</p>
          <p className={cn('text-sm font-semibold font-mono-nums', item.color)}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function AssetDetailPanel({ asset, onClose, role }) {
  if (!asset) return null;
  const showQA = role !== ROLES.MARKETING_HEAD;

  return (
    <motion.div
      key={asset.id}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="w-96 flex-shrink-0 bg-white dark:bg-dark-card border-l border-border dark:border-dark-border flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-border dark:border-dark-border flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="badge bg-surface-muted dark:bg-dark-border text-ink-muted dark:text-gray-400 text-[10px]">
              {asset.typeName}
            </span>
            <span className="badge bg-surface-muted dark:bg-dark-border text-ink-muted dark:text-gray-400 text-[10px]">
              {asset.buAbbr}
            </span>
            <StatusBadge status={asset.status} />
          </div>
          <h3 className="text-sm font-semibold text-ink dark:text-white leading-snug">{asset.title}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-ink-muted dark:text-gray-400 hover:text-ink dark:hover:text-white flex-shrink-0 mt-0.5"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-5">
        {/* Quality scores */}
        {showQA && asset.qualityScores && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-ink dark:text-white">Quality Score</p>
              <QualityScore score={asset.qualityScores.overall} size="md" />
            </div>
            <QualityBreakdown scores={asset.qualityScores} />
          </div>
        )}

        {/* Preview */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint dark:text-gray-500 mb-2">Content Preview</p>
          <div className="ai-panel rounded-[8px] p-3">
            <p className="text-xs text-ink-muted dark:text-gray-400 leading-relaxed whitespace-pre-line">
              {asset.preview}
            </p>
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint dark:text-gray-500">Details</p>
          {[
            { label: 'Agent', value: asset.agentName },
            { label: 'Channel', value: asset.channel },
            { label: 'Word Count', value: asset.wordCount ? asset.wordCount.toLocaleString() : '—' },
            { label: 'Created', value: timeAgo(asset.createdAt) },
            { label: 'Published', value: asset.publishedAt ? timeAgo(asset.publishedAt) : '—' },
            ...(asset.sourceAssetTitle ? [{ label: 'Source', value: asset.sourceAssetTitle }] : []),
          ].map(({ label, value }) => (
            <div key={label} className="flex items-start justify-between gap-3 text-xs">
              <span className="text-ink-faint dark:text-gray-500 flex-shrink-0">{label}</span>
              <span className="text-ink-muted dark:text-gray-400 text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function SortIcon({ field, currentField, dir }) {
  if (field !== currentField) return <ArrowUpDown size={11} className="text-ink-faint opacity-40" />;
  return dir === 'asc' ? <ChevronUp size={11} className="text-brand-green" /> : <ChevronDown size={11} className="text-brand-green" />;
}

export default function ContentTracker() {
  const {
    filterBU, filterType, filterStatus, filterSearch, sortField, sortDir,
    setFilterBU, setFilterType, setFilterStatus, setFilterSearch, setSort,
    selectAsset, selectedAsset, getFilteredAssets, getStats,
  } = useContentStore();
  const role = useAppStore((s) => s.role);
  const showQA = role !== ROLES.MARKETING_HEAD;

  const filtered = getFilteredAssets();
  const stats = getStats();

  const PAGE_SIZE = 40;
  const [page, setPage] = useState(0);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleAssetClick = (id) => {
    if (selectedAsset?.id === id) {
      selectAsset(null);
    } else {
      selectAsset(id);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="bg-white dark:bg-dark-card border-b border-border dark:border-dark-border px-6 py-4 flex-shrink-0 space-y-3">
        <StatsBar stats={stats} />

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint dark:text-gray-500" />
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => { setFilterSearch(e.target.value); setPage(0); }}
              placeholder="Search assets..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-muted dark:bg-dark-border border border-border dark:border-dark-border rounded-btn text-ink dark:text-white placeholder:text-ink-faint dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-green"
            />
          </div>

          {/* BU filter */}
          <select
            value={filterBU}
            onChange={(e) => { setFilterBU(e.target.value); setPage(0); }}
            className="text-xs bg-surface-muted dark:bg-dark-border border border-border dark:border-dark-border rounded-btn px-3 py-1.5 text-ink dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-green"
          >
            <option value="all">All BUs</option>
            {BUSINESS_UNITS.map((bu) => (
              <option key={bu.id} value={bu.id}>{bu.name}</option>
            ))}
          </select>

          {/* Type filter */}
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(0); }}
            className="text-xs bg-surface-muted dark:bg-dark-border border border-border dark:border-dark-border rounded-btn px-3 py-1.5 text-ink dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-green"
          >
            {CONTENT_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
            className="text-xs bg-surface-muted dark:bg-dark-border border border-border dark:border-dark-border rounded-btn px-3 py-1.5 text-ink dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-green"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Clear filters */}
          {(filterBU !== 'all' || filterType !== 'all' || filterStatus !== 'all' || filterSearch) && (
            <button
              onClick={() => { setFilterBU('all'); setFilterType('all'); setFilterStatus('all'); setFilterSearch(''); setPage(0); }}
              className="flex items-center gap-1 text-xs text-ink-muted dark:text-gray-400 hover:text-ink dark:hover:text-white"
            >
              <X size={11} /> Clear
            </button>
          )}

          <span className="ml-auto text-xs text-ink-faint dark:text-gray-500">
            {filtered.length} of {stats.total} assets
          </span>
        </div>
      </div>

      {/* Table + Detail panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Table */}
        <div className="flex-1 overflow-auto scrollbar-thin">
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 bg-surface-muted dark:bg-dark-card border-b border-border dark:border-dark-border z-10">
              <tr>
                {[
                  { field: 'buAbbr', label: 'BU', w: 'w-12' },
                  { field: 'title', label: 'Asset Title', w: 'min-w-[240px]' },
                  { field: 'typeName', label: 'Type', w: 'w-32' },
                  { field: 'status', label: 'Status', w: 'w-32' },
                  ...(showQA ? [{ field: 'qualityScores.overall', label: 'Quality', w: 'w-24' }] : []),
                  { field: 'agentName', label: 'Agent', w: 'w-40' },
                  { field: 'channel', label: 'Channel', w: 'w-32' },
                  { field: 'createdAt', label: 'Created', w: 'w-24' },
                ].map(({ field, label, w }) => (
                  <th
                    key={field}
                    className={cn('text-left px-4 py-2.5 font-medium text-ink-faint dark:text-gray-500 uppercase tracking-wider cursor-pointer hover:text-ink dark:hover:text-white', w)}
                    onClick={() => setSort(field)}
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      <SortIcon field={field} currentField={sortField} dir={sortDir} />
                    </div>
                  </th>
                ))}
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-dark-border">
              {paginated.map((asset) => {
                const isSelected = selectedAsset?.id === asset.id;
                return (
                  <tr
                    key={asset.id}
                    onClick={() => handleAssetClick(asset.id)}
                    className={cn(
                      'cursor-pointer transition-colors',
                      isSelected
                        ? 'bg-brand-green-light dark:bg-green-900/10'
                        : 'hover:bg-surface-muted dark:hover:bg-dark-card/60'
                    )}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-[10px] font-semibold text-ink-muted dark:text-gray-400 bg-surface-muted dark:bg-dark-border px-1.5 py-0.5 rounded">
                        {asset.buAbbr}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink dark:text-white leading-snug line-clamp-2 max-w-sm">{asset.title}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-muted dark:text-gray-400">{asset.typeName}</td>
                    <td className="px-4 py-3"><StatusBadge status={asset.status} /></td>
                    {showQA && (
                      <td className="px-4 py-3">
                        {asset.qualityScores ? (
                          <QualityBar score={asset.qualityScores.overall} className="w-20" />
                        ) : (
                          <span className="text-ink-faint dark:text-gray-500">—</span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3 text-ink-muted dark:text-gray-400">{asset.agentName}</td>
                    <td className="px-4 py-3 text-ink-muted dark:text-gray-400">{asset.channel}</td>
                    <td className="px-4 py-3 text-ink-faint dark:text-gray-500">{timeAgo(asset.createdAt)}</td>
                    <td className="px-4 py-3">
                      <ChevronRight size={12} className={cn('text-ink-faint', isSelected && 'text-brand-green')} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <FileText size={32} className="text-ink-faint dark:text-gray-600 mb-3" />
              <p className="text-sm font-medium text-ink-muted dark:text-gray-400">No assets match your filters</p>
              <p className="text-xs text-ink-faint dark:text-gray-500 mt-1">Try adjusting the BU, type, or status filters</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 py-4 border-t border-border dark:border-dark-border">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="btn-secondary py-1 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs text-ink-muted dark:text-gray-400">
                Page {page + 1} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary py-1 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedAsset && (
            <AssetDetailPanel
              key={selectedAsset.id}
              asset={selectedAsset}
              onClose={() => selectAsset(null)}
              role={role}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
