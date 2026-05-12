import { useState } from 'react';
import { useGateStore } from '../store/useGateStore';
import { useAppStore, ROLES } from '../store/useAppStore';
import { SLATimer, SLAProgressBar } from '../components/ui/SLATimer';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, AlertTriangle, ChevronDown, ChevronUp, ArrowRight, Info } from 'lucide-react';

const GATE_STATUS_STYLES = {
  active: {
    border: 'border-amber-200 dark:border-amber-800',
    header: 'bg-amber-50 dark:bg-amber-900/20',
    badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
  },
  pending: {
    border: 'border-blue-200 dark:border-blue-800',
    header: 'bg-blue-50 dark:bg-blue-900/20',
    badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    icon: Clock,
    iconColor: 'text-blue-400',
  },
  completed: {
    border: 'border-green-200 dark:border-green-800',
    header: 'bg-brand-green-light dark:bg-green-900/20',
    badge: 'bg-green-100 dark:bg-green-900/30 text-brand-green dark:text-green-400',
    icon: CheckCircle2,
    iconColor: 'text-brand-green',
  },
  blocked: {
    border: 'border-red-200 dark:border-red-800',
    header: 'bg-red-50 dark:bg-red-900/20',
    badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
  },
};

function ApproverAvatar({ approver }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-surface-muted dark:bg-dark-border border border-border dark:border-dark-border flex items-center justify-center flex-shrink-0">
        <span className="text-[8px] font-bold text-ink-muted dark:text-gray-400">{approver.avatar}</span>
      </div>
      <div>
        <p className="text-[10px] font-medium text-ink dark:text-white leading-tight">{approver.name}</p>
        <p className="text-[9px] text-ink-faint dark:text-gray-500">{approver.role}</p>
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
      'rounded-[10px] border bg-white dark:bg-dark-card overflow-hidden transition-all duration-200',
      styles.border,
      gate.status === 'active' && 'shadow-card'
    )}>
      {/* Header */}
      <div
        className={cn('px-4 py-3 cursor-pointer', styles.header)}
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <StatusIcon size={14} className={cn(styles.iconColor, 'mt-px flex-shrink-0')} />
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className={cn('badge font-semibold', styles.badge)}>Gate {gate.number}</span>
                <h3 className="text-[11px] font-semibold text-ink dark:text-white">{gate.name}</h3>
              </div>
              <p className="text-[10px] text-ink-muted dark:text-gray-400 leading-relaxed max-w-xl">{gate.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {gate.status === 'active' && <SLATimer deadline={gate.slaDeadline} slaHours={gate.slaHours} />}
            {expanded ? <ChevronUp size={13} className="text-ink-muted dark:text-gray-400" /> : <ChevronDown size={13} className="text-ink-muted dark:text-gray-400" />}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-ink-muted dark:text-gray-400">
              <span className="font-mono-nums font-semibold text-ink dark:text-white">{gate.itemsApproved}</span> of {gate.itemsCount} approved
            </span>
            <span className="text-[10px] font-mono-nums text-ink-muted dark:text-gray-400">{Math.round(pct)}%</span>
          </div>
          <div className="w-full h-1 bg-white/60 dark:bg-dark-card/60 rounded-full overflow-hidden">
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
            <div className="px-4 py-3 border-t border-border dark:border-dark-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Approvers */}
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-faint dark:text-gray-500 mb-2">Approvers</p>
                  <div className="space-y-2">
                    {gate.approvers.map((a) => <ApproverAvatar key={a.name} approver={a} />)}
                  </div>
                </div>

                {/* Triggers & outcomes */}
                <div className="space-y-2.5">
                  {[
                    { label: 'Triggered by', text: gate.triggers, color: 'text-ink-muted dark:text-gray-400' },
                    { label: 'On approve', text: gate.onApprove, color: 'text-brand-green' },
                    { label: 'On reject', text: gate.onReject, color: 'text-amber-600 dark:text-amber-400' },
                  ].map(({ label, text, color }) => (
                    <div key={label}>
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-faint dark:text-gray-500 mb-0.5">{label}</p>
                      <p className={cn('text-[10px] leading-relaxed', color)}>{text}</p>
                    </div>
                  ))}
                </div>

                {/* SLA + actions */}
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-faint dark:text-gray-500 mb-2">SLA Window</p>
                  <p className="text-xl font-mono-nums font-semibold text-ink dark:text-white leading-none">{gate.slaHours}h</p>
                  <p className="text-[9px] text-ink-muted dark:text-gray-400 mt-0.5 mb-3">Maximum approval window</p>

                  {canApprove && gate.status !== 'completed' && (
                    <div className="space-y-1.5">
                      <button
                        onClick={() => approveGateItem(gate.id)}
                        disabled={gate.itemsApproved >= gate.itemsCount}
                        className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Approve Next Item
                      </button>
                      <button
                        onClick={handleApproveAll}
                        disabled={gate.status === 'completed'}
                        className={cn(
                          'w-full px-3 py-1.5 rounded-btn text-xs font-medium transition-colors border',
                          confirming
                            ? 'bg-brand-green text-white border-brand-green'
                            : 'bg-white dark:bg-dark-card text-ink dark:text-white border-border dark:border-dark-border hover:bg-surface-muted dark:hover:bg-dark-border'
                        )}
                      >
                        {confirming ? 'Confirm: Approve All' : `Approve All${remaining > 0 ? ` (${remaining})` : ''}`}
                      </button>
                      {confirming && (
                        <button onClick={() => setConfirming(false)} className="w-full text-[10px] text-ink-muted dark:text-gray-400 hover:text-ink dark:hover:text-white">
                          Cancel
                        </button>
                      )}
                    </div>
                  )}

                  {gate.status === 'completed' && (
                    <div className="flex items-center gap-1.5 text-brand-green text-[11px] font-medium">
                      <CheckCircle2 size={13} /> All items approved
                    </div>
                  )}

                  {gate.status === 'pending' && !canApprove && (
                    <div className="text-[10px] text-ink-faint dark:text-gray-500 flex items-start gap-1">
                      <Info size={11} className="flex-shrink-0 mt-px" />
                      Activates once upstream items are approved.
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
    <div className="flex items-center gap-0 overflow-x-auto">
      {gates.map((gate, i) => (
        <div key={gate.id} className="flex items-center flex-shrink-0">
          <div className={cn(
            'flex flex-col items-center px-3 py-2 rounded-[8px] border',
            gate.status === 'active' ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20' :
            gate.status === 'completed' ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' :
            'border-border dark:border-dark-border bg-white dark:bg-dark-card'
          )}>
            <span className={cn('w-1.5 h-1.5 rounded-full mb-0.5', statusDot[gate.status])} />
            <span className="text-[9px] font-semibold text-ink dark:text-white whitespace-nowrap">Gate {gate.number}</span>
            <span className="text-[9px] text-ink-faint dark:text-gray-500 whitespace-nowrap max-w-[72px] text-center leading-tight">{gate.name}</span>
            {gate.status === 'active' && (
              <SLATimer deadline={gate.slaDeadline} slaHours={gate.slaHours} compact className="mt-0.5" />
            )}
          </div>
          {i < gates.length - 1 && (
            <ArrowRight size={11} className="mx-1 text-ink-faint dark:text-gray-600 flex-shrink-0" />
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
    <div className="p-4 space-y-4 max-w-[1100px] mx-auto">

      <div className="card p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold text-ink dark:text-white uppercase tracking-wider">Pipeline Flow</p>
          {activeGates.length > 0 && (
            <span className="badge bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
              {activeGates.length} gate{activeGates.length > 1 ? 's' : ''} awaiting action
            </span>
          )}
        </div>
        <GateFlowDiagram gates={gates} />
      </div>

      <div className="space-y-3">
        {gates.map((gate) => (
          <GateCard key={gate.id} gate={gate} canApprove={canApprove} />
        ))}
      </div>

      <div className="ai-panel rounded-[10px] p-3 flex items-start gap-2">
        <div className="w-4 h-4 rounded bg-brand-green/20 flex items-center justify-center flex-shrink-0 mt-px">
          <span className="text-brand-green text-[8px] font-bold">AI</span>
        </div>
        <div>
          <p className="text-[11px] font-medium text-brand-green-dark dark:text-green-400">How gate approvals work</p>
          <p className="text-[10px] text-ink-muted dark:text-gray-400 mt-0.5 leading-relaxed max-w-3xl">
            Each gate requires explicit human sign-off before the pipeline advances. Approving triggers the next layer automatically.
            Rejecting returns the item to the originating agent with your annotations. SLA timers count in real time; overdue gates escalate to the AI COE team.
          </p>
        </div>
      </div>
    </div>
  );
}
