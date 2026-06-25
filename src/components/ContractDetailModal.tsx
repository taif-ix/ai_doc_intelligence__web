import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  BookOpen, 
  Users, 
  Scale, 
  ChevronRight, 
  ChevronDown,
  Info
} from 'lucide-react';
import { useState } from 'react';
import { Contract } from '../types';

interface ContractDetailModalProps {
  contract: Contract | null;
  onClose: () => void;
}

export function ContractDetailModal({ contract, onClose }: ContractDetailModalProps) {
  const [expandedClause, setExpandedClause] = useState<string | null>(null);

  if (!contract) return null;

  const toggleClause = (id: string) => {
    setExpandedClause(expandedClause === id ? null : id);
  };

  // Determine risk presentation details
  let scoreColor = 'text-green-600 bg-green-50 border-green-200';
  let riskLabel = 'Low Risk';

  if (contract.riskScore > 65) {
    scoreColor = 'text-red-600 bg-red-50 border-red-200';
    riskLabel = 'Critical Risk';
  } else if (contract.riskScore > 30) {
    scoreColor = 'text-amber-600 bg-amber-50 border-amber-200';
    riskLabel = 'Moderate Risk';
  }

  return (
    <AnimatePresence>
      <div id="drawer-backdrop" className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs z-50 flex justify-end">
        {/* Click outside to close */}
        <div id="drawer-backdrop-close" className="absolute inset-0" onClick={onClose} />

        <motion.div
          id="drawer-container"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col z-50 border-l border-[#E2E8F0]"
        >
          {/* Header */}
          <div id="drawer-header" className="px-6 py-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
            <div id="drawer-heading-group">
              <span id="drawer-badge" className="text-xs font-bold uppercase tracking-wider text-[#004AC6] bg-[#EBF2FE] px-3 py-1 rounded-full border border-[#C3C6D7]/40">
                AI Compliance Audit
              </span>
              <h2 id="drawer-title" className="text-xl font-bold text-[#191B23] mt-1.5 truncate max-w-md" title={contract.fileName}>
                {contract.fileName}
              </h2>
            </div>
            <button
              id="drawer-close-btn"
              onClick={onClose}
              className="p-2 rounded-full text-[#737686] hover:bg-[#E2E8F0] hover:text-[#191B23] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div id="drawer-scroll-area" className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {/* Status & Score Alert */}
            {contract.status === 'Processing' ? (
              <div id="status-processing-card" className="p-5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-4">
                <div id="processing-loader" className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin flex-shrink-0" />
                <div id="processing-text-group">
                  <h4 id="processing-subheading" className="text-sm font-bold text-blue-800">Backend Analysis Executing</h4>
                  <p id="processing-desc" className="text-xs text-blue-600 mt-1">
                    The backend is scanning clauses, synthesizing definitions, and examining mutual liability caps. This can take a short while.
                  </p>
                </div>
              </div>
            ) : contract.status === 'Failed' ? (
              <div id="status-failed-card" className="p-5 bg-red-50 border border-red-200 rounded-2xl flex gap-3.5">
                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div id="failed-text-group">
                  <h4 id="failed-subheading" className="text-sm font-bold text-red-800">Analysis Engine Fault</h4>
                  <p id="failed-desc" className="text-xs text-red-600 mt-1">
                    {contract.summary}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Score Summary Box */}
                <div id="score-summary-grid" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div id="score-block" className="col-span-1 border border-[#E2E8F0] rounded-2xl p-4 bg-[#F8FAFC] flex flex-col justify-between">
                    <p id="risk-score-label" className="text-xs font-semibold text-[#737686]">RISK DEFICIT SCORE</p>
                    <div id="risk-gauge-row" className="flex items-baseline gap-1.5 mt-2">
                      <span id="risk-score-big-num" className={`text-4xl font-extrabold tracking-tight ${contract.riskScore > 65 ? 'text-red-600' : contract.riskScore > 30 ? 'text-amber-600' : 'text-green-600'}`}>
                        {contract.riskScore}
                      </span>
                      <span id="risk-score-denominator" className="text-sm text-[#737686]">/100</span>
                    </div>
                    <div id="risk-badge" className={`inline-flex items-center justify-center mt-3 py-1 px-2 text-xs font-extrabold rounded-md border text-center ${scoreColor}`}>
                      {riskLabel}
                    </div>
                  </div>

                  <div id="meta-highlights-block" className="col-span-1 md:col-span-2 border border-[#E2E8F0] rounded-2xl p-4 bg-white space-y-3.5">
                    <div id="meta-type" className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#EBF2FE] flex items-center justify-center text-[#004AC6]">
                        <Scale className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-semibold text-[#737686]">Contract Category</p>
                        <p id="meta-contract-type" className="text-xs font-bold text-[#191B23] truncate">{contract.contractType}</p>
                      </div>
                    </div>

                    <div id="meta-parties" className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#EBF2FE] flex items-center justify-center text-[#004AC6]">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-semibold text-[#737686]">Signing Parties</p>
                        <p id="meta-contract-parties" className="text-xs font-bold text-[#191B23] truncate">
                          {contract.parties.length > 0 ? contract.parties.join(' ↔ ') : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div id="meta-dates" className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#EBF2FE] flex items-center justify-center text-[#004AC6]">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-semibold text-[#737686]">Effective Period</p>
                        <p id="meta-contract-term" className="text-xs font-bold text-[#191B23] truncate">
                          {contract.effectiveDate} ({contract.duration})
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Summary */}
                <div id="executive-summary-section" className="space-y-2">
                  <h3 id="exec-heading" className="text-sm font-bold text-[#191B23] uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#004AC6]" />
                    AI Executive Assessment
                  </h3>
                  <p id="exec-body" className="p-4 bg-[#EBF2FE]/40 border border-[#004AC6]/10 text-sm text-[#434655] rounded-2xl leading-relaxed">
                    {contract.summary}
                  </p>
                </div>

                {/* Highlighted Warnings */}
                {contract.warnings > 0 && (
                  <div id="warnings-callout" className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 id="warnings-callout-title" className="text-xs font-extrabold text-red-700 uppercase">Attention Redline Required</h4>
                      <p id="warnings-callout-text" className="text-xs text-red-600 mt-1">
                        We detected {contract.warnings} clause{contract.warnings > 1 ? 's' : ''} classified under <strong className="font-extrabold">High Risk</strong>. These terms depart severely from standard operational limits and require manual commercial edits to protect your liability.
                      </p>
                    </div>
                  </div>
                )}

                {/* Clause List Drilldown */}
                <div id="clauses-drilldown-section" className="space-y-3">
                  <h3 id="clauses-analysis-title" className="text-xs font-bold text-[#191B23] uppercase tracking-wider">
                    Itemized Clause Breakdown ({contract.clauses.length})
                  </h3>

                  <div id="clauses-list-container" className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-xl overflow-hidden bg-white">
                    {contract.clauses.map((clause) => {
                      const isExpanded = expandedClause === clause.id;
                      
                      let badgeStyle = 'bg-green-50 text-green-700 border-green-200';
                      if (clause.riskLevel === 'High') {
                        badgeStyle = 'bg-red-50 text-red-700 border-red-200';
                      } else if (clause.riskLevel === 'Medium') {
                        badgeStyle = 'bg-orange-50 text-orange-700 border-orange-200';
                      }

                      return (
                        <div id={`clause-row-${clause.id}`} key={clause.id} className="transition-all hover:bg-[#F8FAFC]">
                          <button
                            id={`clause-toggle-btn-${clause.id}`}
                            onClick={() => toggleClause(clause.id)}
                            className="w-full text-left px-4 py-4 flex items-center justify-between gap-4 cursor-pointer"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span id={`clause-badge-${clause.id}`} className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeStyle}`}>
                                {clause.riskLevel}
                              </span>
                              <p id={`clause-title-${clause.id}`} className="text-sm font-bold text-[#191B23] truncate">
                                {clause.title}
                              </p>
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-[#737686] flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-[#737686] flex-shrink-0" />
                            )}
                          </button>

                          {/* Expanded Content with redline rewrites */}
                          {isExpanded && (
                            <div id={`clause-expanded-${clause.id}`} className="px-4 pb-5 pt-1 space-y-4 bg-[#F8FAFC]/50 border-t border-[#E2E8F0]/30 text-xs leading-relaxed">
                              {clause.text && (
                                <div id="clause-excerpt-box" className="space-y-1">
                                  <span className="font-bold text-[#737686] uppercase tracking-wide text-[9px]">Original Excerpt:</span>
                                  <p id="clause-excerpt-text" className="p-3 bg-white border border-[#E2E8F0] rounded-lg text-[#505F76] font-mono whitespace-pre-wrap leading-normal">
                                    &quot;{clause.text}&quot;
                                  </p>
                                </div>
                              )}

                              <div id="clause-assessment-box" className="space-y-1 bg-[#FFFBEB] p-3 rounded-lg border border-amber-200/50">
                                <span className="font-extrabold text-amber-800 uppercase tracking-wide text-[9px] flex items-center gap-1">
                                  <Info className="w-3.5 h-3.5" /> Risk Explanation:
                                </span>
                                <p id="clause-assessment-text" className="text-[#434655]">
                                  {clause.explanation}
                                </p>
                              </div>

                              <div id="clause-recommendation-box" className="space-y-1 bg-[#ECFDF5] p-3 rounded-lg border border-emerald-200/50">
                                <span className="font-extrabold text-emerald-800 uppercase tracking-wide text-[9px]">Redline Advisory / Re-Negotiate Path:</span>
                                <p id="clause-recommendation-text" className="text-[#065F46] font-medium leading-normal">
                                  {clause.recommendation}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
