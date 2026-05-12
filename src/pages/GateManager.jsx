import { useState } from 'react';
import { useGateStore } from '../store/useGateStore';
import { useAppStore, ROLES } from '../store/useAppStore';
import { SLATimer, SLAProgressBar } from '../components/ui/SLATimer';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Clock, AlertTriangle, ChevronDown, ChevronUp,
  Users, ArrowRight, Zap, Shield, Info,
} from 'lucide-react';

const GATE_STATUS_STYLES = {
  active: {
    border: 'border-amber-200 dark:border-amber-800',
    header: 'bg-amber-50 dark:bg-amber-900/20',
    badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    ring: 'ring-amber-200 dark:ring-amber-800',
  },
  pending: {
    border: 'border-blue-200 dark:border-blue-800',
    header: 'bg-blue-50 dark:bg-blue-900/20',
    badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    icon: Clock,
    iconColor: 'text-blue-500',
    ring: 'ring-blue-200 dark:ring-blue-800',
  },
  completed: {
    border: 'border-green-200 dark:border-green-800',
    header: 'bg-brand-green-light dark:bg-green-900/20',
    badge: 'bg-green-100 dark:bg-green-900/30 text-brand-green dark:text-green-400',
    icon: CheckCircle2,
    iconColor: 'text-brand-green',
    ring: 'ring-green-200 dark:ring-green-800',
  },
  blocked: {
    border: 'border-red-200 dark:border-red-800',
    header: 'bg-red-50 dark:bg-red-900/20',
    badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    ring: 'ring-red-200 dark:ring-red-800',
  },
};

function ApproverAvatar({ approver }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-full bg-surface-muted dark:bg-dark-border border border-border dark:border-dark-border flex items-center justify-center flex-shrink-0">
        <span className="text-[9px] font-bold text-ink-muted dark:text-gray-400">{approver.avatar}</span>
      </div>
      <div>
        <p className="text-xs font-medium text-ink dark:text-white leading-tight">{approver.name}</p>
        <p className="text-[10px] text-ink-faint dark:text-gray-500">{approver.role}</p>
      </div>
    </div>
  );
}

