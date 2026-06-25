import { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  FileText, 
  Clock, 
  Filter, 
  ChevronRight, 
  X,
  PlusSquare,
  ShieldAlert
} from 'lucide-react';
import { Contract } from '../types';

interface SearchViewProps {
  contracts: Contract[];
  onViewContract: (contract: Contract) => void;
}

export function SearchView({ contracts, onViewContract }: SearchViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL'); // "ALL", "LOW", "MEDIUM", "HIGH"

  // Compute unique contract types dynamically
  const contractTypes = useMemo(() => {
    const types = new Set<string>();
    contracts.forEach(c => {
      if (c.contractType && c.contractType !== 'Analyzing...' && c.contractType !== 'N/A') {
        types.add(c.contractType);
      }
    });
    return Array.from(types);
  }, [contracts]);

  // Perform searching and multi-parameter filtering
  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      // 1. Text Search Filter
      const matchSearch = 
        c.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contractType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.parties.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));

      // 2. Status Filter
      const matchStatus = 
        selectedStatus === 'ALL' || 
        c.status.toUpperCase() === selectedStatus.toUpperCase();

      // 3. Document Category Type Filter
      const matchType = 
        selectedType === 'ALL' || 
        c.contractType === selectedType;

      // 4. Risk Score level Filter
      let matchRisk = true;
      if (riskFilter !== 'ALL') {
        const score = c.riskScore;
        if (riskFilter === 'LOW') matchRisk = score <= 30 && c.status !== 'Failed';
        if (riskFilter === 'MEDIUM') matchRisk = score > 30 && score <= 65 && c.status !== 'Failed';
        if (riskFilter === 'HIGH') matchRisk = (score > 65 || c.status === 'High Risk') && c.status !== 'Failed';
      }

      return matchSearch && matchStatus && matchType && matchRisk;
    });
  }, [contracts, searchTerm, selectedStatus, selectedType, riskFilter]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedStatus('ALL');
    setSelectedType('ALL');
    setRiskFilter('ALL');
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-green-50 text-green-700 border border-green-200">Completed</span>;
      case 'Processing':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">Processing</span>;
      case 'High Risk':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-red-50 text-red-700 border border-red-200">High Risk</span>;
      case 'Failed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-slate-100 text-[#434655] border border-slate-300">Failed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-[#F1F5F9] text-[#434655]">{status}</span>;
    }
  };

  return (
    <div id="search-view-root" className="space-y-6 animate-fade-in">
      {/* Title Header */}
      <div id="search-header-group">
        <h1 className="text-3xl font-black text-[#191B23]">Advanced Index Search</h1>
        <p className="text-sm text-[#737686] mt-1 font-medium">
          Filter, query, and search through all contract segments and AI risk markers.
        </p>
      </div>

      {/* Advanced Filter controls bar */}
      <div id="filters-card" className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-[0_4px_20px_-2px_rgba(15,23,42,0.03)] space-y-4">
        {/* Search Input and Sliders button */}
        <div id="search-bar-row" className="flex flex-col md:flex-row gap-3">
          <div id="search-input-box" className="flex-1 flex items-center bg-[#F8FAFC] px-4 py-3 rounded-xl border border-[#C3C6D7]/65 focus-within:border-[#2563EB]/85 transition-all">
            <Search className="w-5 h-5 text-[#737686]" />
            <input
              id="search-main-input"
              type="text"
              placeholder="Search by file name, typing, party, summary clause..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm w-full ml-3 focus:outline-none p-0"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="p-1 rounded-full hover:bg-slate-200">
                <X className="w-4 h-4 text-[#737686]" />
              </button>
            )}
          </div>

          <button
            id="clear-filters-btn"
            onClick={clearAllFilters}
            className="px-4 py-3 border border-[#C3C6D7] text-[#434655] hover:bg-slate-50 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Reset Filters</span>
          </button>
        </div>

        {/* Filter categories tags */}
        <div id="filter-parameters-grid" className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1.5">
          {/* Status Select */}
          <div id="status-filter-group" className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#737686] uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Filter Status
            </label>
            <select
              id="status-select-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
            >
              <option value="ALL">All States</option>
              <option value="COMPLETED">Completed</option>
              <option value="HIGH RISK">High Risk</option>
              <option value="PROCESSING">Processing</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {/* Type Select */}
          <div id="type-filter-group" className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#737686] uppercase tracking-wider flex items-center gap-1.5">
               Document Category
            </label>
            <select
              id="type-select-filter"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
            >
              <option value="ALL">All Categories</option>
              {contractTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Risk Level filter */}
          <div id="risk-filter-group" className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#737686] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> Risk Score Scope
            </label>
            <select
              id="risk-select-filter"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
            >
              <option value="ALL">Any Score</option>
              <option value="LOW">Low (0 - 30)</option>
              <option value="MEDIUM">Medium (31 - 65)</option>
              <option value="HIGH">High (66 - 100)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filtered Count Metrics */}
      <p id="search-metrics-tag" className="text-xs font-semibold text-[#737686]">
        Showing <strong className="text-[#191B23] font-extrabold">{filteredContracts.length}</strong> matching contract{filteredContracts.length !== 1 ? 's' : ''} found
      </p>

      {/* Filtered Grid/List Results */}
      <div id="search-results-list" className="space-y-3.5">
        {filteredContracts.length === 0 ? (
          <div id="search-unmatched-card" className="bg-slate-50 border border-dashed border-[#C3C6D7] rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <PlusSquare className="w-12 h-12 text-[#737686]/40 mb-3" />
            <h3 className="text-sm font-bold text-[#191B23]">No index matches found</h3>
            <p className="text-xs text-[#737686] mt-1 max-w-sm">
              We couldn&apos;t find matches matching those filters. Try searching with alternative terms or clearing filters.
            </p>
          </div>
        ) : (
          filteredContracts.map((contract) => {
            const isHighRisk = contract.riskScore > 65 || contract.status === 'High Risk';
            const riskClass = isHighRisk 
              ? 'text-red-700 hover:border-red-300' 
              : contract.riskScore > 30 
                ? 'text-amber-700 hover:border-amber-300' 
                : 'text-green-700 hover:border-green-300';

            return (
              <div
                id={`search-item-${contract.id}`}
                key={contract.id}
                onClick={() => onViewContract(contract)}
                className="bg-white border border-[#E2E8F0] hover:border-[#2563EB]/40 hover:shadow-xs p-5 rounded-2xl transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${contract.fileType === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                    <FileText className="w-5.5 h-5.5" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 id={`search-item-filename-${contract.id}`} className="text-sm font-bold text-[#191B23] truncate max-w-xs md:max-w-md group-hover:text-[#2563EB] transition-colors" title={contract.fileName}>
                        {contract.fileName}
                      </h4>
                      {renderStatusBadge(contract.status)}
                    </div>
                    <p id={`search-item-parties-${contract.id}`} className="text-[10px] text-[#737686] uppercase font-bold tracking-wider">
                      Category: {contract.contractType} {contract.parties.length > 0 ? `• Parties: ${contract.parties.join(', ')}` : ''}
                    </p>
                    <p id={`search-item-desc-${contract.id}`} className="text-xs text-[#434655] line-clamp-2 pr-4 leading-relaxed">
                      {contract.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 justify-between md:justify-end border-t md:border-t-0 border-[#E2E8F0] pt-3 md:pt-0">
                  <div className="text-left md:text-right flex-shrink-0">
                    <p className="text-[9px] text-[#737686] uppercase font-semibold">Risk Rating</p>
                    <p id={`search-item-score-${contract.id}`} className={`text-base font-black ${riskClass}`}>
                      {contract.status === 'Processing' ? 'Scanning...' : contract.status === 'Failed' ? 'N/A' : `${contract.riskScore}/100`}
                    </p>
                  </div>

                  <div className="text-left md:text-right flex-shrink-0">
                    <p className="text-[9px] text-[#737686] uppercase font-semibold">Indexed On</p>
                    <p className="text-xs text-[#434655] font-bold flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-[#737686]" />
                      {contract.uploadedAt}
                    </p>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[#737686] group-hover:text-[#2563EB] group-hover:bg-[#EBF2FE]/40 transition-colors hidden md:flex">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
