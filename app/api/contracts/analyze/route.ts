import { NextRequest, NextResponse } from "next/server";
import { startContractAnalysis } from "@/src/server/contracts";
import { analyzeWithBackend, getBackendApiUrl } from "@/src/server/backend";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { fileName, textContent, fileSize } = body;

  if (!fileName || !textContent) {
    return NextResponse.json(
      { error: "FileName and custom text content are required." },
      { status: 400 },
    );
  }

  if (getBackendApiUrl()) {
    try {
      const backendResult = await analyzeWithBackend({
        contractId: `contract-${Date.now()}`,
        fileName,
        textContent,
      });

      return NextResponse.json(
        {
          message: "Analysis queued by backend",
          contract: backendResult?.contract,
        },
        { status: 202 },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Backend upload failed.";

      return NextResponse.json(
        { error: message },
        { status: 502 },
      );
    }
  }

  const contract = startContractAnalysis({ fileName, textContent, fileSize });

  return NextResponse.json(
    {
      message: "Analysis started",
      contract,
    },
    { status: 202 },
  );
}
