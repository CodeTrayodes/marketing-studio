import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useContentStore } from '../store/useContentStore';
import { useAppStore, ROLES } from '../store/useAppStore';
import { StatusBadge } from '../components/ui/StatusBadge';
import { cn, timeAgo, qualityColor } from '../lib/utils';
import { BUSINESS_UNITS, AGENTS } from '../data/agents';
import { addToast } from '../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronRight, ChevronDown, ChevronUp, ArrowUpDown, ExternalLink,
  CheckCircle2, RotateCcw, Flag, Plus, TrendingUp, Send, Lock,
} from 'lucide-react';

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
];

const STATUS_MAP = {
  published: ['published'],
  approved: ['approved'],
  staged: ['gate-3-pending'],
  'in-review': ['gate-2-pending', 'gate-3-pending', 'qa-review'],
  drafting: ['draft'],
};

const QUALITY_PILLS = [
  { value: 'all', label: 'All Quality' },
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

// Status labels for actions
const STATUS_LABEL = {
  'qa-review': 'QA Review',
  'gate-2-pending': 'Gate 2',
  'gate-3-pending': 'Gate 3',
  'draft': 'Draft',
  'approved': 'Approved',
  'published': 'Published',
};

// Next status label for approve action
const ADVANCE_LABEL = {
  'draft': 'Move to QA',
  'qa-review': 'Advance to Gate 2',
  'gate-2-pending': 'Advance to Gate 3',
  'gate-3-pending': 'Mark Approved',
};

// Which roles can do which actions on which statuses
function getAvailableActions(status, role) {
  const isApprover = [ROLES.CAMPAIGN_LEAD, ROLES.AI_COE].includes(role);
  const isEditor = [ROLES.CONTENT_EDITOR, ROLES.AI_COE, ROLES.CAMPAIGN_LEAD].includes(role);
  const isViewer = role === ROLES.MARKETING_HEAD;

  if (isViewer) return [{ id: 'analyse', label: 'View Analytics', variant: 'neutral' }];

  const actions = [];

  if (status === 'approved' && isApprover) {
    actions.push({ id: 'publish', label: 'Publish Now', variant: 'green', icon: Send });
  }
  if (ADVANCE_LABEL[status] && (isApprover || (role === ROLES.CONTENT_EDITOR && ['draft', 'qa-review'].includes(status)))) {
    actions.push({ id: 'advance', label: ADVANCE_LABEL[status], variant: 'green', icon: CheckCircle2 });
  }
  if (['draft', 'qa-review', 'gate-2-pending', 'gate-3-pending'].includes(status) && isEditor) {
    actions.push({ id: 'revise', label: 'Request Revision', variant: 'amber', icon: RotateCcw });
  }
  if (['draft', 'qa-review', 'gate-2-pending', 'gate-3-pending'].includes(status)) {
    actions.push({ id: 'flag', label: 'Flag', variant: 'neutral-sm', icon: Flag });
  }
  if (status === 'published') {
    actions.push({ id: 'analyse', label: 'View Analytics', variant: 'neutral', icon: TrendingUp });
  }

  return actions;
}

// ─── Cell components ──────────────────────────────────────────────────────────

function AgentBadge({ agentId }) {
  const agent = AGENTS.find(a => a.id === agentId);
  const hex = LAYER_HEX[agent?.layer] || '#6B7280';
  return (
    <span
      className="inline-block text-[9px] font-mono font-medium px-1.5 py-px rounded"
      style={{ backgroundColor: `${hex}18`, color: hex }}
    >
      {agent?.code || agentId}
    </span>
  );
}

function QualityBadge({ score }) {
  if (score == null) return <span className="text-ink-faint dark:text-gray-600 text-[10px]">—</span>;
  const cls = score >= 85
    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
    : score >= 70
    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
  return <span className={cn('text-[10px] font-mono font-medium px-1.5 py-px rounded', cls)}>{score}</span>;
}

function GeoBar({ score }) {
  if (score == null) return <span className="text-ink-faint dark:text-gray-600 text-[10px]">—</span>;
  const hex = score >= 80 ? '#16A34A' : score >= 65 ? '#D97706' : '#DC2626';
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-1 bg-border dark:bg-dark-border rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: hex }} />
      </div>
      <span className="text-[10px] font-mono" style={{ color: hex }}>{score}</span>
    </div>
  );
}

