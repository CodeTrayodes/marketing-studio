import { useAppStore, ROLES, ROLE_CONFIG } from '../store/useAppStore';
import { useAgentStore } from '../store/useAgentStore';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, Zap, Shield, User, LayoutDashboard, CheckCircle2 } from 'lucide-react';

const FADE_UP = {
  hidden: { opacity: 0, y: 10 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] } }),
};

const ROLE_ORDER = [ROLES.MARKETING_HEAD, ROLES.CAMPAIGN_LEAD, ROLES.CONTENT_EDITOR, ROLES.AI_COE];

const ROLE_ICONS = {
  [ROLES.MARKETING_HEAD]: LayoutDashboard,
  [ROLES.CAMPAIGN_LEAD]: User,
  [ROLES.CONTENT_EDITOR]: Shield,
  [ROLES.AI_COE]: Zap,
};

function RoleSwitcher() {
  const { role, setRole } = useAppStore();

  return (
    <div className="card p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-ink dark:text-white">Active Role</h3>
        <p className="text-xs text-ink-muted dark:text-gray-400 mt-0.5">
          Switching your role changes what data and navigation is visible. No data is modified.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ROLE_ORDER.map((id, i) => {
          const config = ROLE_CONFIG[id];
          const isActive = role === id;
          const Icon = ROLE_ICONS[id];
          return (
            <motion.button
              key={id}
              custom={i}
              variants={FADE_UP}
              initial="hidden"
              animate="show"
              onClick={() => setRole(id)}
              className={cn(
                'flex items-start gap-3 p-4 rounded-card border-2 text-left transition-all duration-200',
                isActive
                  ? 'border-brand-green bg-brand-green-light dark:bg-green-900/20'
                  : 'border-border dark:border-dark-border bg-white dark:bg-dark-card hover:border-brand-green/40 hover:bg-surface-muted dark:hover:bg-dark-border'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-btn flex items-center justify-center flex-shrink-0',
                isActive ? 'bg-brand-green text-white' : 'bg-surface-muted dark:bg-dark-border text-ink-muted dark:text-gray-400'
              )}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={cn('text-sm font-semibold', isActive ? 'text-brand-green-dark dark:text-green-400' : 'text-ink dark:text-white')}>
                    {config.label}
                  </p>
                  {isActive && <CheckCircle2 size={14} className="text-brand-green flex-shrink-0" />}
                </div>
                <p className="text-xs text-ink-muted dark:text-gray-400 mt-0.5 leading-relaxed">{config.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {[
                    config.showTelemetry && 'Telemetry',
                    config.showTokenCosts && 'Token costs',
                    config.showAgentInternals && 'Agent internals',
                  ].filter(Boolean).map((cap) => (
                    <span key={cap} className="text-[10px] bg-brand-green/10 text-brand-green-dark dark:text-green-400 px-1.5 py-0.5 rounded">
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
    <div className="card p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-ink dark:text-white">Appearance</h3>
        <p className="text-xs text-ink-muted dark:text-gray-400 mt-0.5">Choose your preferred colour scheme.</p>
      </div>
      <div className="flex gap-3">
        {options.map(({ value, label, icon: Icon, desc }) => {
          const isActive = theme === value;
          return (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                'flex-1 flex items-center gap-3 p-4 rounded-card border-2 text-left transition-all duration-200',
                isActive
                  ? 'border-brand-green bg-brand-green-light dark:bg-green-900/20'
                  : 'border-border dark:border-dark-border bg-white dark:bg-dark-card hover:border-brand-green/40'
              )}
            >
              <Icon size={18} className={isActive ? 'text-brand-green' : 'text-ink-muted dark:text-gray-400'} />
              <div>
                <p className={cn('text-sm font-semibold', isActive ? 'text-brand-green-dark dark:text-green-400' : 'text-ink dark:text-white')}>
                  {label}
                </p>
                <p className="text-xs text-ink-muted dark:text-gray-400">{desc}</p>
              </div>
              {isActive && <CheckCircle2 size={14} className="text-brand-green ml-auto flex-shrink-0" />}
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
    <div className="card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-ink dark:text-white">Platform Status</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, color }) => (
          <div key={label}>
            <p className="text-[10px] text-ink-faint dark:text-gray-500 uppercase tracking-wider mb-1">{label}</p>
            <p className={cn('text-sm font-semibold font-mono-nums', color)}>{value}</p>
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
    <div className="card p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-ink dark:text-white">Model Configuration</h3>
        <p className="text-xs text-ink-muted dark:text-gray-400 mt-0.5">
          Each agent uses the Claude model best suited to its task complexity and latency requirements.
        </p>
      </div>
      <div className="divide-y divide-border dark:divide-dark-border">
        {items.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between py-2">
            <span className="text-xs text-ink-muted dark:text-gray-400">{label}</span>
            <span className="text-xs font-mono text-ink dark:text-white bg-surface-muted dark:bg-dark-border px-2 py-0.5 rounded">
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
    <div className="p-6 space-y-6 max-w-[900px] mx-auto">
      <RoleSwitcher />
      <ThemeSettings />
      <SystemInfo />
      {showInternals && <PlatformInfo />}

      {/* About */}
      <div className="ai-panel rounded-card p-4 flex items-start gap-3">
        <Zap size={16} className="text-brand-green flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-brand-green-dark dark:text-green-400">LevelShift Pulse v2.4.1</p>
          <p className="text-xs text-ink-muted dark:text-gray-400 mt-1 leading-relaxed">
            AI Content Operations Platform. 13 agents · 4 layers · 310 assets per quarter · 5 Business Units.
            Built on Claude claude-opus-4-7, claude-sonnet-4-6, and claude-haiku-4-5. All production data is simulated for demonstration.
          </p>
        </div>
      </div>
    </div>
  );
}
