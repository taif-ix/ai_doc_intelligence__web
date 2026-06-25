import { NextRequest, NextResponse } from "next/server";
import { startContractAnalysis } from "@/src/server/contracts";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { fileName, textContent, fileSize } = body;

  if (!fileName || !textContent) {
    return NextResponse.json(
      { error: "FileName and custom text content are required." },
      { status: 400 },
    );
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
