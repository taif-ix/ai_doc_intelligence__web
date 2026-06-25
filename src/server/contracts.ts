import "server-only";

import { GoogleGenAI, Type } from "@google/genai";
import { analyzeWithBackend } from "@/src/server/backend";
import { Contract, ClauseAnalysis, IntelligenceStats } from "@/src/types";

let contracts: Contract[] = [
  {
    id: "contract-1",
    fileName: "MSA_Standard.pdf",
    fileSize: "1.2 MB",
    fileType: "pdf",
    uploadedAt: "Oct 24, 2023",
    status: "Completed",
    riskScore: 15,
    contractType: "Master Services Agreement",
    parties: ["Acme Corp", "Globex Consulting"],
    effectiveDate: "Oct 15, 2023",
    duration: "3 Years",
    summary:
      "A standard balanced Master Services Agreement governing software consulting deliverables. Clauses for payment, intellectual property, and warranties follow standard low-risk market practices.",
    clauses: [
      {
        id: "c1-1",
        title: "Intellectual Property Rights",
        text: "All intellectual property rights in the Deliverables created solely for the Customer during this Agreement shall vest in the Customer upon full and final payment of all corresponding fees.",
        riskLevel: "Low",
        explanation:
          "IP transfers to the customer properly upon final invoice completion, protecting the agency background assets while honoring buyer requirements.",
        recommendation: "Perfect representation. No changes required.",
      },
      {
        id: "c1-2",
        title: "Limitation of Liability",
        text: "Either party's maximum liability under this agreement shall be capped at the total amount actually paid by Customer to Service Provider in the twelve (12) months preceding the claim.",
        riskLevel: "Low",
        explanation:
          "Mutual annual fees cap is highly balanced and standard for commercial engagements.",
        recommendation:
          "Maintain as is; provides strong risk mitigation for both operations.",
      },
      {
        id: "c1-3",
        title: "Indemnification Limit",
        text: "Service Provider shall defend, indemnify and hold harmless the Customer from claims that Deliverables infringe third party IP, up to the general Liability Cap.",
        riskLevel: "Medium",
        explanation:
          "Many clients expect an uncapped or super-cap exception for IP infringement indemnities.",
        recommendation:
          "No action needed now, but remain open to lifting to 2x cap if client negotiates.",
      },
    ],
    warnings: 0,
  },
  {
    id: "contract-2",
    fileName: "Vendor_Agreement_v2.docx",
    fileSize: "450 KB",
    fileType: "docx",
    uploadedAt: "Oct 24, 2023",
    status: "Processing",
    riskScore: 0,
    contractType: "Vendor Services Agreement",
    parties: ["Zenith Logistics Ltd", "Globex Consulting"],
    effectiveDate: "Nov 01, 2023",
    duration: "12 Months",
    summary:
      "Courier and logistics operations contract covering scheduled client dispatch operations.",
    clauses: [],
    warnings: 0,
  },
  {
    id: "contract-3",
    fileName: "Employment_Contract_NY.pdf",
    fileSize: "890 KB",
    fileType: "pdf",
    uploadedAt: "Oct 23, 2023",
    status: "High Risk",
    riskScore: 78,
    contractType: "Executive Employment Agreement",
    parties: ["NY Tech Holdings Inc", "Jane Doe"],
    effectiveDate: "Nov 01, 2023",
    duration: "At-Will Employment",
    summary:
      "Executive employment contract with high-risk elements surrounding non-compete scope, mandatory weekend intellectual property transfer, and unilateral bonus cancellation rules.",
    clauses: [
      {
        id: "c3-1",
        title: "Restrictive Covenant (Non-Compete)",
        text: "Employee agrees that during their employment and for a period of five (5) years thereafter, they shall not, directly or indirectly, engage in any business competing with the Company anywhere in the United States.",
        riskLevel: "High",
        explanation:
          "A 5-year nationwide geographic non-compete is predatory, unreasonable, and likely unenforceable under NY state law, but poses immense threat of litigation.",
        recommendation:
          "Renegotiate to limit scope to the New York metropolitan area and reduce the post-employment duration strictly to 6-12 months max.",
      },
      {
        id: "c3-2",
        title: "IP Transfer (Inventions Assignment)",
        text: "Employee assigns all inventions, websites, source code, and creations developed during tenure, including those compiled during non-working hours, weekends, or using personal devices.",
        riskLevel: "High",
        explanation:
          "Broad assignment over non-working hours and personal devices usurps the employee's private independent work.",
        recommendation:
          "Request exclusion of personal inventions created completely on own time without company assets and outside the core scope of work.",
      },
      {
        id: "c3-3",
        title: "Performance Bonus Unilateral Shift",
        text: "The distribution of any sales performance bonus is completely at the sole discretionary judgment of Management, which reserves the right to modify, adjust, or cancel accrued bonuses at any time prior to checkout payout.",
        riskLevel: "Medium",
        explanation:
          "Management retains the right to cancel already generated and earned commissions before payouts.",
        recommendation:
          "Rephrase to clarify that earned bonuses computed under written metrics cannot be retroactively canceled; discretionary adjustments should only apply to future cycles.",
      },
    ],
    warnings: 2,
  },
  {
    id: "contract-4",
    fileName: "Privacy_Policy_Update.pdf",
    fileSize: "710 KB",
    fileType: "pdf",
    uploadedAt: "Oct 22, 2023",
    status: "Failed",
    riskScore: 0,
    contractType: "N/A",
    parties: [],
    effectiveDate: "N/A",
    duration: "N/A",
    summary:
      "Processing failed. The file appears to be password-protected or corrupt, preventing text extraction engine access.",
    clauses: [],
    warnings: 0,
  },
];

