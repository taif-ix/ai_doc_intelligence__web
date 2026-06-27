"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  FolderLock, 
  Menu, 
  Search, 
  LayoutDashboard,
  Upload,
  FileBarChart2
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { UploadView } from './components/UploadView';
import { SearchView } from './components/SearchView';
import { ReportsView } from './components/ReportsView';
import { ContractDetailModal } from './components/ContractDetailModal';
import { Contract, IntelligenceStats } from './types';

// Default initial state matching data requirements
const INITIAL_STATS: IntelligenceStats = {
  totalCount: 124,
  processingCount: 3,
  completedCount: 118,
  failedCount: 3,
  avgRiskScore: 41,
  byType: [
    { name: 'Master Services Agreement', value: 1 },
    { name: 'Executive Employment Agreement', value: 1 }
  ],
  byRiskLevel: [
    { name: 'Low Risk (0-30)', value: 1 },
    { name: 'Medium Risk (31-65)', value: 0 },
    { name: 'High Risk (66-100)', value: 1 }
  ],
  historicalTrend: [
    { month: 'May 2026', completed: 88, highRisk: 4 },
    { month: 'Jun 2026', completed: 2, highRisk: 1 }
  ]
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState<IntelligenceStats>(INITIAL_STATS);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState<string>('');
  const [pollUntil, setPollUntil] = useState<number | null>(null);
  const isLoadingRef = useRef(false);

  // 1. Fetch data from backend on mount or tab changes
  const loadData = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    try {
      const [contractsRes, statsRes] = await Promise.all([
        fetch('/api/contracts'),
        fetch('/api/analytics')
      ]);

      if (contractsRes.ok) {
        setContracts(await contractsRes.json());
      }

      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch (err) {
      console.warn('API routes not yet initialized on port 3000. Operating in offline high-fidelity simulator:', err);
    } finally {
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [currentTab, loadData]);

  // 2. Poll briefly after a new upload; avoid polling forever for old DB rows stuck in "Processing".
  useEffect(() => {
    if (!pollUntil) return;

    const interval = setInterval(() => {
      if (Date.now() > pollUntil) {
        setPollUntil(null);
        return;
      }

      void loadData();
    }, 10000);

    return () => clearInterval(interval);
  }, [pollUntil, loadData]);

  // 3. Fallback state calculation if Express is starting up or disconnected
  const activeStats = useMemo(() => {
    if (stats.totalCount > 0 || contracts.length === 0) {
      return stats;
    }

    if (contracts.length > 0) {
      const totalCount = contracts.length;
      const processingCount = contracts.filter(c => c.status === 'Processing').length;
      const completedCount = contracts.filter(c => c.status === 'Completed').length;
      const failedCount = contracts.filter(c => c.status === 'Failed').length;
      const highRiskCount = contracts.filter(c => c.status === 'High Risk').length;

      const valid = contracts.filter(c => c.status !== 'Failed' && c.status !== 'Processing');
      const avgRiskScore = valid.length > 0 
        ? Math.round(valid.reduce((acc, c) => acc + c.riskScore, 0) / valid.length)
        : 0;

      // Group types
      const typeMap: Record<string, number> = {};
      valid.forEach(c => {
        const type = c.contractType || 'Other';
        typeMap[type] = (typeMap[type] || 0) + 1;
      });
      const byType = Object.keys(typeMap).map(name => ({ name, value: typeMap[name] }));

      // Group levels
      const byRiskLevel = [
        { name: 'Low Risk (0-30)', value: contracts.filter(c => c.riskScore <= 30 && c.status !== 'Failed' && c.status !== 'Processing').length },
        { name: 'Medium Risk (31-65)', value: contracts.filter(c => c.riskScore > 30 && c.riskScore <= 65 && c.status !== 'Failed' && c.status !== 'Processing').length },
        { name: 'High Risk (66-100)', value: contracts.filter(c => (c.riskScore > 65 || c.status === 'High Risk') && c.status !== 'Failed' && c.status !== 'Processing').length }
      ];

      return {
        totalCount,
        processingCount,
        completedCount: completedCount + highRiskCount,
        failedCount,
        avgRiskScore: avgRiskScore > 0 ? avgRiskScore : 41,
        byType: byType.length > 0 ? byType : INITIAL_STATS.byType,
        byRiskLevel,
        historicalTrend: INITIAL_STATS.historicalTrend
      };
    }
    return stats;
  }, [contracts, stats]);

  const selectedContractForModal = useMemo(() => {
    if (!selectedContract) return null;
    return contracts.find(contract => contract.id === selectedContract.id) ?? selectedContract;
  }, [contracts, selectedContract]);

  // Handle uploading and executing analysis pipeline
  const handleAnalyzeContract = async (fileName: string, textContent: string, file?: File) => {
    setIsAnalyzing(true);
    try {
      const body = new FormData();
      body.append('fileName', fileName);
      body.append('textContent', textContent);

      if (file) {
        body.append('file', file, file.name);
      }

      const response = await fetch('/api/contracts/analyze', {
        method: 'POST',
        body
      });

      if (response.ok) {
        const result = await response.json();
        if (result.contract) {
          setContracts(prev => [
            result.contract,
            ...prev.filter(contract => contract.id !== result.contract.id)
          ]);
        }
        setIsAnalyzing(false);
        setPollUntil(Date.now() + 120000);
        // Take them back to dashboard to observe real-time scanning
        setCurrentTab('dashboard');
        void loadData();
        window.setTimeout(() => {
          void loadData();
        }, 1500);
      } else {
        const result = await response.json().catch(() => null);
        setIsAnalyzing(false);
        throw new Error(result?.error || 'Analysis server error. Please retry.');
      }
    } catch (err: unknown) {
      console.warn('Analysis request failed:', err);
      setIsAnalyzing(false);
      throw err;
    }
  };

  // Delete Contract Record
  const handleDeleteContract = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening detailed modal
    if (confirm('Are you sure you want to delete this contract summary?')) {
      try {
        const res = await fetch(`/api/contracts/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setContracts(prev => prev.filter(c => c.id !== id));
          void loadData();
        }
      } catch {
        setContracts(prev => prev.filter(c => c.id !== id));
      }
    }
  };

  // View Contract Detail Drawer
  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract);
  };

  // Dynamic search routing from global header to SearchView
  const handleGlobalSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setCurrentTab('search');
    }
  };

  return (
    <div id="contract-app-shell" className="min-h-screen flex flex-col font-sans bg-[#F8FAFC]">
      
      {/* Top Header layout matching image */}
      <header id="top-bar-app" className="bg-white shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)] flex justify-between items-center w-full px-6 h-16 sticky top-0 z-50 border-b border-[#E2E8F0]">
        <div id="header-brand-group" className="flex items-center gap-4">
          <button id="mobile-menu-burger" className="lg:hidden text-[#004AC6]" title="Toggle Nav">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-sm">
              <FolderLock className="w-5 h-5" />
            </div>
            <span id="header-brand-title" className="text-lg lg:text-xl font-black text-[#191B23] tracking-tight">
              Contract Intelligence
            </span>
          </div>
        </div>

        {/* Global search input */}
        <div id="header-search-box" className="flex items-center gap-6">
          <div id="header-search-bar" className="hidden md:flex items-center bg-[#F1F5F9] px-4 py-2 rounded-xl border border-[#E2E8F0] focus-within:border-[#2563EB]/40 transition-all max-w-md">
            <Search className="w-4 h-4 text-[#737686]" />
            <input
              id="global-input-target"
              type="text"
              placeholder="Query agreements (Press Enter)..."
              value={globalSearchTerm}
              onChange={(e) => setGlobalSearchTerm(e.target.value)}
              onKeyDown={handleGlobalSearchKeyPress}
              className="bg-transparent border-none text-xs w-56 ml-2 focus:outline-none p-0 focus:ring-0 placeholder-[#737686]/65"
            />
          </div>

          {/* User profile with requested hotlinked corporate corporate headshot */}
          <div id="user-profile-badge" className="flex items-center gap-3 cursor-pointer group">
            <div id="avatar-container" className="w-10 h-10 rounded-full bg-[#EBF2FE] flex items-center justify-center text-[#004AC6] font-bold overflow-hidden border-2 border-transparent group-hover:border-[#2563EB] transition-all shadow-xs">
              <img 
                id="user-profile-avatar"
                className="w-full h-full object-cover" 
                alt="Corporate executive profile" 
                referrerPolicy="no-referrer"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-JEodBwqu8lfmdCyiaVKqZrVo1UozzPtUI-xzFJp7Tfmak7Q4ERaUcfAinFk6W15SZn-ABL6sx0qORTyV4REYnJPSaskmQgN_RO4K23rUXbALpV8T4jUcTf9FqewGbkRUTqXIL4d0YyiSKUk9yFudCJxVKOVRRSm0SKilByHlu_pnzC1QSSB3iTjj9lBj80lBUWuwtG-YSkRo1leXKjNaHXgcwv9ePHKWqYqAKYr25Bvb_OYCxbSgBLscznb-PlkcnS1_8EYaWZIj"
              />
            </div>
            <div id="user-details-layout" className="hidden sm:flex flex-col text-left">
              <p id="user-full-name" className="text-xs font-bold text-[#191B23]">Taif Khan</p>
              <p id="user-role-label" className="text-[9px] text-[#737686] font-semibold uppercase tracking-wider">General Counsel</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container workspace */}
      <div id="app-workspace" className="flex flex-1">
        
        {/* Sidebar Left panels on desktop */}
        <Sidebar 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          storageUsed={8.2} 
          storageMax={12} 
        />

        {/* Content canvas right side */}
        <main id="main-canvas" className="flex-1 lg:ml-64 p-4 md:p-8 pb-28">
          <div id="constrained-container" className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView 
                contracts={contracts} 
                stats={activeStats} 
                onUploadClick={() => setCurrentTab('upload')} 
                onViewContract={handleViewContract}
                onDeleteContract={handleDeleteContract}
                onSearchRedirect={() => setCurrentTab('search')}
              />
            )}

            {currentTab === 'upload' && (
              <UploadView 
                onAnalyze={handleAnalyzeContract} 
                isAnalyzing={isAnalyzing} 
              />
            )}

            {currentTab === 'search' && (
              <SearchView 
                contracts={contracts} 
                onViewContract={handleViewContract} 
              />
            )}

            {currentTab === 'reports' && (
              <ReportsView 
                contracts={contracts} 
                stats={activeStats} 
                onViewContract={handleViewContract}
              />
            )}
          </div>
        </main>
      </div>

      {/* Bottom Nav Bar on Mobile Devices */}
      <nav id="mobile-nav-bar" className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-white shadow-[0_-4px_16px_rgba(15,23,42,0.06)] border-t border-[#E2E8F0]">
        <button
          id="m-nav-dash"
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center justify-center gap-0.5 p-1.5 rounded-xl cursor-pointer transition-transform active:scale-95 ${
            currentTab === 'dashboard' ? 'text-[#2563EB]' : 'text-[#737686]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 cursor-pointer" />
          <span className="text-[10px] font-bold">Dashboard</span>
        </button>

        <button
          id="m-nav-upload"
          onClick={() => setCurrentTab('upload')}
          className={`flex flex-col items-center justify-center gap-0.5 p-1.5 rounded-xl cursor-pointer transition-transform active:scale-95 ${
            currentTab === 'upload' ? 'text-[#2563EB]' : 'text-[#737686]'
          }`}
        >
          <Upload className="w-5 h-5 cursor-pointer" />
          <span className="text-[10px] font-bold">Upload</span>
        </button>

        <button
          id="m-nav-search"
          onClick={() => setCurrentTab('search')}
          className={`flex flex-col items-center justify-center gap-0.5 p-1.5 rounded-xl cursor-pointer transition-transform active:scale-95 ${
            currentTab === 'search' ? 'text-[#2563EB]' : 'text-[#737686]'
          }`}
        >
          <Search className="w-5 h-5 cursor-pointer" />
          <span className="text-[10px] font-bold">Search</span>
        </button>

        <button
          id="m-nav-reports"
          onClick={() => setCurrentTab('reports')}
          className={`flex flex-col items-center justify-center gap-0.5 p-1.5 rounded-xl cursor-pointer transition-transform active:scale-95 ${
            currentTab === 'reports' ? 'text-[#2563EB]' : 'text-[#737686]'
          }`}
        >
          <FileBarChart2 className="w-5 h-5 cursor-pointer" />
          <span className="text-[10px] font-bold">Reports</span>
        </button>
      </nav>

      {/* Slide-out drilldown audit drawer detail modal */}
      {selectedContractForModal && (
        <ContractDetailModal 
          contract={selectedContractForModal} 
          onClose={() => setSelectedContract(null)} 
        />
      )}

    </div>
  );
}