function GateCard({ gate, canApprove }) {
  const [expanded, setExpanded] = useState(gate.status === 'active');
  const [confirming, setConfirming] = useState(false);
  const { approveGateItem, approveAllInGate } = useGateStore();
  const styles = GATE_STATUS_STYLES[gate.status] || GATE_STATUS_STYLES.pending;
  const StatusIcon = styles.icon;
  const pct = gate.itemsCount > 0 ? (gate.itemsApproved / gate.itemsCount) * 100 : 0;
  const remaining = gate.itemsCount - gate.itemsApproved;

  const handleApproveAll = () => {
    if (!confirming) { setConfirming(true); return; }
    approveAllInGate(gate.id);
    setConfirming(false);
  };

  return (
    <div className={cn(
      'rounded-card border-2 bg-white dark:bg-dark-card overflow-hidden transition-all duration-200',
      styles.border,
      gate.status === 'active' && 'shadow-card-hover'
    )}>
      {/* Header */}
      <div
        className={cn('px-5 py-4 cursor-pointer', styles.header)}
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <StatusIcon size={18} className={styles.iconColor} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className={cn('badge text-[10px] font-semibold', styles.badge)}>
                  Gate {gate.number}
                </span>
                <h3 className="text-sm font-semibold text-ink dark:text-white">{gate.name}</h3>
              </div>
              <p className="text-xs text-ink-muted dark:text-gray-400 leading-relaxed max-w-xl">
                {gate.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            {gate.status === 'active' && (
              <SLATimer deadline={gate.slaDeadline} slaHours={gate.slaHours} />
            )}
            {expanded ? <ChevronUp size={16} className="text-ink-muted dark:text-gray-400" /> : <ChevronDown size={16} className="text-ink-muted dark:text-gray-400" />}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-nums font-semibold text-ink dark:text-white">
                {gate.itemsApproved}
              </span>
              <span className="text-xs text-ink-muted dark:text-gray-400">of {gate.itemsCount} items approved</span>
            </div>
            <span className="text-xs font-mono-nums text-ink-muted dark:text-gray-400">{Math.round(pct)}%</span>
          </div>
          <div className="w-full h-2 bg-white/60 dark:bg-dark-card/60 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                gate.status === 'completed' ? 'bg-brand-green' :
                gate.status === 'active' ? 'bg-amber-400' : 'bg-blue-400'
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          {gate.status === 'active' && (
            <SLAProgressBar deadline={gate.slaDeadline} slaHours={gate.slaHours} className="mt-1" />
          )}
        </div>
      </div>

      {/* Expanded body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 py-4 border-t border-border dark:border-dark-border space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Approvers */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint dark:text-gray-500 mb-3 flex items-center gap-1.5">
                    <Users size={11} /> Approvers
                  </p>
                  <div className="space-y-2.5">
                    {gate.approvers.map((a) => (
                      <ApproverAvatar key={a.name} approver={a} />
                    ))}
                  </div>
                </div>

                {/* Triggers & outcomes */}
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint dark:text-gray-500 mb-1.5">Triggered by</p>
                    <p className="text-xs text-ink-muted dark:text-gray-400 leading-relaxed">{gate.triggers}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint dark:text-gray-500 mb-1.5">On approve</p>
                    <p className="text-xs text-brand-green leading-relaxed">{gate.onApprove}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint dark:text-gray-500 mb-1.5">On reject</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">{gate.onReject}</p>
                  </div>
                </div>

                {/* SLA + actions */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint dark:text-gray-500 mb-3 flex items-center gap-1.5">
                    <Clock size={11} /> SLA Window
                  </p>
                  <p className="text-2xl font-mono-nums font-semibold text-ink dark:text-white">{gate.slaHours}h</p>
                  <p className="text-xs text-ink-muted dark:text-gray-400 mt-0.5 mb-4">Maximum approval window</p>

                  {canApprove && gate.status !== 'completed' && (
                    <div className="space-y-2">
                      <button
                        onClick={() => approveGateItem(gate.id)}
                        disabled={gate.itemsApproved >= gate.itemsCount}
                        className="btn-primary w-full text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Approve Next Item
                      </button>
                      <button
                        onClick={handleApproveAll}
                        disabled={gate.status === 'completed'}
                        className={cn(
                          'w-full px-4 py-2 rounded-btn text-xs font-medium transition-colors border',
                          confirming
                            ? 'bg-brand-green text-white border-brand-green'
                            : 'bg-white dark:bg-dark-card text-ink dark:text-white border-border dark:border-dark-border hover:bg-surface-muted dark:hover:bg-dark-border'
                        )}
                      >
                        {confirming ? 'Confirm: Approve All' : `Approve All ${remaining > 0 ? `(${remaining} remaining)` : ''}`}
                      </button>
                      {confirming && (
                        <button
                          onClick={() => setConfirming(false)}
                          className="w-full text-xs text-ink-muted dark:text-gray-400 hover:text-ink dark:hover:text-white"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  )}

                  {gate.status === 'completed' && (
                    <div className="flex items-center gap-2 text-brand-green text-sm font-medium mt-1">
                      <CheckCircle2 size={16} />
                      All items approved
                    </div>
                  )}

                  {gate.status === 'pending' && !canApprove && (
                    <div className="text-xs text-ink-faint dark:text-gray-500 flex items-start gap-1.5">
                      <Info size={12} className="flex-shrink-0 mt-0.5" />
                      This gate will activate once upstream items are approved.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GateFlowDiagram({ gates }) {
  const statusDot = {
    active: 'bg-amber-400 animate-pulse',
    pending: 'bg-blue-300',
    completed: 'bg-brand-green',
    blocked: 'bg-red-400',
  };

  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-2">
      {gates.map((gate, i) => (
        <div key={gate.id} className="flex items-center flex-shrink-0">
          <div className={cn(
            'flex flex-col items-center px-4 py-2 rounded-card border',
            gate.status === 'active' ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20' :
            gate.status === 'completed' ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' :
            'border-border dark:border-dark-border bg-white dark:bg-dark-card'
          )}>
            <span className={cn('w-2.5 h-2.5 rounded-full mb-1', statusDot[gate.status])} />
            <span className="text-[10px] font-semibold text-ink dark:text-white whitespace-nowrap">Gate {gate.number}</span>
            <span className="text-[9px] text-ink-faint dark:text-gray-500 whitespace-nowrap max-w-[80px] text-center leading-tight">
              {gate.name}
            </span>
            {gate.status === 'active' && (
              <SLATimer deadline={gate.slaDeadline} slaHours={gate.slaHours} compact className="mt-1" />
            )}
          </div>
          {i < gates.length - 1 && (
            <ArrowRight size={14} className="mx-1 text-ink-faint dark:text-gray-600 flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}

export default function GateManager() {
  const gates = useGateStore((s) => s.gates);
  const role = useAppStore((s) => s.role);

  const canApprove = [ROLES.CAMPAIGN_LEAD, ROLES.AI_COE, ROLES.CONTENT_EDITOR].includes(role);
  const activeGates = gates.filter((g) => g.status === 'active');

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      {/* Flow diagram */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-ink dark:text-white uppercase tracking-wider">Pipeline Flow</h3>
          {activeGates.length > 0 && (
            <span className="badge bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px]">
              {activeGates.length} gate{activeGates.length > 1 ? 's' : ''} awaiting action
            </span>
          )}
        </div>
        <GateFlowDiagram gates={gates} />
      </div>

      {/* Gate cards */}
      <div className="space-y-4">
        {gates.map((gate) => (
          <GateCard
            key={gate.id}
            gate={gate}
            canApprove={canApprove}
          />
        ))}
      </div>

      {/* Explainer */}
      <div className="ai-panel rounded-card p-4 flex items-start gap-3">
        <Shield size={16} className="text-brand-green flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-brand-green-dark dark:text-green-400">How gate approvals work</p>
          <p className="text-xs text-ink-muted dark:text-gray-400 mt-1 leading-relaxed max-w-3xl">
            Each gate requires explicit human sign-off before the pipeline advances. Approving a gate triggers the next
            layer of agents automatically — no manual handoff required. Rejecting an item returns it to the originating
            agent with your annotations attached. SLA timers count down in real time; overdue gates escalate to the AI COE team.
          </p>
        </div>
      </div>
    </div>
  );
}