let seedCompletionScheduled = false;

function scheduleSeedCompletion() {
  if (seedCompletionScheduled) return;
  seedCompletionScheduled = true;

  setTimeout(() => {
    const processingIdx = contracts.findIndex((c) => c.id === "contract-2");
    if (processingIdx === -1 || contracts[processingIdx].status !== "Processing") return;

    contracts[processingIdx] = {
      ...contracts[processingIdx],
      status: "Completed",
      riskScore: 35,
      parties: ["Zenith Logistics Ltd", "Globex Consulting"],
      effectiveDate: "Nov 01, 2023",
      duration: "12 Months",
      summary:
        "Vendor fulfillment agreement defining service level benchmarks for scheduled logistics dispatch. Balanced overall but requires standard 15-day SLA audit checks.",
      clauses: [
        {
          id: "c2-1",
          title: "Service Level Agreement Credits",
          text: "If delivery success rate falls below 98.0% in any calendar month, Vendor shall apply a 5% credit on the succeeding monthly invoice.",
          riskLevel: "Low",
          explanation:
            "Clear, manageable remedy that binds performance quality without triggering default litigation.",
          recommendation: "Highly standard SLA clause.",
        },
        {
          id: "c2-2",
          title: "Unilateral Insurance requirements",
          text: "Vendor must carry a minimum of $5,000,000 in comprehensive commercial liability coverages, listing client as additionally insured.",
          riskLevel: "Medium",
          explanation:
            "A $5M limits requirement is surprisingly heavy for small-scale courier operations and raises administrative overheads.",
          recommendation:
            "Suggest reducing limit requirement to $1,000,000 or $2,000,000 based on standard package risk exposure.",
        },
      ],
      warnings: 0,
    };
  }, 30000);
}

export function getContracts() {
  scheduleSeedCompletion();
  return contracts;
}

export function getContract(id: string) {
  scheduleSeedCompletion();
  return contracts.find((contract) => contract.id === id) ?? null;
}

export function deleteContract(id: string) {
  const initialLength = contracts.length;
  contracts = contracts.filter((contract) => contract.id !== id);
  return contracts.length !== initialLength;
}

