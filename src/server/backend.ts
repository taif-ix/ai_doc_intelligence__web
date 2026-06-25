import "server-only";

import { ClauseAnalysis, Contract } from "@/src/types";

type BackendUploadResult = {
  contract: Partial<Contract>;
  rawResponse: unknown;
};

type BackendQueuedDocument = {
  document_id?: string;
  file_name?: string;
  status?: string;
  gcs_path?: string;
  message_id?: string;
  reason?: string;
};

type BackendUploadResponse = {
  message?: string;
  documents?: BackendQueuedDocument[];
};

export function getBackendApiUrl() {
  return (
    process.env.BACKEND_API_URL ||
    process.env.VITE_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""
  ).replace(/\/+$/, "");
}

export async function analyzeWithBackend(input: {
  contractId: string;
  fileName: string;
  textContent: string;
}): Promise<BackendUploadResult | null> {
  const backendUrl = getBackendApiUrl();
  if (!backendUrl) return null;

  const formData = new FormData();
  const blob = new Blob([input.textContent], { type: "text/plain" });
  formData.append("files", blob, ensureSupportedTextName(input.fileName));

  const response = await fetch(`${backendUrl}/upload-contracts`, {
    method: "POST",
    body: formData,
  });

  const contentType = response.headers.get("content-type") || "";
  const rawResponse = contentType.includes("application/json")
    ? ((await response.json()) as BackendUploadResponse)
    : await response.text();

  if (!response.ok) {
    const message =
      typeof rawResponse === "string"
        ? stripTags(rawResponse).slice(0, 200)
        : JSON.stringify(rawResponse).slice(0, 200);
    throw new Error(
      `Backend upload failed with ${response.status}: ${message}`,
    );
  }

  return {
    contract:
      typeof rawResponse === "string"
        ? parseBackendAnalysisHtml(input.contractId, input.fileName, rawResponse)
        : parseBackendUploadJson(input.contractId, input.fileName, rawResponse),
    rawResponse,
  };
}

export async function fetchBackendContracts(): Promise<Contract[] | null> {
  const backendUrl = getBackendApiUrl();
  if (!backendUrl) return null;

  const response = await fetch(`${backendUrl}/api/contracts`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Backend contracts fetch failed with ${response.status}`);
  }

  return (await response.json()) as Contract[];
}

export async function fetchBackendAnalytics() {
  const backendUrl = getBackendApiUrl();
  if (!backendUrl) return null;

  const response = await fetch(`${backendUrl}/api/analytics`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Backend analytics fetch failed with ${response.status}`);
  }

  return response.json();
}

