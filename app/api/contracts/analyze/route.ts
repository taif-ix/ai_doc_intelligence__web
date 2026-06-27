import { NextRequest, NextResponse } from "next/server";
import { startContractAnalysis } from "@/src/server/contracts";
import { analyzeFileWithBackend, analyzeWithBackend, getBackendApiUrl } from "@/src/server/backend";

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  let file: File | null = null;
  let fileName = "";
  let textContent = "";
  let fileSize = "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const uploadedFile = formData.get("file");
    if (uploadedFile instanceof File) {
      file = uploadedFile;
      fileName = uploadedFile.name;
      fileSize = `${Math.ceil(uploadedFile.size / 1024)} KB`;
    }
    textContent = String(formData.get("textContent") || "");
  } else {
    const body = await request.json();
    fileName = body.fileName;
    textContent = body.textContent;
    fileSize = body.fileSize;
  }

  if (!fileName || (!file && !textContent)) {
    return NextResponse.json(
      { error: "A file or custom text content is required." },
      { status: 400 },
    );
  }

  if (getBackendApiUrl()) {
    try {
      const contractId = `contract-${Date.now()}`;
      const backendResult = file
        ? await analyzeFileWithBackend({ contractId, file })
        : await analyzeWithBackend({
            contractId,
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
