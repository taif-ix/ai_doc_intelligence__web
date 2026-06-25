import { 
  LayoutDashboard, 
  Upload, 
  Search, 
  FileBarChart2, 
  HardDrive 
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  storageUsed: number; // e.g. 8.2
  storageMax: number; // e.g. 12
}

export function Sidebar({ currentTab, setCurrentTab, storageUsed, storageMax }: SidebarProps) {
  const percent = Math.min(100, Math.round((storageUsed / storageMax) * 100));

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', name: 'Upload Contract', icon: Upload },
    { id: 'search', name: 'Search', icon: Search },
    { id: 'reports', name: 'Reports', icon: FileBarChart2 },
  ];

  return (
    <aside id="desktop-sidebar" className="hidden lg:flex flex-col gap-6 p-6 bg-white border-r border-[#E2E8F0] h-[calc(100vh-4rem)] w-64 fixed left-0 top-16 z-40">
      <nav id="desktop-navigation" className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer group ${
                isActive
                  ? 'bg-[#EBF2FE] text-[#004AC6] font-semibold border-l-4 border-[#004AC6]'
                  : 'text-[#434655] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
              }`}
            >
              <Icon 
                id={`nav-icon-${item.id}`}
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-[#004AC6]' : 'text-[#737686] group-hover:text-[#004AC6]'
                }`} 
              />
              <span id={`nav-text-${item.id}`} className="text-sm font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Storage Indicator */}
      <div id="storage-indicator-panel" className="mt-auto pb-4">
        <div id="storage-indicator-card" className="bg-[#EBF2FE] text-[#004AC6] p-4 rounded-2xl shadow-sm border border-[#C3C6D7]/30 flex flex-col gap-2.5">
          <div id="storage-meta-row" className="flex items-center gap-2 text-[#004AC6]/90">
            <HardDrive id="storage-icon" className="w-4 h-4 text-[#004AC6]" />
            <p id="storage-title" className="text-xs font-semibold uppercase tracking-wider">Storage Capacity</p>
          </div>
          <div id="storage-progress-container" className="w-full bg-[#004AC6]/10 h-2 rounded-full overflow-hidden">
            <div 
              id="storage-progress-bar"
              className="bg-[#2563EB] h-full rounded-full transition-all duration-500" 
              style={{ width: `${percent}%` }}
            ></div>
          </div>
          <p id="storage-text-metrics" className="text-xs font-bold text-[#00174B]">
            {storageUsed.toFixed(1)} GB / {storageMax} GB ({percent}% Used)
          </p>
        </div>
      </div>
    </aside>
  );
}