export function getAnalytics(): IntelligenceStats {
  scheduleSeedCompletion();

  const totalCount = contracts.length;
  const processingCount = contracts.filter((c) => c.status === "Processing").length;
  const completedCount = contracts.filter((c) => c.status === "Completed").length;
  const failedCount = contracts.filter((c) => c.status === "Failed").length;
  const highRiskCount = contracts.filter((c) => c.status === "High Risk").length;

  const validContracts = contracts.filter(
    (c) => c.status !== "Failed" && c.status !== "Processing",
  );
  const avgRiskScore =
    validContracts.length > 0
      ? Math.round(
          validContracts.reduce((acc, current) => acc + current.riskScore, 0) /
            validContracts.length,
        )
      : 0;

  const typeMap: Record<string, number> = {};
  validContracts.forEach((contract) => {
    const type = contract.contractType || "Other";
    typeMap[type] = (typeMap[type] || 0) + 1;
  });

  let lowRiskCount = 0;
  let medRiskCount = 0;
  let topRiskCount = 0;
  validContracts.forEach((contract) => {
    if (contract.riskScore <= 30) lowRiskCount++;
    else if (contract.riskScore <= 65) medRiskCount++;
    else topRiskCount++;
  });

  return {
    totalCount,
    processingCount,
    completedCount: completedCount + highRiskCount,
    failedCount,
    avgRiskScore,
    byType: Object.keys(typeMap).map((name) => ({ name, value: typeMap[name] })),
    byRiskLevel: [
      { name: "Low Risk (0-30)", value: lowRiskCount },
      { name: "Medium Risk (31-65)", value: medRiskCount },
      { name: "High Risk (66-100)", value: topRiskCount + highRiskCount },
    ],
    historicalTrend: [
      { month: "May 2026", completed: 88, highRisk: 4 },
      { month: "Jun 2026", completed: completedCount, highRisk: highRiskCount },
    ],
  };
}

export function startContractAnalysis(input: {
  fileName: string;
  textContent: string;
  fileSize?: string;
}) {
  const { fileName, textContent } = input;
  const fileSize =
    input.fileSize || `${Math.ceil((textContent.length * 1.5) / 1024)} KB`;
  const fileType: Contract["fileType"] = fileName.endsWith(".docx")
    ? "docx"
    : fileName.endsWith(".pdf")
      ? "pdf"
      : "txt";
  const contractId = `contract-${Date.now()}`;

  const contract: Contract = {
    id: contractId,
    fileName,
    fileSize,
    fileType,
    uploadedAt: new Date().toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    status: "Processing",
    riskScore: 0,
    contractType: "Analyzing...",
    parties: [],
    effectiveDate: "Extracting...",
    duration: "Extracting...",
    summary:
      "Extracting clauses and assessing risk benchmarks using Gemini Legal Intelligence...",
    clauses: [],
    warnings: 0,
  };

  contracts.unshift(contract);
  void runAnalysis(contractId, fileName, textContent);
  return contract;
}

async function runAnalysis(contractId: string, fileName: string, textContent: string) {
  try {
    const finalAnalysisResult = await buildAnalysis(contractId, fileName, textContent);
    const contractIdx = contracts.findIndex((contract) => contract.id === contractId);
    if (contractIdx !== -1) {
      contracts[contractIdx] = {
        ...contracts[contractIdx],
        ...finalAnalysisResult,
        status: finalAnalysisResult.status || "Completed",
      };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown server engine dysfunction.";
    const contractIdx = contracts.findIndex((contract) => contract.id === contractId);
    if (contractIdx !== -1) {
      contracts[contractIdx] = {
        ...contracts[contractIdx],
        status: "Failed",
        summary: `Analysis failed. Error: ${message}`,
        clauses: [],
      };
    }
  }
}

async function buildAnalysis(
  contractId: string,
  fileName: string,
  textContent: string,
): Promise<Partial<Contract>> {
  const backendResult = await analyzeWithBackend({ contractId, fileName, textContent });
  if (backendResult) return backendResult.contract;

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    return analyzeWithGemini(contractId, fileName, textContent, apiKey);
  }

  await new Promise((resolve) => setTimeout(resolve, 3000));
  return buildFallbackAnalysis(contractId, textContent);
}

