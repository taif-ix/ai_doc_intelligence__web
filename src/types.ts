/**
 * Shared types for the Contract Intelligence platform.
 */

export interface ClauseAnalysis {
  id: string;
  title: string;
  text?: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  explanation: string;
  recommendation: string;
}

export interface Contract {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: 'pdf' | 'docx' | 'txt';
  uploadedAt: string;
  status: 'Completed' | 'Processing' | 'High Risk' | 'Failed';
  riskScore: number; // 0 to 100
  contractType: string; // e.g. "Non-Disclosure Agreement", "Master Services Agreement"
  parties: string[];
  effectiveDate: string;
  duration: string;
  summary: string;
  clauses: ClauseAnalysis[];
  warnings: number; // count of High risk clauses
}

export interface IntelligenceStats {
  totalCount: number;
  processingCount: number;
  completedCount: number;
  failedCount: number;
  avgRiskScore: number;
  byType: { name: string; value: number }[];
  byRiskLevel: { name: string; value: number }[];
  historicalTrend: { month: string; completed: number; highRisk: number }[];
}
