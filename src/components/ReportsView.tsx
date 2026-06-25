import { useMemo } from 'react';
import { 
  ShieldAlert, 
  PieChart, 
  BarChart2, 
  AlertTriangle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Contract, IntelligenceStats } from '../types';

interface ReportsViewProps {
  contracts: Contract[];
  stats: IntelligenceStats;
  onViewContract: (contract: Contract) => void;
}

export function ReportsView({ contracts, stats, onViewContract }: ReportsViewProps) {

  // Isolate and prioritize high risk warnings across files
  const highRiskClauses = useMemo(() => {
    const list: { contractFile: string; contractId: string; title: string; riskLevel: string; recommendation: string }[] = [];
    contracts.forEach(contract => {
      contract.clauses.forEach(clause => {
        if (clause.riskLevel === 'High') {
          list.push({
            contractFile: contract.fileName,
            contractId: contract.id,
            title: clause.title,
            riskLevel: clause.riskLevel,
            recommendation: clause.recommendation
          });
        }
      });
    });
    return list;
  }, [contracts]);

  // Design category breakdown visually using SVG
  const maxTypeValue = useMemo(() => {
    return Math.max(...stats.byType.map(t => t.value), 1);
  }, [stats]);

  return (
    <div id="reports-view-root" className="space-y-8 animate-fade-in pb-16">
      {/* Title Header */}
      <div id="reports-header-group">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#191B23]">Compliance Analytics</h1>
            <p className="text-sm text-[#737686] mt-1 font-medium">
              Detailed metrics diagnostics and risk trends generated across your legal repository.
            </p>
          </div>
          <a
            href="/api/reports/export"
            className="inline-flex items-center justify-center rounded-xl bg-[#2563EB] px-4 py-3 text-xs font-bold text-white shadow-md shadow-[#2563EB]/10 transition-all hover:bg-[#1D4ED8]"
          >
            Download Backend Excel
          </a>
        </div>
      </div>

      {/* Overview Analytics row */}
      <div id="overview-analytics-row" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Average Risk cockpit */}
        <div id="avg-risk-card" className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-[0_4px_20px_-2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#737686] uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-[#2563EB]" /> Average Repository Risk
            </h3>
            <p className="text-[10px] text-[#737686] font-medium mt-1 leading-relaxed">
              Standardized weighted average compliance score across processed segments.
            </p>
          </div>

          <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
            <span className={`text-5xl font-black tracking-tight ${stats.avgRiskScore > 65 ? 'text-red-600' : stats.avgRiskScore > 30 ? 'text-amber-600' : 'text-green-600'}`}>
              {stats.avgRiskScore}
            </span>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-[#191B23]">
                {stats.avgRiskScore > 65 ? 'High Compliance Deficit' : stats.avgRiskScore > 30 ? 'Moderate Repository Risk' : 'Healthy Risk Matrix'}
              </h4>
              <p className="text-[10px] text-[#737686]">
                Target goal under standard operations is below 25.
              </p>
            </div>
          </div>

          {/* Faux gauge visual footer */}
          <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden flex">
            <div className="bg-green-500 h-full w-[30%]" title="Safe" />
            <div className="bg-amber-500 h-full w-[35%]" title="Moderate" />
            <div className="bg-red-500 h-full w-[35%]" title="Critical" />
          </div>
        </div>

        {/* Risk Distribution Chart */}
        <div id="risk-distribution-card" className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-[0_4px_20px_-2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#737686] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#2563EB]" /> Risk Distribution
            </h3>
            <p className="text-[10px] text-[#737686] font-medium mt-1">
              Distribution of documents by severity flags count.
            </p>
          </div>

          <div className="space-y-4 py-4">
            {stats.byRiskLevel.map((level, i) => {
              const maxVal = Math.max(...stats.byRiskLevel.map(l => l.value), 1);
              const pct = (level.value / maxVal) * 100;
              const fill = i === 0 ? 'bg-green-500' : i === 1 ? 'bg-amber-500' : 'bg-red-500';

              return (
                <div key={level.name} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#191B23]">{level.name}</span>
                    <span className="font-extrabold text-[#505F76]">{level.value} file{level.value !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-full bg-[#F1F5F9] h-2.5 rounded-full overflow-hidden">
                    <div className={`h-full ${fill} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pt-2 text-[#434655] text-[10px] font-semibold border-t border-[#E2E8F0]/40">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span>Regular assessments reduce litigation liabilities by up to 40%.</span>
          </div>
        </div>

        {/* Dynamic Category Index */}
        <div id="category-index-card" className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-[0_4px_20px_-2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#737686] uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-[#2563EB]" /> Categories Overview
            </h3>
            <p className="text-[10px] text-[#737686] font-medium mt-1">
              Aggregate distribution of agreements currently analyzed.
            </p>
          </div>

          <div className="space-y-3.5 py-4 overflow-y-auto max-h-[160px] custom-scrollbar">
            {stats.byType.length === 0 ? (
              <p className="text-xs text-center text-[#737686] italic py-8">No categories indexed.</p>
            ) : (
              stats.byType.map((typeObj) => {
                const widthPct = (typeObj.value / maxTypeValue) * 100;
                return (
                  <div key={typeObj.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[#191B23] truncate max-w-[140px]" title={typeObj.name}>{typeObj.name}</span>
                      <span className="text-[#505F76]">{typeObj.value}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#2563EB] h-full rounded-full" style={{ width: `${widthPct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="text-[9px] font-bold uppercase tracking-wider text-[#004AC6] bg-[#EBF2FE] px-2.5 py-1 rounded-md border border-[#C3C6D7]/40 w-fit">
            Automatic Classification Active
          </div>
        </div>

      </div>

      {/* Flagged Redline Warning alerts list */}
      <div id="flagged-redline-terms-container" className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(15,23,42,0.03)] overflow-hidden">
        <div id="flagged-header" className="px-6 py-5 border-b border-[#E2E8F0] bg-red-50/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-red-900">Highest Exposure Risk Terms</h2>
              <p className="text-[11px] text-red-600 font-medium">Critical non-standard clauses currently flagged across the repository.</p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-red-700 bg-red-100/60 border border-red-200 px-3 py-1 rounded-full">
            {highRiskClauses.length} Flagged Area{highRiskClauses.length !== 1 ? 's' : ''}
          </span>
        </div>

        {highRiskClauses.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center bg-[#F8FAFC]">
            <ShieldCheck className="w-12 h-12 text-green-500 mb-2.5" />
            <h4 className="text-sm font-bold text-[#191B23]">All Agreements Clear of High-Risk Flags</h4>
            <p className="text-xs text-[#737686] mt-1">
              Great! There are no clauses currently classified under High Risk across the repository.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]/60">
            {highRiskClauses.map((item, idx) => {
              const matchedContract = contracts.find(c => c.id === item.contractId);
              return (
                <div 
                  key={`high-risk-clause-${idx}`}
                  onClick={() => matchedContract && onViewContract(matchedContract)}
                  className="p-5 hover:bg-[#F8FAFC]/50 transition-colors cursor-pointer flex flex-col md:flex-row md:items-start justify-between gap-4 group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md uppercase">
                        High Exposure
                      </span>
                      <h4 className="text-xs font-bold text-[#191B23] truncate group-hover:text-[#2563EB] transition-colors">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-[#737686] font-medium">• Detected in {item.contractFile}</span>
                    </div>
                    <p className="text-xs text-[#505F76] leading-relaxed">
                      <strong className="text-red-700 font-bold">Redline Proposal:</strong> {item.recommendation}
                    </p>
                  </div>

                  <button className="self-end md:self-center p-2 rounded-full hover:bg-slate-100 text-[#737686] flex items-center justify-center gap-1 group-hover:text-[#2563EB] text-xs font-bold transition-all cursor-pointer">
                    <span>Inspect</span>
                    <ChevronRight className="w-4 h-4 cursor-pointer" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