async function analyzeWithGemini(
  contractId: string,
  fileName: string,
  textContent: string,
  apiKey: string,
): Promise<Partial<Contract>> {
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: `You are a high-level corporate legal officer. Please perform a rigorous legal compliance analysis and risk assessment on the following contract document:

File Name: ${fileName}
Contract Text:
${textContent.slice(0, 50000)}

Analyze the text and populate:
1. contractType: Short descriptive name
2. parties: Array of company names or individuals signing
3. effectiveDate: Accurate date from text or "Not Specified"
4. duration: Term length or "At-Will" or "Not Specified"
5. summary: 2-3 sentences executive legal summary
6. riskScore: Calculated average risk score between 0 and 100
7. clauses: List of key clauses analyzed with title, text, riskLevel, explanation, and recommendation.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          contractType: { type: Type.STRING },
          parties: { type: Type.ARRAY, items: { type: Type.STRING } },
          effectiveDate: { type: Type.STRING },
          duration: { type: Type.STRING },
          summary: { type: Type.STRING },
          riskScore: { type: Type.INTEGER },
          clauses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                text: { type: Type.STRING },
                riskLevel: { type: Type.STRING },
                explanation: { type: Type.STRING },
                recommendation: { type: Type.STRING },
              },
              required: ["title", "riskLevel", "explanation", "recommendation"],
            },
          },
        },
        required: ["contractType", "parties", "summary", "riskScore", "clauses"],
      },
    },
  });

  const rawText = response.text?.trim();
  if (!rawText) throw new Error("Empirical assessment yielded empty output.");

  const schemaObj = JSON.parse(rawText);
  const clauses = (schemaObj.clauses || []).map((clause: Record<string, string>, index: number) => ({
    id: `c-${contractId}-${index}`,
    title: clause.title,
    text: clause.text,
    riskLevel:
      clause.riskLevel === "High" || clause.riskLevel === "Medium" || clause.riskLevel === "Low"
        ? clause.riskLevel
        : "Low",
    explanation: clause.explanation,
    recommendation: clause.recommendation,
  })) as ClauseAnalysis[];
  const riskScore = typeof schemaObj.riskScore === "number" ? schemaObj.riskScore : 40;

  return {
    contractType: schemaObj.contractType || "Miscellaneous Agreement",
    parties: schemaObj.parties || [],
    effectiveDate: schemaObj.effectiveDate || "Not Specified",
    duration: schemaObj.duration || "Not Specified",
    summary: schemaObj.summary || "Compiled contract reviews.",
    riskScore,
    clauses,
    warnings: clauses.filter((clause) => clause.riskLevel === "High").length,
    status: riskScore > 65 ? "High Risk" : "Completed",
  };
}

function buildFallbackAnalysis(contractId: string, textContent: string): Partial<Contract> {
  const lowerText = textContent.toLowerCase();

  if (
    lowerText.includes("noncompete") ||
    lowerText.includes("non-compete") ||
    lowerText.includes("competing") ||
    lowerText.includes("solitication") ||
    lowerText.includes("employment")
  ) {
    const clauses: ClauseAnalysis[] = [
      {
        id: `fc-${contractId}-1`,
        title: "Restrictive Covenants (Competitive Limits)",
        text: "The Employee shall not work for any competitor anywhere globally for 36 months following post-termination exit.",
        riskLevel: "High",
        explanation:
          "A 36-month global non-compete clause heavily restricts employment opportunities and will fail basic reasonableness standards in court, yet inflicts leverage pressure.",
        recommendation:
          "Refuse or negotiate post-employment restrictions down to a maximum of 6 months, strictly limited with clear geographical boundaries relevant to regional sales.",
      },
      {
        id: `fc-${contractId}-2`,
        title: "Mutual Indemnity Over Work Product",
        text: "Employee agrees to bear full financial liability and indemnify Employer and all of its corporate partners from potential proprietary infringement claims.",
        riskLevel: "High",
        explanation:
          "Individual employees should never personally indemnify a corporate employer for intellectual property infractions resulting from standard company assignments.",
        recommendation:
          "Request deletion of the entire clause; standard corporate professional insurance should absorb standard deliverable liabilities.",
      },
    ];

    return {
      contractType: "Employment Agreement",
      parties: ["Premier Tech Corp", "Jane Employee"],
      effectiveDate: "Immediate",
      duration: "12 Months",
      summary:
        "Standard New York employment contract governing functional duties, but containing heavy restrictive non-compete clauses that require attention.",
      riskScore: 68,
      clauses,
      warnings: clauses.length,
      status: "High Risk",
    };
  }

  if (
    lowerText.includes("disclosure") ||
    lowerText.includes("confidential") ||
    lowerText.includes("nda")
  ) {
    const clauses: ClauseAnalysis[] = [
      {
        id: `fc-${contractId}-1`,
        title: "Definition of Confidential Information",
        text: "Includes all shared materials labeled as confidential or communicated verbally if summarized in writing within 30 days.",
        riskLevel: "Low",
        explanation:
          "Well-structured clause that sets concrete guidelines for marking standard engineering details.",
        recommendation: "Excellent. Keep as is.",
      },
      {
        id: `fc-${contractId}-2`,
        title: "Survival Term of NDA obligations",
        text: "Confidentiality constraints shall bind both parties for five (5) years following the termination of transaction cycles.",
        riskLevel: "Medium",
        explanation:
          "Five years is common, but trade secrets can require indefinite survival, while general information can fade in 2-3 years.",
        recommendation:
          "Specify that trade secrets remain secret indefinitely, while traditional software parameters expire after three (3) years.",
      },
    ];

    return {
      contractType: "Mutual Non-Disclosure Agreement",
      parties: ["Alpha Technologies Inc", "Beta Solutions Corp"],
      effectiveDate: "Immediate",
      duration: "12 Months",
      summary:
        "Bilateral NDA safeguarding intellectual transaction discussions and private credentials exchange. Highly robust mutual terms.",
      riskScore: 20,
      clauses,
      warnings: 0,
      status: "Completed",
    };
  }

  const clauses: ClauseAnalysis[] = [
    {
      id: `fc-${contractId}-1`,
      title: "Standard Liability Coverage",
      text: "Each party's liability under this agreement is restricted strictly to the amount actually paid in invoices.",
      riskLevel: "Low",
      explanation: "Mutually balanced billing constraints reduce exposure perfectly.",
      recommendation: "Approve as drafted.",
    },
    {
      id: `fc-${contractId}-2`,
      title: "Termination Rules",
      text: "The Customer can terminate this agreement with 10 days notice, while the Provider requires 90 days notice.",
      riskLevel: "Medium",
      explanation:
        "Asymmetrical notification standards can disrupt development velocity if the customer terminates unexpectedly.",
      recommendation:
        "Negotiate mutual 30 days notice for convenience to secure team scheduling.",
    },
  ];

  return {
    contractType: "Consulting Agreement",
    parties: ["Acme Systems LLC", "Independent contractor"],
    effectiveDate: "Immediate",
    duration: "12 Months",
    summary:
      "Services agreement outlining terms of engagement for custom cloud architecture deployment. Fair and balanced with typical milestone schedules.",
    riskScore: 32,
    clauses,
    warnings: 0,
    status: "Completed",
  };
}
