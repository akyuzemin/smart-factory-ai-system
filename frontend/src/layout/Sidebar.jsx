import { NavLink } from 'react-router-dom';

const navigationItems = [
  { label: 'Dashboard', icon: 'dashboard', to: '/', end: true },
  { label: 'Makineler', icon: 'machines', to: '/machines' },
  { label: 'Sensörler', icon: 'sensors', to: '/sensors' },
  { label: 'Üretim', icon: 'production', to: '/production' },
  { label: 'Operatörler', icon: 'operators', to: '/operators' },
  { label: 'Bakım', icon: 'maintenance', to: '/maintenance' },
  { label: 'Raporlar', icon: 'reports', to: '/reports' },
  { label: 'AI Kalite Kontrol', icon: 'ai', to: '/ai-quality-control' },
  { label: 'Ayarlar', icon: 'settings', to: '/settings' },
];

function Sidebar() {
  return (
    <aside className="w-full border-b border-slate-700/70 bg-slate-950 md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 px-5 py-4 md:px-6 md:py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-950/50">
            <FactoryIcon />
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide text-white">SMART FACTORY</p>
            <p className="text-xs text-slate-400">Kontrol Merkezi</p>
          </div>
        </div>

        <nav aria-label="Ana menü" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:px-4 md:pb-0">
          {navigationItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors md:w-full ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 shadow-sm ring-1 ring-inset ring-cyan-400/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <NavigationIcon name={item.icon} />
              <span className="whitespace-nowrap">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto hidden border-t border-slate-800 px-6 py-5 md:block">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <div>
              <p className="text-xs font-medium text-slate-200">Sistem Çevrimiçi</p>
              <p className="text-xs text-slate-500">Tüm servisler aktif</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function FactoryIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 text-slate-950" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 21V9l6 3V9l6 3V5l6 3v13H3Z" />
      <path d="M7 21v-4h3v4m4-4h3" />
    </svg>
  );
}

function NavigationIcon({ name }) {
  const commonProps = {
    'aria-hidden': true,
    className: 'h-5 w-5 shrink-0',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    viewBox: '0 0 24 24',
  };

  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    machines: <><path d="M4 20V8h8v12M12 12h8v8" /><path d="M6 12h2m-2 4h2m8-1h2m-1-3v6" /></>,
    sensors: <><path d="M12 18a6 6 0 1 0-6-6" /><path d="M12 14a2 2 0 1 0-2-2" /><path d="M4 4l16 16" /></>,
    production: <><path d="M4 20V10l5 3V9l5 3V5l5 3v12H4Z" /><path d="M8 20v-3h3v3m3-5h2" /></>,
    operators: <><circle cx="12" cy="8" r="3" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
    maintenance: <><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2.1-2.1 2.9-2.7Z" /></>,
    reports: <><path d="M5 3h10l4 4v14H5V3Z" /><path d="M15 3v5h5M8 12h8M8 16h6" /></>,
    ai: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M9 10h.01M15 10h.01M9 15c1.5 1 4.5 1 6 0M12 1v3m0 16v3M1 12h3m16 0h3" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.1 2.1-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-3v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2.1-2.1.1-.1A1.7 1.7 0 0 0 7 15a1.7 1.7 0 0 0-1.5-1H5.3v-3h.2A1.7 1.7 0 0 0 7 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.1-2.1.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2h3v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.1 2.1-.1.1A1.7 1.7 0 0 0 19.4 10a1.7 1.7 0 0 0 1.5 1h.2v3h-.2a1.7 1.7 0 0 0-1.5 1Z" /></>,
  };

  return <svg {...commonProps}>{paths[name]}</svg>;
}

export default Sidebar;