function SortIcon({ field, currentField, dir }) {
  if (field !== currentField) return <ArrowUpDown size={9} className="text-ink-faint opacity-30" />;
  return dir === 'asc'
    ? <ChevronUp size={9} className="text-brand-green" />
    : <ChevronDown size={9} className="text-brand-green" />;
}

// ─── New Brief Modal ──────────────────────────────────────────────────────────

function NewBriefModal({ open, onClose }) {
  const createAsset = useContentStore(s => s.createAsset);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('seo-blog');
  const [buId, setBuId] = useState(BUSINESS_UNITS[0].id);
  const [brief, setBrief] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    const bu = BUSINESS_UNITS.find(b => b.id === buId);
    const typeOpt = TYPE_OPTIONS.find(t => t.value === type);
    const agent = AGENTS.find(a => a.id === 'agent-2a') || AGENTS[0];
    createAsset({
      title: title.trim(),
      type,
      typeName: typeOpt?.label || type,
      buId: bu.id,
      buName: bu.name,
      buAbbr: bu.abbr,
      agentId: agent.id,
      agentName: agent.name,
      channel: 'Content Hub',
      brief: brief.trim() || null,
    });
    addToast(`Brief created — agent will pick up "${title.trim().slice(0, 40)}…"`);
    setTitle(''); setType('seo-blog'); setBuId(BUSINESS_UNITS[0].id); setBrief('');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded shadow-xl w-[500px] max-w-[90vw] p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-medium text-ink dark:text-white">New Content Brief</h2>
            <p className="text-[11px] text-ink-muted dark:text-gray-400 mt-0.5">The assigned agent will pick this up and begin drafting.</p>
          </div>
          <button onClick={onClose} className="text-ink-faint hover:text-ink dark:text-gray-500 dark:hover:text-white">
            <X size={14} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500 block mb-1">Title / Topic</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. How AI is transforming enterprise CRM workflows"
              className="w-full text-[12px] bg-surface-muted dark:bg-dark-border border border-border dark:border-dark-border rounded px-2.5 py-2 text-ink dark:text-white placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-brand-green"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500 block mb-1">Content Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full text-[11px] bg-surface-muted dark:bg-dark-border border border-border dark:border-dark-border rounded px-2.5 py-2 text-ink dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-green"
              >
                {TYPE_OPTIONS.filter(o => o.value !== 'all').map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500 block mb-1">Business Unit</label>
              <select
                value={buId}
                onChange={e => setBuId(e.target.value)}
                className="w-full text-[11px] bg-surface-muted dark:bg-dark-border border border-border dark:border-dark-border rounded px-2.5 py-2 text-ink dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-green"
              >
                {BUSINESS_UNITS.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500 block mb-1">Brief <span className="normal-case tracking-normal text-ink-faint/70">(optional)</span></label>
            <textarea
              value={brief}
              onChange={e => setBrief(e.target.value)}
              rows={3}
              placeholder="Key angles, target audience, specific data points to include, tone guidance..."
              className="w-full text-[11px] bg-surface-muted dark:bg-dark-border border border-border dark:border-dark-border rounded px-2.5 py-2 text-ink dark:text-white placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-brand-green resize-none"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-brand-green text-white rounded text-[12px] font-medium hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={12} />
            Submit Brief
          </button>
          <button onClick={onClose} className="btn-secondary px-5 text-[11px]">Cancel</button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function AssetDetailPanel({ asset, onClose, role }) {
  if (!asset) return null;

  const advanceAsset = useContentStore(s => s.advanceAsset);
  const reviseAsset = useContentStore(s => s.reviseAsset);
  const publishAsset = useContentStore(s => s.publishAsset);
  const flagAsset = useContentStore(s => s.flagAsset);
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');

  const gateLabel = {
    'gate-2-pending': 'Gate 2 — Content Review',
    'gate-3-pending': 'Gate 3 — Final Approval',
    'qa-review': 'QA Review',
    draft: 'In Drafting',
    approved: 'Approved',
    published: 'Published',
  }[asset.status] || asset.status;

  const showGateLink = ['gate-2-pending', 'gate-3-pending'].includes(asset.status);
  const actions = getAvailableActions(asset.status, role);
  const isFlagged = asset.flagged;

  const handleAction = (actionId) => {
    if (actionId === 'advance') {
      advanceAsset(asset.id);
      addToast(`Moved to ${STATUS_LABEL[{
        'draft': 'qa-review',
        'qa-review': 'gate-2-pending',
        'gate-2-pending': 'gate-3-pending',
        'gate-3-pending': 'approved',
      }[asset.status]] || 'next stage'}`);
    } else if (actionId === 'publish') {
      publishAsset(asset.id);
      addToast('Asset published');
    } else if (actionId === 'revise') {
      setShowRevisionInput(v => !v);
    } else if (actionId === 'flag') {
      flagAsset(asset.id);
      addToast(isFlagged ? 'Flag removed' : 'Flagged for review', 'info');
    } else if (actionId === 'analyse') {
      // scroll quality into view — handled visually below
    }
  };

  const handleReviseSubmit = () => {
    if (!revisionNote.trim()) return;
    reviseAsset(asset.id, revisionNote.trim());
    addToast('Revision request sent to agent');
    setRevisionNote('');
    setShowRevisionInput(false);
  };

  return (
    <motion.div
      key={asset.id}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="w-96 flex-shrink-0 bg-white dark:bg-dark-card border-l border-border dark:border-dark-border flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border dark:border-dark-border flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <StatusBadge status={asset.status} />
            <span className="badge bg-surface-muted dark:bg-dark-border text-ink-muted dark:text-gray-400">{asset.typeName}</span>
            <span className="badge bg-surface-muted dark:bg-dark-border text-ink-muted dark:text-gray-400">{asset.buAbbr}</span>
            {isFlagged && (
              <span className="badge bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">Flagged</span>
            )}
          </div>
          <h3 className="text-[13px] font-medium text-ink dark:text-white leading-snug">{asset.title}</h3>
        </div>
        <button onClick={onClose} className="text-ink-muted dark:text-gray-400 hover:text-ink dark:hover:text-white flex-shrink-0 mt-0.5">
          <X size={14} />
        </button>
      </div>

      {/* Actions */}
      {actions.length > 0 && (
        <div className="px-4 py-3 border-b border-border dark:border-dark-border bg-surface-muted/50 dark:bg-dark-border/30">
          <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500 mb-2">Actions</p>
          <div className="flex flex-wrap gap-1.5">
            {actions.map(action => (
              <button
                key={action.id}
                onClick={() => handleAction(action.id)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors',
                  action.variant === 'green' && 'bg-brand-green text-white hover:bg-green-700',
                  action.variant === 'amber' && (showRevisionInput && action.id === 'revise'
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30'),
                  action.variant === 'neutral' && 'bg-surface-muted dark:bg-dark-border border border-border dark:border-dark-border text-ink-muted dark:text-gray-400 hover:bg-border dark:hover:bg-dark-border/70',
                  action.variant === 'neutral-sm' && cn(
                    'bg-surface-muted dark:bg-dark-border border border-border dark:border-dark-border hover:bg-border',
                    isFlagged ? 'text-amber-500' : 'text-ink-faint dark:text-gray-500'
                  ),
                )}
              >
                {action.icon && <action.icon size={11} strokeWidth={1.5} />}
                {action.label}
              </button>
            ))}
          </div>

          {/* Inline revision input */}
          <AnimatePresence>
            {showRevisionInput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div className="mt-2.5 space-y-2">
                  <textarea
                    value={revisionNote}
                    onChange={e => setRevisionNote(e.target.value)}
                    rows={3}
                    autoFocus
                    placeholder="Describe what needs to change — the agent will receive this and revise accordingly..."
                    className="w-full text-[11px] bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded px-2.5 py-2 text-ink dark:text-white placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none"
                  />
                  <div className="flex gap-1.5">
                    <button
                      onClick={handleReviseSubmit}
                      disabled={!revisionNote.trim()}
                      className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded text-[11px] font-medium hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send size={10} />
                      Send to Agent
                    </button>
                    <button onClick={() => setShowRevisionInput(false)} className="btn-secondary px-3 py-1.5 text-[11px]">Cancel</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-4 space-y-4">

          {/* Quality breakdown */}
          {asset.qualityScores && (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500 mb-2.5">Quality Scores</p>
              <div className="space-y-2.5">
                {[
                  { label: 'Overall', val: asset.qualityScores.overall },
                  { label: 'SEO', val: asset.qualityScores.seo },
                  { label: 'Brand', val: asset.qualityScores.brand },
                  { label: 'GEO Readiness', val: asset.qualityScores.geo },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] text-ink-muted dark:text-gray-400">{label}</span>
                      <span className={cn('text-[11px] font-mono font-medium', qualityColor(val))}>{val}/100</span>
                    </div>
                    <div className="w-full h-1 bg-border dark:bg-dark-border rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${val}%`, backgroundColor: val >= 85 ? '#16A34A' : val >= 70 ? '#D97706' : '#DC2626' }} />
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-0.5 border-t border-border dark:border-dark-border">
                  <span className="text-[11px] text-ink-muted dark:text-gray-400">AI Detection</span>
                  <span className="text-[11px] font-medium text-brand-green">PASS ✓ ({asset.qualityScores.aiDetection}%)</span>
                </div>
              </div>
            </div>
          )}

          {/* Content preview */}
          {asset.preview && (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500 mb-1.5">Content Preview</p>
              <div className="bg-surface-muted dark:bg-dark-border rounded p-3">
                <p className="text-[11px] text-ink-muted dark:text-gray-400 leading-relaxed line-clamp-6">{asset.preview}</p>
              </div>
            </div>
          )}

          {/* Details */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500 mb-2">Details</p>
            <div className="space-y-2">
              {[
                { label: 'Agent', value: asset.agentName },
                { label: 'Channel', value: asset.channel },
                { label: 'Words', value: asset.wordCount?.toLocaleString() ?? '—' },
                { label: 'Created', value: timeAgo(asset.createdAt) },
                { label: 'Published', value: asset.publishedAt ? timeAgo(asset.publishedAt) : '—' },
                { label: 'Gate Status', value: gateLabel },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-3">
                  <span className="text-[11px] text-ink-faint dark:text-gray-500 flex-shrink-0 w-20">{label}</span>
                  <span className="text-[11px] text-ink dark:text-white text-right leading-relaxed">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gate link */}
          {showGateLink && (
            <Link to="/gates"
              className="flex items-center justify-center gap-1.5 w-full px-3 py-2 border border-border dark:border-dark-border rounded text-[11px] font-medium text-ink-muted dark:text-gray-400 hover:bg-surface-muted dark:hover:bg-dark-border transition-colors"
            >
              View in Gate Manager
              <ExternalLink size={11} />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ContentTracker() {
  const assets = useContentStore(s => s.assets);
  const { filterBU, setFilterBU, sortField, sortDir, setSort, selectedAsset, selectAsset } = useContentStore();
  const role = useAppStore(s => s.role);

  const [statusFilter, setStatusFilter] = useState('all');
  const [qualityFilter, setQualityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [showNewBrief, setShowNewBrief] = useState(false);
  const PAGE_SIZE = 40;

  const canCreate = [ROLES.CAMPAIGN_LEAD, ROLES.CONTENT_EDITOR, ROLES.AI_COE].includes(role);

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
    { field: 'buAbbr', label: 'BU', w: 'w-12' },
    { field: 'title', label: 'Title', w: 'min-w-[260px]' },
    { field: 'typeName', label: 'Type', w: 'w-32' },
    { field: 'agent', label: 'Agent', w: 'w-16' },
    { field: 'status', label: 'Status', w: 'w-36' },
    { field: 'quality', label: 'Quality', w: 'w-16' },
    { field: 'geo', label: 'GEO', w: 'w-28' },
    { field: 'channel', label: 'Channel', w: 'w-28' },
    { field: 'createdAt', label: 'Updated', w: 'w-20' },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* Toolbar */}
      <div className="bg-white dark:bg-dark-card border-b border-border dark:border-dark-border px-4 py-3 flex-shrink-0 space-y-2.5">

        {/* BU pills + headline stats + create button */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            {BU_PILLS.map(bu => (
              <button
                key={bu.id}
                onClick={() => handleBUChange(bu.id)}
                className={cn(
                  'px-2.5 py-1 rounded text-[10px] font-medium transition-colors',
                  filterBU === bu.id
                    ? 'bg-ink dark:bg-white text-white dark:text-ink'
                    : 'bg-surface-muted dark:bg-dark-border text-ink-muted dark:text-gray-400 hover:bg-border dark:hover:bg-dark-border'
                )}
              >
                {bu.abbr}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <p className="text-[11px] text-ink-muted dark:text-gray-400 whitespace-nowrap">
              <span className="font-medium text-ink dark:text-white">{stats.total}</span> assets
              {' · '}
              <span className="font-medium text-brand-green">{stats.published}</span> published
              {' · '}
              <span className="font-medium text-amber-500">{stats.inReview}</span> in review
            </p>
            {canCreate && (
              <button
                onClick={() => setShowNewBrief(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-green text-white rounded text-[11px] font-medium hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                <Plus size={12} strokeWidth={2} />
                New Brief
              </button>
            )}
          </div>
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status pills */}
          <div className="flex items-center gap-1">
            {STATUS_PILLS.map(p => (
              <button
                key={p.value}
                onClick={() => handleStatusChange(p.value)}
                className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors whitespace-nowrap',
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

          {/* Quality pills */}
          <div className="flex items-center gap-1">
            {QUALITY_PILLS.map(p => (
              <button
                key={p.value}
                onClick={() => handleQualityChange(p.value)}
                className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors whitespace-nowrap',
                  qualityFilter === p.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-surface-muted dark:bg-dark-border text-ink-muted dark:text-gray-400 hover:bg-border'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="w-px h-3.5 bg-border dark:bg-dark-border flex-shrink-0" />

          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(0); }}
            className="text-[10px] bg-surface-muted dark:bg-dark-border border border-border dark:border-dark-border rounded px-2 py-1 text-ink dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-green"
          >
            {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search title or agent..."
            className="text-[10px] bg-surface-muted dark:bg-dark-border border border-border dark:border-dark-border rounded px-2 py-1 text-ink dark:text-white placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-brand-green w-36"
          />

          <span className="ml-auto text-[10px] text-ink-faint dark:text-gray-500">{filtered.length} results</span>
        </div>
      </div>

      {/* Stats strip */}
      <div className="bg-surface-muted/60 dark:bg-dark-border/60 border-b border-border dark:border-dark-border px-4 py-1.5 flex items-center gap-6 flex-shrink-0">
        {[
          { label: 'Total', value: stats.total, color: 'text-ink dark:text-white' },
          { label: 'Avg Quality', value: `${stats.avgQuality}/100`, color: qualityColor(stats.avgQuality) },
          { label: 'Avg GEO', value: `${stats.avgGeo}/100`, color: 'text-blue-600' },
          { label: 'Published Today', value: stats.publishedToday, color: 'text-brand-green' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="text-[10px] text-ink-faint dark:text-gray-500 uppercase tracking-[0.08em]">{label}</span>
            <span className={cn('text-[12px] font-medium font-mono-nums', color)}>{value}</span>
          </div>
        ))}
      </div>

      {/* Table + detail panel */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto scrollbar-thin">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-white dark:bg-dark-card border-b border-border dark:border-dark-border z-10">
              <tr>
                {TABLE_COLS.map(({ field, label, w }) => (
                  <th
                    key={field}
                    className={cn('text-left px-3 py-2.5 font-medium text-[10px] text-ink-faint dark:text-gray-500 uppercase tracking-[0.08em] cursor-pointer hover:text-ink dark:hover:text-white whitespace-nowrap', w)}
                    onClick={() => setSort(field)}
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      <SortIcon field={field} currentField={sortField} dir={sortDir} />
                    </div>
                  </th>
                ))}
                <th className="w-6" />
              </tr>
            </thead>
            <tbody>
              {paginated.map((asset, idx) => {
                const isSel = selectedAsset?.id === asset.id;
                const isEven = idx % 2 === 0;
                return (
                  <tr
                    key={asset.id}
                    onClick={() => isSel ? selectAsset(null) : selectAsset(asset.id)}
                    className={cn(
                      'cursor-pointer transition-colors border-b border-border/50 dark:border-dark-border/50',
                      isSel
                        ? 'bg-brand-green-light dark:bg-green-900/10'
                        : isEven
                        ? 'bg-white dark:bg-dark-card hover:bg-surface-muted/70 dark:hover:bg-dark-border/40'
                        : 'bg-surface-muted/30 dark:bg-dark-border/20 hover:bg-surface-muted/70 dark:hover:bg-dark-border/40'
                    )}
                  >
                    <td className="px-3 py-3">
                      <span className="font-mono text-[9px] font-medium text-ink-muted dark:text-gray-400 bg-surface-muted dark:bg-dark-border px-1.5 py-0.5 rounded">
                        {asset.buAbbr}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-[12px] text-ink dark:text-white leading-snug line-clamp-2 max-w-[320px]">
                        {asset.flagged && <Flag size={10} className="inline-block mr-1 text-amber-500 flex-shrink-0" strokeWidth={1.5} />}
                        {asset.title}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-[11px] text-ink-muted dark:text-gray-400 whitespace-nowrap">{asset.typeName}</td>
                    <td className="px-3 py-3"><AgentBadge agentId={asset.agent} /></td>
                    <td className="px-3 py-3"><StatusBadge status={asset.status} /></td>
                    <td className="px-3 py-3"><QualityBadge score={asset.qualityScores?.overall} /></td>
                    <td className="px-3 py-3"><GeoBar score={asset.qualityScores?.geo} /></td>
                    <td className="px-3 py-3 text-[11px] text-ink-muted dark:text-gray-400 whitespace-nowrap">{asset.channel}</td>
                    <td className="px-3 py-3 text-[11px] text-ink-faint dark:text-gray-500 whitespace-nowrap">{timeAgo(asset.createdAt)}</td>
                    <td className="px-3 py-3">
                      <ChevronRight size={11} className={cn('text-ink-faint', isSel && 'text-brand-green')} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-[12px] font-medium text-ink-muted dark:text-gray-400">No assets match your filters</p>
              <p className="text-[11px] text-ink-faint dark:text-gray-500 mt-1">Try adjusting the BU, status, or search terms above</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 py-3 border-t border-border dark:border-dark-border">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                className="btn-secondary py-1 px-3 disabled:opacity-40 disabled:cursor-not-allowed text-[10px]">
                Previous
              </button>
              <span className="text-[10px] text-ink-muted dark:text-gray-400">{page + 1} / {totalPages}</span>
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
              role={role}
            />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showNewBrief && <NewBriefModal open={showNewBrief} onClose={() => setShowNewBrief(false)} />}
      </AnimatePresence>
    </div>
  );
}
