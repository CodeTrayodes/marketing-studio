import { useState } from 'react';
import { useGateStore } from '../store/useGateStore';
import { useContentStore } from '../store/useContentStore';
import { useAppStore, ROLES } from '../store/useAppStore';
import { SLATimer } from '../components/ui/SLATimer';
import { addToast } from '../components/ui/Toast';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Lock, AlertTriangle, X, Check, RotateCcw,
  Flag, ChevronRight, ChevronDown, ChevronUp, Users,
} from 'lucide-react';

// ─── Pipeline Status Bar ──────────────────────────────────────────────────────

function PipelineBar({ gates }) {
  return (
    <div className="card p-3">
      <div className="flex items-center gap-1.5 mb-3">
        <div className="w-3.5 h-3.5 rounded bg-brand-green/15 flex items-center justify-center flex-shrink-0">
          <span className="text-brand-green text-[7px] font-medium">AI</span>
        </div>
        <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500">
          Pipeline — Q2 2025
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {gates.map((gate) => {
          const isActive = gate.status === 'active';
          const isCompleted = gate.status === 'completed';
          return (
            <div
              key={gate.id}
              className={cn(
                'rounded p-2.5 border transition-all',
                isActive
                  ? 'bg-amber-50 dark:bg-amber-900/15 border-amber-200 dark:border-amber-800'
                  : isCompleted
                  ? 'bg-brand-green-light dark:bg-green-900/15 border-green-200 dark:border-green-800'
                  : 'bg-surface-muted dark:bg-dark-border border-border dark:border-dark-border'
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={cn(
                    'text-[9px] font-medium uppercase tracking-[0.08em]',
                    isActive
                      ? 'text-amber-600 dark:text-amber-400'
                      : isCompleted
                      ? 'text-brand-green'
                      : 'text-ink-faint dark:text-gray-500'
                  )}
                >
                  Gate {gate.number}
                </span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                {isCompleted && <CheckCircle2 size={10} className="text-brand-green" />}
                {gate.status === 'pending' && <Lock size={9} className="text-ink-faint dark:text-gray-500" />}
              </div>
              <p
                className={cn(
                  'text-[11px] font-medium leading-tight',
                  isActive
                    ? 'text-amber-700 dark:text-amber-300'
                    : isCompleted
                    ? 'text-brand-green-dark dark:text-green-400'
                    : 'text-ink-muted dark:text-gray-400'
                )}
              >
                {gate.name}
              </p>
              <p
                className={cn(
                  'text-[10px] mt-1 font-mono-nums',
                  isActive
                    ? 'text-amber-600/80 dark:text-amber-500/80'
                    : isCompleted
                    ? 'text-brand-green'
                    : 'text-ink-faint dark:text-gray-500'
                )}
              >
                {isCompleted
                  ? `All ${gate.itemsCount} approved`
                  : gate.status === 'pending'
                  ? `Waiting on Gate ${gate.number - 1}`
                  : `${gate.itemsApproved} / ${gate.itemsCount} reviewed`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Review Panel ─────────────────────────────────────────────────────────────

function ScoreCell({ score, label, large = false }) {
  if (score == null) return null;
  const color =
    score >= 85 ? 'text-brand-green' : score >= 70 ? 'text-amber-500' : 'text-red-500';
  const bg =
    score >= 85
      ? 'bg-green-50 dark:bg-green-900/20'
      : score >= 70
      ? 'bg-amber-50 dark:bg-amber-900/20'
      : 'bg-red-50 dark:bg-red-900/20';

  return (
    <div className={cn('flex flex-col items-center justify-center gap-0.5 rounded p-2', bg)}>
      <span className={cn('font-mono font-medium tabular-nums', large ? 'text-[22px]' : 'text-[14px]', color)}>
        {score}
      </span>
      <span className="text-[9px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500 text-center">
        {label}
      </span>
    </div>
  );
}

function ReviewPanel({ asset, gate, canApprove, onClose, onApprove, onRevise }) {
  const flagAsset = useContentStore((s) => s.flagAsset);
  const [revising, setRevising] = useState(false);
  const [note, setNote] = useState('');

  if (!asset) return null;

  const q = asset.qualityScores;
  const aiDetect = q?.aiDetection;
  const aiDetectColor =
    aiDetect <= 8 ? 'text-brand-green' : aiDetect <= 15 ? 'text-amber-500' : 'text-red-500';
  const aiDetectLabel = aiDetect <= 8 ? 'Low' : aiDetect <= 15 ? 'Med' : 'High';
  const aiDetectBg =
    aiDetect <= 8
      ? 'bg-green-50 dark:bg-green-900/20'
      : aiDetect <= 15
      ? 'bg-amber-50 dark:bg-amber-900/20'
      : 'bg-red-50 dark:bg-red-900/20';

  const createdDate = asset.createdAt
    ? new Date(asset.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : '—';

  const handleApprove = () => {
    onApprove(asset);
  };

  const handleRevise = () => {
    if (!note.trim()) return;
    onRevise(asset.id, note.trim());
    setNote('');
    setRevising(false);
  };

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-14 right-0 h-[calc(100vh-3.5rem)] w-[520px] bg-white dark:bg-dark-card border-l border-border dark:border-dark-border flex flex-col z-40 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-border dark:border-dark-border flex-shrink-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[9px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500 bg-surface-muted dark:bg-dark-border px-1.5 py-0.5 rounded">
              {asset.typeName}
            </span>
            <span className="text-[9px] text-ink-faint dark:text-gray-500">{asset.buAbbr}</span>
            {asset.flagged && (
              <span className="flex items-center gap-0.5 text-[9px] text-amber-500 font-medium">
                <Flag size={9} /> Flagged
              </span>
            )}
          </div>
          <h2 className="text-[13px] font-medium text-ink dark:text-white leading-snug pr-2">
            {asset.title}
          </h2>
          <p className="text-[10px] text-ink-faint dark:text-gray-500 mt-1">
            {asset.agentName}
            {asset.wordCount ? ` · ${asset.wordCount.toLocaleString()} words` : ''}
            {' · '}Created {createdDate}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-ink-faint dark:text-gray-500 hover:text-ink dark:hover:text-white flex-shrink-0 mt-0.5 p-0.5 rounded hover:bg-surface-muted dark:hover:bg-dark-border transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">

        {/* Quality analysis */}
        {q && (
          <div className="px-5 py-4 border-b border-border dark:border-dark-border">
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-3.5 h-3.5 rounded bg-brand-green/15 flex items-center justify-center flex-shrink-0">
                <span className="text-brand-green text-[7px] font-medium">AI</span>
              </div>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500">
                Quality Analysis
              </p>
            </div>
            <div className="grid grid-cols-5 gap-2">
              <ScoreCell score={q.overall} label="Overall" large />
              <ScoreCell score={q.seo} label="SEO" />
              <ScoreCell score={q.brand} label="Brand" />
              <ScoreCell score={q.geo} label="GEO" />
              <div
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 rounded p-2',
                  aiDetectBg
                )}
              >
                <span className={cn('font-mono font-medium text-[14px]', aiDetectColor)}>
                  {aiDetect}%
                </span>
                <span className="text-[9px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500 text-center">
                  AI Risk
                </span>
                <span className={cn('text-[9px] font-medium', aiDetectColor)}>{aiDetectLabel}</span>
              </div>
            </div>
            <div className="mt-3">
              {q.overall >= 85 ? (
                <div className="flex items-center gap-1.5 text-brand-green">
                  <CheckCircle2 size={11} />
                  <span className="text-[10px] font-medium">
                    QA Agent passed — all quality thresholds met
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <AlertTriangle size={11} />
                  <span className="text-[10px] font-medium">
                    Quality score {q.overall} — below 85 threshold, review carefully
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Agent summary */}
        <div className="px-5 py-4 border-b border-border dark:border-dark-border">
          <div className="ai-panel rounded p-3.5 space-y-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-brand-green/15 flex items-center justify-center flex-shrink-0">
                <span className="text-brand-green text-[7px] font-medium">AI</span>
              </div>
              <p className="text-[10px] font-medium text-brand-green-dark dark:text-green-400">
                Agent Summary
              </p>
            </div>
            <p className="text-[11px] text-ink-muted dark:text-gray-400 leading-relaxed">
              <span className="text-ink dark:text-white font-medium">{asset.agentName}</span> produced
              this {asset.typeName.toLowerCase()} for the{' '}
              <span className="text-ink dark:text-white font-medium">{asset.buName}</span> business
              unit, targeting the <span className="text-ink dark:text-white font-medium">{asset.channel}</span> channel.
              {q?.overall >= 85
                ? ` Scores are strong — SEO ${q.seo}, Brand ${q.brand}, GEO ${q.geo}.`
                : q?.overall
                ? ` Some dimensions need attention — Overall ${q.overall}.`
                : ''}
              {gate ? ` Pending ${gate.name} sign-off.` : ''}
            </p>
            {asset.wordCount && (
              <p className="text-[10px] text-ink-faint dark:text-gray-500">
                {asset.wordCount.toLocaleString()} words · Created {createdDate}
              </p>
            )}
          </div>
        </div>

        {/* Content preview */}
        <div className="px-5 py-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500 mb-2.5">
            Content Preview
          </p>
          <div className="bg-surface-muted dark:bg-dark-border rounded p-4">
            <p className="text-[11px] text-ink dark:text-white leading-relaxed whitespace-pre-line font-mono">
              {asset.preview || 'No preview available for this asset.'}
            </p>
          </div>
          {asset.wordCount && (
            <p className="text-[9px] text-ink-faint dark:text-gray-500 mt-1.5 text-right">
              Showing excerpt · {asset.wordCount.toLocaleString()} words total
            </p>
          )}
        </div>
      </div>

      {/* Decision area — sticky bottom */}
      <div className="border-t border-border dark:border-dark-border px-5 py-4 flex-shrink-0 bg-white dark:bg-dark-card space-y-3">
        <AnimatePresence mode="wait">
          {canApprove && !revising && (
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="flex gap-2"
            >
              <button
                onClick={handleApprove}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-brand-green text-white rounded text-[11px] font-medium hover:bg-green-700 transition-colors"
              >
                <Check size={12} />
                Approve
              </button>
              <button
                onClick={() => setRevising(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-border dark:border-dark-border text-ink-muted dark:text-gray-400 rounded text-[11px] font-medium hover:bg-surface-muted dark:hover:bg-dark-border transition-colors"
              >
                <RotateCcw size={11} />
                Request Revision
              </button>
            </motion.div>
          )}

          {canApprove && revising && (
            <motion.div
              key="revision"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="space-y-2.5"
            >
              <label className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500 block">
                Note to agent — describe what needs to change
              </label>
              <textarea
                autoFocus
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="e.g. Strengthen the opening, add a concrete data point in section 2, tighten the CTA — align with Q2 brand guidelines..."
                className="w-full text-[11px] bg-surface-muted dark:bg-dark-border border border-border dark:border-dark-border rounded px-3 py-2 text-ink dark:text-white placeholder:text-ink-faint dark:placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-green resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleRevise}
                  disabled={!note.trim()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-brand-green text-white rounded text-[11px] font-medium hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RotateCcw size={10} />
                  Send to Agent
                </button>
                <button
                  onClick={() => { setRevising(false); setNote(''); }}
                  className="px-4 py-2.5 border border-border dark:border-dark-border text-ink-muted dark:text-gray-400 rounded text-[11px] hover:bg-surface-muted dark:hover:bg-dark-border transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {!canApprove && (
            <motion.p
              key="view-only"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] text-ink-faint dark:text-gray-500 text-center py-2"
            >
              View only — your role does not have approval permissions for this gate.
            </motion.p>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between pt-1">
          <p className="text-[9px] text-ink-faint dark:text-gray-500">
            {canApprove ? 'Revisions are sent directly to the originating agent.' : ''}
          </p>
          <button
            onClick={() => flagAsset(asset.id)}
            className={cn(
              'flex items-center gap-1 text-[9px] transition-colors',
              asset.flagged
                ? 'text-amber-500'
                : 'text-ink-faint dark:text-gray-500 hover:text-amber-500'
            )}
          >
            <Flag size={10} />
            {asset.flagged ? 'Flagged' : 'Flag'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Asset Queue Card ─────────────────────────────────────────────────────────

function AssetQueueCard({ asset, isSelected, onClick }) {
  const q = asset.qualityScores?.overall;
  const scoreColor =
    q >= 85 ? 'text-brand-green' : q >= 70 ? 'text-amber-500' : 'text-red-500';
  const accentColor =
    q >= 85 ? 'bg-brand-green' : q >= 70 ? 'bg-amber-400' : 'bg-red-400';

  const daysWaiting = asset.createdAt
    ? Math.floor((Date.now() - new Date(asset.createdAt).getTime()) / 86400000)
    : 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left flex items-stretch gap-3 px-3 py-2.5 rounded border transition-all duration-150',
        isSelected
          ? 'border-brand-green/40 bg-brand-green-light dark:bg-green-900/15'
          : 'border-border dark:border-dark-border bg-white dark:bg-dark-card hover:border-brand-green/25 hover:bg-surface-muted dark:hover:bg-dark-border'
      )}
    >
      <div className={cn('w-0.5 rounded-full flex-shrink-0', accentColor)} />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-ink dark:text-white leading-snug truncate">{asset.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[9px] text-ink-faint dark:text-gray-500 bg-surface-muted dark:bg-dark-border px-1.5 py-px rounded">
            {asset.typeName}
          </span>
          <span className="text-[9px] text-ink-faint dark:text-gray-500">
            {daysWaiting}d waiting
          </span>
          {asset.flagged && (
            <span className="text-[9px] text-amber-500">
              <Flag size={9} />
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end justify-center gap-1 flex-shrink-0">
        {q != null && (
          <span className={cn('text-[11px] font-mono font-medium tabular-nums', scoreColor)}>
            {q}
          </span>
        )}
        <ChevronRight
          size={11}
          className={isSelected ? 'text-brand-green' : 'text-ink-faint dark:text-gray-500'}
        />
      </div>
    </button>
  );
}

// ─── Gate Section ─────────────────────────────────────────────────────────────

function GateSection({ gate, canApprove, selectedAssetId, onSelectAsset }) {
  const assets = useContentStore((s) => s.assets);
  const approveAllInGate = useGateStore((s) => s.approveAllInGate);
  const [expanded, setExpanded] = useState(gate.status === 'active');

  const gateAssets = assets.filter((a) => a.status === `${gate.id}-pending`);
  const pct =
    gate.itemsCount > 0 ? Math.round((gate.itemsApproved / gate.itemsCount) * 100) : 0;

  const borderColor =
    gate.status === 'active'
      ? 'border-amber-200 dark:border-amber-800'
      : gate.status === 'completed'
      ? 'border-green-200 dark:border-green-800'
      : 'border-border dark:border-dark-border';

  const leftAccent =
    gate.status === 'active' ? '#F59E0B' : gate.status === 'completed' ? '#16A34A' : '#E5E7EB';

  const handleApproveGate = () => {
    approveAllInGate(gate.id);
    addToast(
      `Gate ${gate.number} approved — ${gate.number < 4 ? `Gate ${gate.number + 1} unlocked` : 'Distribution Agent activated'}`,
      'success'
    );
  };

  return (
    <div
      className={cn(
        'card border overflow-hidden transition-all duration-200',
        borderColor,
        gate.status === 'active' && 'shadow-card'
      )}
      style={{ borderLeft: `3px solid ${leftAccent}` }}
    >
      {/* Gate header */}
      <div
        className={cn(
          'px-4 py-3 cursor-pointer select-none',
          gate.status === 'active' && 'bg-amber-50/30 dark:bg-amber-900/10'
        )}
        onClick={() => gate.status !== 'pending' && setExpanded((v) => !v)}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-7 h-7 rounded flex items-center justify-center flex-shrink-0',
                gate.status === 'active'
                  ? 'bg-amber-100 dark:bg-amber-900/40'
                  : gate.status === 'completed'
                  ? 'bg-brand-green/10'
                  : 'bg-surface-muted dark:bg-dark-border'
              )}
            >
              {gate.status === 'completed' ? (
                <CheckCircle2 size={13} className="text-brand-green" />
              ) : gate.status === 'pending' ? (
                <Lock size={12} className="text-ink-faint dark:text-gray-500" />
              ) : (
                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                  {gate.number}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className={cn(
                    'text-[9px] font-medium uppercase tracking-[0.08em]',
                    gate.status === 'active'
                      ? 'text-amber-600 dark:text-amber-400'
                      : gate.status === 'completed'
                      ? 'text-brand-green'
                      : 'text-ink-faint dark:text-gray-500'
                  )}
                >
                  Gate {gate.number}
                </span>
                {gate.status === 'active' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </div>
              <p className="text-[13px] font-medium text-ink dark:text-white">{gate.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {gate.status === 'active' && (
              <SLATimer deadline={gate.slaDeadline} slaHours={gate.slaHours} compact />
            )}
            {gate.status === 'completed' && (
              <span className="text-[10px] font-medium text-brand-green flex items-center gap-1">
                <CheckCircle2 size={11} /> Approved
              </span>
            )}
            {gate.status !== 'pending' && (
              <span className="text-[10px] font-mono-nums text-ink-muted dark:text-gray-400">
                {gate.itemsApproved}/{gate.itemsCount}
              </span>
            )}
            {gate.status !== 'pending' && (
              expanded
                ? <ChevronUp size={13} className="text-ink-faint dark:text-gray-500" />
                : <ChevronDown size={13} className="text-ink-faint dark:text-gray-500" />
            )}
          </div>
        </div>

        {gate.status !== 'pending' && (
          <div className="mt-2.5 h-0.5 bg-border dark:bg-dark-border rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                gate.status === 'completed' ? 'bg-brand-green' : 'bg-amber-400'
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}

        {gate.status === 'pending' && (
          <p className="text-[10px] text-ink-faint dark:text-gray-500 mt-1.5 ml-10">
            Locked — waiting on Gate {gate.number - 1} to complete
          </p>
        )}
      </div>

      {/* Expanded body */}
      <AnimatePresence>
        {expanded && gate.status !== 'pending' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border dark:border-dark-border">

              {/* Completed */}
              {gate.status === 'completed' && (
                <div className="px-4 py-3 flex items-center gap-3">
                  <CheckCircle2 size={14} className="text-brand-green flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-[11px] font-medium text-brand-green">
                      All {gate.itemsCount} assets approved
                    </p>
                    <p className="text-[10px] text-ink-faint dark:text-gray-500 mt-0.5">
                      {gate.approvers.map((a) => a.name).join(' · ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500 mb-0.5">
                      Next step
                    </p>
                    <p className="text-[10px] text-brand-green">{gate.onApprove}</p>
                  </div>
                </div>
              )}

              {/* Active */}
              {gate.status === 'active' && (
                <div className="p-4 space-y-4">

                  {/* What happens next */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-surface-muted dark:bg-dark-border rounded p-2.5">
                      <p className="text-[9px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500 mb-1">
                        On Approve
                      </p>
                      <p className="text-[10px] text-brand-green leading-relaxed">{gate.onApprove}</p>
                    </div>
                    <div className="bg-surface-muted dark:bg-dark-border rounded p-2.5">
                      <p className="text-[9px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500 mb-1">
                        On Revise
                      </p>
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 leading-relaxed">
                        {gate.onReject}
                      </p>
                    </div>
                  </div>

                  {/* Reviewers */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Users size={11} className="text-ink-faint dark:text-gray-500" />
                      <span className="text-[9px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500">
                        Reviewers
                      </span>
                    </div>
                    {gate.approvers.map((a) => (
                      <div key={a.name} className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded bg-surface-muted dark:bg-dark-border border border-border dark:border-dark-border flex items-center justify-center flex-shrink-0">
                          <span className="text-[8px] font-medium text-ink-muted dark:text-gray-400">
                            {a.avatar}
                          </span>
                        </div>
                        <div>
                          <p className="text-[10px] font-medium text-ink dark:text-white leading-none">
                            {a.name}
                          </p>
                          <p className="text-[9px] text-ink-faint dark:text-gray-500">{a.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Asset review queue */}
                  {gateAssets.length > 0 ? (
                    <div>
                      <p className="text-[9px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500 mb-2">
                        Review Queue — {gateAssets.length} asset{gateAssets.length !== 1 ? 's' : ''} pending · click to open document
                      </p>
                      <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-0.5">
                        {gateAssets.map((asset) => (
                          <AssetQueueCard
                            key={asset.id}
                            asset={asset}
                            isSelected={selectedAssetId === asset.id}
                            onClick={() =>
                              onSelectAsset(selectedAssetId === asset.id ? null : asset.id)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 py-2">
                      <CheckCircle2 size={13} className="text-brand-green" />
                      <p className="text-[11px] font-medium text-brand-green">
                        All assets in this queue have been reviewed
                      </p>
                    </div>
                  )}

                  {/* Approve gate CTA */}
                  {canApprove && (
                    <div className="pt-3 border-t border-border dark:border-dark-border space-y-1.5">
                      <button
                        onClick={handleApproveGate}
                        disabled={gateAssets.length > 0}
                        className={cn(
                          'w-full flex items-center justify-center gap-2 py-2.5 rounded text-[11px] font-medium transition-all',
                          gateAssets.length === 0
                            ? 'bg-brand-green text-white hover:bg-green-700'
                            : 'bg-surface-muted dark:bg-dark-border text-ink-faint dark:text-gray-500 cursor-not-allowed'
                        )}
                      >
                        <CheckCircle2 size={12} />
                        Approve Gate {gate.number} —{' '}
                        {gate.number < 4 ? `Unlock Gate ${gate.number + 1}` : 'Activate Distribution'}
                      </button>
                      {gateAssets.length > 0 && (
                        <p className="text-[9px] text-ink-faint dark:text-gray-500 text-center">
                          Open and review all {gateAssets.length} remaining asset
                          {gateAssets.length !== 1 ? 's' : ''} before approving the gate
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GateManager() {
  const gates = useGateStore((s) => s.gates);
  const assets = useContentStore((s) => s.assets);
  const approveAsset = useContentStore((s) => s.approveAsset);
  const reviseAsset = useContentStore((s) => s.reviseAsset);
  const approveGateItem = useGateStore((s) => s.approveGateItem);
  const role = useAppStore((s) => s.role);
  const canApprove = [ROLES.CAMPAIGN_LEAD, ROLES.AI_COE, ROLES.CONTENT_EDITOR].includes(role);

  const [selectedAssetId, setSelectedAssetId] = useState(null);

  const selectedAsset = selectedAssetId ? assets.find((a) => a.id === selectedAssetId) : null;
  const selectedAssetGate = selectedAsset
    ? gates.find((g) => selectedAsset.status === `${g.id}-pending`)
    : null;

  const handleApprove = (asset) => {
    approveAsset(asset.id);
    if (selectedAssetGate) approveGateItem(selectedAssetGate.id);
    addToast(`Approved — "${asset.title.slice(0, 45)}${asset.title.length > 45 ? '…' : ''}"`, 'success');
    setSelectedAssetId(null);
  };

  const handleRevise = (id, note) => {
    reviseAsset(id, note);
    addToast('Revision sent to agent — content will be reworked', 'info');
    setSelectedAssetId(null);
  };

  const activeGatesCount = gates.filter((g) => g.status === 'active').length;
  const totalPending = gates.reduce((sum, g) => {
    return sum + assets.filter((a) => a.status === `${g.id}-pending`).length;
  }, 0);

  return (
    <div className="relative flex h-full overflow-hidden">
      {/* Main scrollable content */}
      <div
        className={cn(
          'flex-1 overflow-y-auto transition-all duration-300',
          selectedAsset ? 'mr-[520px]' : ''
        )}
      >
        <div className="p-4 space-y-3">

          {/* Pipeline bar */}
          <PipelineBar gates={gates} />

          {/* Active banner */}
          {activeGatesCount > 0 && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800 rounded">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
              <p className="text-[11px] font-medium text-amber-700 dark:text-amber-300">
                {activeGatesCount} gate{activeGatesCount !== 1 ? 's' : ''} active
                {totalPending > 0
                  ? ` · ${totalPending} asset${totalPending !== 1 ? 's' : ''} awaiting review`
                  : ' · all assets reviewed, ready to approve'}
              </p>
              {!canApprove && (
                <span className="ml-auto text-[10px] text-amber-600/70 dark:text-amber-500/70">
                  View only
                </span>
              )}
            </div>
          )}

          {/* Gate sections */}
          {gates.map((gate) => (
            <GateSection
              key={gate.id}
              gate={gate}
              canApprove={canApprove}
              selectedAssetId={selectedAssetId}
              onSelectAsset={setSelectedAssetId}
            />
          ))}

          {/* AI explainer */}
          <div className="ai-panel rounded p-3 flex items-start gap-2">
            <div className="w-4 h-4 rounded bg-brand-green/20 flex items-center justify-center flex-shrink-0 mt-px">
              <span className="text-brand-green text-[8px] font-medium">AI</span>
            </div>
            <div>
              <p className="text-[12px] font-medium text-brand-green-dark dark:text-green-400">
                Human-in-the-loop gate system
              </p>
              <p className="text-[11px] text-ink-muted dark:text-gray-400 mt-0.5 leading-relaxed">
                Click any asset to open its document, quality scores, and agent summary before making
                a decision. Revision notes are sent directly to the originating agent, which reworks
                the content and resubmits for review. SLA timers escalate overdue gates to the AI
                COE team.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 bottom-0 top-14 bg-black/10 z-30"
            onClick={() => setSelectedAssetId(null)}
          />
        )}
      </AnimatePresence>

      {/* Review panel */}
      <AnimatePresence>
        {selectedAsset && (
          <ReviewPanel
            asset={selectedAsset}
            gate={selectedAssetGate}
            canApprove={canApprove}
            onClose={() => setSelectedAssetId(null)}
            onApprove={handleApprove}
            onRevise={handleRevise}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
