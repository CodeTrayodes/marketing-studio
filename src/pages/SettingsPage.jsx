import { useAppStore, ROLES, ROLE_CONFIG } from '../store/useAppStore';
import { useAgentStore } from '../store/useAgentStore';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { Sun, Moon, CheckCircle2 } from 'lucide-react';

const FADE_UP = {
  hidden: { opacity: 0, y: 8 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] } }),
};

const ROLE_ORDER = [ROLES.MARKETING_HEAD, ROLES.CAMPAIGN_LEAD, ROLES.CONTENT_EDITOR, ROLES.AI_COE];

function SectionHeader({ children }) {
  return <p className="text-[10px] font-semibold text-ink-faint dark:text-gray-500 uppercase tracking-widest mb-3">{children}</p>;
}

function RoleSwitcher() {
  const { role, setRole } = useAppStore();

  return (
    <div className="card p-4 space-y-3">
      <div>
        <p className="text-[11px] font-semibold text-ink dark:text-white">Active Role</p>
        <p className="text-[10px] text-ink-muted dark:text-gray-400 mt-0.5">
          Switching role changes visible data and navigation. No data is modified.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {ROLE_ORDER.map((id, i) => {
          const config = ROLE_CONFIG[id];
          const isActive = role === id;
          return (
            <motion.button
              key={id}
              custom={i}
              variants={FADE_UP}
              initial="hidden"
              animate="show"
              onClick={() => setRole(id)}
              className={cn(
                'flex items-start gap-2.5 p-3 rounded-[8px] border text-left transition-all duration-200',
                isActive
                  ? 'border-brand-green bg-brand-green-light dark:bg-green-900/20'
                  : 'border-border dark:border-dark-border bg-white dark:bg-dark-card hover:border-brand-green/30 hover:bg-surface-muted dark:hover:bg-dark-border'
              )}
            >
              <div className={cn(
                'w-6 h-6 rounded-[5px] flex items-center justify-center flex-shrink-0 text-[9px] font-bold',
                isActive ? 'bg-brand-green text-white' : 'bg-surface-muted dark:bg-dark-border text-ink-muted dark:text-gray-400'
              )}>
                {config.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={cn('text-[11px] font-semibold', isActive ? 'text-brand-green-dark dark:text-green-400' : 'text-ink dark:text-white')}>
                    {config.label}
                  </p>
                  {isActive && <CheckCircle2 size={12} className="text-brand-green flex-shrink-0" />}
                </div>
                <p className="text-[10px] text-ink-muted dark:text-gray-400 mt-0.5 leading-relaxed">{config.description}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {[
                    config.showTelemetry && 'Telemetry',
                    config.showTokenCosts && 'Token costs',
                    config.showAgentInternals && 'Agent internals',
                  ].filter(Boolean).map((cap) => (
                    <span key={cap} className="text-[9px] bg-brand-green/10 text-brand-green-dark dark:text-green-400 px-1.5 py-px rounded">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function ThemeSettings() {
  const { theme, setTheme } = useAppStore();
  const options = [
    { value: 'light', label: 'Light', icon: Sun, desc: 'White backgrounds, full contrast' },
    { value: 'dark', label: 'Dark', icon: Moon, desc: 'Near-black surfaces, reduced eye strain' },
  ];

  return (
    <div className="card p-4 space-y-3">
      <div>
        <p className="text-[11px] font-semibold text-ink dark:text-white">Appearance</p>
        <p className="text-[10px] text-ink-muted dark:text-gray-400 mt-0.5">Choose your preferred colour scheme.</p>
      </div>
      <div className="flex gap-2">
        {options.map(({ value, label, icon: Icon, desc }) => {
          const isActive = theme === value;
          return (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                'flex-1 flex items-center gap-2.5 p-3 rounded-[8px] border text-left transition-all duration-200',
                isActive
                  ? 'border-brand-green bg-brand-green-light dark:bg-green-900/20'
                  : 'border-border dark:border-dark-border bg-white dark:bg-dark-card hover:border-brand-green/30'
              )}
            >
              <Icon size={14} className={isActive ? 'text-brand-green' : 'text-ink-muted dark:text-gray-400'} />
              <div>
                <p className={cn('text-[11px] font-semibold', isActive ? 'text-brand-green-dark dark:text-green-400' : 'text-ink dark:text-white')}>
                  {label}
                </p>
                <p className="text-[10px] text-ink-muted dark:text-gray-400">{desc}</p>
              </div>
              {isActive && <CheckCircle2 size={12} className="text-brand-green ml-auto flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SystemInfo() {
  const agentStates = useAgentStore((s) => s.agentStates);
  const systemHealth = useAgentStore((s) => s.systemHealth);
  const totalAssets = useAgentStore((s) => s.totalAssetsThisSession);
  const runningCount = Object.values(agentStates).filter((s) => s.status === 'running').length;
  const totalTokens = Object.values(agentStates).reduce((sum, s) => sum + (s.tokensUsed || 0), 0);

  const stats = [
    { label: 'System Health', value: `${systemHealth.toFixed(1)}%`, color: 'text-brand-green' },
    { label: 'Agents Running', value: `${runningCount} / 13`, color: 'text-blue-600' },
    { label: 'Assets This Session', value: totalAssets.toLocaleString(), color: 'text-ink dark:text-white' },
    { label: 'Total Tokens Used', value: `${(totalTokens / 1000).toFixed(1)}k`, color: 'text-ink-muted dark:text-gray-400' },
    { label: 'Platform Version', value: '2.4.1', color: 'text-ink-muted dark:text-gray-400' },
    { label: 'Quarter', value: 'Q2 2025', color: 'text-ink-muted dark:text-gray-400' },
  ];

  return (
    <div className="card p-4 space-y-3">
      <p className="text-[11px] font-semibold text-ink dark:text-white">Platform Status</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map(({ label, value, color }) => (
          <div key={label}>
            <p className="text-[9px] text-ink-faint dark:text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
            <p className={cn('text-[11px] font-semibold font-mono-nums', color)}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlatformInfo() {
  const items = [
    { label: 'Research Agent', value: 'claude-opus-4-7' },
    { label: 'Strategy Agent', value: 'claude-sonnet-4-6' },
    { label: 'Blog + SEO Agent', value: 'claude-opus-4-7' },
    { label: 'Social Media Agent', value: 'claude-haiku-4-5' },
    { label: 'Case Studies + Sales', value: 'claude-opus-4-7' },
    { label: 'QA Agent', value: 'claude-sonnet-4-6' },
    { label: 'Distribution Agent', value: 'claude-haiku-4-5' },
    { label: 'Performance Agent', value: 'claude-sonnet-4-6' },
    { label: 'Optimisation Agent', value: 'claude-opus-4-7' },
  ];

  return (
    <div className="card p-4 space-y-3">
      <div>
        <p className="text-[11px] font-semibold text-ink dark:text-white">Model Configuration</p>
        <p className="text-[10px] text-ink-muted dark:text-gray-400 mt-0.5">
          Each agent uses the Claude model best suited to its task complexity and latency requirements.
        </p>
      </div>
      <div className="divide-y divide-border dark:divide-dark-border">
        {items.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between py-1.5">
            <span className="text-[10px] text-ink-muted dark:text-gray-400">{label}</span>
            <span className="text-[10px] font-mono text-ink dark:text-white bg-surface-muted dark:bg-dark-border px-1.5 py-px rounded">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const role = useAppStore((s) => s.role);
  const showInternals = useAppStore((s) => s.canSee('showAgentInternals'));

  return (
    <div className="p-4 space-y-4 max-w-[800px] mx-auto">
      <RoleSwitcher />
      <ThemeSettings />
      <SystemInfo />
      {showInternals && <PlatformInfo />}

      <div className="ai-panel rounded-[10px] p-3 flex items-start gap-2">
        <div className="w-4 h-4 rounded bg-brand-green/20 flex items-center justify-center flex-shrink-0 mt-px">
          <span className="text-brand-green text-[8px] font-bold">AI</span>
        </div>
        <div>
          <p className="text-[11px] font-medium text-brand-green-dark dark:text-green-400">LevelShift Pulse v2.4.1</p>
          <p className="text-[10px] text-ink-muted dark:text-gray-400 mt-0.5 leading-relaxed">
            AI Content Operations Platform. 13 agents · 4 layers · 310 assets per quarter · 5 Business Units.
            Built on Claude Opus 4.7, Sonnet 4.6, and Haiku 4.5. All production data is simulated for demonstration.
          </p>
        </div>
      </div>
    </div>
  );
}
