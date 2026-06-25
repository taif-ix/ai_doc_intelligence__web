import { 
  FileText, 
  RefreshCw, 
  CheckCircle, 
  AlertOctagon, 
  Plus, 
  Trash2,
  FileSpreadsheet,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { Contract, IntelligenceStats } from '../types';

interface DashboardViewProps {
  contracts: Contract[];
  stats: IntelligenceStats;
  onUploadClick: () => void;
  onViewContract: (contract: Contract) => void;
  onDeleteContract: (id: string, e: React.MouseEvent) => void;
  onSearchRedirect: () => void;
}

export function DashboardView({ 
  contracts, 
  stats, 
  onUploadClick, 
  onViewContract,
  onDeleteContract,
  onSearchRedirect
}: DashboardViewProps) {

  // Format score progress bar width & color
  const renderRiskMeter = (score: number, status: string) => {
    if (status === 'Processing') {
      return (
        <span id="calculating-label" className="text-xs text-[#737686] italic tracking-wide">
          Calculating...
        </span>
      );
    }
    if (status === 'Failed') {
      return <span id="na-label" className="text-xs text-red-500 font-semibold uppercase">N/A</span>;
    }

    let barColor = 'bg-green-500';
    let textColor = 'text-[#434655]';

    if (score > 65) {
      barColor = 'bg-red-500';
      textColor = 'text-red-600 font-semibold';
    } else if (score > 30) {
      barColor = 'bg-orange-500';
      textColor = 'text-orange-600 font-semibold';
    }

    return (
      <div id="risk-meter-wrapper" className="flex items-center gap-3">
        <div id="risk-meter-track" className="w-24 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
          <div 
            id="risk-meter-fill"
            className={`${barColor} h-full rounded-full`} 
            style={{ width: `${score}%` }}
          />
        </div>
        <span id="risk-meter-score" className={`text-xs ${textColor}`}>{score}/100</span>
      </div>
    );
  };

  // Status badges matching layout
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <span id="badge-completed" className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-green-50 text-green-700 font-semibold border border-green-200">
            Completed
          </span>
        );
      case 'Processing':
        return (
          <span id="badge-processing" className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-blue-50 text-blue-700 font-semibold border border-blue-200 animate-pulse">
            Processing
          </span>
        );
      case 'High Risk':
        return (
          <span id="badge-highrisk" className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-orange-50 text-orange-700 font-semibold border border-orange-200">
            High Risk
          </span>
        );
      case 'Failed':
        return (
          <span id="badge-failed" className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-red-50 text-red-700 font-semibold border border-red-200">
            Failed
          </span>
        );
      default:
        return (
          <span id="badge-unknown" className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-[#F1F5F9] text-[#434655] font-semibold border border-[#E2E8F0]">
            {status}
          </span>
        );
    }
  };

  return (
    <div id="dashboard-view-root" className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div id="welcome-section" className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div id="welcome-text-group">
          <h1 id="welcome-title" className="text-3xl lg:text-4xl font-black text-[#191B23] tracking-tight">
            Intelligence Overview
          </h1>
          <p id="welcome-subtitle" className="text-[#434655] text-base lg:text-lg mt-1 font-medium">
            Reviewing your automated legal analysis and risk indices for today.
          </p>
        </div>
        <button
          id="dashboard-cta-upload"
          onClick={onUploadClick}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#2563EB]/15 transition-all active:scale-95 cursor-pointer"
        >
          <Plus id="plus-icon" className="w-4 h-4 cursor-pointer" />
          <span>Upload Contract</span>
        </button>
      </div>

      {/* Bento Grid Metrics */}
      <div id="bento-metrics-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Documents */}
        <div id="metric-card-total" className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(15,23,42,0.03)] hover:border-[#2563EB]/40 hover:shadow-md transition-all">
          <div id="metric-header-total" className="flex items-center justify-between mb-4">
            <div id="metric-icon-box-total" className="w-12 h-12 rounded-xl bg-[#EBF2FE] flex items-center justify-center text-[#004AC6]">
              <FileText className="w-6 h-6" />
            </div>
            <span id="metric-trend-total" className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +12%
            </span>
          </div>
          <h3 id="metric-title-total" className="text-sm font-bold text-[#737686] uppercase tracking-wider">Total Documents</h3>
          <p id="metric-val-total" className="text-3xl font-extrabold text-[#191B23] mt-1">{stats.totalCount}</p>
        </div>

        {/* Processing */}
        <div id="metric-card-processing" className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(15,23,42,0.03)] hover:border-[#2563EB]/40 hover:shadow-md transition-all">
          <div id="metric-header-processing" className="flex items-center justify-between mb-4">
            <div id="metric-icon-box-processing" className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <RefreshCw className={`w-5 h-5 ${stats.processingCount > 0 ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
            </div>
            <span id="metric-trend-processing" className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full">
              In Progress
            </span>
          </div>
          <h3 id="metric-title-processing" className="text-sm font-bold text-[#737686] uppercase tracking-wider">Processing</h3>
          <p id="metric-val-processing" className="text-3xl font-extrabold text-[#191B23] mt-1">{stats.processingCount}</p>
        </div>

        {/* Completed */}
        <div id="metric-card-completed" className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(15,23,42,0.03)] hover:border-[#2563EB]/40 hover:shadow-md transition-all">
          <div id="metric-header-completed" className="flex items-center justify-between mb-4">
            <div id="metric-icon-box-completed" className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span id="metric-trend-completed" className="text-xs font-bold text-green-700 bg-green-50 border border-green-150 px-2.5 py-1 rounded-full">
              Verified
            </span>
          </div>
          <h3 id="metric-title-completed" className="text-sm font-bold text-[#737686] uppercase tracking-wider">Completed</h3>
          <p id="metric-val-completed" className="text-3xl font-extrabold text-[#191B23] mt-1">{stats.completedCount}</p>
        </div>

        {/* Failed */}
        <div id="metric-card-failed" className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(15,23,42,0.03)] hover:border-[#2563EB]/40 hover:shadow-md transition-all">
          <div id="metric-header-failed" className="flex items-center justify-between mb-4">
            <div id="metric-icon-box-failed" className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <span id="metric-trend-failed" className="text-xs font-bold text-red-700 bg-red-50 border border-red-150 px-2.5 py-1 rounded-full">
              Attention
            </span>
          </div>
          <h3 id="metric-title-failed" className="text-sm font-bold text-[#737686] uppercase tracking-wider">Failed</h3>
          <p id="metric-val-failed" className="text-3xl font-extrabold text-[#191B23] mt-1">{stats.failedCount}</p>
        </div>
      </div>

      {/* Recent Documents Table section */}
      <div id="recent-documents-container" className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(15,23,42,0.03)] overflow-hidden">
        <div id="recent-docs-header" className="px-6 py-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 id="recent-docs-heading" className="text-lg font-bold text-[#191B23]">Recent Documents</h2>
          <button 
            id="view-all-redirect-btn"
            onClick={onSearchRedirect}
            className="text-[#2563EB] hover:text-[#1D4ED8] text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
          >
            <span>View All Search Filters</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div id="table-scroll-wrapper" className="overflow-x-auto">
          {contracts.length === 0 ? (
            <div id="empty-table-state" className="flex flex-col items-center justify-center py-12 px-6 bg-slate-50 text-center">
              <FileSpreadsheet className="w-12 h-12 text-[#737686]/50 mb-3" />
              <h4 className="text-sm font-bold text-[#191B23]">No analyzed documents yet</h4>
              <p className="text-xs text-[#737686] mt-1 max-w-sm">
                Get started by clicking the &quot;Upload Contract&quot; button to send a document through backend analysis.
              </p>
            </div>
          ) : (
            <table id="recent-documents-table" className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#F8FAFC] text-[#434655] uppercase text-[10px] tracking-wider font-bold border-b border-[#E2E8F0]">
                  <th className="px-6 py-4">File Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Risk Score</th>
                  <th className="px-6 py-4">Date Uploaded</th>
                  <th className="px-6 py-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody id="table-body-rows" className="divide-y divide-[#E2E8F0]/50">
                {contracts.map((item) => {
                  const isPdf = item.fileType === 'pdf';
                  return (
                    <tr 
                      id={`table-row-${item.id}`}
                      key={item.id} 
                      onClick={() => onViewContract(item)}
                      className="hover:bg-[#F8FAFC]/70 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isPdf ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 max-w-[280px]">
                            <p className="text-sm font-extrabold text-[#191B23] truncate group-hover:text-[#2563EB] transition-colors" title={item.fileName}>
                              {item.fileName}
                            </p>
                            <p className="text-[10px] text-[#737686] font-semibold tracking-wider mt-0.5">
                              {item.fileSize} • {item.contractType !== 'Analyzing...' ? item.contractType : 'Assessing...'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        {renderStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-4.5">
                        {renderRiskMeter(item.riskScore, item.status)}
                      </td>
                      <td className="px-6 py-4.5 text-[#434655] text-xs font-semibold">
                        {item.uploadedAt}
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <button 
                          id={`delete-btn-${item.id}`}
                          onClick={(e) => onDeleteContract(item.id, e)}
                          className="p-2 rounded-full hover:bg-red-50 hover:text-red-600 text-[#737686]/60 transition-colors cursor-pointer"
                          title="Delete Contract Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