export async function proxyBackendExcelReport() {
  const backendUrl = getBackendApiUrl();
  if (!backendUrl) {
    return new Response(JSON.stringify({ error: "BACKEND_API_URL is not configured." }), {
      status: 503,
      headers: { "content-type": "application/json" },
    });
  }

  const response = await fetch(`${backendUrl}/export-excel`);
  const headers = new Headers(response.headers);
  headers.set(
    "content-type",
    response.headers.get("content-type") ||
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function parseBackendAnalysisHtml(
  contractId: string,
  fileName: string,
  html: string,
): Partial<Contract> {
  const status = normalizeStatus(readGridValue(html, "Status"));
  const riskScore = parseInt(readGridValue(html, "Risk Score"), 10) || 0;
  const documentType = readGridValue(html, "Document Type") || "Analyzed Contract";
  const parties = readListAfterHeading(html, "Parties");
  const effectiveDate = readValueAfterBold(html, "Effective") || "Not detected";
  const expiryDate = readValueAfterBold(html, "Expiry") || "Not detected";
  const contractValue = readParagraphAfterHeading(html, "Contract Value");
  const governingLaw = readParagraphAfterHeading(html, "Governing Law");
  const clauses = readClauses(contractId, html);
  const risks = readRisks(contractId, html);

  const riskClauses: ClauseAnalysis[] = risks.map((risk, index) => ({
    id: `backend-risk-${contractId}-${index}`,
    title: risk.title,
    riskLevel: risk.riskLevel,
    explanation: risk.explanation,
    recommendation: "Review this risk with counsel and compare it against your standard fallback language.",
  }));

  const allClauses = clauses.length > 0 ? clauses : riskClauses;
  const warnings = allClauses.filter((clause) => clause.riskLevel === "High").length;

  return {
    fileName,
    status: riskScore > 65 || warnings > 0 ? "High Risk" : status,
    riskScore,
    contractType: documentType,
    parties,
    effectiveDate,
    duration: expiryDate && expiryDate !== "Not detected" ? `Until ${expiryDate}` : "Not detected",
    summary: [
      `Backend analysis completed using ${documentType || "document analysis"}.`,
      contractValue ? `Contract value: ${contractValue}.` : "",
      governingLaw ? `Governing law: ${governingLaw}.` : "",
      risks.length > 0 ? `${risks.length} risk item(s) were returned by the backend.` : "",
    ]
      .filter(Boolean)
      .join(" "),
    clauses: allClauses,
    warnings,
  };
}

function parseBackendUploadJson(
  contractId: string,
  fileName: string,
  payload: BackendUploadResponse,
): Partial<Contract> {
  const document = payload.documents?.[0];
  const status = document?.status === "skipped" ? "Failed" : "Processing";

  return {
    id: document?.document_id || contractId,
    fileName: document?.file_name || fileName,
    status,
    riskScore: 0,
    contractType: status === "Failed" ? "Unsupported Document" : "Queued for Backend Analysis",
    parties: [],
    effectiveDate: "Pending",
    duration: "Pending",
    summary:
      status === "Failed"
        ? document?.reason || "Backend rejected this file."
        : `${payload.message || "Document queued by backend."} Refresh shortly to load backend analysis results.`,
    clauses: [],
    warnings: 0,
  };
}

function ensureSupportedTextName(fileName: string) {
  return /\.(txt|pdf|docx|doc)$/i.test(fileName) ? fileName : `${fileName}.txt`;
}

function normalizeStatus(status: string): Contract["status"] {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes("fail")) return "Failed";
  if (lowerStatus.includes("process")) return "Processing";
  if (lowerStatus.includes("risk")) return "High Risk";
  return "Completed";
}

function readGridValue(html: string, label: string) {
  const pattern = new RegExp(`<b>\\s*${escapeRegExp(label)}\\s*<\\/b>\\s*<p>([\\s\\S]*?)<\\/p>`, "i");
  return cleanHtml(pattern.exec(html)?.[1] || "");
}

function readValueAfterBold(html: string, label: string) {
  const pattern = new RegExp(`<b>\\s*${escapeRegExp(label)}:\\s*<\\/b>\\s*([^<\\n]+)`, "i");
  return cleanHtml(pattern.exec(html)?.[1] || "");
}

function readParagraphAfterHeading(html: string, heading: string) {
  const pattern = new RegExp(`<h3>\\s*${escapeRegExp(heading)}\\s*<\\/h3>\\s*<p>([\\s\\S]*?)<\\/p>`, "i");
  return cleanHtml(pattern.exec(html)?.[1] || "");
}

function readListAfterHeading(html: string, heading: string) {
  const pattern = new RegExp(`<h3>\\s*${escapeRegExp(heading)}\\s*<\\/h3>\\s*<ul>([\\s\\S]*?)<\\/ul>`, "i");
  const listHtml = pattern.exec(html)?.[1] || "";
  return [...listHtml.matchAll(/<li>([\s\S]*?)<\/li>/gi)]
    .map((match) => cleanHtml(match[1]))
    .filter(Boolean);
}

function readClauses(contractId: string, html: string): ClauseAnalysis[] {
  const clauseSection = extractBetween(html, "<h3>Clauses</h3>", "<h3>Risks</h3>") || "";

  return [...clauseSection.matchAll(/<div class='mini-card'><b>([\s\S]*?)<\/b><p>([\s\S]*?)<\/p><\/div>/gi)]
    .map((match, index) => ({
      id: `backend-clause-${contractId}-${index}`,
      title: cleanHtml(match[1]) || "Clause",
      text: cleanHtml(match[2]),
      riskLevel: "Low" as const,
      explanation: "Clause extracted by the connected FastAPI backend.",
      recommendation: "Review for business fit and compare against your standard contract playbook.",
    }))
    .filter((clause) => clause.title || clause.text);
}

function readRisks(contractId: string, html: string) {
  const riskMatches = [...html.matchAll(/<div class='risk-card'><b>([\s\S]*?)<\/b><p>([\s\S]*?)<\/p><\/div>/gi)];

  return riskMatches.map((match, index) => {
    const [severityRaw, titleRaw] = cleanHtml(match[1]).split(/\s+[—-]\s+/, 2);
    const riskLevel = normalizeRiskLevel(severityRaw);

    return {
      id: `backend-risk-${contractId}-${index}`,
      title: titleRaw || cleanHtml(match[1]) || "Risk",
      riskLevel,
      explanation: cleanHtml(match[2]),
    };
  });
}

function normalizeRiskLevel(severity: string): ClauseAnalysis["riskLevel"] {
  const lowerSeverity = severity.toLowerCase();
  if (lowerSeverity.includes("high")) return "High";
  if (lowerSeverity.includes("medium")) return "Medium";
  return "Low";
}

function extractBetween(value: string, start: string, end: string) {
  const startIndex = value.indexOf(start);
  if (startIndex === -1) return "";
  const contentStart = startIndex + start.length;
  const endIndex = value.indexOf(end, contentStart);
  return endIndex === -1 ? value.slice(contentStart) : value.slice(contentStart, endIndex);
}

function cleanHtml(value: string) {
  return decodeHtml(stripTags(value)).replace(/\s+/g, " ").trim();
}

function stripTags(value: string) {
  return value.replace(/<[^>]+>/g, " ");
}

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
