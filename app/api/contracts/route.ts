import { NextResponse } from "next/server";
import { getContracts } from "@/src/server/contracts";
import { fetchBackendContracts, getBackendApiUrl } from "@/src/server/backend";

export async function GET() {
  const backendUrl = getBackendApiUrl();

  try {
    const backendContracts = await fetchBackendContracts();
    if (backendContracts) {
      return NextResponse.json(backendContracts);
    }
  } catch (error) {
    console.warn("Backend /api/contracts unavailable.", error);
    if (backendUrl) {
      return NextResponse.json(
        { error: "Backend /api/contracts unavailable." },
        { status: 502 },
      );
    }
  }

  return NextResponse.json(getContracts());
}
