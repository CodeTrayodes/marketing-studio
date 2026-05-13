import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useGateStore } from '../store/useGateStore';
import { useContentStore } from '../store/useContentStore';
import { useAppStore, ROLES } from '../store/useAppStore';
import { SLATimer, SLAProgressBar } from '../components/ui/SLATimer';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Clock, Lock, AlertTriangle, ChevronDown, ChevronUp,
  ArrowRight, RotateCcw, Flag, X, Check, Users,
} from 'lucide-react';

// ─── Gate Timeline ────────────────────────────────────────────────────────────

function GateTimeline({ gates, activeId }) {
  return (
    <div className="flex items-start">
      {gates.map((gate, i) => {
        const isCompleted = gate.status === 'completed';
        const isActive = gate.status === 'active';
        const isLast = i === gates.length - 1;

        const circleBase = 'w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0 transition-all duration-300 border-2';
        const circleStyle = isCompleted
          ? 'bg-brand-green border-brand-green text-white'
          : isActive
          ? 'bg-amber-400 border-amber-400 text-white shadow-md shadow-amber-200 dark:shadow-amber-900/40'
          : 'bg-white dark:bg-dark-card border-border dark:border-dark-border text-ink-faint dark:text-gray-500';

        return (
          <div key={gate.id} className="flex items-start flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={cn(circleBase, circleStyle, isActive && 'scale-110')}>
                {isCompleted ? <CheckCircle2 size={14} /> : gate.number}
              </div>
              <p className={cn(
                'text-[10px] font-medium mt-1.5 whitespace-nowrap',
                isActive ? 'text-amber-600 dark:text-amber-400' : isCompleted ? 'text-brand-green' : 'text-ink-faint dark:text-gray-500'
              )}>
                {gate.name}
              </p>
              <p className="text-[8px] text-ink-faint dark:text-gray-600 whitespace-nowrap mt-0.5 text-center max-w-[90px]">
                {gate.approvers.map(a => a.name.split(' ')[0]).join(', ')}
              </p>
              <div className="mt-1">
                {isCompleted && <span className="text-[8px] text-brand-green font-medium">Approved ✓</span>}
                {isActive && (
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[8px] text-amber-500 font-medium">In Review</span>
                  </div>
                )}
                {gate.status === 'pending' && (
                  <div className="flex items-center gap-0.5">
                    <Lock size={8} className="text-gray-400" />
                    <span className="text-[8px] text-gray-400">Locked</span>
                  </div>
                )}
              </div>
            </div>
            {!isLast && (
              <div className="flex-1 mt-4 mx-2 relative h-px">
                <div className="absolute inset-0 bg-border dark:bg-dark-border rounded-full" />
                {isCompleted && <div className="absolute inset-0 bg-brand-green rounded-full" />}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Revision Modal ───────────────────────────────────────────────────────────

function RevisionModal({ asset, open, onClose, onSubmit }) {
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (!note.trim()) return;
    onSubmit(asset?.id, note.trim());
    setNote('');
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded shadow-xl z-50 w-[440px] max-w-[90vw] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-[13px] font-medium text-ink dark:text-white">
              Request Revision
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-ink-faint dark:text-gray-500 hover:text-ink dark:hover:text-white">
                <X size={13} />
              </button>
            </Dialog.Close>
          </div>

          {asset && (
            <div className="pb-3 border-b border-border dark:border-dark-border">
              <p className="text-[10px] font-medium text-ink-faint dark:text-gray-500 uppercase tracking-[0.08em] mb-0.5">Asset</p>
              <p className="text-[11px] text-ink-muted dark:text-gray-400 truncate">{asset.title}</p>
            </div>
          )}

          <div>
            <label className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500 block mb-1.5">
              Revision note for the agent
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={4}
              placeholder="Describe the changes needed — the agent will receive this as a revision brief and regenerate the content accordingly..."
              className="w-full text-[11px] bg-surface-muted dark:bg-dark-border border border-border dark:border-dark-border rounded px-2.5 py-2 text-ink dark:text-white placeholder:text-ink-faint dark:placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-green resize-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSubmit}
              disabled={!note.trim()}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-brand-green text-white rounded text-[11px] font-medium hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw size={10} />
              Send to Agent
            </button>
            <Dialog.Close asChild>
              <button className="btn-secondary px-4 text-[10px]">Cancel</button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── Asset Review Queue ───────────────────────────────────────────────────────

function AssetReviewQueue({ gate, canApprove }) {
  const assets = useContentStore(s => s.assets);
  const approveAsset = useContentStore(s => s.approveAsset);
  const reviseAsset = useContentStore(s => s.reviseAsset);
  const approveGateItem = useGateStore(s => s.approveGateItem);

  const [revisionTarget, setRevisionTarget] = useState(null);
  const [flagged, setFlagged] = useState(new Set());

  const gateAssets = assets.filter(a => a.status === `${gate.id}-pending`);

  const handleApprove = (asset) => {
    approveAsset(asset.id);
    approveGateItem(gate.id);
  };

  const handleReviseSubmit = (id, note) => {
    reviseAsset(id, note);
  };

  if (gateAssets.length === 0) {
    return (
      <p className="text-[10px] text-ink-muted dark:text-gray-400 py-4 text-center">
        All assets at this gate have been reviewed.
      </p>
    );
  }

  const shown = gateAssets.slice(0, 12);

  return (
    <>
      <div className="overflow-x-auto -mx-4">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-surface-muted dark:bg-dark-border">
              {['Title', 'Type', 'Quality', 'Awaiting', 'Actions'].map(h => (
                <th key={h} className="text-left px-3 py-1.5 text-[10px] font-medium text-ink-faint dark:text-gray-500 uppercase tracking-[0.08em] whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-dark-border">
            {shown.map((asset, i) => {
              const reviewer = gate.approvers[i % gate.approvers.length];
              const isFlagged = flagged.has(asset.id);
              const q = asset.qualityScores?.overall;
              const qCls = q >= 85
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';

              return (
                <tr key={asset.id} className={cn('transition-colors', isFlagged && 'bg-amber-50/60 dark:bg-amber-900/10')}>
                  <td className="px-3 py-2">
                    <p className="text-[11px] font-medium text-ink dark:text-white max-w-[240px] truncate">{asset.title}</p>
                  </td>
                  <td className="px-3 py-2 text-[10px] text-ink-muted dark:text-gray-400 whitespace-nowrap">{asset.typeName}</td>
                  <td className="px-3 py-2">
                    {q != null
                      ? <span className={cn('text-[10px] font-mono font-medium px-1.5 py-px rounded', qCls)}>{q}</span>
                      : <span className="text-ink-faint text-[10px]">—</span>
                    }
                  </td>
                  <td className="px-3 py-2 text-[10px] text-ink-muted dark:text-gray-400 whitespace-nowrap">
                    {reviewer?.name}
                  </td>
                  <td className="px-3 py-2">
                    {canApprove ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleApprove(asset)}
                          className="flex items-center gap-0.5 px-1.5 py-0.5 bg-brand-green text-white rounded text-[10px] font-medium hover:bg-green-700 transition-colors"
                        >
                          <Check size={9} />
                          Approve
                        </button>
                        <button
                          onClick={() => setRevisionTarget(asset)}
                          className="flex items-center gap-0.5 px-1.5 py-0.5 bg-surface-muted dark:bg-dark-border border border-border dark:border-dark-border rounded text-[10px] text-ink-muted dark:text-gray-400 hover:bg-border transition-colors"
                        >
                          <RotateCcw size={9} />
                          Revise
                        </button>
                        <button
                          onClick={() => setFlagged(prev => { const n = new Set(prev); n.add(asset.id); return n; })}
                          className={cn('p-0.5 rounded transition-colors', isFlagged ? 'text-amber-500' : 'text-ink-faint dark:text-gray-500 hover:text-amber-500')}
                        >
                          <Flag size={10} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[9px] text-ink-faint dark:text-gray-500">View only</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {gateAssets.length > 12 && (
          <p className="text-[9px] text-ink-faint dark:text-gray-500 px-3 py-2">
            +{gateAssets.length - 12} more assets pending review
          </p>
        )}
      </div>

      <RevisionModal
        asset={revisionTarget}
        open={!!revisionTarget}
        onClose={() => setRevisionTarget(null)}
        onSubmit={handleReviseSubmit}
      />
    </>
  );
}

// ─── Gate Card ────────────────────────────────────────────────────────────────

function GateCard({ gate, canApprove }) {
  const [expanded, setExpanded] = useState(gate.status === 'active');
  const [gateApproved, setGateApproved] = useState(false);
  const approveAllInGate = useGateStore(s => s.approveAllInGate);

  const pct = gate.itemsCount > 0 ? (gate.itemsApproved / gate.itemsCount) * 100 : 0;
  const allReviewed = gate.itemsApproved >= gate.itemsCount;

  const borderColor = gate.status === 'active' ? 'border-amber-300 dark:border-amber-800'
    : gate.status === 'completed' ? 'border-green-200 dark:border-green-800'
    : 'border-border dark:border-dark-border';

  const leftBorder = gate.status === 'active' ? '#F59E0B'
    : gate.status === 'completed' ? '#16A34A'
    : '#E5E7EB';

  const handleApproveGate = () => {
    approveAllInGate(gate.id);
    setGateApproved(true);
    setTimeout(() => setGateApproved(false), 4000);
  };

  return (
    <div className={cn(
      'rounded border bg-white dark:bg-dark-card overflow-hidden transition-all duration-200',
      borderColor,
      gate.status === 'active' && 'shadow-card'
    )}
      style={{ borderLeft: `3px solid ${leftBorder}` }}
    >
      {/* Header (always visible) */}
      <div
        className="px-4 py-3 cursor-pointer"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                'text-[10px] font-medium px-1.5 py-px rounded',
                gate.status === 'active' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                : gate.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-brand-green dark:text-green-400'
                : 'bg-surface-muted dark:bg-dark-border text-ink-faint dark:text-gray-500'
              )}>
                Gate {gate.number}
              </span>
              <h3 className="text-[12px] font-medium text-ink dark:text-white">{gate.name}</h3>
              {gate.status === 'pending' && <Lock size={11} className="text-gray-400 flex-shrink-0" />}
            </div>
            <p className="text-[10px] text-ink-muted dark:text-gray-400 leading-relaxed max-w-2xl">{gate.description}</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {gate.status === 'active' && <SLATimer deadline={gate.slaDeadline} slaHours={gate.slaHours} />}
            {gate.status === 'completed' && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-brand-green">
                <CheckCircle2 size={12} /> Approved
              </span>
            )}
            {expanded ? <ChevronUp size={13} className="text-ink-muted dark:text-gray-400" /> : <ChevronDown size={13} className="text-ink-muted dark:text-gray-400" />}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-ink-muted dark:text-gray-400">
              <span className="font-mono-nums font-medium text-ink dark:text-white">{gate.itemsApproved}</span> of {gate.itemsCount} approved
            </span>
            <span className="text-[10px] font-mono-nums text-ink-muted dark:text-gray-400">{Math.round(pct)}%</span>
          </div>
          <div className="w-full h-px bg-border dark:bg-dark-border rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-700',
                gate.status === 'completed' ? 'bg-brand-green' : gate.status === 'active' ? 'bg-amber-400' : 'bg-blue-400'
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          {gate.status === 'active' && <SLAProgressBar deadline={gate.slaDeadline} slaHours={gate.slaHours} className="mt-1" />}
        </div>
      </div>

      {/* Expanded body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border dark:border-dark-border">

              {/* Locked state */}
              {gate.status === 'pending' && (
                <div className="px-4 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-muted dark:bg-dark-border flex items-center justify-center flex-shrink-0">
                    <Lock size={14} className="text-gray-400" />
                  </div>
                  <p className="text-[10px] text-ink-muted dark:text-gray-400">
                    This gate unlocks after <strong>Gate {gate.number - 1}</strong> is approved.
                    All items must pass through the previous gate before this one activates.
                  </p>
                </div>
              )}

              {/* Completed gate summary */}
              {gate.status === 'completed' && (
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-brand-green">
                    <CheckCircle2 size={14} />
                    <span className="text-[11px] font-medium text-brand-green">All {gate.itemsCount} items approved</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {gate.approvers.map(a => (
                      <div key={a.name} className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-brand-green/15 border border-brand-green/30 flex items-center justify-center">
                          <span className="text-[8px] font-medium text-brand-green">{a.avatar}</span>
                        </div>
                        <span className="text-[9px] text-ink-muted dark:text-gray-400">{a.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active gate: reviewers + queue + actions */}
              {gate.status === 'active' && (
                <div className="px-4 py-3 space-y-4">
                  {/* Reviewers row */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 mr-2">
                      <Users size={12} className="text-ink-faint dark:text-gray-500" />
                      <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500">Reviewers</span>
                    </div>
                    {gate.approvers.map(a => (
                      <div key={a.name} className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-surface-muted dark:bg-dark-border border border-border dark:border-dark-border flex items-center justify-center flex-shrink-0">
                          <span className="text-[8px] font-medium text-ink-muted dark:text-gray-400">{a.avatar}</span>
                        </div>
                        <div>
                          <p className="text-[9px] font-medium text-ink dark:text-white leading-none">{a.name}</p>
                          <p className="text-[8px] text-ink-faint dark:text-gray-500">{a.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Asset review queue */}
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500 mb-2">Asset Review Queue</p>
                    <AssetReviewQueue gate={gate} canApprove={canApprove} />
                  </div>

                  {/* Success banner */}
                  <AnimatePresence>
                    {gateApproved && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 px-3 py-2 bg-brand-green-light dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded"
                      >
                        <CheckCircle2 size={13} className="text-brand-green flex-shrink-0" />
                        <p className="text-[11px] font-medium text-brand-green-dark dark:text-green-400">
                          Gate {gate.number} Approved — {gate.number < 4 ? `Gate ${gate.number + 1} unlocked` : 'Distribution Agent activated'}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Approve Gate button */}
                  {canApprove && gate.status !== 'completed' && (
                    <div className="space-y-2 pt-1 border-t border-border dark:border-dark-border">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleApproveGate}
                          disabled={!allReviewed}
                          className={cn(
                            'flex-1 flex items-center justify-center gap-2 py-2 rounded text-[11px] font-medium transition-all',
                            allReviewed
                              ? 'bg-brand-green text-white hover:bg-green-700'
                              : 'bg-surface-muted dark:bg-dark-border text-ink-faint dark:text-gray-500 cursor-not-allowed'
                          )}
                        >
                          <CheckCircle2 size={12} />
                          Approve Gate {gate.number} — Unlock {gate.number < 4 ? `Layer ${gate.number + 1}` : 'Distribution'}
                        </button>
                      </div>
                      {!allReviewed && (
                        <p className="text-[9px] text-ink-faint dark:text-gray-500 text-center">
                          Review all {gate.itemsCount - gate.itemsApproved} remaining assets before approving the gate
                        </p>
                      )}
                    </div>
                  )}

                  {/* Triggers info */}
                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border dark:border-dark-border">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500 mb-0.5">On Approve</p>
                      <p className="text-[10px] text-brand-green leading-relaxed">{gate.onApprove}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint dark:text-gray-500 mb-0.5">On Reject</p>
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 leading-relaxed">{gate.onReject}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function GateManager() {
  const gates = useGateStore(s => s.gates);
  const role = useAppStore(s => s.role);
  const canApprove = [ROLES.CAMPAIGN_LEAD, ROLES.AI_COE, ROLES.CONTENT_EDITOR].includes(role);
  const activeGates = gates.filter(g => g.status === 'active');

  return (
    <div className="p-4 space-y-4 max-w-[1100px] mx-auto">

      {/* Gate timeline card */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-medium text-ink dark:text-white uppercase tracking-[0.08em]">Pipeline Flow</p>
          {activeGates.length > 0 && (
            <span className="badge bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
              {activeGates.length} gate{activeGates.length > 1 ? 's' : ''} awaiting action
            </span>
          )}
        </div>
        <GateTimeline gates={gates} />
      </div>

      {/* Gate cards */}
      <div className="space-y-3">
        {gates.map(gate => (
          <GateCard key={gate.id} gate={gate} canApprove={canApprove} />
        ))}
      </div>

      {/* AI explainer */}
      <div className="ai-panel rounded p-3 flex items-start gap-2">
        <div className="w-4 h-4 rounded bg-brand-green/20 flex items-center justify-center flex-shrink-0 mt-px">
          <span className="text-brand-green text-[8px] font-medium">AI</span>
        </div>
        <div>
          <p className="text-[12px] font-medium text-brand-green-dark dark:text-green-400">How gate approvals work</p>
          <p className="text-[11px] text-ink-muted dark:text-gray-400 mt-0.5 leading-relaxed max-w-3xl">
            Each gate requires explicit human sign-off before the pipeline advances. Approving an individual asset marks it ready;
            approving the gate as a whole unlocks the next layer. Rejected assets return to the originating agent with your revision notes.
            SLA timers run in real time — overdue gates escalate to the AI COE team.
          </p>
        </div>
      </div>
    </div>
  );
}
